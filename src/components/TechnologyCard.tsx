import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Technology } from '../types';
import { openWhatsApp, WhatsAppMessages } from '../utils/whatsapp';

interface TechnologyCardProps {
  tech: Technology;
}

export const TechnologyCard: React.FC<TechnologyCardProps> = ({ tech }) => {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openWhatsApp(WhatsAppMessages.technology(tech.name), {
      service_name: `Tecnologia: ${tech.name}`,
      cta_location: 'Card de Tecnologia'
    });
  };

  return (
    <div 
      className="liquid-glass-card rounded-2xl overflow-hidden flex flex-col h-full group transition-transform duration-300 hover:-translate-y-1"
    >
      <Link to={`/tecnologias/${tech.slug}`} className="block relative aspect-16/10 overflow-hidden bg-[#181310] focus:outline-none">
        <img
          src={tech.image}
          alt={`Tecnologia ${tech.name} na Clínica Nidô`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181310]/85 via-[#181310]/20 to-transparent pointer-events-none" />
        <div className="absolute top-3 left-3 right-3 z-10 flex items-start">
          <span className="inline-block bg-[#181310]/85 text-[#FFFFFF] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-md leading-snug max-w-[90%]">
            {tech.category}
          </span>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-3">
          <div>
            <Link 
              to={`/tecnologias/${tech.slug}`}
              className="font-serif text-2xl text-[#241E1B] font-bold hover:text-[#44342E] transition-colors block"
            >
              {tech.name}
            </Link>
            <p className="text-xs text-[#8C7359] uppercase tracking-wider font-bold mt-1 line-clamp-1">
              {tech.tagline}
            </p>
          </div>

          <p className="text-sm text-[#5C4B44] leading-relaxed font-semibold line-clamp-3">
            {tech.description}
          </p>

          {/* Key highlights */}
          <div className="pt-1 space-y-1.5">
            {tech.keyBenefits.slice(0, 2).map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-[#44342E] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8C7359] shrink-0 mt-0.5" />
                <span className="line-clamp-1">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ações do Card */}
        <div className="pt-4 border-t border-[#E5DAD0]/80 space-y-2">
          <Link
            to={`/tecnologias/${tech.slug}`}
            className="w-full inline-flex items-center justify-center gap-2 btn-nido-primary text-[#FFFFFF] text-xs uppercase tracking-wider font-bold py-3 px-4 rounded-full transition-all cursor-pointer"
          >
            <span>Conhecer Tecnologia</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleWhatsApp}
            className="w-full inline-flex items-center justify-center gap-1.5 text-[#44342E] hover:text-[#241E1B] text-xs font-bold py-1.5 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Tirar dúvidas no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
