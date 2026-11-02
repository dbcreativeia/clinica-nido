import test from 'node:test';
import assert from 'node:assert/strict';
import { trackMetaEvent,getOrCreateFbc } from './src/utils/metaConversions.ts';
function setup(consent:any) {
 const storage=new Map<string,string>(); if(consent)storage.set('nido_cookie_consent',JSON.stringify(consent));
 (globalThis as any).localStorage={getItem:(k:string)=>storage.get(k)||null,setItem:(k:string,v:string)=>storage.set(k,v)};
 let cookie='';(globalThis as any).document={get cookie(){return cookie},set cookie(v){cookie=v}};
 let calls=0; (globalThis as any).window={location:{hostname:'www.nidoestetica.com.br',pathname:'/',search:'?fbclid=abc',href:'https://www.nidoestetica.com.br/',protocol:'https:'},fbq:()=>{calls++}};
 (globalThis as any).fetch=async()=>{calls++;return{ok:true,json:async()=>({success:true})}};
 return()=>calls;
}
for(const [label,consent] of [['absent',null],['expired',{meta:true,timestamp:1}],['invalid',{meta:true,timestamp:'invalid'}]] as const) test('marketing blocked when consent '+label,async()=>{const calls=setup(consent);await trackMetaEvent('Contact');assert.equal(calls(),0);assert.equal(getOrCreateFbc(),undefined)});
test('Contact sends normalized identifiers only in userData, with same Pixel/CAPI event ID',async()=>{
 setup({meta:true,timestamp:Date.now()});
 const pixel:any[]=[];(window as any).fbq=(...args:any[])=>pixel.push(args);
 let sent:any; (globalThis as any).fetch=async(_url:any,opts:any)=>{sent=JSON.parse(opts.body);return {ok:true,json:async()=>({success:true})}};
 await trackMetaEvent('Contact',{userData:{em:' TEST@EXAMPLE.COM ',ph:'(11)98793-3438'},customData:{service_label:'private',email:'private'}});
 const track=pixel.find(args=>args[0]==='track');assert.equal(track[3].eventID,sent.eventId);
 assert.equal(sent.userData.em,'test@example.com');assert.equal(sent.userData.ph,'5511987933438');
 assert.equal(JSON.stringify(sent.customData).includes('private'),false);
 assert.equal(sent.userData.ct,undefined);assert.equal(sent.userData.st,undefined);
});
test('preview cannot send a live event even with client test flag',async()=>{const calls=setup({meta:true,timestamp:Date.now()});(window as any).location.hostname='preview.example.com';await trackMetaEvent('Contact',{testEventCode:'TEST'});assert.equal(calls(),0)});
test('form opening uses custom Pixel event and matching CAPI ID without contact identifiers',async()=>{
 setup({meta:true,timestamp:Date.now()});
 const pixel:any[]=[];(window as any).fbq=(...args:any[])=>pixel.push(args);
 let sent:any;(globalThis as any).fetch=async(_url:any,opts:any)=>{sent=JSON.parse(opts.body);return {ok:true,json:async()=>({success:true})}};
 await trackMetaEvent('WhatsAppFormOpen');
 const event=pixel.find(args=>args[0]==='trackCustom');
 assert.ok(event,'custom event must use trackCustom');
 assert.equal(event[1],'WhatsAppFormOpen');assert.equal(sent.eventName,'WhatsAppFormOpen');
 assert.equal(event[3].eventID,sent.eventId);
 assert.equal(pixel.some(args=>args[1]==='Contact'||args[1]==='Lead'),false);
 assert.equal(sent.userData.em,undefined);assert.equal(sent.userData.ph,undefined);
});

test('website and qualified CRM event share the consented external ID without analytics consent',async()=>{
 setup({meta:true,analytics:false,timestamp:Date.now(),consentSubjectId:'d3f251a0-92a5-4d84-b3a0-ab6e673b295f'});
 let sent:any;(globalThis as any).fetch=async(_url:any,opts:any)=>{sent=JSON.parse(opts.body);return{ok:true,json:async()=>({success:true})}};
 await trackMetaEvent('Contact',{userData:{external_id:'unrelated-analytics-id'}});
 assert.equal(sent.userData.external_id,'d3f251a0-92a5-4d84-b3a0-ab6e673b295f');
 const {buildQualifiedLeadEvent}=await import('./crm-meta.mjs');
 const {createHash}=await import('node:crypto');
 const event=buildQualifiedLeadEvent({id:'identity-test',status:'agendado',email:'test@example.com',attribution:{visitorId:'unrelated-analytics-id',meta:{marketingConsent:true,consentAt:Date.now(),consentSubjectId:sent.userData.external_id}}});
 assert.ok(event);
 assert.equal(event.user_data.external_id,createHash('sha256').update(sent.userData.external_id).digest('hex'));
});
test('client cannot generate Lead even with valid marketing consent',async()=>{
 const calls=setup({meta:true,timestamp:Date.now()});await trackMetaEvent('Lead');assert.equal(calls(),0);
});
