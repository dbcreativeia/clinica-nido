import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Flame, 
  Sun, 
  Dna, 
  ArrowRight, 
  MessageCircle, 
  CheckCircle2 
} from 'lucide-react';
import { openWhatsApp, WhatsAppMessages } from '../utils/whatsapp';

export const NEEDS = [
  {
    id: 'contorno-corporal',
    tag: 'Corpo & Gordura',
    title: 'Gordura Localizada e Flacidez Corporal',
    shortDesc: 'Retração tecidual, definição de cintura, flancos, abdômen e glúteo sem cirurgia convencional.',
    icon: Flame,
    suggestedSlug: 'endoslim',
    treatmentName: 'Endoslim',
    treatmentSubtitle: 'Laser subdérmico de diodo • Técnica autoral Dra. Brenda',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80',
    bullets: [
      'Atuação subdérmica com fibra óptica de laser',
      'Quebra de gordura e retração simultânea de pele',
      'Anestesia local em consultório'
    ]
  },
  {
    id: 'flacidez-facial',
    tag: 'Rosto & Sustentação',
    title: 'Flacidez Facial e Queda dos Traços',
    shortDesc: 'Recuperação dos vetores anatômicos de sustentação com o Método Espelho.',
    icon: Activity,
    suggestedSlug: 'hipro-facial-corporal',
    treatmentName: 'Lifting Não Cirúrgico HIPRO',
    treatmentSubtitle: 'Ultrassom microfocado para firmeza e sustentação',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&q=80',
    bullets: [
      'Preservação total da sua mímica e identidade',
      'Microdoses nos pontos certos de perda óssea',
      'Efeito lifting suave sem efeito artificial'
    ]
  },
  {
    id: 'regenerativos',
    tag: 'Reparo Celular',
    title: 'Longevidade Cutânea e Hidratação Profunda',
    shortDesc: 'Estímulo biológico com Exossomos, Peptídeos, PDRN e Biorremodelador Profhilo®.',
    icon: Dna,
    suggestedSlug: 'profhilo',
    treatmentName: 'Profhilo® & Regenerativa',
    treatmentSubtitle: 'Biorremodelação com ácido hialurônico ultrapuro',
    image: 'https://images.unsplash.com/photo-1512290900672-1f48651c6b12?auto=format&fit=crop&w=600&q=80',
    bullets: [
      'Hidratação profunda da matriz dérmica',
      'Sem volumização artificial (não deforma o rosto)',
      'Estímulo biológico a 4 tipos de colágeno'
    ]
  },
  {
    id: 'manchas-melasma',
    tag: 'Manchas & Melasma',
    title: 'Manchas Resistentes e Melasma',
    shortDesc: 'Renovação cutânea controlada com Peeling Dermeskin e ativos biomiméticos.',
    icon: Sun,
    suggestedSlug: 'peeling-dermeskin-melasma',
    treatmentName: 'Peeling Dermeskin',
    treatmentSubtitle: 'Controle pigmentar com modulação inflamatória',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    bullets: [
      'Despigmentação progressiva e segura',
      'Compatível com fototipos variados',
      'Plano contínuo de fotoproteção e home care'
    ]
  },
  {
    id: 'qualidade-pele',
    tag: 'Textura & Poros',
    title: 'Textura Irregular, Poros e Viço',
    shortDesc: 'Limpeza e recuperação de barreira com Peptídeos e ativos regeneradores.',
    icon: Sparkles,
    suggestedSlug: 'extracao-regeneradora-peptideos',
    treatmentName: 'Extração Regeneradora Facial',
    treatmentSubtitle: 'Limpeza profunda com hidratação biomimética',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    bullets: [
      'Remoção de impurezas sem agressão mecânica severa',
      'Infusão tópica de peptídeos antioxidantes',
      'Recuperação rápida do viço luminoso'
    ]
  }
];

export const NeedSelector: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = NEEDS[selectedIndex];

  const handleWhatsApp = (treatmentName: string) => {
    openWhatsApp(WhatsAppMessages.treatment(treatmentName), {
      service_name: treatmentName,
      page_path: '/',
      cta_location: 'Assistente Mobile de Escolha'
    });
  };

  return (
    <section className="py-12 sm:py-20 bg-[#F7F2EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#7A5B3E] block mb-1.5">
            Guia Rápido de Escolha
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1F1916] font-bold">
            O que você deseja <em className="italic text-[#44342E]">tratar hoje?</em>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#4D3B33] font-semibold">
            Toque na queixa que mais se aproxima do seu objetivo para ver o protocolo recomendado pela nossa equipe.
          </p>
        </div>

        {/* Horizontal Mobile Touch Chips / Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none sm:justify-center">
          {NEEDS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(idx)}
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                selectedIndex === idx
                  ? 'bg-[#44342E] text-[#FFFFFF] border-[#44342E] shadow-sm'
                  : 'bg-[#FFFFFF] text-[#1F1916] border-[#E5DAD0] hover:bg-[#E5DAD0]'
              }`}
            >
              {item.tag}
            </button>
          ))}
        </div>

        {/* Active Featured Recommendation Card (Mobile Ergonomic) */}
        <div className="bg-[#FFFFFF] rounded-3xl p-5 sm:p-8 border border-[#E5DAD0] shadow-sm max-w-4xl mx-auto transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Image side com degradê escuro */}
            <div className="md:col-span-5">
              <div className="relative aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden border border-[#E5DAD0] shadow-xs bg-[#181310]">
                <img
                  src={current.image}
                  alt={current.treatmentName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181310]/85 via-[#181310]/20 to-transparent" />
                <div className="absolute top-3 left-3 bg-[#181310]/90 text-[#FFFFFF] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/20">
                  Recomendação Nidô
                </div>
              </div>
            </div>

            {/* Content side */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <span className="text-xs sm:text-sm uppercase tracking-wider text-[#7A5B3E] font-bold block">
                  {current.title}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1916] mt-1">
                  {current.treatmentName}
                </h3>
                <p className="text-xs sm:text-sm text-[#7A5B3E] font-bold mt-0.5">
                  {current.treatmentSubtitle}
                </p>
              </div>

              <p className="text-sm sm:text-base text-[#332722] leading-relaxed font-semibold">
                {current.shortDesc}
              </p>

              {/* Bullets */}
              <div className="space-y-1.5 pt-1">
                {current.bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#332722] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#7A5B3E] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Touch Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  onClick={() => handleWhatsApp(current.treatmentName)}
                  className="inline-flex items-center justify-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3.5 rounded-full transition-colors cursor-pointer shadow-sm active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Falar sobre {current.treatmentName}</span>
                </button>

                <Link
                  to={`/tratamentos/${current.suggestedSlug}`}
                  className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1F1916] hover:text-[#44342E] px-5 py-3.5 rounded-full border border-[#E5DAD0] bg-[#F7F2EB] hover:bg-[#E5DAD0] transition-colors"
                >
                  <span>Ver detalhes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick hint */}
        <p className="text-center text-xs text-[#7A5B3E] font-semibold mt-4">
          * A indicação e o planejamento definitivo são confirmados presencialmente na clínica.
        </p>
      </div>
    </section>
  );
};
