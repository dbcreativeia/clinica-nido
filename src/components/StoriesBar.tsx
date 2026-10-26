import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface StoryHighlight {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isBadge?: boolean;
  imageStyle?: React.CSSProperties;
}

export const StoriesBar: React.FC = () => {
  const highlights: StoryHighlight[] = [
    {
      id: 'endoslim',
      title: 'Endoslim',
      subtitle: 'Laser Corporal',
      image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=300&q=80',
      link: '/tratamentos/endoslim',
      isBadge: true,
    },
    {
      id: 'profhilo',
      title: 'Profhilo®',
      subtitle: 'Biorremodelação',
      image: 'https://images.unsplash.com/photo-1512290900672-1f48651c6b12?auto=format&fit=crop&w=300&q=80',
      link: '/tratamentos/profhilo',
    },
    {
      id: 'regenerativa',
      title: 'Regenerativa',
      subtitle: 'Exossomos & PDRN',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80',
      link: '/tratamentos/bio-regeneracao-celular',
    },
    {
      id: 'dermeskin',
      title: 'Melasma',
      subtitle: 'Peeling Dermeskin',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80',
      link: '/tratamentos/peeling-dermeskin-melasma',
    },
    {
      id: 'lifting',
      title: 'Lifting 3D',
      subtitle: 'Método Espelho',
      image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=300&q=80',
      link: '/tratamentos/hipro-facial-corporal',
    },
    {
      id: 'hipro',
      title: 'HIPRO',
      subtitle: 'Ultrassom Focado',
      image: 'https://lh3.googleusercontent.com/d/1onznv0AkvKgVZkEUL7Xs_Yh3WEysv-Q-',
      link: '/tecnologias',
    },
    {
      id: 'nutrologia',
      title: 'Nutrologia',
      subtitle: 'Dr. Deangelo',
      image: '/drdeangelo.webp',
      imageStyle: { transformOrigin: '55% 22%', transform: 'scale(1.7)' },
      link: '/corpo-clinico',
    },
  ];

  return (
    <div className="w-full bg-[#FFFFFF] border-y border-[#E5DAD0] py-3.5 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#241E1B] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#44342E]" />
          <span>Acesso Rápido aos Destaques</span>
        </div>
        <Link
          to="/tratamentos"
          className="text-[11px] text-[#8C7359] hover:text-[#241E1B] font-semibold transition-colors"
        >
          Ver todos →
        </Link>
      </div>

      {/* Horizontal smooth snap list */}
      <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
        {highlights.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className="flex flex-col items-center shrink-0 group snap-start cursor-pointer focus:outline-none"
          >
            {/* Circular Ring */}
            <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#44342E] via-[#8C7359] to-[#44342E] transition-transform duration-200 group-hover:scale-105 active:scale-95 shadow-2xs">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#FFFFFF] bg-[#181310]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  style={(item as any).imageStyle}
                  loading="lazy"
                />
              </div>
              {item.isBadge && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#44342E] text-[#FFFFFF] text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap border border-white/20">
                  Top
                </span>
              )}
            </div>

            {/* Label */}
            <span className="text-xs font-semibold text-[#241E1B] mt-2 group-hover:text-[#44342E] transition-colors leading-tight text-center">
              {item.title}
            </span>
            <span className="text-[10px] text-[#8C7359] font-medium leading-none mt-0.5 text-center">
              {item.subtitle}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
