import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import fs from 'node:fs';import vm from 'node:vm';import {transformSync} from 'esbuild';
import {normalizeAttribution,normalizeLocation,parseContext} from './tracking-context.mjs';
import {normalizeMetaContext} from './crm-meta.mjs';
import {normalizeGoogleContext, createGoogleLedger, googleCsv, registerGoogleFeed} from './crm-google.mjs';

const now=Date.parse('2026-11-02T22:00:00Z');
const consent={marketingConsent:true,noticeVersion:'nido-privacy-2026-11-02',consentAt:now-1000,expiresAt:now+86400000,consentSubjectId:'12345678-1234-4234-8234-123456789abc'};
const attribution={gclid:'TestClickIdentifier_123',clickIdType:'gclid',capturedAt:new Date(now-60000).toISOString()};
const context=()=>normalizeGoogleContext(attribution,consent,now);
function fixture(){
 const leads=new Map([['one',{id:'one',status:'agendado',attribution_context:{google:context()},google_qualified_at:'2026-11-02 22:00:00+00:00',google_qualification_context:context()}]]),events=new Map();
 const pool={async query(sql,args=[]){
  if(sql.startsWith('CREATE TABLE'))return [{}];
  if(sql.startsWith('SELECT * FROM nido_leads'))return [[leads.get(args[0])].filter(x=>x&&!x.deleted_at)];
  if(sql.startsWith('INSERT IGNORE')){if(!events.has(args[0]))events.set(args[0],{lead_id:args[0],gclid:args[1],qualified_at:args[2],order_id:args[3],google_context:args[4]});return [{}];}
  if(sql.includes('FROM nido_google_qualifications'))return [[...events.values()].flatMap(e=>{const l=leads.get(e.lead_id);return l&&!l.deleted_at?[{...e,attribution_context:l.attribution_context}]:[]})];
  throw new Error('Unexpected SQL');
 }};
 return {pool,leads,events};
}
test('only a typed real-click field with fresh Google-inclusive consent is eligible',()=>{
 assert.equal(context().gclid,attribution.gclid);
 for(const type of ['gbraid','wbraid',undefined])assert.equal(normalizeGoogleContext({...attribution,clickIdType:type},consent,now),null);
 for(const c of [{...consent,marketingConsent:false},{...consent,noticeVersion:'nido-privacy-2026-11-01'},{...consent,consentAt:now+1},{...consent,expiresAt:now-1}])assert.equal(normalizeGoogleContext(attribution,c,now),null);
 assert.equal(normalizeGoogleContext({...attribution,gclid:'=formula'},consent,now),null);
 assert.equal(normalizeGoogleContext({...attribution,capturedAt:new Date(now-91*86400000).toISOString()},consent,now),null);
});
test('the actual SQL insert preserves validated Google and Meta consent context',async()=>{
 const src=fs.readFileSync('server.ts','utf8');const start=src.indexOf('  async function insertLead('),end=src.indexOf('  async function updateLeadFields(',start);
 const code=transformSync(src.slice(start,end)+'\nglobalThis.insert=insertLead;',{loader:'ts',format:'cjs'}).code;
 let params;const live=Date.now();const currentConsent={...consent,consentAt:live-1000,expiresAt:live+86400000};
 const google=normalizeGoogleContext({...attribution,capturedAt:new Date(live-60000).toISOString()},currentConsent,live);
 const meta=normalizeMetaContext(currentConsent,{},live);
 const ctx={normalizeAttribution,normalizeLocation,parseContext,normalizeMetaContext,normalizeGoogleContext,console,
  requireLeadDatabase:()=>({query:async(_sql,p)=>{params=p;return [{}];}}),readLeads:async()=>[],saveLeadsToFile:async()=>{}};
 vm.createContext(ctx);vm.runInContext(code,ctx);await ctx.insert({id:'one',attribution:{google,meta}});
 const saved=JSON.parse(params.at(-1));assert.equal(saved.google.gclid,attribution.gclid);assert.equal(saved.meta.marketingConsent,true);
});
test('qualification persists once across status transitions, concurrent calls and restarts',async()=>{
 const f=fixture();let clock=now;const ledger=createGoogleLedger({pool:f.pool,now:()=>clock,isAllowed:async()=>true});
 await Promise.all([ledger.qualify('one'),ledger.qualify('one')]);
 const first=[...f.events.values()][0];clock+=60000;f.leads.get('one').status='compareceu';
 await createGoogleLedger({pool:f.pool,now:()=>clock,isAllowed:async()=>true}).qualify('one');
 f.leads.get('one').status='convertido';await ledger.qualify('one');
 assert.equal(f.events.size,1);assert.equal([...f.events.values()][0].qualified_at,first.qualified_at);
 assert.equal(first.qualified_at,'2026-11-02 22:00:00+00:00');
});
test('new contact is not qualification and deleted or revoked consent never exports',async()=>{
 const f=fixture();let allowed=true;const ledger=createGoogleLedger({pool:f.pool,now:()=>now,isAllowed:async()=>allowed});
 f.leads.get('one').status='novo';f.leads.get('one').google_qualified_at=null;assert.equal((await ledger.qualify('one')).status,'ineligible');
 f.leads.get('one').status='agendado';f.leads.get('one').google_qualified_at='2026-11-02 22:00:00+00:00';await ledger.qualify('one');assert.equal((await ledger.rows()).length,1);
 allowed=false;assert.equal((await ledger.rows()).length,0);allowed=true;
 f.leads.get('one').deleted_at='2026-11-02';assert.equal((await ledger.rows()).length,0);
});
test('recovery retains the original qualification after failed delivery and later status changes',async()=>{
 const f=fixture();f.leads.get('one').status='perdido';
 const ledger=createGoogleLedger({pool:f.pool,now:()=>now+600000,isAllowed:async()=>true});
 await ledger.qualify('one');const [row]=await ledger.rows();assert.equal(row.qualified_at,'2026-11-02 22:00:00+00:00');
});
test('repeat form with another click or no consent cannot erase an already qualified click',async()=>{
 const f=fixture();const subjects=[];const ledger=createGoogleLedger({pool:f.pool,now:()=>now,isAllowed:async lead=>{subjects.push(parseContext(lead.attribution_context).meta.consentSubjectId);return true;}});
 await ledger.qualify('one');f.leads.get('one').attribution_context={google:null,meta:null};
 assert.equal((await ledger.rows())[0].gclid,attribution.gclid);assert.equal(subjects.at(-1),consent.consentSubjectId);
});
test('a failed SQL contact insert propagates rather than acknowledging a file-only contact',async()=>{
 const src=fs.readFileSync('server.ts','utf8');const start=src.indexOf('  async function insertLead('),end=src.indexOf('  async function updateLeadFields(',start);
 const code=transformSync(src.slice(start,end)+'\nglobalThis.insert=insertLead;',{loader:'ts',format:'cjs'}).code;
 let wroteFile=false;const ctx={normalizeAttribution,normalizeLocation,parseContext,normalizeMetaContext,normalizeGoogleContext,console:{warn(){}},
  requireLeadDatabase:()=>({query:async()=>{throw Error('DB unavailable');}}),readLeads:async()=>[],saveLeadsToFile:async()=>{wroteFile=true;}};
 vm.createContext(ctx);vm.runInContext(code,ctx);await assert.rejects(ctx.insert({id:'one'}));assert.equal(wroteFile,false);
});
test('export carries only click, generic action, stable time and opaque order ID',async()=>{
 const f=fixture();Object.assign(f.leads.get('one'),{name:'Private patient',email:'private@example.com',service_interest:'Private treatment'});
 const ledger=createGoogleLedger({pool:f.pool,now:()=>now,isAllowed:async()=>true});await ledger.qualify('one');
 const csv=googleCsv(await ledger.rows());assert.match(csv,/Google Click ID,Conversion Name,Conversion Time,Order ID/);
 assert.match(csv,/NIDÔ \| Lead qualificado \| CRM/);assert.doesNotMatch(csv,/Private|private@|one,/);
 assert.equal(googleCsv([]).split('\r\n').filter(Boolean).length,1);
});
test('HTTP export denies missing/bad credentials and preview, never caches, valid auth reads CSV',async()=>{
 const app=express();const secret='test-only-012345678901234567890123456789';let calls=0;
 registerGoogleFeed(app,{ledger:{rows:async()=>{calls++;return [];}},getSecret:()=>secret,isProduction:()=>true});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const url=`http://127.0.0.1:${server.address().port}/api/google-ads/qualified.csv`;
 try{
  assert.equal((await fetch(url)).status,401);
  assert.equal((await fetch(url,{headers:{Authorization:'Basic '+Buffer.from('googleads:wrong').toString('base64')}})).status,401);
  assert.equal(calls,0);
  const r=await fetch(url,{headers:{Authorization:'Basic '+Buffer.from('googleads:'+secret).toString('base64')}});
  assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');assert.match(await r.text(),/Conversion Time/);assert.equal(calls,1);
 }finally{await new Promise(r=>server.close(r));}
 const disabled=express();registerGoogleFeed(disabled,{ledger:{rows:async()=>{throw Error('must not read');}},getSecret:()=>secret,isProduction:()=>false});
 const preview=disabled.listen(0,'127.0.0.1');await new Promise(r=>preview.once('listening',r));
 try{assert.equal((await fetch(`http://127.0.0.1:${preview.address().port}/api/google-ads/qualified.csv`)).status,404);}finally{await new Promise(r=>preview.close(r));}
});
