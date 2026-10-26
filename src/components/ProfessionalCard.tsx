import React from 'react';
import { MessageCircle, Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Professional } from '../types';
import { openWhatsApp, WhatsAppMessages } from '../utils/whatsapp';

interface ProfessionalCardProps {
  professional: Professional;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional }) => {
  const handleWhatsApp = () => {
    openWhatsApp(WhatsAppMessages.team(professional.name), {
      service_name: `Profissional: ${professional.name}`,
      cta_location: 'Card de Profissional'
    });
  };

  return (
    <div 
      className="liquid-glass-card rounded-2xl overflow-hidden flex flex-col h-full transition-transform duration-300 hover:-translate-y-1"
    >
      {/* Photo (Clean & Unobstructed) */}
      <div className="relative aspect-4/5 overflow-hidden bg-[#241E1B]">
        <img
          src={professional.image}
          alt={`${professional.name} - ${professional.role}`}
          className={`w-full h-full object-cover ${professional.imagePosition || 'object-top'} ${professional.imageClass || ''}`}
          style={professional.imageStyle}
          loading="lazy"
        />
      </div>

      {/* Bio & Details */}
      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-3">
          {professional.badge && (
            <span className="inline-flex items-center gap-1.5 bg-[#FAF6F0] text-[#44342E] text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border border-[#E5DAD0]">
              <Award className="w-3.5 h-3.5 text-[#8C7359]" />
              {professional.badge}
            </span>
          )}

          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1F1916] leading-tight">
              {professional.name}
            </h3>
            <p className="text-xs text-[#7A5B3E] font-semibold mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C7359]" />
              <span>{professional.registration}</span>
            </p>
          </div>

          <span className="text-xs uppercase tracking-wider text-[#8C7359] font-medium block pt-1 border-t border-[#E5DAD0]/60">
            {professional.role}
          </span>

          <p className="text-sm text-[#5C4B44] leading-relaxed font-normal">
            {professional.shortBio}
          </p>

          <div className="pt-2">
            <span className="text-xs font-semibold text-[#241E1B] uppercase tracking-wider block mb-2">
              Áreas de Atuação:
            </span>
            <ul className="space-y-1.5 text-xs text-[#44342E] font-medium">
              {professional.specialties.map((spec, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8C7359] shrink-0 mt-0.5" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>

          {professional.validationNote && (
            <p className="text-[11px] text-[#66534B] italic pt-1 border-t border-[#E5DAD0]">
              {professional.validationNote}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-[#E5DAD0]/80">
          <button
            onClick={handleWhatsApp}
            className="w-full inline-flex items-center justify-center gap-2 btn-nido-primary text-[#FFFFFF] text-xs uppercase tracking-wider font-bold py-3 px-4 rounded-full transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Agendar com {professional.name.split(' ')[0]} {professional.name.split(' ')[1]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
