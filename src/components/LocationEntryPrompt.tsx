import React,{useEffect,useState} from 'react';
import {MapPin} from 'lucide-react';
import {Link} from 'react-router-dom';
import {readLocationPreferences,saveLocationPreference} from '../utils/privacyConsent';
import {requestCrmLocation} from '../utils/locationPermission';
export const LocationEntryPrompt:React.FC=()=>{
 const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{
  const sync=()=>setVisible(!readLocationPreferences());sync();window.addEventListener('nido:privacy-preferences-changed',sync);return()=>window.removeEventListener('nido:privacy-preferences-changed',sync);
 },[]);
 async function allow(){setBusy(true);try{const loc=await requestCrmLocation();if(!loc){setVisible(true);setMessage('Não foi possível obter a localização. Você pode tentar novamente em Como chegar.');}else setVisible(false);}catch{setMessage('Não foi possível salvar sua autorização. Nenhuma localização foi guardada.');}finally{setBusy(false);}}
 function decline(){try{saveLocationPreference(false);setVisible(false);}catch{setVisible(false);}}
 if(!visible)return null;
 return <aside data-analytics-ignore aria-label="Permissão opcional de localização" className="fixed top-24 right-3 left-3 sm:left-auto sm:w-96 z-[110] rounded-2xl bg-white border border-[#E5DAD0] shadow-xl p-4 space-y-2 text-[#44342E]">
  <h2 className="font-serif text-lg flex items-center gap-2"><MapPin className="w-5 h-5" aria-hidden/>De onde você nos visita?</h2>
  <p className="text-sm leading-relaxed">Podemos guardar sua localização no CRM para analisar de onde vêm os visitantes e vinculá-la ao contato que você enviar?</p>
  <p className="text-xs">É opcional e separado dos cookies. Você pode retirar a autorização em Preferências de Privacidade.</p>
  {message?<><p role="status" className="text-sm">{message}</p><button type="button" onClick={()=>setVisible(false)} className="underline cursor-pointer">Fechar</button></>:<div className="grid grid-cols-2 gap-2"><button type="button" disabled={busy} onClick={()=>void allow()} className="rounded-xl border border-[#44342E] px-3 py-3 text-sm font-semibold cursor-pointer disabled:opacity-60">{busy?'Solicitando…':'Permitir localização'}</button><button type="button" disabled={busy} onClick={decline} className="rounded-xl border border-[#44342E] px-3 py-3 text-sm font-semibold cursor-pointer disabled:opacity-60">Não permitir</button></div>}
  <Link to="/politica-de-privacidade" className="text-xs underline">Como usamos os dados</Link>
 </aside>;
};
