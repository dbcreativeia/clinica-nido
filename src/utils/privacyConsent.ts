import {NOTICE_VERSION,CONSENT_DURATION_MS,readCookieChoice} from '../../privacy-consent.mjs';
export {NOTICE_VERSION,CONSENT_DURATION_MS};
const COOKIE_KEY='nido_cookie_consent';
const LOCATION_KEY='nido_location_consent';
const SUBJECT_KEY='nido_privacy_subject';
const PENDING_KEY='nido_privacy_receipts_pending';
export function privacySubjectId():string {
 let id=localStorage.getItem(SUBJECT_KEY);
 if(!id || !/^[a-f0-9-]{36}$/i.test(id)){id=crypto.randomUUID();localStorage.setItem(SUBJECT_KEY,id);}
 return id;
}
export function readCookiePreferences(){try{return readCookieChoice(localStorage.getItem(COOKIE_KEY));}catch{return null;}}
export function hasCrmLocationConsent():boolean {
 try {const c=JSON.parse(localStorage.getItem(LOCATION_KEY)||'null');return c?.crmLocation===true && c.noticeVersion===NOTICE_VERSION && c.timestamp>0 && c.timestamp<=Date.now() && c.expiresAt>Date.now() && Date.now()-c.timestamp<CONSENT_DURATION_MS;}catch{return false;}
}
export async function flushPrivacyReceipts():Promise<void>{
 let pending:any[];try{pending=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');if(!Array.isArray(pending))return;}catch{return;}
 for(const receipt of pending){
  try{const response=await fetch('/api/privacy/consent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(receipt),keepalive:true});const result=await response.json();if(!response.ok||result.success!==true)continue;
   const current=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');localStorage.setItem(PENDING_KEY,JSON.stringify(current.filter((r:any)=>r.id!==receipt.id)));
  }catch{/* Keep the receipt for the next visit. */}
 }
}
function saveReceipt(kind:'cookies'|'location',choices:Record<string,boolean>,timestamp:number){
 const receipt={id:crypto.randomUUID(),subjectId:privacySubjectId(),kind,choices,timestamp,noticeVersion:NOTICE_VERSION};
 const history=JSON.parse(localStorage.getItem('nido_privacy_receipts')||'[]');
 localStorage.setItem('nido_privacy_receipts',JSON.stringify([...history,receipt].filter(r=>timestamp-r.timestamp<CONSENT_DURATION_MS).slice(-100)));
 const pending=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');localStorage.setItem(PENDING_KEY,JSON.stringify([...pending,receipt].slice(-100)));
 void flushPrivacyReceipts();return receipt;
}
export function saveCookiePreferences(analytics:boolean,meta:boolean){
 const timestamp=Date.now();const receipt=saveReceipt('cookies',{necessary:true,analytics,meta},timestamp);
 const choice={necessary:true,analytics,meta,timestamp,expiresAt:timestamp+CONSENT_DURATION_MS,noticeVersion:NOTICE_VERSION,consentSubjectId:receipt.subjectId,receiptId:receipt.id};
 localStorage.setItem(COOKIE_KEY,JSON.stringify(choice));
 if(!meta){
  for(const key of ['nido_fbp','nido_fbc'])localStorage.removeItem(key);
  for(const name of ['_fbp','_fbc'])for(const domain of ['',`; domain=${window.location.hostname}`,`; domain=.nidoestetica.com.br`])document.cookie=`${name}=; Max-Age=0; path=/${domain}; SameSite=Lax`;
 }
 window.dispatchEvent(new CustomEvent('nido:analytics-consent-changed',{detail:{analytics}}));
 window.dispatchEvent(new CustomEvent('nido:privacy-preferences-changed'));
 return choice;
}
export function saveLocationPreference(crmLocation:boolean){
 const timestamp=Date.now();const receipt=saveReceipt('location',{crmLocation},timestamp);
 localStorage.setItem(LOCATION_KEY,JSON.stringify({crmLocation,timestamp,expiresAt:timestamp+CONSENT_DURATION_MS,noticeVersion:NOTICE_VERSION,receiptId:receipt.id}));
 sessionStorage.removeItem('nido_visitor_geo');window.dispatchEvent(new CustomEvent('nido:location-changed'));
 window.dispatchEvent(new CustomEvent('nido:privacy-preferences-changed'));
}
export function privacyStorageChanged(event:StorageEvent){
 if(event.key===COOKIE_KEY || event.key===null){window.dispatchEvent(new CustomEvent('nido:analytics-consent-changed',{detail:{analytics:readCookiePreferences()?.analytics===true}}));window.dispatchEvent(new CustomEvent('nido:privacy-preferences-changed'));}
 if(event.key===LOCATION_KEY || event.key===null){if(!hasCrmLocationConsent())sessionStorage.removeItem('nido_visitor_geo');window.dispatchEvent(new CustomEvent('nido:location-changed'));window.dispatchEvent(new CustomEvent('nido:privacy-preferences-changed'));}
}
