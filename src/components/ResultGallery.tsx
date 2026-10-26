import React, { useState } from 'react';
import { ShieldAlert, MessageCircle, Clock, Calendar } from 'lucide-react';
import { CASE_RESULTS, REGULATORY_DISCLAIMER_TEXT } from '../data/cases';
import { openWhatsApp, WhatsAppMessages } from '../utils/whatsapp';
import { BeforeAfterSlider } from './BeforeAfterSlider';

export const ResultGallery: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<number>(0);

  const handleEndoslimWhatsApp = () => {
    openWhatsApp(WhatsAppMessages.endoslim(), {
      service_name: 'Endoslim',
      cta_location: 'Galeria de Resultados'
    });
  };

  const currentCase = CASE_RESULTS[selectedCase];

  return (
    <section className="bg-[#F7F2EB] py-14 sm:py-20 border-y border-[#E5DAD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block mb-1.5">
            Casos Clínicos & Acompanhamento
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#241E1B] font-semibold">
            Resultados Endoslim: Evolução com <em className="italic text-[#44342E]">Naturalidade</em>
          </h2>
          <p className="mt-2 text-xs sm:text-base text-[#5C4B44] font-normal leading-relaxed">
            Acompanhamentos fotográficos com registro padronizado da técnica autoral com laser de diodo subdérmico da Dra. Brenda Niyama.
          </p>
        </div>

        {/* Tab Selection (Horizontal Scrollable on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none sm:justify-center">
          {CASE_RESULTS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelectedCase(idx)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                selectedCase === idx
                  ? 'bg-[#44342E] text-[#FFFFFF] border-[#44342E] shadow-xs'
                  : 'bg-[#EFE6DC] text-[#241E1B] border-[#E5DAD0] hover:bg-[#E5DAD0]'
              }`}
            >
              {item.region} • {item.timeframe.replace('Evolução aos ', '')}
            </button>
          ))}
        </div>

        {/* Active Case Showcase with Mobile-First Slider */}
        {currentCase && (
          <div className="bg-[#EFE6DC] rounded-3xl p-5 sm:p-8 border border-[#E5DAD0] max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Interactive Before/After Card */}
              <div className="md:col-span-6">
                <BeforeAfterSlider
                  beforeImage={currentCase.imageBefore}
                  afterImage={currentCase.imageAfter}
                  area={currentCase.region}
                  interval={currentCase.timeframe}
                />
              </div>

              {/* Case Details */}
              <div className="md:col-span-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8C7359] uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-[#44342E]" />
                  <span>{currentCase.sessions}</span>
                  <span>•</span>
                  <Clock className="w-4 h-4 text-[#44342E]" />
                  <span>{currentCase.timeframe}</span>
                </div>

                <h3 className="font-serif text-2xl font-medium text-[#241E1B]">
                  Remodelação de {currentCase.region}
                </h3>

                <p className="text-xs sm:text-sm text-[#5C4B44] leading-relaxed font-normal">
                  {currentCase.description}
                </p>

                <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E5DAD0] text-xs text-[#5C4B44] space-y-1 font-normal">
                  <p className="font-semibold text-[#241E1B]">Parâmetros do Protocolo:</p>
                  <p>• Técnica autoral Dra. Brenda Niyama</p>
                  <p>• Laser de diodo subdérmico com anestesia local em consultório</p>
                  <p>• Retração cutânea e lipólise direcionada</p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleEndoslimWhatsApp}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-full transition-colors cursor-pointer shadow-xs active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Quero saber se o Endoslim é indicado para mim</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mandatory Regulatory Warning Banner */}
        <div className="mt-8 max-w-4xl mx-auto p-4 rounded-xl bg-[#EFE6DC] border border-[#E5DAD0] flex items-start gap-3 text-xs text-[#5C4B44] font-normal">
          <ShieldAlert className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#241E1B] font-semibold">Aviso Regulatório (CFM e CFBM):</strong> {REGULATORY_DISCLAIMER_TEXT}
          </p>
        </div>
      </div>
    </section>
  );
};
