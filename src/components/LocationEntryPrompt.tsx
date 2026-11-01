import React,{useEffect,useRef} from 'react';
import {readLocationPreferences,readCookiePreferences} from '../utils/privacyConsent';
import {requestCrmLocation} from '../utils/locationPermission';
export const LocationEntryPrompt:React.FC=()=>{
 const started=useRef(false);
 useEffect(()=>{
  if(started.current || readLocationPreferences() || readCookiePreferences())return;
  started.current=true;
  // Defer until the purpose notice has painted. The browser owns the permission UI.
  const frame=requestAnimationFrame(()=>{void requestCrmLocation();});
  return()=>{cancelAnimationFrame(frame);started.current=false;};
 },[]);
 return null;
};
