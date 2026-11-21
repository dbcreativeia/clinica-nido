import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {buildSync} from 'esbuild';

const code=buildSync({entryPoints:['src/utils/googleAdsContact.ts'],bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text;
function setup({consent=true,hostname='www.nidoestetica.com.br',pathname='/tratamentos/private',hash=''}={}){
 const calls=[],scripts=[];
 const ctx={module:{exports:{}},exports:{},console,window:{location:{hostname,pathname,hash},gtag:(...a)=>calls.push(a)},localStorage:{getItem:()=>JSON.stringify({meta:consent,analytics:false,noticeVersion:'nido-privacy-2026-11-02',timestamp:Date.now()})},document:{head:{appendChild:s=>scripts.push(s)},createElement:()=>({})}};
 vm.runInNewContext(code,ctx);return {api:ctx.module.exports,calls,scripts};
}
test('opening records only the opening action without requiring a saved lead',()=>{
 const {api,calls,scripts}=setup();
 assert.equal(typeof api.trackGoogleFormOpen,'function');
 api.trackGoogleFormOpen();
 const events=calls.filter(a=>a[0]==='event');
 assert.equal(events.length,1);
 assert.equal(events[0][1],'conversion');
 assert.equal(events[0][2].send_to,'AW-11000286313/ZKJBCPeE-LwdEOmYrP0o');
 assert.equal(events[0][2].page_location,'https://www.nidoestetica.com.br/');
 assert.doesNotMatch(JSON.stringify(calls),/private|service_name|email|phone|transaction_id/);
 assert.equal(scripts.length,1);
});
for(const options of [{consent:false},{hostname:'localhost'},{pathname:'/admin'},{hash:'#admin'}])test('opening suppressed when ineligible '+JSON.stringify(options),()=>{
 const {api,calls}=setup(options);
 assert.equal(typeof api.trackGoogleFormOpen,'function');
 api.trackGoogleFormOpen();assert.equal(calls.filter(a=>a[0]==='event').length,0);
});
test('opening and confirmed submission remain separate actions',()=>{
 const {api,calls}=setup();
 assert.equal(typeof api.trackGoogleFormOpen,'function');
 api.trackGoogleFormOpen();api.trackConfirmedGoogleContact('opaque-id');api.trackConfirmedGoogleContact('opaque-id');
 assert.deepEqual(calls.filter(a=>a[0]==='event').map(a=>a[2].send_to),['AW-11000286313/ZKJBCPeE-LwdEOmYrP0o','AW-11000286313/GoyeCMrii5MaEOmYrP0o']);
});
