import {GOOGLE_QUALIFICATION_ASSIGNMENTS} from './crm-google.mjs';
export const CRM_VERSION = 'nido-crm-sync-v3';
const ALLOWED = new Set([13625351,14680687]);
const STATES = new Map([
  [105149571,'novo'],[105149575,'em_contato'],[105149579,'em_contato'],[105149583,'em_contato'],
  [105149587,'agendado'],[105480591,'compareceu'],[105480595,'convertido'],
  ...[105480599,105480603,105480607,105480611,105480615,105480619].map(id=>[id,'em_contato']),
  [113434019,'novo'],[113434023,'novo'],[113434027,'em_contato'],[113434031,'em_contato'],
  [142,'convertido'],[143,'perdido']
]);
export function normalizedPhone(value) {
  let digits=String(value || '').replace(/\D/g,'').replace(/^00/,'');
  if (digits.length===10 || digits.length===11) digits='55'+digits;
  return /^55\d{10,11}$/.test(digits) ? digits : '';
}
const truth = v => v===true || v===1 || v==='1' || v==='true';
function eligible(k) {return k && ALLOWED.has(Number(k.pipeline_id)) && !truth(k.is_deleted);}

// Pure orchestration. Only repository.apply/remove can change existing site records.
export async function synchronizeKommo({repo,request,remoteIds = undefined}) {
  const leads=await repo.list();
  const report={version:CRM_VERSION,storage:'mysql',fetchedCount:0,matchedCount:0,updatedCount:0,unmatchedCount:0,unknownStatusCount:0,missingRemoteCount:0,ambiguousCount:0,reboundCount:0,outOfScopeCount:0};
  const cache=new Map();
  async function getLead(id) {
    const key=String(id);
    if (!cache.has(key)) {
      const lead=await request(`leads/${encodeURIComponent(key)}?with=contacts`);
      cache.set(key,lead); if(lead) report.fetchedCount++;
    }
    return cache.get(key);
  }
  async function apply(local,k,rebind=false) {
    if (!k) {report.missingRemoteCount++;return;}
    if (!rebind && String(k.id)!==String(local.kommoLeadId || k.id)) return;
    if (truth(k.is_deleted)) {await repo.remove(local.id);return;}
    if (!eligible(k)) return;
    const status=STATES.get(Number(k.status_id));
    if (!status) {report.unknownStatusCount++;return;}
    if (!Number.isFinite(Number(k.updated_at)) || Number(k.updated_at)<=0) throw new Error('Kommo returned an invalid update timestamp');
    report.matchedCount++;
    if (await repo.apply(local.id,k,status,{rebind,expectedKommoId:local.kommoLeadId || '',expectedUpdatedAt:Number(local.kommoUpdatedAt || 0)})) {
      report.updatedCount++;
      if(rebind) report.reboundCount++;
    }
  }
  async function recover(local, requiredId) {
    const rebind=Boolean(local.kommoLeadId);
    if(rebind) {
      const previous=await getLead(local.kommoLeadId);
      // Only repair an existing, live link outside the supported treatment funnels.
      // A missing/deleted entity is never silently replaced with another treatment.
      if(!previous || truth(previous.is_deleted) || ALLOWED.has(Number(previous.pipeline_id))) return;
    }
    const createdAt=Date.parse(local.createdAt || '')/1000;
    const phone=normalizedPhone(local.phone);
    if(!phone || leads.filter(l=>normalizedPhone(l.phone)===phone).length!==1) {report.ambiguousCount++;return;}
    const candidates=new Map();
    let page=1;
    while(true) {
      const data=await request(`contacts?query=${encodeURIComponent(phone)}&with=leads&limit=250&page=${page}`);
      for(const contact of data?._embedded?.contacts || []) {
        const phones=(contact.custom_fields_values || []).filter(f=>f.field_code==='PHONE').flatMap(f=>(f.values || []).map(v=>normalizedPhone(v.value)));
        if(!phones.includes(phone)) continue;
        for(const ref of contact._embedded?.leads || []) {
          const k=await getLead(ref.id);
          if(eligible(k) && (!Number.isFinite(createdAt) || Number(k.created_at)>=createdAt-60) && !leads.some(l=>l.kommoLeadId && String(l.kommoLeadId)===String(k.id))) candidates.set(String(k.id),k);
        }
      }
      if(!data?._links?.next) break;
      if(++page>100) throw new Error('Kommo contact pagination limit exceeded; no ambiguous association applied');
    }
    if(candidates.size===1) {
      const candidate=[...candidates.values()][0];
      if(!requiredId || String(candidate.id)===requiredId) await apply(local,candidate,rebind);
    } else if(candidates.size>1) report.ambiguousCount++;
    else report.unmatchedCount++;
  }
  if (remoteIds) {
    for(const id of new Set(remoteIds.map(String))) {
      const local=leads.find(l=>String(l.kommoLeadId || '')===id);
      if(local) await apply(local,await getLead(id));
      else {
        const k=await getLead(id);
        if(!eligible(k)) continue;
        const eventPhones=new Set();
        for(const ref of k._embedded?.contacts || []) {
          const contact=await request(`contacts/${ref.id}?with=leads`);
          for(const field of contact?.custom_fields_values || []) if(field.field_code==='PHONE') {
            for(const value of field.values || []) {const phone=normalizedPhone(value.value);if(phone) eventPhones.add(phone);}
          }
        }
        for(const candidate of leads.filter(l=>eventPhones.has(normalizedPhone(l.phone)))) await recover(candidate,id);
      }
    }
  } else {
    for(const l of leads.filter(l=>l.kommoLeadId)) {
      const remote=await getLead(l.kommoLeadId);
      if(remote && !truth(remote.is_deleted) && !ALLOWED.has(Number(remote.pipeline_id))) {
        report.outOfScopeCount++;
        await recover(l);
      } else await apply(l,remote);
    }
    for(const local of leads.filter(l=>!l.kommoLeadId)) {
      await recover(local);
    }
  }
  return report;
}

