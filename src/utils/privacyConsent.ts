import {NOTICE_VERSION,CONSENT_DURATION_MS,readCookieChoice} from '../../privacy-consent.mjs';
export {NOTICE_VERSION,CONSENT_DURATION_MS};
const COOKIE_KEY='nido_cookie_consent';
const LOCATION_KEY='nido_location_consent';
const SUBJECT_KEY='nido_privacy_subject';
const PENDING_KEY='nido_privacy_receipts_pending';
const UUID_V4_REGEX=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const memoryStore=new Map<string,string>();

function generateUuid():string {
 try {
  if(typeof crypto!=='undefined' && typeof crypto.randomUUID==='function'){
   const id=crypto.randomUUID();
   if(UUID_V4_REGEX.test(id))return id;
  }
 }catch{}
 const bytes=new Uint8Array(16);
 try {
  if(typeof crypto!=='undefined' && typeof crypto.getRandomValues==='function'){
   crypto.getRandomValues(bytes);
  }else{
   for(let i=0;i<16;i++)bytes[i]=Math.floor(Math.random()*256);
  }
 }catch{
  for(let i=0;i<16;i++)bytes[i]=Math.floor(Math.random()*256);
 }
 bytes[6]=(bytes[6]&0x0f)|0x40;
 bytes[8]=(bytes[8]&0x3f)|0x80;
 const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
}

function safeGetItem(key:string):string|null {
 try {
  if(typeof localStorage!=='undefined'){
   const val=localStorage.getItem(key);
   if(val!==null)return val;
  }
 }catch{}
 try {
  if(typeof sessionStorage!=='undefined' && typeof sessionStorage.getItem==='function'){
   const val=sessionStorage.getItem(key);
   if(val!==null)return val;
  }
 }catch{}
 return memoryStore.get(key)??null;
}

function safeSetItem(key:string,value:string,critical=false):void {
 memoryStore.set(key,value);
 let savedLocal=false;
 try {
  if(typeof localStorage!=='undefined'){
   localStorage.setItem(key,value);
   savedLocal=true;
  }
 }catch{
  if(critical){
   try {
    localStorage.removeItem('nido_privacy_receipts');
    localStorage.removeItem(PENDING_KEY);
    localStorage.setItem(key,value);
    savedLocal=true;
   }catch{}
  }
 }
 if(!savedLocal){
  try {
   if(typeof sessionStorage!=='undefined' && typeof sessionStorage.setItem==='function'){
    sessionStorage.setItem(key,value);
   }
  }catch{}
 }
}

function safeRemoveItem(key:string):void {
 memoryStore.delete(key);
 try{if(typeof localStorage!=='undefined')localStorage.removeItem(key);}catch{}
 try{if(typeof sessionStorage!=='undefined' && typeof sessionStorage.removeItem==='function')sessionStorage.removeItem(key);}catch{}
}

