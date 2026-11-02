import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {buildSync} from 'esbuild';
test('only an acknowledged CRM form and fresh advertising consent produce a secondary conversion',async()=>{
 const code=buildSync({entryPoints:['src/utils/leadSubmission.ts'],bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text;
 const calls=[],scripts=[],store=new Map();let ok=false;
 const ctx={module:{exports:{}},exports:{},console,window:{location:{hostname:'www.nidoestetica.com.br',pathname:'/tratamentos/private',hash:''},gtag:(...a)=>calls.push(a)},
  localStorage:{getItem:k=>store.get(k)||null},document:{head:{appendChild:s=>scripts.push(s)},createElement:()=>({})},
  fetch:async()=>({ok,json:async()=>ok?{success:true,lead:{id:'opaque-lead-id'}}:{success:false}})};
 vm.runInNewContext(code,ctx);const persist=ctx.module.exports.persistContactLead;
 store.set('nido_cookie_consent',JSON.stringify({meta:true,analytics:false,noticeVersion:'nido-privacy-2026-11-02',timestamp:Date.now()}));
 await assert.rejects(persist({email:'private@example.com',serviceInterest:'private treatment'}));assert.equal(calls.length,0);
 ok=true;await persist({email:'private@example.com',serviceInterest:'private treatment'});
 const events=calls.filter(a=>a[0]==='event'&&a[1]==='conversion');assert.equal(events.length,1);
 assert.equal(events[0][2].send_to,'AW-11000286313/GoyeCMrii5MaEOmYrP0o');
 assert.equal(events[0][2].transaction_id,'opaque-lead-id');assert.equal(events[0][2].page_location,'https://www.nidoestetica.com.br/');
 assert.doesNotMatch(JSON.stringify(calls),/private|treatment/);assert.equal(scripts.length,1);
 await persist({});assert.equal(calls.filter(a=>a[0]==='event').length,1);
 store.set('nido_cookie_consent',JSON.stringify({meta:true,noticeVersion:'nido-privacy-2026-11-01',timestamp:Date.now()}));
 await persist({});assert.equal(calls.filter(a=>a[0]==='event').length,1);
});
