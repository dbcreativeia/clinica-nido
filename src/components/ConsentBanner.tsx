import React,{useEffect,useState} from 'react';
import {ShieldCheck,X,Lock} from 'lucide-react';
import {Link} from 'react-router-dom';
import {trackGooglePageView,syncGoogleConsent} from '../utils/googleConsent';
import {initTrafficAttribution} from '../utils/trafficSource';
import {trackMetaPageView,refreshMetaConsent} from '../utils/metaConversions';
import {readCookiePreferences,saveCookiePreferences,hasCrmLocationConsent,saveLocationPreference,flushPrivacyReceipts,privacyStorageChanged} from '../utils/privacyConsent';

const choiceButtonClass='min-h-16 w-full rounded-xl border border-[#44342E] bg-white px-4 py-3 text-sm font-semibold text-[#44342E] hover:bg-[#FAF6F0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44342E] cursor-pointer';
export const ConsentBanner:React.FC=()=>{
 const [visible,setVisible]=useState(false),[custom,setCustom]=useState(false);
 const [analytics,setAnalytics]=useState(false),[meta,setMeta]=useState(false),[crmLocation,setCrmLocation]=useState(false),[error,setError]=useState('');
 function syncChoices(){const c=readCookiePreferences();setAnalytics(c?.analytics===true);setMeta(c?.meta===true);setCrmLocation(hasCrmLocationConsent());}
 useEffect(()=>{
  syncChoices();setVisible(!readCookiePreferences());trackGooglePageView();void flushPrivacyReceipts();
  const reopen=()=>{syncChoices();setError('');setCustom(true);setVisible(true);};
  const storage=(e:StorageEvent)=>{privacyStorageChanged(e);syncChoices();refreshMetaConsent();trackGooglePageView();};
  const online=()=>{void flushPrivacyReceipts();};
  window.addEventListener('nido:open-cookie-settings',reopen);window.addEventListener('storage',storage);window.addEventListener('online',online);
  return()=>{window.removeEventListener('nido:open-cookie-settings',reopen);window.removeEventListener('storage',storage);window.removeEventListener('online',online);};
 },[]);
 function choose(a:boolean,m:boolean){
  try{const previouslyAllowed=readCookiePreferences()?.meta===true;saveCookiePreferences(a,m);refreshMetaConsent();syncGoogleConsent();if(a)trackGooglePageView();
   if(m&&!previouslyAllowed){try{initTrafficAttribution();void trackMetaPageView();}catch{/* Tracking failure never invalidates the saved choice. */}}
   setAnalytics(a);setMeta(m);setVisible(false);setError('');
  }catch{setError('Não foi possível salvar sua escolha neste navegador. Os rastreadores opcionais permanecem sujeitos à última preferência válida.');}
 }
 function revokeLocation(){try{saveLocationPreference(false);setCrmLocation(false);}catch{setError('Não foi possível atualizar a preferência de localização.');}}
 if(!visible)return null;
 return <section data-analytics-ignore aria-label="Preferências de privacidade" className="fixed bottom-0 inset-x-0 z-[100] max-h-[85dvh] overflow-y-auto bg-white border-t border-[#E5DAD0] shadow-2xl px-4 py-5 sm:px-6 text-[#241E1B]">
  <div className="max-w-5xl mx-auto space-y-4">
   <div className="flex items-start justify-between gap-4"><h2 className="flex items-center gap-2 font-serif text-xl sm:text-2xl"><ShieldCheck aria-hidden className="w-5 h-5 text-[#8C7359]"/>Sua privacidade na Nidô</h2><button type="button" aria-label="Fechar preferências sem alterar escolhas" onClick={()=>setVisible(false)} className="p-2 rounded-lg hover:bg-[#FAF6F0] cursor-pointer"><X className="w-5 h-5"/></button></div>
   <p className="text-sm leading-relaxed text-[#5C4B44]">Usamos cookies necessários para o site funcionar. Com sua autorização, também medimos a navegação para melhorar o site e compartilhamos identificadores e eventos com a Meta para medir nossos anúncios. Você pode mudar sua escolha a qualquer momento.</p>
   {custom&&<div className="space-y-3 text-sm">
    <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E5DAD0]"><h3 className="font-semibold flex items-center gap-2"><Lock className="w-4 h-4" aria-hidden/>Necessários: sempre ativos</h3><p className="mt-1 text-[#5C4B44]">Permitem o funcionamento do site e registram suas preferências de privacidade.</p></div>
    <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5DAD0] cursor-pointer"><input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)} className="mt-1 w-5 h-5 accent-[#44342E] shrink-0"/><span><strong className="block">Analytics</strong><span className="text-[#5C4B44]">Usamos Analytics Interno e Google Analytics para medir páginas visitadas, cliques e tempo de navegação. Os registros internos podem relacionar a navegação ao contato enviado no site.</span></span></label>
    <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5DAD0] cursor-pointer"><input type="checkbox" checked={meta} onChange={e=>setMeta(e.target.checked)} className="mt-1 w-5 h-5 accent-[#44342E] shrink-0"/><span><strong className="block">Publicidade</strong><span className="text-[#5C4B44]">Permitem medir anúncios com a Meta usando eventos, cookies e identificadores. Ao enviar um formulário, nome, e-mail e telefone podem ser enviados com hash para correspondência.</span></span></label>
    <div className="p-3 rounded-xl bg-[#FAF6F0] text-[#5C4B44]"><strong className="text-[#241E1B]">Localização é uma escolha separada.</strong><p>O GPS é solicitado separadamente na entrada do site ou em <Link to="/contato" onClick={()=>setVisible(false)} className="underline">Como chegar</Link>. Aceitar cookies não autoriza guardar coordenadas no CRM.</p>{crmLocation&&<button type="button" onClick={revokeLocation} className="mt-2 underline font-semibold text-[#44342E] cursor-pointer">Revogar armazenamento da minha localização no CRM</button>}</div>
   </div>}
   {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
    <button type="button" onClick={()=>choose(true,true)} className={choiceButtonClass}>Aceitar todos os cookies opcionais</button>
    <button type="button" onClick={()=>choose(false,false)} className={choiceButtonClass}>Recusar opcionais</button>
    {custom?<button type="button" onClick={()=>choose(analytics,meta)} className="w-full rounded-xl bg-[#44342E] text-white px-4 py-3 text-sm font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2">Salvar minhas escolhas</button>:<button type="button" onClick={()=>{syncChoices();setCustom(true);}} className="w-full rounded-xl border border-[#E5DAD0] px-4 py-3 text-sm font-semibold text-[#44342E] hover:bg-[#FAF6F0] cursor-pointer">Personalizar</button>}
   </div>
   <p className="text-xs text-[#5C4B44] flex flex-wrap gap-x-4 gap-y-2"><Link to="/politica-de-privacidade" onClick={()=>setVisible(false)} className="underline">Política de Privacidade</Link><Link to="/politica-de-cookies" onClick={()=>setVisible(false)} className="underline">Política de Cookies</Link><span>Recusar não impede o acesso ao site ou ao atendimento.</span></p>
  </div>
 </section>;
};
