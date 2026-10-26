import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Filter, ShieldAlert, X, ArrowRight, Cpu } from 'lucide-react';
import { TREATMENTS } from '../data/treatments';
import { TECHNOLOGIES } from '../data/technologies';
import { calculateSearchScore } from '../utils/searchEngine';
import { TreatmentCategory } from '../types';
import { TreatmentCard } from '../components/TreatmentCard';
import { OrganicBlob } from '../components/BiomorphicShapes';
import { SEOHead } from '../components/SEOHead';

export const TreatmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = (searchParams.get('categoria') as TreatmentCategory | 'todas') || 'todas';
  const buscaParam = searchParams.get('busca') || '';
  
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam);
  const [searchQuery, setSearchQuery] = useState(buscaParam);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync category and search when URL search parameter changes
  useEffect(() => {
    setSelectedCategory(catParam);
    if (buscaParam) {
      setSearchQuery(buscaParam);
    }
  }, [catParam, buscaParam]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    { id: 'todas', label: 'Todos os Tratamentos' },
    { id: 'faciais', label: 'Faciais' },
    { id: 'corporais', label: 'Corporais' },
    { id: 'regenerativos', label: 'Medicina Regenerativa' },
    { id: 'capilares', label: 'Capilares' },
    { id: 'saude-e-bem-estar', label: 'Saúde & Bem-Estar' },
  ];

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'todas') {
      searchParams.delete('categoria');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ categoria: catId });
    }
  };

  const filteredTreatments = useMemo(() => {
    const q = searchQuery.trim();
    return TREATMENTS.filter((t) => {
      const matchesCat = selectedCategory === 'todas' || t.category === selectedCategory;
      if (!q) return matchesCat;
      const score = calculateSearchScore(q, t);
      return matchesCat && score > 0;
    }).sort((a, b) => {
      if (!q) return 0;
      return calculateSearchScore(q, b) - calculateSearchScore(q, a);
    });
  }, [selectedCategory, searchQuery]);

  // Instant Suggestions Dropdown
  const instantSuggestions = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [];

    const matchedTreatments = TREATMENTS
      .map(t => ({ item: t, score: calculateSearchScore(q, t) }))
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

    const matchedTechnologies = TECHNOLOGIES
      .map(tech => ({ item: tech, score: calculateSearchScore(q, tech) }))
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
  }, [searchQuery]);

  return (
    <div className="pt-28 pb-20 bg-[#F5EFE7] min-h-screen w-full max-w-full overflow-x-hidden relative">
      <SEOHead
        title="Tratamentos Estéticos Faciais e Corporais em São Paulo | Clínica Nidô"
        description="Procedimentos estéticos e regenerativos avançados na Água Branca, SP: Endoslim, Harmonização Facial, Bioestimuladores, Toxina Botulínica, Peeling e Nutrologia."
        canonicalPath="/tratamentos"
        image="/foto-clinica_1.webp"
        keywords={[
          'tratamentos estéticos são paulo',
          'procedimentos faciais perdizes',
          'remodelação corporal água branca',
          'endoslim sp',
          'harmonização facial são paulo',
          'bioestimulador sculptra radiesse sp',
          'medicina regenerativa exossomos',
          'clínica estética zona oeste sp'
        ]}
        schemaJson={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Tratamentos Estéticos & Regenerativos - Clínica Nidô',
          description: 'Catálogo de procedimentos estéticos, faciais, corporais e regenerativos na Clínica Nidô em São Paulo.',
          url: 'https://www.nidoestetica.com.br/tratamentos'
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Page Header com Forma Orgânica em Camada de Profundidade */}
        <div className="text-center max-w-3xl mx-auto mb-10 relative">
          <OrganicBlob
            variant="hero-treatments"
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] -z-10 opacity-70"
          />
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block mb-2">
            Portfólio de Cuidados
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#241E1B] font-semibold relative">
            Tratamentos Estéticos & <em className="italic text-[#44342E]">Regenerativos</em>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#5C4B44] font-normal leading-relaxed">
            Conheça as opções terapêuticas da Clínica Nidô. Cada plano é estruturado de forma única a partir da sua avaliação individual.
          </p>
        </div>

        {/* Search & Filters Controls - Estilo fluido sem caixa fechada */}
        <div className="mb-12 space-y-6 max-w-3xl mx-auto text-center">
          {/* Barra de Busca com Dropdown Instantâneo da Home */}
          <div ref={searchContainerRef} className="relative w-full z-40">
            <div className="relative flex items-center bg-[#FFFFFF] rounded-full border-2 border-[#E5DAD0] shadow-sm p-1 sm:p-1.5 focus-within:border-[#44342E] focus-within:ring-2 focus-within:ring-[#44342E]/15 transition-all w-full min-w-0">
              <div className="pl-3 sm:pl-4 pr-1.5 sm:pr-2 text-[#44342E] shrink-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#44342E]" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 1) {
                    setIsDropdownOpen(true);
                  }
                }}
                placeholder="Qual queixa ou tratamento procura?"
                className="flex-1 min-w-0 py-2 sm:py-3 text-xs sm:text-sm md:text-base placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base text-[#1F1916] placeholder-[#7A6256] bg-transparent focus:outline-none font-medium"
                aria-label="Buscar queixa ou tratamento"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsDropdownOpen(false);
                  }}
                  className="p-1 sm:p-2 text-[#1F1916]/70 hover:text-[#1F1916] cursor-pointer shrink-0"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDropdownOpen(false)}
                className="bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-colors cursor-pointer shrink-0 ml-1 shadow-xs active:scale-95"
              >
                Buscar
              </button>
            </div>

            {/* Dropdown Overlay Instantâneo (Igual ao da Home) */}
            {isDropdownOpen && searchQuery.trim().length >= 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 liquid-glass-dropdown rounded-2xl overflow-hidden z-[100] shadow-2xl border border-[#E5DAD0] bg-[#FFFFFF]/95 backdrop-blur-md text-left">
                {instantSuggestions.length > 0 ? (
                  <div className="py-2 divide-y divide-[#E5DAD0] max-h-[360px] sm:max-h-[400px] overflow-y-auto">
                    <div className="px-4 py-2 text-[11px] sm:text-xs uppercase tracking-wider font-bold text-[#44342E] bg-[#F7F2EB] flex justify-between items-center">
                      <span>Resultados instantâneos ({instantSuggestions.length})</span>
                      <span className="text-[10px] sm:text-[11px] text-[#7A5B3E] font-medium">
                        Clique para abrir ou veja a lista abaixo
                      </span>
                    </div>
                    {instantSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate(item.url);
                        }}
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
                          <p className="text-xs sm:text-sm text-[#5C4B44] font-normal line-clamp-1 mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#8C7359] group-hover:text-[#44342E] group-hover:translate-x-1 transition-all shrink-0" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full px-4 py-2.5 bg-[#F7F2EB]/80 hover:bg-[#E5DAD0] text-xs sm:text-sm font-bold text-[#44342E] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Exibir {filteredTreatments.length} {filteredTreatments.length === 1 ? 'resultado' : 'resultados'} na página</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-5 text-center text-sm text-[#4D3B33] font-medium">
                    Nenhum resultado instantâneo para "{searchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filtros de Categoria - Centralizados */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#8C7359] font-medium">
              <Filter className="w-3.5 h-3.5 text-[#8C7359]" />
              <span>Filtrar por categoria:</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#49362F] text-[#FFFFFF] border border-[#49362F] shadow-sm'
                      : 'bg-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.8)] text-[#241E1B] border border-[rgba(132,102,78,0.22)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] hover:-translate-y-0.5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 text-xs text-[#8C7359] font-medium px-1">
          <span>
            Exibindo <strong>{filteredTreatments.length}</strong> {filteredTreatments.length === 1 ? 'tratamento' : 'tratamentos'}
          </span>
          {searchQuery && (
            <span>
              Filtrado por: "<strong>{searchQuery}</strong>"
            </span>
          )}
        </div>

        {/* Treatments Grid - Todos à vista com layout responsivo sem rolagem horizontal */}
        {filteredTreatments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTreatments.map((treatment) => (
              <TreatmentCard key={treatment.id} treatment={treatment} />
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DAD0] p-12 text-center max-w-md mx-auto space-y-4">
            <Sparkles className="w-8 h-8 text-[#8C7359] mx-auto" />
            <h3 className="font-serif text-xl font-medium text-[#241E1B]">
              Nenhum tratamento encontrado
            </h3>
            <p className="text-xs text-[#5C4B44] font-normal">
              Tente buscar com outros termos ou selecione outra categoria para ver os procedimentos disponíveis.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('todas');
                setSearchQuery('');
              }}
              className="bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider py-2.5 px-6 rounded-full transition-colors cursor-pointer shadow-xs"
            >
              Ver todos os tratamentos
            </button>
          </div>
        )}

        {/* Ethical disclaimer reminder */}
        <div className="mt-16 p-4 rounded-xl bg-[#EFE6DC] border border-[#E5DAD0] max-w-3xl mx-auto flex items-start gap-3 text-xs text-[#44342E]">
          <ShieldAlert className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />
          <p className="leading-relaxed font-normal">
            <strong>Informação técnica e ética:</strong> Os tratamentos apresentados requerem avaliação clínica individualizada prévia para definição da indicação, planejamento de sessões e segurança. As respostas aos procedimentos podem variar conforme as características biológicas de cada organismo.
          </p>
        </div>
      </div>
    </div>
  );
};
