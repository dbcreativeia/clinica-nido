import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { openWhatsApp, WhatsAppMessages, WHATSAPP_DISPLAY } from '../utils/whatsapp';

export const WhatsAppFloating: React.FC = () => {
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const location = useLocation();

  const handleWhatsApp = () => {
    openWhatsApp(WhatsAppMessages.general(), {
      service_name: 'Geral',
      page_path: location.pathname,
      cta_location: 'Botão Flutuante Desktop'
    });
  };

  return (
    /* Floating WhatsApp Button for Desktop only (hidden on mobile, integrated into bottom bar) */
    <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end">
      {!tooltipDismissed && (
        <div className="mb-2 bg-[#FFFFFF] text-[#241E1B] p-3.5 rounded-2xl shadow-xl border border-[#E5DAD0] text-xs max-w-xs relative animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={() => setTooltipDismissed(true)}
            className="absolute top-1.5 right-1.5 text-[#5C4B44]/60 hover:text-[#241E1B] p-0.5 cursor-pointer"
            aria-label="Fechar mensagem"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="font-semibold text-xs text-[#241E1B] pr-3">
            Dúvidas sobre procedimentos?
          </p>
          <p className="text-[11px] text-[#5C4B44] mt-0.5 font-normal">
            Estamos online no WhatsApp para orientar você.
          </p>
        </div>
      )}

      <button
        onClick={handleWhatsApp}
        className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#44342E] hover:bg-[#5A453D] text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer animate-whatsapp-brand-pulse"
        aria-label="Falar com a Clínica Nidô pelo WhatsApp"
      >
        {/* Subtle pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-[#8C7359]/30 animate-ping pointer-events-none" />
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-current relative z-10" />
      </button>
    </div>
  );
};
