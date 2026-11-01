import test from 'node:test';
import assert from 'node:assert/strict';
import {buildQualifiedLeadEvent,normalizeMetaContext,qualifiedEventId} from './crm-meta.mjs';
const now=Date.now();
const meta={marketingConsent:true,consentAt:now-1000,expiresAt:now+86400000,fbp:'fb.1.1793556000000.12345',fbc:'fb.1.1793556000000.actualclick',eventSourceUrl:'https://nidoestetica.com.br/tratamentos/private?email=private'};
const lead={id:'lead_1',status:'agendado',name:'Maria Teste',email:'maria@example.com',phone:'11900000000',procedureCycles:[{cycleId:'cycle_1'}],attribution:{meta:normalizeMetaContext(meta,{ip:'203.0.113.10',userAgent:'visitor browser'},now)}};
test('qualified event preserves visitor context, hashes identifiers and omits invented geography',()=>{const e=buildQualifiedLeadEvent(lead,now);assert.equal(e.event_name,'Lead');assert.equal(e.user_data.fbp,meta.fbp);assert.equal(e.user_data.client_user_agent,'visitor browser');assert.match(e.user_data.em,/^[a-f0-9]{64}$/);assert.equal(e.user_data.ct,undefined);assert.equal(e.user_data.st,undefined);assert.equal(e.user_data.country,undefined);assert.equal(e.action_source,'system_generated');assert.equal(e.event_source_url,'https://www.nidoestetica.com.br/');});
test('same cycle retains ID across qualified stages and a new cycle gets a new ID',()=>{assert.equal(qualifiedEventId(lead),qualifiedEventId({...lead,status:'compareceu'}));assert.notEqual(qualifiedEventId(lead),qualifiedEventId({...lead,procedureCycles:[{cycleId:'cycle_2'}]}));});
test('missing, denied, future or expired consent cannot create a Lead',()=>{for(const m of [undefined,{}, {...meta,marketingConsent:false},{...meta,consentAt:now+1000},{...meta,expiresAt:now-1}]){assert.equal(buildQualifiedLeadEvent({...lead,attribution:{meta:m}},now),null);}});
test('nonqualifying and deleted leads do not generate an event',()=>{assert.equal(buildQualifiedLeadEvent({...lead,status:'novo'},now),null);assert.equal(buildQualifiedLeadEvent({...lead,deleted_at:'2026-01-01'},now),null);});
import {createCrmMetaQueue} from './crm-meta.mjs';
function database(){
 const rows=new Map();const original={...lead,procedure_cycles:lead.procedureCycles,attribution_context:JSON.stringify(lead.attribution),meta_lead_sent:0};
 const pool={async query(sql,args=[]){
  if(sql.startsWith('SELECT * FROM nido_leads'))return [[original]];
  if(sql.startsWith('INSERT IGNORE')){if(!rows.has(args[0]))rows.set(args[0],{event_id:args[0],lead_id:args[1],cycle_id:args[2],payload:args[3],consent_expires_at:args[4],state:'pending',attempts:0,due:true,locked:false});return [{affectedRows:1}];}
  if(sql.startsWith('SELECT * FROM nido_meta_outbox'))return [[...rows.values()].filter(r=>r.state==='pending'&&r.due&&!r.locked).map(r=>({...r}))];
  if(sql.startsWith('SELECT id FROM nido_leads'))return [original.deleted_at?[]:[{id:original.id}]];
  if(sql.startsWith('UPDATE nido_meta_outbox')){const r=rows.get(args.at(-1));if(sql.includes('attempts=attempts+1')){if(r.locked||r.state!=='pending')return[{affectedRows:0}];r.locked=true;r.attempts++;}else if(sql.includes("state='sent'"))r.state='sent';else if(sql.includes("state='skipped'"))r.state='skipped';else{r.due=false;r.locked=false;}return[{affectedRows:1}];}
  if(sql.startsWith('UPDATE nido_leads')){if(args[1]===original.procedure_cycles[0].cycleId)original.meta_lead_sent=1;return[{affectedRows:1}];}
  throw Error('Unexpected SQL '+sql);
 }};return {pool,rows,original};
}
test('durable qualification survives duplicate webhooks and a worker restart',async()=>{const db=database();let sends=0;const send=async()=>{sends++;return {success:true,events_received:1}};const q=createCrmMetaQueue({...db,send});await q.qualify(lead.id);await q.qualify(lead.id);assert.equal(db.rows.size,1);await createCrmMetaQueue({...db,send}).flush();assert.equal(sends,1);assert.equal(db.original.meta_lead_sent,1);await q.flush();assert.equal(sends,1);});
test('failed or zero-ack delivery does not mark the lead sent and retries keep ID and event time',async()=>{for(const result of [{success:false},{success:true,events_received:0}]){const db=database();const bodies=[];const q=createCrmMetaQueue({...db,send:async b=>{bodies.push(b);return bodies.length===1?result:{success:true,events_received:1}}});await q.qualify(lead.id);await q.flush();assert.equal(db.original.meta_lead_sent,0);for(const r of db.rows.values())r.due=true;await q.flush();assert.deepEqual(bodies[0],bodies[1]);assert.equal(db.original.meta_lead_sent,1);}});
test('two worker instances use a database lease to avoid simultaneous dispatch',async()=>{const db=database();let sends=0;const send=async()=>{sends++;return{success:true,events_received:1}};const q=createCrmMetaQueue({...db,send});await q.qualify(lead.id);await Promise.all([q.flush(),createCrmMetaQueue({...db,send}).flush()]);assert.equal(sends,1);});
test('deleted lead or expired consent cancels pending delivery',async()=>{for(const kind of ['deleted','expired']){const db=database();let sends=0;const q=createCrmMetaQueue({...db,send:async()=>{sends++;return{success:true,events_received:1}}});await q.qualify(lead.id);if(kind==='deleted')db.original.deleted_at='deleted';else for(const r of db.rows.values())r.consent_expires_at=1;await q.flush();assert.equal(sends,0);assert.equal([...db.rows.values()][0].state,'skipped');}});
