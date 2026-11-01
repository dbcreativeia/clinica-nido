import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const path='./privacy-consent.mjs';
test('privacy module exposes validated choices and immutable receipt version',async()=>{
 assert.ok(fs.existsSync(path),'privacy module must exist');
 const {readCookieChoice,normalizeConsentReceipt,NOTICE_VERSION}=await import(path);
 const now=Date.now();
 assert.equal(readCookieChoice(null,now),null);
 assert.equal(readCookieChoice({timestamp:now+1,meta:true},now),null);
 assert.equal(readCookieChoice({timestamp:now-181*86400000,meta:true},now),null);
 assert.equal(readCookieChoice({timestamp:now,expiresAt:now-1,meta:true},now),null);
 assert.deepEqual(readCookieChoice({timestamp:now,analytics:true,meta:false},now).meta,false);
 assert.throws(()=>normalizeConsentReceipt({kind:'cookies',noticeVersion:'wrong'},now));
 const r=normalizeConsentReceipt({id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',subjectId:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',kind:'cookies',noticeVersion:NOTICE_VERSION,choices:{analytics:true,meta:false},timestamp:now},now);
 assert.equal(r.choices.geo,undefined);assert.equal(r.choices.meta,false);
 assert.equal(r.choices.necessary,true);assert.equal('ip' in r,false);
});
test('cookie banner never requests GPS and accept/reject share the same button class',()=>{
 const s=fs.readFileSync('src/components/ConsentBanner.tsx','utf8');
 assert.doesNotMatch(s,/requestBrowserLocation|handleTriggerGeo|Aceitar Todos & GPS/);
 assert.match(s,/Aceitar opcionais/);assert.match(s,/Recusar opcionais/);
 assert.equal((s.match(/className=\{choiceButtonClass\}/g)||[]).length,2);
});
test('receipt persistence stores only validated fields and latest refusal blocks queued qualification',async()=>{
 const {recordConsentReceipt,isStoredMarketingAllowed,NOTICE_VERSION}=await import('./privacy-consent.mjs');const now=Date.now();let params;
 await recordConsentReceipt({query:async(sql,p)=>{params=p;return [{affectedRows:1}]}},{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',subjectId:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',kind:'cookies',noticeVersion:NOTICE_VERSION,timestamp:now,choices:{meta:false,analytics:false},email:'private',latitude:5},now);
 assert.equal(params.join('').includes('private'),false);
 const lead={attribution_context:{meta:{consentSubjectId:'subject'}}};
 assert.equal(await isStoredMarketingAllowed({query:async()=>[[{choices:{meta:false}}]]},lead),false);
 assert.equal(await isStoredMarketingAllowed({query:async()=>[[]]},lead),false);
 assert.equal(await isStoredMarketingAllowed({query:async()=>[[{choices:{meta:true}}]]},lead),true);
});
test('Google Analytics is not loaded unconditionally from HTML',()=>{assert.doesNotMatch(fs.readFileSync('index.html','utf8'),/<script[^>]+src="https:\/\/www.googletagmanager.com/);});
