export const NOTICE_VERSION='nido-privacy-2026-11-02';
export const CONSENT_DURATION_MS=180*86400000;
export function readCookieChoice(raw,now=Date.now()) {
 try {
  const c=typeof raw==='string'?JSON.parse(raw):raw;
  if(!c || typeof c.timestamp!=='number' || c.timestamp<=0 || c.timestamp>now || now-c.timestamp>=CONSENT_DURATION_MS || (c.expiresAt && (typeof c.expiresAt!=='number'||c.expiresAt<=now)))return null;
  return {...c,necessary:true,analytics:c.analytics===true,meta:c.meta===true};
 }catch{return null;}
}
const uuid=v=>typeof v==='string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
export function normalizeConsentReceipt(input,now=Date.now()) {
 if(!input || !uuid(input.id)||!uuid(input.subjectId)||!['cookies','location'].includes(input.kind)||input.noticeVersion!==NOTICE_VERSION||!Number.isFinite(input.timestamp)||input.timestamp<=0||input.timestamp>now+60000||now-input.timestamp>CONSENT_DURATION_MS||typeof input.choices!=='object'||!input.choices)throw new Error('Invalid privacy receipt');
 const choices=input.kind==='cookies'?{necessary:true,analytics:input.choices.analytics===true,meta:input.choices.meta===true}:{crmLocation:input.choices.crmLocation===true};
 return {id:input.id,subjectId:input.subjectId,kind:input.kind,noticeVersion:NOTICE_VERSION,timestamp:input.timestamp,choices};
}
export async function initConsentReceipts(pool){await pool.query(`CREATE TABLE IF NOT EXISTS nido_privacy_consents (id CHAR(36) PRIMARY KEY,subject_id CHAR(36) NOT NULL,kind VARCHAR(12) NOT NULL,notice_version VARCHAR(50) NOT NULL,chosen_at BIGINT NOT NULL,choices JSON NOT NULL,received_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),INDEX subject_history(subject_id,kind,received_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);await pool.query('DELETE FROM nido_privacy_consents WHERE received_at<DATE_SUB(NOW(),INTERVAL 12 MONTH)');}
export async function recordConsentReceipt(pool,input,now=Date.now()){
 const r=normalizeConsentReceipt(input,now);
 await pool.query('INSERT IGNORE INTO nido_privacy_consents (id,subject_id,kind,notice_version,chosen_at,choices) VALUES (?,?,?,?,?,?)',[r.id,r.subjectId,r.kind,r.noticeVersion,r.timestamp,JSON.stringify(r.choices)]);
 return r.id;
}
/** @param {number|undefined} [eventAt] */
export async function isStoredMarketingAllowed(pool,lead,eventAt=undefined){
 let a;try{a=typeof lead.attribution_context==='string'?JSON.parse(lead.attribution_context):lead.attribution_context;}catch{return false;}
 const id=a?.meta?.consentSubjectId;if(!id)return true; // Legacy consent remains subject to its original expiry.
 const [rows]=await pool.query("SELECT choices FROM nido_privacy_consents WHERE subject_id=? AND kind='cookies' ORDER BY chosen_at DESC,received_at DESC,id DESC LIMIT 1",[id]);
 if(!rows.length)return false;
 const c=typeof rows[0].choices==='string'?JSON.parse(rows[0].choices):rows[0].choices;if(c?.meta!==true)return false;
 if(eventAt!==undefined){
  if(!Number.isFinite(eventAt))return false;
  const [history]=await pool.query("SELECT choices,notice_version FROM nido_privacy_consents WHERE subject_id=? AND kind='cookies' AND chosen_at<=? ORDER BY chosen_at DESC,received_at DESC,id DESC LIMIT 1",[id,eventAt]);
  if(!history.length||history[0].notice_version!==NOTICE_VERSION)return false;
  const previous=typeof history[0].choices==='string'?JSON.parse(history[0].choices):history[0].choices;
  return previous?.meta===true;
 }
 return true;
}
