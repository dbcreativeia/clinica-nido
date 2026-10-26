import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export const CategoryHighlights: React.FC = () => {
  const categories: CategoryItem[] = [
    {
      id: 'faciais',
      title: 'Procedimentos Faciais',
      subtitle: 'Harmonização & Sustentação',
      image: 'https://lh3.googleusercontent.com/d/1tCcoQRbFzWkH-R0zrK-um778_ZjZMXBu',
      link: '/tratamentos?categoria=faciais',
    },
    {
      id: 'corporais',
      title: 'Remodelação Corporal',
      subtitle: 'Laser Subdérmico & Contorno',
      image: '/02-endoslim-abdomen-1-sessao-30-dias.webp',
      link: '/tratamentos?categoria=corporais',
    },
    {
      id: 'regenerativos',
      title: 'Medicina Regenerativa',
      subtitle: 'Biotecnologia Celular & PDRN',
      image: 'https://lh3.googleusercontent.com/d/1qYWMR_QvI-fbpzjEKzcKbZkOxI6kYkt0',
      link: '/tratamentos?categoria=regenerativos',
    },
    {
      id: 'capilares',
      title: 'Tricologia & Capilar',
      subtitle: 'Densidade & Fortalecimento',
      image: 'https://lh3.googleusercontent.com/d/14b6fevARNYDGgFPkpY-YilUmlgJhjWCz',
      link: '/tratamentos?categoria=capilares',
    },
    {
      id: 'saude-e-bem-estar',
      title: 'Saúde & Nutrologia',
      subtitle: 'Medicina Integrada & Longevidade',
      image: 'https://lh3.googleusercontent.com/d/16RQp6Nvx5CxXU-l8jl9NOqkJujyoiv9P',
      link: '/tratamentos?categoria=saude-e-bem-estar',
    },
  ];

  return (
    <section className="relative z-10 py-12 sm:py-20 bg-[#F5EFE7] w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-10 pb-4 border-b border-[#E5DAD0]">
          <div>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#1F1916] font-bold tracking-tight">
              Categorias de <em className="italic text-[#44342E]">Tratamento</em>
            </h2>
            <p className="text-sm sm:text-base text-[#5C4B44] font-normal mt-1">
              Selecione a área desejada para ver os procedimentos.
            </p>
          </div>

          <Link
            to="/tratamentos"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm uppercase tracking-wider font-bold text-[#1F1916] hover:text-[#44342E] transition-colors"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="w-full min-w-0 transition-transform duration-300 hover:-translate-y-1"
            >
              <Link
                to={cat.link}
                className="group flex flex-col liquid-glass-card rounded-2xl overflow-hidden w-full min-w-0 h-full"
              >
                {/* Photo com degradê escuro */}
                <div className="relative aspect-16/9 sm:aspect-16/10 overflow-hidden bg-[#181310] w-full">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    style={(cat as any).imageStyle}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181310]/85 via-[#181310]/25 to-transparent opacity-75 group-hover:opacity-55 transition-opacity" />
                </div>

                {/* Action Bar */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3 w-full min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs uppercase tracking-wider text-[#7A5B3E] font-medium block truncate">
                      {cat.subtitle}
                    </span>
                    <h3 className="font-serif text-lg sm:text-2xl text-[#1F1916] font-bold group-hover:text-[#44342E] transition-colors leading-snug break-words mt-0.5">
                      {cat.title}
                    </h3>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-[#FFFFFF]/80 backdrop-blur-md border border-white/80 shadow-sm group-hover:bg-[#44342E] group-hover:text-white transition-all flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4 text-[#44342E] group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
