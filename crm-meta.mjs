import crypto from 'node:crypto';
import {parseContext} from './tracking-context.mjs';
const QUALIFIED=new Set(['agendado','compareceu','convertido']);
const MAX_AGE=180*86400000;
const hash=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
export function normalizeMetaContext(input={},request={},now=Date.now()) {
  if(input?.marketingConsent!==true || !Number.isFinite(input.consentAt) || input.consentAt<=0 || input.consentAt>now || now-input.consentAt>=MAX_AGE || (input.expiresAt && input.expiresAt<=now))return null;
  const cookie=v=>typeof v==='string' && /^fb\.\d\.\d+\.[A-Za-z0-9._-]+$/.test(v) && v.length<=500?v:undefined;
  return {marketingConsent:true,consentAt:input.consentAt,expiresAt:Math.min(input.expiresAt||input.consentAt+MAX_AGE,input.consentAt+MAX_AGE),fbp:cookie(input.fbp),fbc:cookie(input.fbc),eventSourceUrl:'https://www.nidoestetica.com.br/',clientIp:typeof request.ip==='string'?request.ip.slice(0,64):undefined,clientUserAgent:typeof request.userAgent==='string'?request.userAgent.slice(0,1024):undefined};
}
export function cycleId(lead){return String(parseContext(lead.procedureCycles||lead.procedure_cycles)?.[0]?.cycleId||`initial_${lead.id}`);}
export function qualifiedEventId(lead){return 'nido_qualified_'+hash(`${lead.id}:${cycleId(lead)}`).slice(0,48);}
export function buildQualifiedLeadEvent(lead,now=Date.now()) {
  if(!lead || lead.deleted_at || !QUALIFIED.has(lead.status))return null;
  const stored=parseContext(lead.attribution||lead.attribution_context)?.meta;
  const meta=normalizeMetaContext(stored,{},now);if(!meta)return null;
  const user_data={};
  const visitorId=parseContext(lead.attribution||lead.attribution_context)?.visitorId;
  if(typeof visitorId==='string' && visitorId)user_data.external_id=hash(visitorId);
  const email=String(lead.email||'').trim().toLowerCase();if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.endsWith('@nido.local'))user_data.em=hash(email);
  let phone=String(lead.phone||'').replace(/\D/g,'');if(phone.length===10||phone.length===11)phone='55'+phone;if(/^55\d{10,11}$/.test(phone))user_data.ph=hash(phone);
  if(!user_data.em&&!user_data.ph)return null;
  const parts=String(lead.name||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/\s+/);
  if(parts[0])user_data.fn=hash(parts[0]);if(parts.length>1)user_data.ln=hash(parts.slice(1).join(' '));
  if(meta.fbp)user_data.fbp=meta.fbp;if(meta.fbc)user_data.fbc=meta.fbc;
  if(stored.clientIp)user_data.client_ip_address=stored.clientIp;if(stored.clientUserAgent)user_data.client_user_agent=stored.clientUserAgent;
  return {event_name:'Lead',event_id:qualifiedEventId(lead),event_time:Math.floor(now/1000),action_source:'system_generated',event_source_url:meta.eventSourceUrl,user_data,custom_data:{content_name:'Informações institucionais',content_category:'Site'}};
}
export async function initCrmMetaOutbox(pool){
 await pool.query(`CREATE TABLE IF NOT EXISTS nido_meta_outbox (event_id VARCHAR(100) PRIMARY KEY,lead_id VARCHAR(100) NOT NULL,cycle_id VARCHAR(150) NOT NULL,payload JSON NOT NULL,consent_expires_at BIGINT NOT NULL,state VARCHAR(16) NOT NULL DEFAULT 'pending',attempts INT NOT NULL DEFAULT 0,next_attempt_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,locked_until DATETIME NULL,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,sent_at DATETIME NULL,INDEX pending_events (state,next_attempt_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}
export function createCrmMetaQueue({pool,send,now=Date.now}){
 let draining;
 async function qualify(id){
  const [rows]=await pool.query('SELECT * FROM nido_leads WHERE id=? AND deleted_at IS NULL',[id]);const lead=rows[0];
  if(!lead)return {status:'missing'};
  const payload=buildQualifiedLeadEvent(lead,now());if(!payload)return {status:'ineligible'};
  if(lead.meta_lead_sent)return {status:'already_sent'};
  const meta=parseContext(lead.attribution_context).meta;
  await pool.query('INSERT IGNORE INTO nido_meta_outbox (event_id,lead_id,cycle_id,payload,consent_expires_at) VALUES (?,?,?,?,?)',[payload.event_id,id,cycleId(lead),JSON.stringify(payload),meta.expiresAt||meta.consentAt+MAX_AGE]);
  return {status:'queued',eventId:payload.event_id};
 }
 async function drain(){
  const [rows]=await pool.query("SELECT * FROM nido_meta_outbox WHERE state='pending' AND next_attempt_at<=NOW() AND (locked_until IS NULL OR locked_until<NOW()) ORDER BY created_at LIMIT 20");
  for(const row of rows){
   const [lease]=await pool.query("UPDATE nido_meta_outbox SET locked_until=DATE_ADD(NOW(),INTERVAL 2 MINUTE),attempts=attempts+1 WHERE event_id=? AND state='pending' AND (locked_until IS NULL OR locked_until<NOW())",[row.event_id]);if(!lease.affectedRows)continue;
   const payload=parseContext(row.payload);
   const [live]=await pool.query('SELECT id FROM nido_leads WHERE id=? AND deleted_at IS NULL',[row.lead_id]);
   if(!live.length || Number(row.consent_expires_at)<=now() || now()/1000-Number(payload.event_time)>7*86400){await pool.query("UPDATE nido_meta_outbox SET state='skipped',locked_until=NULL WHERE event_id=?",[row.event_id]);continue;}
   let result;try{result=await send({data:[payload]});}catch{result={success:false};}
   if(result.success===true && Number(result.events_received)>0){
    await pool.query("UPDATE nido_meta_outbox SET state='sent',sent_at=NOW(),locked_until=NULL WHERE event_id=?",[row.event_id]);
    await pool.query("UPDATE nido_leads SET meta_lead_sent=1,meta_lead_sent_at=NOW() WHERE id=? AND deleted_at IS NULL AND COALESCE(JSON_UNQUOTE(JSON_EXTRACT(procedure_cycles,'$[0].cycleId')),CONCAT('initial_',id))=?",[row.lead_id,row.cycle_id]);
   }else if(result.status===400){
    await pool.query("UPDATE nido_meta_outbox SET state='failed',locked_until=NULL WHERE event_id=?",[row.event_id]);
   }else{
    const seconds=Math.min(3600,30*2**Math.min(Number(row.attempts),7));
    await pool.query("UPDATE nido_meta_outbox SET locked_until=NULL,next_attempt_at=DATE_ADD(NOW(),INTERVAL ? SECOND) WHERE event_id=?",[seconds,row.event_id]);
   }
  }
 }
 return {qualify,flush(){if(!draining)draining=drain().finally(()=>{draining=null;});return draining;}};
}