export async function receiveKommoWebhook({repo,request,payload}) {
  const container=payload?.leads || {};
  const items=value=>Array.isArray(value)?value:value && typeof value==='object'?Object.values(value):[];
  const deleted=new Set(items(container.delete).map(l=>String(l.id)));
  const changed=[...items(container.status),...items(container.update),...items(container.add),...(payload?.lead?[payload.lead]:[]),...(Array.isArray(payload)?payload:[])];
  for(const item of changed) if(truth(item.is_deleted)||truth(item.deleted)) deleted.add(String(item.id));
  const leads=await repo.list();
  let deletedCount=0;
  for(const local of leads) if(local.kommoLeadId && deleted.has(String(local.kommoLeadId))) {await repo.remove(local.id);deletedCount++;}
  // Re-read the current remote entity instead of trusting delayed status payloads.
  const remoteIds=changed.map(l=>String(l.id || '')).filter(id=>/^\d+$/.test(id) && !deleted.has(id));
  const result=await synchronizeKommo({repo,request,remoteIds});
  return {...result,deletedCount};
}

export function createKommoRepository(pool,list) {
  if(!pool) throw new Error('MySQL unavailable');
  return {
    list,
    async apply(id,k,status,options={}) {
      if(options.rebind) {
        const [result]=await pool.query(`UPDATE nido_leads SET status=?, kommo_lead_id=?, kommo_status_id=?, kommo_updated_at=?, ${GOOGLE_QUALIFICATION_ASSIGNMENTS}, updated_at=NOW() WHERE id=? AND deleted_at IS NULL AND kommo_lead_id=? AND COALESCE(kommo_updated_at,0)=?`,
          [status,String(k.id),String(k.status_id),Number(k.updated_at),id,String(options.expectedKommoId),Number(options.expectedUpdatedAt)]);
        return result.affectedRows>0;
      }
      const [result]=await pool.query(`UPDATE nido_leads SET status=?, kommo_lead_id=?, kommo_status_id=?, kommo_updated_at=?, ${GOOGLE_QUALIFICATION_ASSIGNMENTS}, updated_at=NOW() WHERE id=? AND deleted_at IS NULL AND (kommo_lead_id IS NULL OR kommo_lead_id='' OR kommo_lead_id=?) AND COALESCE(kommo_updated_at,0)<=?`,
        [status,String(k.id),String(k.status_id),Number(k.updated_at),id,String(k.id),Number(k.updated_at)]);
      return result.affectedRows>0;
    },
    async remove(id) {
      await pool.query('UPDATE nido_leads SET deleted_at=NOW(), updated_at=NOW() WHERE id=? AND deleted_at IS NULL',[id]);
    }
  };
}
