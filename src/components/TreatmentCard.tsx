import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Treatment } from '../types';
import { openWhatsApp, WhatsAppMessages } from '../utils/whatsapp';

interface TreatmentCardProps {
  treatment: Treatment;
}

export const TreatmentCard: React.FC<TreatmentCardProps> = ({ treatment }) => {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openWhatsApp(WhatsAppMessages.treatment(treatment.name), {
      service_name: treatment.name,
      cta_location: 'Card de Tratamento'
    });
  };

  return (
    <div 
      className="group liquid-glass-card rounded-2xl overflow-hidden flex flex-col h-full transition-transform duration-300 hover:-translate-y-1"
    >
      {/* Image with Tag & Soft Vignette */}
      <Link to={`/tratamentos/${treatment.slug}`} className="relative block overflow-hidden aspect-4/3">
        <img
          src={treatment.heroImage}
          alt={treatment.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181310]/85 via-[#181310]/30 to-transparent transition-opacity" />
        
        {/* Category & Badges em Liquid Glass */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="bg-[#FFFFFF]/85 backdrop-blur-md text-[#241E1B] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm border border-white/80">
            {treatment.categoryLabel}
          </span>
          {treatment.isNew && (
            <span className="bg-[#44342E]/85 backdrop-blur-md text-[#FFFFFF] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/30 animate-pulse-whatsapp">
              <Sparkles className="w-3 h-3 text-[#E0D4C8]" />
              Destaque
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-2">
          <Link to={`/tratamentos/${treatment.slug}`} className="group-hover:text-[#44342E] transition-colors">
            <h3 className="font-serif text-xl sm:text-2xl text-[#1F1916] font-bold leading-tight">
              {treatment.name}
            </h3>
          </Link>
          <p className="text-xs uppercase tracking-wider text-[#7A5B3E] font-medium">
            {treatment.subtitle}
          </p>
          <p className="text-sm text-[#5C4B44] line-clamp-3 leading-relaxed font-normal pt-0.5">
            {treatment.summary}
          </p>
        </div>

        {/* Action Buttons in Liquid Glass Style */}
        <div className="pt-3 border-t border-[#E5DAD0]/80 flex flex-col gap-2">
          <Link
            to={`/tratamentos/${treatment.slug}`}
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1F1916] btn-nido-secondary py-2.5 px-3 rounded-full text-center"
          >
            <span className="whitespace-nowrap">Ver Detalhes</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>

          <button
            onClick={handleWhatsApp}
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FFFFFF] btn-nido-primary py-2.5 px-3 rounded-full cursor-pointer"
            title={`Conversar sobre ${treatment.name} no WhatsApp`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
            <span className="whitespace-nowrap">Conversar no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
