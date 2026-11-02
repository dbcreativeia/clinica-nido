import crypto from 'node:crypto';
import {parseContext} from './tracking-context.mjs';

export const GOOGLE_NOTICE_VERSION='nido-privacy-2026-11-02';
export const GOOGLE_CONVERSION_NAME='NIDÔ | Lead qualificado | CRM';
const QUALIFIED=new Set(['agendado','compareceu','convertido']);
const DAY=86400000;
const click=v=>typeof v==='string' && /^[A-Za-z0-9_-]{10,255}$/.test(v);
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
// Append after the status/attribution assignments in the same UPDATE statement.
// MySQL evaluates these assignments left-to-right: snapshot before stamping time.
export const GOOGLE_QUALIFICATION_ASSIGNMENTS=`google_qualification_context=IF(google_qualified_at IS NULL
 AND status IN ('agendado','compareceu','convertido') AND JSON_UNQUOTE(JSON_EXTRACT(attribution_context,'$.google.gclid')) IS NOT NULL,
 JSON_EXTRACT(attribution_context,'$.google'),google_qualification_context),
 google_qualified_at=IF(google_qualified_at IS NULL AND status IN ('agendado','compareceu','convertido')
 AND JSON_UNQUOTE(JSON_EXTRACT(attribution_context,'$.google.gclid')) IS NOT NULL,
 CONCAT(LEFT(DATE_FORMAT(UTC_TIMESTAMP(3),'%Y-%m-%d %H:%i:%s.%f'),23),'+00:00'),google_qualified_at)`;

// Old attribution combined braids and GCLIDs. Never reinterpret those legacy IDs.
export function normalizeGoogleContext(attribution={},consent={},now=Date.now()){
 if(!attribution||!consent)return null;
 if(attribution.clickIdType!=='gclid' || !click(attribution.gclid))return null;
 const captured=Date.parse(attribution.capturedAt||'');
 if(!Number.isFinite(captured)||captured>now||now-captured>=90*DAY)return null;
 if(consent.marketingConsent!==true||consent.noticeVersion!==GOOGLE_NOTICE_VERSION ||
    !Number.isFinite(consent.consentAt)||consent.consentAt<=0||consent.consentAt>now||
    now-consent.consentAt>=180*DAY||!Number.isFinite(consent.expiresAt)||consent.expiresAt<=now)return null;
 if(typeof consent.consentSubjectId!=='string'||!/^[a-f0-9-]{36}$/i.test(consent.consentSubjectId))return null;
 return {gclid:attribution.gclid,clickIdType:'gclid',capturedAt:new Date(captured).toISOString(),
  marketingConsent:true,noticeVersion:GOOGLE_NOTICE_VERSION,consentAt:consent.consentAt,
  expiresAt:Math.min(consent.expiresAt,consent.consentAt+180*DAY),consentSubjectId:consent.consentSubjectId};
}
function googleContext(value,now){const g=parseContext(value);return normalizeGoogleContext(g,g,now);}
const consentLead=g=>({attribution_context:{meta:g}});
export function createGoogleLedger({pool,now=Date.now,isAllowed}){
 let starting;
 async function init(){
  if(!starting)starting=pool.query(`CREATE TABLE IF NOT EXISTS nido_google_qualifications (
   lead_id VARCHAR(100) PRIMARY KEY,gclid VARCHAR(255) NOT NULL,qualified_at VARCHAR(30) NOT NULL,
   order_id CHAR(64) NOT NULL,google_context JSON NOT NULL,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(e=>{starting=null;throw e;});
  await starting;
 }
 async function qualify(id){
  await init();const [rows]=await pool.query('SELECT * FROM nido_leads WHERE id=? AND deleted_at IS NULL',[id]);const lead=rows[0];
  if(!lead||lead.deleted_at||!lead.google_qualified_at)return {status:'ineligible'};
  const time=lead.google_qualified_at,eventAt=Date.parse(time.replace(' ','T'));
  const g=googleContext(lead.google_qualification_context,now());
  if(!Number.isFinite(eventAt)||eventAt>now()||!g||eventAt<Date.parse(g.capturedAt)||!await isAllowed(consentLead(g),eventAt))return {status:'ineligible'};
  await pool.query('INSERT IGNORE INTO nido_google_qualifications (lead_id,gclid,qualified_at,order_id,google_context) VALUES (?,?,?,?,?)',
   [id,g.gclid,time,hash('nido-google-qualified:'+id),JSON.stringify(g)]);
  return {status:'feed_ready'}; // Prepared is not the same as accepted by Google.
 }
 async function rows(){
  await init();const [rows]=await pool.query(`SELECT q.lead_id,q.gclid,q.qualified_at,q.order_id,q.google_context
   FROM nido_google_qualifications q JOIN nido_leads l ON l.id=q.lead_id
   WHERE l.deleted_at IS NULL AND q.created_at>=DATE_SUB(NOW(),INTERVAL 90 DAY)
   ORDER BY q.created_at,q.lead_id LIMIT 50000`);
  const output=[];
  for(const row of rows){const g=googleContext(row.google_context,now());if(g&&row.gclid===g.gclid&&await isAllowed(consentLead(g),Date.parse(row.qualified_at.replace(' ','T'))))output.push(row);}
  return output;
 }
 return {init,qualify,rows};
}
const cell=v=>'"'+String(v).replaceAll('"','""')+'"';
export function googleCsv(rows){
 return 'Google Click ID,Conversion Name,Conversion Time,Order ID\r\n'+rows.map(r=>
  [r.gclid,GOOGLE_CONVERSION_NAME,r.qualified_at,r.order_id].map(cell).join(',')+'\r\n').join('');
}
function authorized(header,secret){
 if(typeof secret!=='string'||secret.length<32||typeof header!=='string'||!header.startsWith('Basic '))return false;
 const provided=Buffer.from(header.slice(6),'base64');const expected=Buffer.from('googleads:'+secret);
 return provided.length===expected.length&&crypto.timingSafeEqual(provided,expected);
}
export function registerGoogleFeed(app,{ledger,getSecret,isProduction}){
 app.get('/api/google-ads/qualified.csv',async(req,res)=>{
  res.set('Cache-Control','no-store');res.set('X-Robots-Tag','noindex, nofollow');
  if(!isProduction())return res.status(404).end();
  if(!authorized(req.headers.authorization,getSecret())){res.set('WWW-Authenticate','Basic realm="Google Ads export"');return res.status(401).end();}
  try{return res.type('text/csv; charset=utf-8').send(googleCsv(await ledger.rows()));}
  catch{return res.status(503).type('text/plain').send('Conversion feed temporarily unavailable');}
 });
}
