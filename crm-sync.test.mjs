import test from 'node:test';
import assert from 'node:assert/strict';
import { synchronizeKommo, receiveKommoWebhook } from './crm-sync.mjs';

function fixture(leads, remote, contacts = []) {
  const rows = new Map(leads.map(l => [l.id, {...l}]));
  const calls = [];
  const repo = {
    list: async () => [...rows.values()].filter(l => !l.deletedAt).map(l => ({...l})),
    apply: async (id, k, status, options={}) => {
      const l = rows.get(id);
      if (!l || l.deletedAt) return false;
      if(options.rebind) {
        if(String(l.kommoLeadId)!==String(options.expectedKommoId) || Number(l.kommoUpdatedAt || 0)!==Number(options.expectedUpdatedAt)) return false;
      } else if((l.kommoLeadId && String(l.kommoLeadId)!==String(k.id)) || (l.kommoUpdatedAt || 0)>k.updated_at) return false;
      Object.assign(l, {status, kommoLeadId:String(k.id), kommoUpdatedAt:k.updated_at});
      return true;
    },
    remove: async id => {const l=rows.get(id); if(l) l.deletedAt=true;}
  };
  const request = async path => {
    calls.push(path);
    if (path.startsWith('contacts?')) return {_embedded:{contacts}, _links:{}};
    if (path.startsWith('contacts/')) return contacts.find(c => String(c.id) === path.split('/')[1]?.split('?')[0]) || null;
    const id=path.split('/')[1]?.split('?')[0];
    return remote[id] || null;
  };
  return {repo,request,rows,calls};
}
const k = (id, status_id=105149587, updated_at=20) => ({id,pipeline_id:13625351,status_id,updated_at,_embedded:{contacts:[]}});

test('updates linked lead by exact id and numeric status without status_name', async()=>{
  const f=fixture([{id:'a',kommoLeadId:'9',status:'novo'}],{'9':k(9)});
  await synchronizeKommo(f); assert.equal(f.rows.get('a').status,'agendado');
});
test('checks every linked id, including those outside the latest 50',async()=>{
  const leads=Array.from({length:61},(_,i)=>({id:String(i),kommoLeadId:String(i+100)}));
  const remote=Object.fromEntries(leads.map(l=>[l.kommoLeadId,k(Number(l.kommoLeadId))]));
  const f=fixture(leads,remote); await synchronizeKommo(f);
  assert.equal([...f.rows.values()].filter(l=>l.status==='agendado').length,61);
});
test('propagates database failure instead of reporting success',async()=>{
  const f=fixture([{id:'a',kommoLeadId:'9'}],{'9':k(9)});
  f.repo.apply=async()=>{throw new Error('database unavailable')};
  await assert.rejects(synchronizeKommo(f),/database unavailable/);
});
test('stale concurrent synchronization cannot restore a locally deleted lead',async()=>{
  const f=fixture([{id:'a',kommoLeadId:'9',status:'novo'}],{'9':k(9)});
  const read=f.request; f.request=async p=>{await f.repo.remove('a'); return read(p)};
  await synchronizeKommo(f); assert.equal(f.rows.get('a').deletedAt,true); assert.equal(f.rows.get('a').status,'novo');
});
test('synchronization preserves a lead created after its snapshot',async()=>{
  const f=fixture([{id:'a',kommoLeadId:'9'}],{'9':k(9)});
  const read=f.request; f.request=async p=>{f.rows.set('new',{id:'new',status:'novo'}); return read(p)};
  await synchronizeKommo(f); assert.equal(f.rows.get('new').status,'novo');
});
test('webhook recognizes leads[delete] and replay cannot restore lead',async()=>{
  const f=fixture([{id:'a',kommoLeadId:'9',status:'novo'}],{'9':k(9)});
  await receiveKommoWebhook({...f,payload:{leads:{delete:[{id:'9'}]}}});
  await receiveKommoWebhook({...f,payload:{leads:{status:[{id:'9',status_id:105149587}]}}});
  assert.equal(f.rows.get('a').deletedAt,true); assert.equal(f.rows.get('a').status,'novo');
});
test('older remote version does not overwrite newer persisted status',async()=>{
  const f=fixture([{id:'a',kommoLeadId:'9',status:'convertido',kommoUpdatedAt:30}],{'9':k(9,105149587,20)});
  await synchronizeKommo(f); assert.equal(f.rows.get('a').status,'convertido');
});
test('unlinked lead is associated by unique full normalized phone',async()=>{
  const contacts=[{id:1,custom_fields_values:[{field_code:'PHONE',values:[{value:'+55 (11) 98793-3438'}]}],_embedded:{leads:[{id:9}]}}];
  const f=fixture([{id:'a',phone:'(11) 98793-3438',status:'novo'}],{'9':k(9)},contacts);
  await synchronizeKommo(f); assert.equal(f.rows.get('a').kommoLeadId,'9');
});
test('identical last eight digits in another DDD never matches',async()=>{
  const contacts=[{id:1,custom_fields_values:[{field_code:'PHONE',values:[{value:'+55 21 98793-3438'}]}],_embedded:{leads:[{id:9}]}}];
  const f=fixture([{id:'a',phone:'(11) 98793-3438',status:'novo'}],{'9':k(9)},contacts);
  await synchronizeKommo(f); assert.equal(f.rows.get('a').kommoLeadId,undefined);
});
test('ambiguous active Kommo leads do not bind by telephone',async()=>{
  const contacts=[{id:1,custom_fields_values:[{field_code:'PHONE',values:[{value:'5511987933438'}]}],_embedded:{leads:[{id:9},{id:10}]}}];
  const f=fixture([{id:'a',phone:'11987933438'}],{'9':k(9),'10':k(10)},contacts);
  await synchronizeKommo(f); assert.equal(f.rows.get('a').kommoLeadId,undefined);
});
test('an absent remote lead does not trigger deletion from incomplete API results',async()=>{
  const f=fixture([{id:'a',kommoLeadId:'9',status:'novo'}],{});
  await synchronizeKommo(f); assert.equal(f.rows.get('a').deletedAt,undefined);
});
test('webhook recovers unique unbound lead using full phone and numeric status',async()=>{
  const contact={id:1,custom_fields_values:[{field_code:'PHONE',values:[{value:'5511987933438'}]}],_embedded:{leads:[{id:9}]}};
  const remote=k(9); remote._embedded.contacts=[{id:1}];
  const f=fixture([{id:'a',phone:'11987933438',status:'novo'}],{'9':remote},[contact]);
  await receiveKommoWebhook({...f,payload:{leads:{status:[{id:'9',status_id:105149587}]}}});
  assert.equal(f.rows.get('a').status,'agendado');
});

