import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transformSync} from 'esbuild';
import {persistContactLead} from './src/utils/leadSubmission.ts';
for(const [file,end] of [['src/components/LeadCaptureModal.tsx','\n  if (!isOpen)'],['src/pages/ContactPage.tsx','\n  return (']]){
 const src=fs.readFileSync(file,'utf8');const start=src.indexOf('const handleSubmit = async');const code=transformSync(src.slice(start,src.indexOf(end,start))+'\nglobalThis.run=handleSubmit;',{loader:'ts',format:'cjs'}).code;
 for(const success of [true,false])test(file+' contact follows acknowledged persistence: '+success,async()=>{
  const events=[],errors=[];globalThis.fetch=async()=>({ok:success,json:async()=>({success,lead:success?{id:'isolated'}:undefined})});
  const ctx={name:'Teste Auditoria',phone:'11900000000',email:'auditoria@example.com',lgpdAccepted:true,isSubmitting:false,formData:{name:'Teste Auditoria',phone:'11900000000',email:'auditoria@example.com',privacyAccepted:true},context:{},rawMessage:'',console:{warn(){},error(){}},localStorage:{setItem(){}},window:{location:{pathname:'/'}},document:{referrer:''},setError:e=>errors.push(e),setFormError:e=>errors.push(e),setIsSubmitting(){},setIsOpen(){},setSubmitted(){},getStoredTrafficAttribution:()=>({channel:'Meta Ads',source:'ig',medium:'paid_social'}),initTrafficAttribution(){},formatPersonalizedWhatsAppMessage:()=>'',getVisitorLocation:async()=>({}),getSessionViewedTreatments:()=>[],getSessionJourney:()=>[],hasAnalyticsConsent:()=>false,captureMetaContext:()=>undefined,persistContactLead,trackMetaEvent:async e=>events.push(e),openDirectWhatsApp:()=>events.push('WhatsApp')};
  vm.createContext(ctx);vm.runInContext(code,ctx);await ctx.run({preventDefault(){}});
  assert.deepEqual(events,success?['Contact','WhatsApp']:[]);if(!success)assert.ok(errors.some(e=>e?.includes('cadastro')));
 });
}
