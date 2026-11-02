import {readCookiePreferences} from './privacyConsent';
import {syncGoogleAdsConsent} from './googleAdsContact.ts';
const GA_ID='G-NB4LH71DCL';
let initialized=false,lastPage:string|null=null;
function allowed(){return ['nidoestetica.com.br','www.nidoestetica.com.br'].includes(window.location.hostname)&&readCookiePreferences()?.analytics===true && !window.location.pathname.startsWith('/admin') && window.location.hash!=='#admin';}
export function syncGoogleConsent(){
 if(typeof window==='undefined')return false;
 const granted=allowed();(window as any)[`ga-disable-${GA_ID}`]=!granted;
 if(!granted){
  if(initialized)window.gtag?.('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  lastPage=null;
  for(const cookie of document.cookie.split(';')){const name=cookie.trim().split('=')[0];if(name==='_ga'||name.startsWith('_ga_'))for(const domain of ['',`; domain=${window.location.hostname}`,`; domain=.nidoestetica.com.br`])document.cookie=`${name}=; Max-Age=0; path=/${domain}; SameSite=Lax`;}
  syncGoogleAdsConsent();return false;
 }
 if(!initialized){
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer!.push(arguments);};
  window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  window.gtag('js',new Date());
  window.gtag('config',GA_ID,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:'https://www.nidoestetica.com.br/',page_title:'Clínica Nidô',page_referrer:'',cookie_expires:180*86400});
  const script=document.createElement('script');script.id='nido-google-analytics';script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;document.head.appendChild(script);initialized=true;
 }else window.gtag?.('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 syncGoogleAdsConsent();return true;
}
export function trackGooglePageView(){
 if(!syncGoogleConsent())return;
 const path=window.location.pathname;if(lastPage===path)return;lastPage=path;
 window.gtag?.('event','page_view',{page_location:'https://www.nidoestetica.com.br/',page_title:'Clínica Nidô',page_referrer:''});
}
