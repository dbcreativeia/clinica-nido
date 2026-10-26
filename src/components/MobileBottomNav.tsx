import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Cpu, Users, MapPin, MessageCircle } from 'lucide-react';
import { openWhatsApp, WhatsAppMessages } from '../utils/whatsapp';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const handleWhatsApp = () => {
    openWhatsApp(WhatsAppMessages.general(), {
      service_name: 'Geral',
      page_path: location.pathname,
      cta_location: 'Menu Fixo Inferior Mobile'
    });
  };

  const navItems = [
    { label: 'Tratamentos', path: '/tratamentos', icon: Sparkles },
    { label: 'Tecnologias', path: '/tecnologias', icon: Cpu },
    { label: 'Equipe', path: '/corpo-clinico', icon: Users },
    { label: 'Endereço', path: '/contato', icon: MapPin },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-lg border-t border-[#E5DAD0] shadow-lg safe-area-pb">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/contato' && location.pathname.startsWith('/contato'));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center h-full py-1 transition-colors relative cursor-pointer ${
                isActive ? 'text-[#44342E] font-semibold' : 'text-[#8C7359] hover:text-[#241E1B]'
              }`}
            >
              {isActive && (
                <span className="absolute top-1 w-6 h-0.5 bg-[#44342E] rounded-full" />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#44342E]' : 'text-[#8C7359]'}`} />
              <span className={`text-[9px] min-[360px]:text-[10px] tracking-tight mt-1 leading-none text-center whitespace-nowrap ${
                isActive ? 'font-semibold text-[#44342E]' : 'font-medium text-[#8C7359]'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Botão Oficial de WhatsApp Integrado ao Menu Fixo Inferior */}
        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center h-full py-1 group cursor-pointer"
          aria-label="Abrir WhatsApp da Clínica Nidô"
        >
          <div className="w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 rounded-full bg-[#44342E] group-hover:bg-[#5A453D] text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 shrink-0 animate-whatsapp-brand-pulse">
            <MessageCircle className="w-4 h-4 fill-current" />
          </div>
          <span className="text-[9px] min-[360px]:text-[10px] tracking-tight mt-1 leading-none font-semibold text-[#1F1916] whitespace-nowrap text-center">
            WhatsApp
          </span>
        </button>
      </div>
    </div>
  );
};
