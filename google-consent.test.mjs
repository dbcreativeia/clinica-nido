import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {buildSync} from 'esbuild';
test('Google tracking loads only with current analytics consent and stops after refusal',()=>{
 const code=buildSync({entryPoints:['src/utils/googleConsent.ts'],bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text;
 const store=new Map(),scripts=[],calls=[];const context={module:{exports:{}},exports:{},window:{location:{hostname:'nidoestetica.com.br',pathname:'/tratamentos/teste',hash:''},gtag:(...a)=>calls.push(a)},localStorage:{getItem:k=>store.get(k)||null},document:{cookie:'',createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}}};
 vm.runInNewContext(code,context);const {trackGooglePageView}=context.module.exports;
 for(const c of [null,{analytics:false,timestamp:Date.now()},{analytics:true,timestamp:Date.now()+60000},{analytics:true,timestamp:1}]){if(c)store.set('nido_cookie_consent',JSON.stringify(c));else store.clear();trackGooglePageView();assert.equal(scripts.length,0);assert.equal(context.window['ga-disable-G-NB4LH71DCL'],true);}
 store.set('nido_cookie_consent',JSON.stringify({analytics:true,timestamp:Date.now()}));trackGooglePageView();assert.equal(scripts.length,1);trackGooglePageView();assert.equal(scripts.length,1);assert.equal(calls.filter(a=>a[0]==='event').length,1);
 assert.equal(calls.find(a=>a[0]==='config')[2].allow_google_signals,false);
 assert.equal(calls.find(a=>a[0]==='event')[2].page_location,'https://www.nidoestetica.com.br/');
 store.set('nido_cookie_consent',JSON.stringify({analytics:false,timestamp:Date.now()}));trackGooglePageView();assert.equal(context.window['ga-disable-G-NB4LH71DCL'],true);assert.equal(calls.filter(a=>a[0]==='event').length,1);
});