export function privacySubjectId():string {
 let id=safeGetItem(SUBJECT_KEY);
 if(!id || !UUID_V4_REGEX.test(id)){
  id=generateUuid();
  safeSetItem(SUBJECT_KEY,id,true);
 }
 return id;
}
export function readCookiePreferences(){try{return readCookieChoice(safeGetItem(COOKIE_KEY));}catch{return null;}}
export function readLocationPreferences(){
 try {const c=JSON.parse(safeGetItem(LOCATION_KEY)||'null');return c && typeof c.crmLocation==='boolean' && c.noticeVersion===NOTICE_VERSION && c.timestamp>0 && c.timestamp<=Date.now() && c.expiresAt>Date.now() && Date.now()-c.timestamp<CONSENT_DURATION_MS?c:null;}catch{return null;}
}
export function hasCrmLocationConsent():boolean {return readLocationPreferences()?.crmLocation===true;}
export async function flushPrivacyReceipts():Promise<void>{
 let pending:any[];try{pending=JSON.parse(safeGetItem(PENDING_KEY)||'[]');if(!Array.isArray(pending))return;}catch{return;}
 for(const receipt of pending){
  try{const response=await fetch('/api/privacy/consent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(receipt),keepalive:true});const result=await response.json();if(!response.ok||result.success!==true)continue;
   const rawCurrent= JSON.parse(safeGetItem(PENDING_KEY)||'[]');
   const current=Array.isArray(rawCurrent)?rawCurrent:[];
   safeSetItem(PENDING_KEY,JSON.stringify(current.filter((r:any)=>r&&r.id!==receipt.id)));
  }catch{/* Keep the receipt for the next visit. */}
 }
}
function saveReceipt(kind:'cookies'|'location',choices:Record<string,boolean>,timestamp:number){
 const receipt={id:generateUuid(),subjectId:privacySubjectId(),kind,choices,timestamp,noticeVersion:NOTICE_VERSION};
 try {
  const parsedHistory=JSON.parse(safeGetItem('nido_privacy_receipts')||'[]');
  const history=Array.isArray(parsedHistory)?parsedHistory:[];
  safeSetItem('nido_privacy_receipts',JSON.stringify([...history,receipt].filter(r=>r&&timestamp-r.timestamp<CONSENT_DURATION_MS).slice(-100)));
 }catch{}
 try {
  const parsedPending=JSON.parse(safeGetItem(PENDING_KEY)||'[]');
  const pending=Array.isArray(parsedPending)?parsedPending:[];
  safeSetItem(PENDING_KEY,JSON.stringify([...pending,receipt].slice(-100)));
 }catch{}
 void flushPrivacyReceipts();return receipt;
}
export function saveCookiePreferences(analytics:boolean,meta:boolean){
 const timestamp=Date.now();const receipt=saveReceipt('cookies',{necessary:true,analytics,meta},timestamp);
 const choice={necessary:true,analytics,meta,timestamp,expiresAt:timestamp+CONSENT_DURATION_MS,noticeVersion:NOTICE_VERSION,consentSubjectId:receipt.subjectId,receiptId:receipt.id};
 safeSetItem(COOKIE_KEY,JSON.stringify(choice),true);
 if(!meta){
  for(const key of ['nido_fbp','nido_fbc'])safeRemoveItem(key);
  try {
   if(typeof document!=='undefined'){
    for(const name of ['_fbp','_fbc'])for(const domain of ['',`; domain=${window.location.hostname}`,`; domain=.nidoestetica.com.br`])document.cookie=`${name}=; Max-Age=0; path=/${domain}; SameSite=Lax`;
   }
  }catch{}
 }
 try{window.dispatchEvent(new CustomEvent('nido:analytics-consent-changed',{detail:{analytics}}));}catch{}
 try{window.dispatchEvent(new CustomEvent('nido:privacy-preferences-changed'));}catch{}
 return choice;
}
export function saveLocationPreference(crmLocation:boolean){
 const timestamp=Date.now();const receipt=saveReceipt('location',{crmLocation},timestamp);
 safeSetItem(LOCATION_KEY,JSON.stringify({crmLocation,timestamp,expiresAt:timestamp+CONSENT_DURATION_MS,noticeVersion:NOTICE_VERSION,receiptId:receipt.id}),true);
 try{sessionStorage.removeItem('nido_visitor_geo');}catch{}
 try{window.dispatchEvent(new CustomEvent('nido:location-changed'));}catch{}
 try{window.dispatchEvent(new CustomEvent('nido:privacy-preferences-changed'));}catch{}
}
export function privacyStorageChanged(event:StorageEvent){
 if(event.key===COOKIE_KEY || event.key===null){try{window.dispatchEvent(new CustomEvent('nido:analytics-consent-changed',{detail:{analytics:readCookiePreferences()?.analytics===true}}));window.dispatchEvent(new CustomEvent('nido:privacy-preferences-changed'));}catch{}}
 if(event.key===LOCATION_KEY || event.key===null){if(!hasCrmLocationConsent()){try{sessionStorage.removeItem('nido_visitor_geo');}catch{}}try{window.dispatchEvent(new CustomEvent('nido:location-changed'));window.dispatchEvent(new CustomEvent('nido:privacy-preferences-changed'));}catch{}}
}
