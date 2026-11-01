import React,{useEffect,useState} from 'react';
import {trackMetaFindLocation} from '../utils/metaConversions';
import {trackCTAClick} from '../utils/internalAnalytics';
import {Link} from 'react-router-dom';
import {requestBrowserLocation,clearVisitorLocation} from '../utils/internalAnalytics';
import {hasCrmLocationConsent,saveLocationPreference} from '../utils/privacyConsent';
export const LocationPreferences:React.FC=()=>{
 const [store,setStore]=useState(()=>hasCrmLocationConsent());
 const [busy,setBusy]=useState(false),[route,setRoute]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{const sync=()=>setStore(hasCrmLocationConsent());window.addEventListener('nido:privacy-preferences-changed',sync);return()=>window.removeEventListener('nido:privacy-preferences-changed',sync);},[]);
 function changeStore(allowed:boolean){try{saveLocationPreference(allowed);setStore(allowed);if(!allowed)clearVisitorLocation();}catch{setMessage('Não foi possível salvar a autorização. A localização não será guardada no CRM.');setStore(false);}}
 async function locate(){
  if(busy)return;setBusy(true);setMessage('');setRoute('');
  try{
   const p=await requestBrowserLocation({storeInCrm:store&&hasCrmLocationConsent()});
   if(!p||p.latitude===undefined||p.longitude===undefined){setMessage('Não foi possível obter a localização. Você pode abrir o endereço nos aplicativos abaixo sem compartilhar coordenadas com a Nidô.');return;}
   setRoute(`https://www.google.com/maps/dir/?api=1&origin=${p.latitude},${p.longitude}&destination=${encodeURIComponent('Rua Dona Germaine Burchard, 499, São Paulo, SP')}`);
   setMessage(store&&hasCrmLocationConsent()?'Localização obtida e autorizada para o CRM. Abra a rota abaixo.':'Localização usada apenas para preparar a rota, sem armazenamento no CRM.');
  }finally{setBusy(false);}
 }
 return <div data-analytics-ignore className="p-5 rounded-2xl border border-[#E5DAD0] bg-white space-y-3 text-sm">
  <h3 className="font-semibold text-[#241E1B]">Calcular uma rota a partir de onde você está</h3>
  <p className="text-[#5C4B44]">Seu navegador solicitará permissão. Ao abrir a rota calculada, suas coordenadas serão compartilhadas com o Google Maps. Você também pode usar os links abaixo sem fornecer sua localização à Nidô.</p>
  <label className="flex gap-3 items-start text-[#5C4B44] cursor-pointer"><input type="checkbox" checked={store} onChange={e=>changeStore(e.target.checked)} className="mt-1 w-5 h-5 shrink-0 accent-[#44342E]"/><span>Também autorizo guardar minhas coordenadas no CRM da Nidô para análise geográfica dos visitantes e vinculá-las ao meu contato, caso eu envie um formulário. Esta autorização é opcional e separada dos cookies.</span></label>
  <p className="text-xs text-[#5C4B44]">As coordenadas ficam neste navegador durante a sessão, por até 24 horas. Se enviadas com navegação ou formulário, ficam registradas nos sistemas da clínica. Você pode retirar a autorização aqui ou em Preferências de privacidade. Para solicitar exclusão de dados já recebidos, consulte a <Link to="/politica-de-privacidade" className="underline">Política de Privacidade</Link>.</p>
  <div className="flex flex-col sm:flex-row gap-2"><button type="button" disabled={busy} onClick={()=>void locate()} className="rounded-xl bg-[#44342E] text-white font-semibold px-4 py-3 cursor-pointer disabled:opacity-60">{busy?'Obtendo localização…':'Usar minha localização para calcular a rota'}</button>{route&&<a href={route} data-location-app="Google Maps" onClick={()=>{void trackMetaFindLocation('Google Maps','Contato');trackCTAClick('Abrir rota calculada','https://www.google.com/maps/dir/');}} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#44342E] text-[#44342E] px-4 py-3 font-semibold text-center">Abrir rota calculada no Google Maps</a>}</div>
  {message&&<p role="status" className="text-[#5C4B44]">{message}</p>}
 </div>;
};