function duplicateChannelFixture() {
  const createdAt='2026-11-01T01:52:55.000Z';
  const original={...k(11103500),pipeline_id:14653579,status_id:113223651,created_at:1793497976};
  const chat={...k(11103518),created_at:1793498098,updated_at:1793498220,_embedded:{contacts:[{id:1}]}};
  const contact={id:1,custom_fields_values:[{field_code:'PHONE',values:[{value:'5511987933438'}]}],_embedded:{leads:[{id:11103518}]}};
  return fixture([{id:'a',phone:'11987933438',kommoLeadId:'11103500',kommoUpdatedAt:0,createdAt,status:'novo'}],{'11103500':original,'11103518':chat},[contact]);
}
test('manual sync recovers the unique new WhatsApp lead when original is in another pipeline',async()=>{
  const f=duplicateChannelFixture();
  await synchronizeKommo(f);
  assert.equal(f.rows.get('a').status,'agendado');
  assert.equal(f.rows.get('a').kommoLeadId,'11103518');
});
test('status webhook recovers linked site lead from an unrelated pipeline',async()=>{
  const f=duplicateChannelFixture();
  await receiveKommoWebhook({...f,payload:{leads:{status:[{id:11103518}]}}});
  assert.equal(f.rows.get('a').status,'agendado');
});
test('recovery does not attach historical treatment from before the new site contact',async()=>{
  const f=duplicateChannelFixture();
  const request=f.request;
  f.request=async path=>{const value=await request(path);return path.startsWith('leads/11103518')?{...value,created_at:1793400000}:value};
  await synchronizeKommo(f);
  assert.equal(f.rows.get('a').status,'novo');
});
test('recovery cannot replace a different link assigned while remote API is pending',async()=>{
  const f=duplicateChannelFixture();
  const request=f.request;
  f.request=async path=>{const value=await request(path);if(path.startsWith('contacts?')) f.rows.get('a').kommoLeadId='777';return value};
  await synchronizeKommo(f);
  assert.equal(f.rows.get('a').kommoLeadId,'777');
  assert.equal(f.rows.get('a').status,'novo');
});

test('recovery never replaces a deleted original lead with another conversation',async()=>{
  const f=duplicateChannelFixture(); const read=f.request;
  f.request=async p=>{const value=await read(p);return p.startsWith('leads/11103500')?{...value,is_deleted:true}:value};
  await synchronizeKommo(f); assert.equal(f.rows.get('a').deletedAt,true);
  assert.equal(f.rows.get('a').kommoLeadId,'11103500');
});
test('a valid linked treatment is never replaced by a different conversation',async()=>{
  const f=duplicateChannelFixture(); const read=f.request;
  f.request=async p=>p.startsWith('leads/11103500')?k(11103500,105149575):read(p);
  await synchronizeKommo(f); assert.equal(f.rows.get('a').kommoLeadId,'11103500');
  assert.equal(f.rows.get('a').status,'em_contato');
});
test('multiple new treatment candidates leave the previous link untouched',async()=>{
  const f=duplicateChannelFixture(); const read=f.request;
  f.request=async p=>{
    if(p.startsWith('leads/11103520')) return {...k(11103520),created_at:1793498100};
    const value=await read(p);
    if(p.startsWith('contacts?')) return {_embedded:{contacts:[{...value._embedded.contacts[0],_embedded:{leads:[{id:11103518},{id:11103520}]}}]}};
    return value;
  };
  const result=await synchronizeKommo(f);
  assert.equal(f.rows.get('a').kommoLeadId,'11103500'); assert.equal(result.ambiguousCount,1);
});
test('SQL rebind compares the original link and version and excludes soft-deleted rows',async()=>{
  const {createKommoRepository}=await import('./crm-sync.mjs');
  let statement,params;
  const repo=createKommoRepository({query:async(sql,args)=>{statement=sql;params=args;return [{affectedRows:1}]}},async()=>[]);
  assert.equal(await repo.apply('a',{...k(11103518),updated_at:30},'agendado',{rebind:true,expectedKommoId:'11103500',expectedUpdatedAt:20}),true);
  assert.match(statement,/deleted_at IS NULL AND kommo_lead_id=\? AND COALESCE\(kommo_updated_at,0\)=\?/);
  assert.deepEqual(params,['agendado','11103518','105149587',30,'a','11103500',20]);
});
