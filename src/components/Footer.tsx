import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Instagram, ShieldCheck, Clock } from 'lucide-react';
import { openWhatsApp, WhatsAppMessages, WHATSAPP_DISPLAY } from '../utils/whatsapp';

export const Footer: React.FC = () => {
  const handleWhatsApp = () => {
    openWhatsApp(WhatsAppMessages.general(), {
      service_name: 'Geral',
      cta_location: 'Rodapé'
    });
  };

  return (
    <footer className="bg-[#241C18] text-[#F7F2EB] pt-16 pb-24 md:pb-12 border-t border-[#332923]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 pb-12 border-b border-[#332923]">
          {/* Brand Info */}
          <div className="space-y-3 text-center md:text-left flex flex-col items-center md:items-start">
            <Link to="/" className="inline-block focus:outline-none" aria-label="Clínica Nidô - Início">
              <img
                src="/logo_nido.webp"
                alt="Clínica Nidô"
                className="h-8 sm:h-9 w-auto object-contain brightness-0 invert opacity-95 transition-opacity hover:opacity-100"
              />
            </Link>
            <p className="text-xs sm:text-sm text-[#F7F2EB]/90 leading-relaxed font-normal max-w-sm md:max-w-none">
              Estética avançada com avaliação individualizada, tecnologia de ponta e cuidado que respeita a sua identidade.
            </p>
            <div className="pt-1 flex justify-center md:justify-start w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#332923] text-[11px] font-light text-[#F7F2EB]/90 border border-[#443730] shadow-xs whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C4A480] shrink-0" />
                <span className="whitespace-nowrap">Resp. Técnica: Dra. Brenda Niyama (CRBM 35047)</span>
              </div>
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <h4 className="font-serif text-base text-[#FFFFFF] mb-3 tracking-wide font-bold">
              Atendimento & Horários
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-[#F7F2EB]/90 font-normal flex flex-col items-center md:items-start">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-2.5 text-center md:text-left">
                <MapPin className="w-4 h-4 text-[#C4A480] shrink-0 md:mt-0.5" />
                <span className="leading-snug">
                  Rua Dona Germaine Burchard, 499<br />
                  Água Branca, São Paulo — SP<br />
                  CEP 05002-062
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-2.5 text-center md:text-left">
                <Clock className="w-4 h-4 text-[#C4A480] shrink-0 md:mt-0.5" />
                <div>
                  <p className="font-medium">Segunda a Sexta: 09h às 20h</p>
                  <p className="font-medium">Sábados: 09h às 15h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social & WhatsApp CTA */}
          <div className="space-y-3 text-center md:text-left flex flex-col items-center md:items-start">
            <h4 className="font-serif text-base text-[#FFFFFF] mb-2 tracking-wide font-bold">
              Converse Conosco
            </h4>
            <p className="text-xs sm:text-sm text-[#F7F2EB]/90 font-normal max-w-sm md:max-w-none">
              Tire dúvidas sobre tratamentos específicos ou agende sua avaliação com nossa equipe.
            </p>
            <button
              onClick={handleWhatsApp}
              className="w-full max-w-sm md:max-w-none inline-flex items-center justify-center gap-2 bg-[#8C7359] hover:bg-[#A38768] text-[#FFFFFF] font-bold py-3 px-5 rounded-full text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm active:scale-98"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{WHATSAPP_DISPLAY}</span>
            </button>
            <div className="pt-1">
              <a
                href="https://www.instagram.com/nidoestetica/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs text-[#E5DAD0] font-semibold hover:text-[#FFFFFF] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#C4A480]" />
                <span>Acompanhe @nidoestetica no Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Ethical Regulatory Disclaimer */}
        <div className="py-4 border-b border-[#332923] text-[11px] text-[#C4B1A0]/80 leading-relaxed text-center max-w-4xl mx-auto font-normal">
          <p>
            <strong className="text-[#F7F2EB] font-semibold">Aviso Legal e Ético:</strong> As informações contidas neste site possuem finalidade exclusivamente educativa e informativa, em consonância com as normas dos Conselhos Profissionais de Saúde (CFM e CFBM). A indicação de procedimentos, número de sessões, evolução e resposta biológica dependem estritamente de avaliação clínica individualizada. Procedimentos estéticos não garantem resultados idênticos entre diferentes organismos.
          </p>
        </div>

        {/* Bottom Legal bar */}
        <div className="pt-5 flex flex-col items-center justify-center text-xs text-[#C4B1A0] font-medium gap-2 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5">
            <Link to="/politica-de-privacidade" className="hover:text-[#FFFFFF] transition-colors">
              Política de Privacidade
            </Link>
            <span className="text-[#332923] hidden sm:inline">•</span>
            <Link to="/politica-de-cookies" className="hover:text-[#FFFFFF] transition-colors">
              Política de Cookies
            </Link>
            <span className="text-[#332923] hidden sm:inline">•</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('nido:open-cookie-settings'))}
              className="hover:text-[#FFFFFF] transition-colors cursor-pointer underline-offset-2 hover:underline"
            >
              Preferências de Privacidade
            </button>
          </div>
          <p className="text-[11px] text-[#C4B1A0]/70">
            © {new Date().getFullYear()} Clínica Nidô Estética Avançada. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
