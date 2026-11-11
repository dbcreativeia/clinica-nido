import {readCookiePreferences,NOTICE_VERSION} from './privacyConsent.ts';
const ADS_ID='AW-11000286313';
const NEUTRAL_URL='https://www.nidoestetica.com.br/';
let configured=false;
const confirmed=new Set<string>();
export function hasGoogleAdsConsent(){
 if(typeof window==='undefined')return false;
 const c=readCookiePreferences();
 return ['nidoestetica.com.br','www.nidoestetica.com.br'].includes(window.location.hostname)&&
  window.location.hash!=='#admin'&&!window.location.pathname.startsWith('/admin')&&c?.meta===true&&c.noticeVersion===NOTICE_VERSION;
}
export function syncGoogleAdsConsent(){
 if(typeof window==='undefined')return false;
 const allowed=hasGoogleAdsConsent();
 if(!allowed){try{if(configured)window.gtag?.('consent','update',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});}catch{}return false;}
 try{
  window.dataLayer=window.dataLayer||[];
  if(typeof window.gtag!=='function'){window.gtag=function(){window.dataLayer!.push(arguments);};}
  window.gtag('consent','update',{analytics_storage:readCookiePreferences()?.analytics?'granted':'denied',ad_storage:'granted',ad_user_data:'granted',ad_personalization:'denied'});
  if(!configured){
   window.gtag('js',new Date());
   window.gtag('config',ADS_ID,{send_page_view:false,allow_ad_personalization_signals:false,allow_google_signals:false,page_location:NEUTRAL_URL,page_title:'Clínica Nidô',page_referrer:''});
   if(typeof document!=='undefined' && typeof document.createElement==='function' && document.head?.appendChild){
    const script=document.createElement('script');script.id='nido-google-ads';script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+ADS_ID;document.head.appendChild(script);
   }
   configured=true;
  }
 }catch{}
 return true;
}
// Called only after MySQL acknowledged the form. Opening WhatsApp is not a conversation.
export function trackConfirmedGoogleContact(id:string){
 if(!id||confirmed.has(id)||!syncGoogleAdsConsent())return;
 try{
  window.gtag?.('event','conversion',{send_to:ADS_ID+'/GoyeCMrii5MaEOmYrP0o',transaction_id:id,
   page_location:NEUTRAL_URL,page_title:'Clínica Nidô',page_referrer:''});
  confirmed.add(id);
 }catch{}
}
