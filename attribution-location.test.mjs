import test from 'node:test';
import assert from 'node:assert/strict';
import { recordAnalyticsEvent } from './analytics-engine.mjs';
import { getVisitorLocation } from './src/utils/internalAnalytics.ts';
import { initTrafficAttribution } from './src/utils/trafficSource.ts';
import { normalizeLocation, validCoordinates } from './tracking-context.mjs';

function browser(search='', consent={analytics:true,geo:false}) {
  const local = new Map([['nido_cookie_consent', JSON.stringify({...consent,timestamp:Date.now()})]]);
  const session = new Map();
  global.window={location:{search,pathname:'/',hostname:'nidoestetica.com.br',hash:''}};
  global.document={referrer:''};
  global.localStorage={getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v),removeItem:k=>local.delete(k)};
  global.sessionStorage={getItem:k=>session.get(k)||null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)};
  return {local,session};
}
test('analytics discards supplied location when GPS consent was denied', async()=>{
  let values;
  await recordAnalyticsEvent({query:async(_sql,params)=>{values=params;return [{affectedRows:1}];}},
    {eventId:'denied',type:'page_view',pagePath:'/',geoConsent:false,city:'São Paulo',state:'SP',neighborhood:'Jardins',latitude:-23.56,longitude:-46.66});
  assert.equal(values[7],'Não informada');
  assert.equal(values[9],'Não informada');
});
test('revoked GPS permission cannot reuse a cached location', async()=>{
  const {session}=browser();
  session.set('nido_visitor_geo',JSON.stringify({city:'São Paulo',state:'SP',neighborhood:'Jardins',latitude:-23.56,longitude:-46.66}));
  const location=await getVisitorLocation();
  assert.equal(location.city,'Não informada');
  assert.equal(location.latitude,undefined);
});
test('paid_social Meta URLs capture campaign, ad set, ad and stable IDs',()=>{
  browser('?utm_source=ig&utm_medium=paid_social&utm_campaign=endoslim&utm_term=frio&utm_content=video_01&utm_id=120250280416180585&adset_id=120250280480790585&ad_id=120250280480790586&placement=instagram_reels');
  const data=initTrafficAttribution();
  assert.equal(data.channel,'Meta Ads');
  assert.equal(data.campaignId,'120250280416180585');
  assert.equal(data.adSet,'frio');
  assert.equal(data.adId,'120250280480790586');
});
test('missing campaign metadata stays unknown, without fabricated campaign names',()=>{
  browser('?gclid=click123');
  assert.equal(initTrafficAttribution().campaign,'');
});
test('Google click type survives navigation without relabeling braids as GCLID',()=>{
  for(const type of ['gclid','gbraid','wbraid']){
    browser('?'+type+'=TestClickIdentifier_123');
    const data=initTrafficAttribution();assert.equal(data.clickIdType,type);
    window.location.search='';
    assert.equal(initTrafficAttribution().clickIdType,type);
  }
});
test('fbclid alone is insufficient evidence to classify organic Facebook as paid advertising',()=>{
  browser('?fbclid=click123');
  assert.notEqual(initTrafficAttribution().channel,'Meta Ads');
});
test('verified GPS preserves real coordinates including zero, without guessing an address',()=>{
  const result=normalizeLocation({geoConsent:true,locationSource:'browser_gps',locationCapturedAt:new Date().toISOString(),latitude:0,longitude:0,accuracy:15,city:'São Paulo'});
  assert.equal(result.latitude,0);
  assert.equal(result.longitude,0);
  assert.equal(result.city,'Não informada');
  assert.equal(result.locationSource,'browser_gps');
});
test('legacy, expired and invalid coordinates cannot create map points',()=>{
  assert.equal(normalizeLocation({latitude:-23.56,longitude:-46.66,city:'Jardins'},false).latitude,undefined);
  assert.equal(validCoordinates(NaN,-46),false);
  assert.equal(validCoordinates(-91,0),false);
  assert.equal(validCoordinates(0,181),false);
  assert.equal(normalizeLocation({geoConsent:true,locationSource:'browser_gps',locationCapturedAt:'2020-01-01',latitude:0,longitude:0}).latitude,undefined);
});
test('Google ValueTrack IDs and keyword stay separate from the ad group',()=>{
  browser('?utm_source=google&utm_medium=cpc&utm_campaign=endoslim_pesquisa&utm_term=laser&utm_content=123&utm_id=456&adgroup_id=789&ad_id=123');
  const result=initTrafficAttribution();
  assert.equal(result.campaignId,'456');
  assert.equal(result.adSetId,'789');
  assert.equal(result.adSet,'');
  assert.equal(result.keyword,'laser');
});
test('attribution survives internal navigation and unresolved macros are not real campaign metadata',()=>{
  browser('?utm_source=instagram&utm_medium=paid_social&utm_campaign=endoslim&utm_content=reel_01&ad_id=123');
  initTrafficAttribution();
  window.location.search='';
  window.location.pathname='/tratamentos/endoslim';
  assert.equal(initTrafficAttribution().adId,'123');
  browser('?utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&ad_id={{ad.id}}');
  const unresolved=initTrafficAttribution();
  assert.equal(unresolved.campaign,'');
  assert.equal(unresolved.adId,'');
});
