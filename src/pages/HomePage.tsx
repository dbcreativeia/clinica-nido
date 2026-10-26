import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  ArrowRight, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { CategoryHighlights } from '../components/CategoryHighlights';
import { QuickTreatmentSearch } from '../components/QuickTreatmentSearch';
import { PROFESSIONALS } from '../data/professionals';
import { openWhatsApp, WhatsAppMessages } from '../utils/whatsapp';

import { SEOHead } from '../components/SEOHead';

const HERO_IMAGES = [
  '/foto-clinica_1.webp',
  '/foto-clinica_2.webp',
  '/foto-clinica_3.webp',
];

export const HomePage: React.FC = () => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleGeneralWhatsApp = () => {
    openWhatsApp(WhatsAppMessages.general(), {
      service_name: 'Geral',
      page_path: '/',
      cta_location: 'Hero Home'
    });
  };

  const handleEndoslimWhatsApp = () => {
    openWhatsApp(WhatsAppMessages.endoslim(), {
      service_name: 'Endoslim',
      page_path: '/',
      cta_location: 'Destaque Endoslim Home'
    });
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-0">
      <SEOHead
        title="Clínica Nidô | Estética Avançada e Medicina Integrada em São Paulo"
        description="Clínica de estética avançada e longevidade na Água Branca, São Paulo. Endoslim, Harmonização Facial, Fotona 5D, Lavieen, HIPRO e Nutrologia com Dra. Brenda Niyama."
        canonicalPath="/"
        image="/foto-clinica_1.webp"
        keywords={[
          'clínica de estética são paulo',
          'endoslim são paulo',
          'endoslim dra brenda',
          'harmonização facial água branca',
          'harmonização facial perdizes',
          'estética avançada zona oeste sp',
          'fotona 5d são paulo',
          'lavieen bb laser sp',
          'hipro ultrassom microfocado',
          'nutrologia esportiva são paulo',
          'profhilo são paulo'
        ]}
        schemaJson={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Clínica Nidô - Estética Avançada',
          url: 'https://www.nidoestetica.com.br/',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://www.nidoestetica.com.br/tratamentos?busca={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }}
      />
      {/* 1. HERO COM BUSCA DIRETA POR QUEIXA / TRATAMENTO - AJUSTADO PARA 1 DOBRA INTEIRA NO MOBILE (100dvh) */}
      <section className="relative z-30 min-h-[100dvh] flex flex-col justify-between items-center pt-20 pb-20 sm:pt-28 sm:pb-12 bg-[#181310] w-full max-w-full">
        {/* Slideshow de Fundo Editorial com Transição Ultra Suave */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {HERO_IMAGES.map((imgSrc, index) => {
            const isActive = index === currentHeroIndex;
            return (
              <motion.img
                key={imgSrc}
                src={imgSrc}
                alt="Ambiente Clínica Nidô"
                initial={false}
                animate={{
                  opacity: isActive ? 0.8 : 0,
                  scale: isActive ? 1.025 : 1,
                }}
                transition={{
                  opacity: { duration: 2.4, ease: [0.4, 0, 0.2, 1] },
                  scale: { duration: 7, ease: "easeOut" },
                }}
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="eager"
              />
            );
          })}
          {/* Degradê translúcido preservando a visibilidade da foto e garantindo leitura cristalina */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#181310]/75 via-[#181310]/45 to-[#181310]/90 z-10" />
        </div>

        {/* Conteúdo Central e Barra de Busca (Verticalmente centralizado na 1ª dobra) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-30 w-full max-w-4xl mx-auto px-6 sm:px-8 text-center text-[#FFFFFF] space-y-6 sm:space-y-8 my-auto py-4"
        >
          <h1 className="font-serif text-3xl min-[360px]:text-[9vw] min-[400px]:text-[9.5vw] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] max-w-5xl mx-auto text-[#FFFFFF]">
            <span className="block font-light">Como podemos</span>
            <span className="block font-extrabold italic text-[#FFFFFF]">cuidar de você hoje?</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#EFE6DC] font-normal max-w-2xl mx-auto leading-relaxed">
            Conte o que você gostaria de melhorar ou digite o nome de um procedimento.
          </p>

          {/* Componente de Busca Instantânea */}
          <div className="pt-1 w-full max-w-full">
            <QuickTreatmentSearch />
          </div>
        </motion.div>

        {/* Indicador sutil de rolagem na base da 1ª dobra */}
        <div className="relative z-10 pb-2 sm:pb-4 flex flex-col items-center gap-1 opacity-75 pointer-events-none">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#E5DAD0] font-bold">
            Role para explorar
          </span>
          <ChevronDown className="w-4 h-4 text-[#E5DAD0] animate-bounce" />
        </div>
      </section>

      {/* 2. CATEGORIAS DE CUIDADO */}
      <CategoryHighlights />

      {/* 3. DESTAQUE ENDOSLIM (Nobre, Acolhedor e com Alto Contraste - Superfície Clara #FCF9F5) */}
      <section className="py-12 sm:py-16 bg-[#FCF9F5] text-[#1F1916] border-y border-[#E5DAD0]/80 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="py-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              {/* Foto com degradê escuro */}
              <div className="lg:col-span-5 w-full">
                <div className="relative aspect-16/10 sm:aspect-4/3 rounded-2xl overflow-hidden border border-[#E5DAD0] bg-[#181310] shadow-sm w-full">
                  <img
                    src="/02-endoslim-abdomen-1-sessao-30-dias.webp"
                    alt="Endoslim - Laser Subdérmico corporal"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181310]/85 via-[#181310]/20 to-transparent" />
                  <div className="absolute top-3 left-3 bg-[#44342E]/85 backdrop-blur-md text-[#FFFFFF] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md border border-white/30 animate-pulse-whatsapp">
                    Técnica Autoral Dra. Brenda
                  </div>
                </div>
              </div>

              {/* Texto Objetivo e Ação Fácil */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4 text-left w-full min-w-0">
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-[#1F1916]">
                  Endoslim: <em className="italic text-[#44342E]">remodelação corporal</em> com laser subdérmico
                </h2>

                <p className="text-base sm:text-lg text-[#4D3B33] font-normal leading-relaxed">
                  Tratamento minimamente invasivo para gordura localizada e retração de flacidez realizado em consultório com anestesia local.
                </p>

                {/* Botões Grandes e Fáceis de Tocar no Celular */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
                  <Link
                    to="/tratamentos/endoslim"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-nido-primary text-[#FFFFFF] text-sm sm:text-base font-bold uppercase tracking-wider min-h-[50px] px-8 py-3.5 rounded-full text-center active:scale-98"
                  >
                    <span>Ver Detalhes do Endoslim</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={handleEndoslimWhatsApp}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-nido-secondary text-[#1F1916] text-sm sm:text-base font-bold uppercase tracking-wider min-h-[50px] px-7 py-3.5 rounded-full cursor-pointer active:scale-98"
                  >
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    <span>Dúvidas no WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORPO CLÍNICO */}
      <section className="py-12 sm:py-16 bg-[#F5EFE7] w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-[#E5DAD0]">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1F1916] font-bold">
                Corpo <em className="italic text-[#44342E]">Clínico</em>
              </h2>
              <p className="text-sm sm:text-base text-[#5C4B44] font-normal mt-0.5">
                Profissionais graduados e habilitados.
              </p>
            </div>

            <Link
              to="/corpo-clinico"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm uppercase tracking-wider font-bold text-[#1F1916] hover:text-[#44342E] transition-colors"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full min-w-0">
            {PROFESSIONALS.map((prof) => (
              <div
                key={prof.id}
                className="w-full min-w-0 transition-transform duration-300 hover:-translate-y-1"
              >
                <Link
                  to="/corpo-clinico"
                  className="group liquid-glass-card rounded-2xl p-3.5 sm:p-5 flex flex-col items-center text-center active:scale-98 min-w-0 h-full"
                >
                  <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-[#EFE6DC] shadow-md mb-2.5 bg-[#EFE6DC] shrink-0">
                    <img
                      src={prof.image}
                      alt={prof.name}
                      className={`w-full h-full object-cover ${prof.imagePosition || 'object-top'} ${prof.imageClass || ''}`}
                      style={prof.imageStyle}
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#1F1916] leading-snug group-hover:text-[#44342E] transition-colors break-words w-full">
                    {prof.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7A5B3E] font-medium mt-1 truncate w-full">
                    {prof.registration}
                  </p>
                  <p className="text-xs sm:text-sm text-[#5C4B44] font-normal mt-0.5 line-clamp-1 w-full">
                    {prof.role}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. AGENDAMENTO RÁPIDO NO WHATSAPP */}
      <section className="py-12 sm:py-16 bg-[#FAF6F0] border-t border-[#E5DAD0] w-full max-w-full overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4 w-full min-w-0">
          <div className="liquid-glass-panel rounded-3xl p-6 sm:p-10 border border-white/80 space-y-4">
            <h2 className="font-serif text-2xl sm:text-4xl text-[#1F1916] font-bold">
              Agende sua <em className="italic text-[#44342E]">avaliação presencial</em>
            </h2>

            <p className="text-base sm:text-lg text-[#4D3B33] font-normal leading-relaxed">
              Nossa equipe de recepção está disponível no WhatsApp para tirar dúvidas e agendar seu atendimento na Água Branca, São Paulo.
            </p>

            <div className="pt-2 w-full">
              <button
                onClick={handleGeneralWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-nido-whatsapp animate-pulse-whatsapp text-white font-bold text-base sm:text-lg uppercase tracking-wider min-h-[52px] px-8 py-3.5 rounded-full cursor-pointer active:scale-98"
              >
                <MessageCircle className="w-6 h-6 fill-current" />
                <span>Falar no WhatsApp</span>
              </button>
            </div>

            <p className="text-sm sm:text-base text-[#7A5B3E] font-bold pt-1 leading-snug">
              Rua Dona Germaine Burchard, 499<br />
              Água Branca, São Paulo
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
