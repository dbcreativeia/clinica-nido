import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, X, Cpu, Sparkles } from 'lucide-react';
import { TREATMENTS } from '../data/treatments';
import { TECHNOLOGIES } from '../data/technologies';
import { calculateSearchScore } from '../utils/searchEngine';

// Atalhos diretos mais buscados (Tratamentos e Tecnologias de ponta)
export const POPULAR_COMPLAINTS = [
  { label: 'Gordura Localizada', path: '/tratamentos/endoslim' },
  { label: 'Flacidez no Rosto', path: '/tratamentos/hipro-facial-corporal' },
  { label: 'HIPRO (Ultrassom)', path: '/tecnologias/hipro' },
  { label: 'Melasma & Manchas', path: '/tratamentos/peeling-dermeskin-melasma' },
  { label: 'Lavieen (BB Laser)', path: '/tecnologias/lavieen' },
  { label: 'Profhilo®', path: '/tratamentos/profhilo' },
  { label: 'Z-Field (Músculo)', path: '/tecnologias/z-field' },
  { label: 'Depilação Soprano', path: '/tecnologias/soprano-ice-platinum' },
];

export interface SearchResultItem {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  type: 'treatment' | 'technology';
  url: string;
}

export const QuickTreatmentSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and rank both treatments and technologies by search score
  const filteredSuggestions: SearchResultItem[] = query.trim().length >= 1
    ? (() => {
        const q = query.trim();

        // 1. Score Treatments
        const matchedTreatments = TREATMENTS
          .map(t => ({
            item: t,
            score: calculateSearchScore(q, t)
          }))
          .filter(res => res.score > 0)
          .map(res => ({
            id: `treatment-${res.item.id}`,
            name: res.item.name,
            subtitle: res.item.subtitle,
            tag: res.item.categoryLabel,
            type: 'treatment' as const,
            url: `/tratamentos/${res.item.slug}`,
            score: res.score
          }));

        // 2. Score Technologies
        const matchedTechnologies = TECHNOLOGIES
          .map(tech => ({
            item: tech,
            score: calculateSearchScore(q, tech)
          }))
          .filter(res => res.score > 0)
          .map(res => ({
            id: `tech-${res.item.id}`,
            name: res.item.name,
            subtitle: res.item.tagline,
            tag: 'Tecnologia',
            type: 'technology' as const,
            url: `/tecnologias/${res.item.slug}`,
            score: res.score
          }));

        return [...matchedTreatments, ...matchedTechnologies]
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);
      })()
    : [];

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(url);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredSuggestions.length > 0) {
      handleSelect(filteredSuggestions[0].url);
    } else if (query.trim()) {
      setIsOpen(false);
      navigate(`/tratamentos?busca=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto text-left relative min-w-0 z-40">
      {/* Wrapper containing the search bar and the overlay dropdown directly below it */}
      <div className="relative w-full z-40">
        <form onSubmit={handleSearchSubmit} className="w-full max-w-full">
          <div className="relative flex items-center liquid-glass-search rounded-full p-1 sm:p-2 focus-within:border-[#44342E] focus-within:ring-2 focus-within:ring-[#44342E]/20 transition-all w-full min-w-0">
            <div className="pl-3 sm:pl-4 pr-1.5 sm:pr-2 text-[#44342E] shrink-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#44342E]" />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (query.trim().length >= 1) {
                  setIsOpen(true);
                }
              }}
              placeholder="Ex.: flacidez, manchas ou botox"
              className="flex-1 min-w-0 py-2.5 sm:py-3.5 pr-1 sm:pr-2 text-xs sm:text-sm md:text-base placeholder:text-[11px] min-[360px]:placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base placeholder:truncate text-[#1F1916] placeholder-[#75625A] bg-transparent focus:outline-none font-medium truncate"
              aria-label="Buscar queixa, tratamento ou tecnologia"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
                className="p-1 sm:p-2 text-[#1F1916]/70 hover:text-[#1F1916] cursor-pointer shrink-0"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            <button
              type="submit"
              className="btn-nido-primary text-[#FFFFFF] text-xs sm:text-base font-bold px-3.5 sm:px-7 py-2.5 sm:py-3.5 rounded-full transition-all cursor-pointer shrink-0 ml-1 active:scale-95"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Instant Suggestions Dropdown - Positioned directly below the input bar */}
        {isOpen && query.trim().length >= 1 && (
          <div className="absolute top-full left-0 right-0 mt-2 liquid-glass-dropdown rounded-2xl overflow-hidden z-[100] max-w-full">
            {filteredSuggestions.length > 0 ? (
              <div className="py-2 divide-y divide-[#E5DAD0] max-h-[360px] sm:max-h-[400px] overflow-y-auto">
                <div className="px-4 py-2 text-[11px] sm:text-xs uppercase tracking-wider font-bold text-[#44342E] bg-[#F7F2EB] flex justify-between items-center">
                  <span>Tratamentos & Tecnologias sugeridos</span>
                  <span className="text-[10px] sm:text-[11px] text-[#7A5B3E] font-medium lowercase">
                    {filteredSuggestions.length} {filteredSuggestions.length === 1 ? 'resultado' : 'resultados'}
                  </span>
                </div>
                {filteredSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.url)}
                    className="w-full px-4 py-3 sm:py-3.5 text-left hover:bg-[#F7F2EB] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-serif font-bold text-[#1F1916] group-hover:text-[#44342E] transition-colors truncate">
                          {item.name}
                        </span>
                        {item.type === 'technology' ? (
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#44342E] text-[#FFFFFF] shrink-0 flex items-center gap-1 shadow-xs">
                            <Cpu className="w-3 h-3 text-[#EFE6DC]" />
                            Tecnologia
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E5DAD0] text-[#1F1916] shrink-0 border border-[#D5C7BC]">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#4D3B33] font-medium line-clamp-1 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8C7359] group-hover:text-[#44342E] group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate(`/tratamentos?busca=${encodeURIComponent(query.trim())}`);
                  }}
                  className="w-full px-4 py-2.5 bg-[#F7F2EB]/70 hover:bg-[#E5DAD0] text-xs sm:text-sm font-bold text-[#44342E] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Ver todos os resultados para "{query.trim()}"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-5 text-center text-sm sm:text-base text-[#4D3B33] font-medium">
                Nenhum resultado encontrado para "{query}".{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate(`/tratamentos?busca=${encodeURIComponent(query.trim())}`);
                  }}
                  className="text-[#44342E] font-bold underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Ver todos os tratamentos
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botões Mais Buscados */}
      <div className="mt-3 sm:mt-4 w-full flex flex-col items-center text-center gap-2">
        <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#FFFFFF] font-bold">
          Mais buscados:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {POPULAR_COMPLAINTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(item.path)}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] backdrop-blur-sm text-[#1F1916] text-[11px] sm:text-xs font-bold border border-[#FFFFFF]/60 hover:border-[#FFFFFF] shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
