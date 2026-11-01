import {requestBrowserLocation} from './internalAnalytics.ts';
import {saveLocationPreference,readLocationPreferences} from './privacyConsent.ts';
export async function requestCrmLocation(){
 const previous=readLocationPreferences();
 try{
  const location=await requestBrowserLocation({storeInCrm:false});
  // A privacy change while the native dialog was open takes precedence.
  if(readLocationPreferences()?.receiptId!==previous?.receiptId)return null;
  saveLocationPreference(!!location);
  if(location){
   const stored={...location,geoConsent:true};
   sessionStorage.setItem('nido_visitor_geo',JSON.stringify(stored));
   window.dispatchEvent(new CustomEvent('nido:location-changed'));
   return stored;
  }
  return null;
 }catch{saveLocationPreference(false);return null;}
}
