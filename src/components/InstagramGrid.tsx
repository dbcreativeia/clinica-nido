import React from 'react';
import { Instagram, ArrowUpRight } from 'lucide-react';

interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: string;
}

const CURATED_POSTS: InstagramPost[] = [
  {
    id: 'post-1',
    imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80',
    caption: 'Endoslim: a ciência da retração tecidual subdérmica com laser de diodo.',
    likes: '142'
  },
  {
    id: 'post-2',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    caption: 'Medicina Regenerativa: Exossomos e PDRN na recuperação celular profunda.',
    likes: '198'
  },
  {
    id: 'post-3',
    imageUrl: 'https://images.unsplash.com/photo-1512290900672-1f4a9ceb649d?auto=format&fit=crop&w=600&q=80',
    caption: 'Profhilo®: Biorremodelação e hidratação sem volumização artificial.',
    likes: '234'
  },
  {
    id: 'post-4',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    caption: 'Espaço Nidô na Água Branca: acolhimento, privacidade e tecnologia.',
    likes: '315'
  },
  {
    id: 'post-5',
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
    caption: 'Método Espelho: o respeito absoluto à identidade de cada paciente.',
    likes: '280'
  },
  {
    id: 'post-6',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    caption: 'Peeling Dermeskin: protocolo avançado para controle seguro do melasma.',
    likes: '176'
  }
];

export const InstagramGrid: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-[#FFFFFF] border-t border-[#E5DAD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block mb-1.5">
              Comunidade & Conteúdo Clínico
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#241E1B] font-semibold">
              Acompanhe a Nidô no <em className="italic text-[#44342E]">Instagram</em>
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4B44] font-normal mt-1">
              Orientações, bastidores dos procedimentos e novidades em estética avançada.
            </p>
          </div>

          <a
            href="https://www.instagram.com/nidoestetica/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs uppercase tracking-wider font-semibold py-3 px-5 rounded-full transition-colors self-start md:self-auto shadow-xs cursor-pointer"
          >
            <Instagram className="w-4 h-4 text-[#E0D4C8]" />
            <span>Seguir @nidoestetica</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Curated 6-post grid com degradê escuro */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CURATED_POSTS.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/nidoestetica/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-[#181310] border border-[#E5DAD0] shadow-xs block"
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181310]/95 via-[#181310]/60 to-[#181310]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 sm:p-4 flex flex-col justify-between text-[#FFFFFF]">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFFFFF] self-end" />
                <p className="text-[11px] line-clamp-3 font-normal leading-snug text-[#FFFFFF]">
                  {post.caption}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
