import {requestBrowserLocation} from './internalAnalytics.ts';
import {saveLocationPreference} from './privacyConsent.ts';
export async function requestCrmLocation(){
 saveLocationPreference(true);
 try{const location=await requestBrowserLocation({storeInCrm:true});if(!location)saveLocationPreference(false);return location;}
 catch{saveLocationPreference(false);return null;}
}
