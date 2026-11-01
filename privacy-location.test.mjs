import test from 'node:test';import assert from 'node:assert/strict';
import {requestBrowserLocation,getCurrentVisitorLocation} from './src/utils/internalAnalytics.ts';
import {saveLocationPreference,saveCookiePreferences,readCookiePreferences,hasCrmLocationConsent} from './src/utils/privacyConsent.ts';
function environment(){
 const local=new Map(),session=new Map(),events=[];
 global.localStorage={getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v),removeItem:k=>local.delete(k)};
 global.sessionStorage={getItem:k=>session.get(k)||null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)};
 global.window={location:{hostname:'nidoestetica.com.br',pathname:'/',hash:''},dispatchEvent:e=>events.push(e.type)};global.document={cookie:''};
 global.fetch=async()=>({ok:true,json:async()=>({success:true})});
 Object.defineProperty(global,'navigator',{value:{geolocation:{getCurrentPosition:success=>success({coords:{latitude:-23.5,longitude:-46.6,accuracy:10}})}},configurable:true});
 return {local,session,events};
}
test('routing coordinates stay temporary and never become CRM location',async()=>{const e=environment();const p=await requestBrowserLocation({storeInCrm:false});assert.equal(p.latitude,-23.5);assert.equal(e.session.has('nido_visitor_geo'),false);assert.equal(getCurrentVisitorLocation().latitude,undefined);});
test('CRM coordinates require separate current consent and can be revoked',async()=>{const e=environment();await requestBrowserLocation({storeInCrm:true});assert.equal(e.session.size,0);saveLocationPreference(true);await requestBrowserLocation({storeInCrm:true});assert.equal(getCurrentVisitorLocation().latitude,-23.5);saveLocationPreference(false);assert.equal(hasCrmLocationConsent(),false);assert.equal(getCurrentVisitorLocation().latitude,undefined);});
test('GPS callback after revocation cannot store coordinates',async()=>{const e=environment();let cb;navigator.geolocation.getCurrentPosition=f=>cb=f;saveLocationPreference(true);const p=requestBrowserLocation({storeInCrm:true});saveLocationPreference(false);cb({coords:{latitude:0,longitude:0,accuracy:5}});await p;assert.equal(e.session.has('nido_visitor_geo'),false);});
test('cookie accept and reject do not enable or reset location permission',()=>{const e=environment();saveCookiePreferences(true,true);assert.equal(hasCrmLocationConsent(),false);assert.equal(readCookiePreferences().meta,true);saveLocationPreference(true);const before=e.local.get('nido_location_consent');saveCookiePreferences(false,false);assert.equal(readCookiePreferences().meta,false);assert.equal(e.local.get('nido_location_consent'),before);assert.ok(e.events.includes('nido:analytics-consent-changed'));});
test('an explicit entry permission captures GPS, while native denial records refusal',async()=>{
 const {requestCrmLocation}=await import('./src/utils/locationPermission.ts');
 const e=environment();await requestCrmLocation();assert.equal(getCurrentVisitorLocation().latitude,-23.5);
 navigator.geolocation.getCurrentPosition=(_success,failure)=>failure();await requestCrmLocation();assert.equal(hasCrmLocationConsent(),false);assert.equal(e.session.has('nido_visitor_geo'),false);
});
