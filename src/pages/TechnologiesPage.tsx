import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Cpu, 
  Filter, 
  Sparkles, 
  MessageCircle, 
  X,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { TECHNOLOGIES } from '../data/technologies';
import { TREATMENTS } from '../data/treatments';
import { TechnologyCard } from '../components/TechnologyCard';
import { openWhatsApp, WhatsAppMessages } from '../utils/whatsapp';
import { SEOHead } from '../components/SEOHead';

export const TechnologiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('categoria') || 'todas';
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
    { id: 'todas', label: 'Todas as Tecnologias' },
    { id: 'ultrassom', label: 'Ultrassom Focado (Lifting)' },
    { id: 'laser', label: 'Lasers & Renovação' },
    { id: 'musculo', label: 'Eletromagnetismo & Músculo' },
    { id: 'radiofrequencia', label: 'Radiofrequência & Colágeno' },
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

  const filteredTechnologies = useMemo(() => {
    return TECHNOLOGIES.filter((tech) => {
      // Category filter check
      let matchesCat = true;
      if (selectedCategory === 'ultrassom') {
        matchesCat = tech.id === 'hipro' || tech.id === 'ultraformer-iii';
      } else if (selectedCategory === 'laser') {
        matchesCat = tech.id === 'lavieen' || tech.id === 'soprano-ice-platinum' || tech.id === 'fotona-5d';
      } else if (selectedCategory === 'musculo') {
        matchesCat = tech.id === 'z-field';
      } else if (selectedCategory === 'radiofrequencia') {
        matchesCat = tech.id === 'endymed';
      }

      // Query filter check
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;

      const matchesSearch =
        tech.name.toLowerCase().includes(q) ||
        tech.category.toLowerCase().includes(q) ||
        tech.tagline.toLowerCase().includes(q) ||
        tech.description.toLowerCase().includes(q) ||
        (tech.howItWorks && tech.howItWorks.toLowerCase().includes(q)) ||
        tech.targetIndications.some(item => item.toLowerCase().includes(q)) ||
        tech.keyBenefits.some(item => item.toLowerCase().includes(q)) ||
        tech.relatedTreatments.some(item => item.name.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Instant Suggestions Dropdown (idêntico à Home)
  const instantSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const matchedTechnologies = TECHNOLOGIES.filter(tech => {
      const inName = tech.name.toLowerCase().includes(q);
      const inTagline = tech.tagline?.toLowerCase().includes(q);
      const inCategory = tech.category?.toLowerCase().includes(q);
      return inName || inTagline || inCategory;
    }).slice(0, 5).map(tech => ({
      id: `tech-${tech.id}`,
      name: tech.name,
      subtitle: tech.tagline,
      tag: 'Tecnologia',
      type: 'technology' as const,
      url: `/tecnologias/${tech.slug}`
    }));

    const matchedTreatments = TREATMENTS.filter(t => {
      const inName = t.name.toLowerCase().includes(q);
      const inSubtitle = t.subtitle?.toLowerCase().includes(q);
      const inSummary = t.summary?.toLowerCase().includes(q);
      const inCategory = t.categoryLabel?.toLowerCase().includes(q);
      return inName || inSubtitle || inSummary || inCategory;
    }).slice(0, 4).map(t => ({
      id: `treatment-${t.id}`,
      name: t.name,
      subtitle: t.subtitle,
      tag: t.categoryLabel,
      type: 'treatment' as const,
      url: `/tratamentos/${t.slug}`
    }));

    return [...matchedTechnologies, ...matchedTreatments];
  }, [searchQuery]);

  const handleGeneralWhatsApp = () => {
    openWhatsApp(WhatsAppMessages.general(), {
      service_name: 'Tecnologias',
      page_path: '/tecnologias',
      cta_location: 'Página de Tecnologias'
    });
  };

  return (
    <div className="pt-28 pb-20 bg-[#F5EFE7] min-h-screen w-full max-w-full overflow-x-hidden">
      <SEOHead
        title="Tecnologias Médicas e Estéticas de Ponta em São Paulo | Nidô"
        description="Conheça as plataformas tecnológicas da Clínica Nidô: HIPRO, Ultraformer III, Lavieen BB Laser, Fotona 5D, Z-Field Dual, Endymed 3DEEP e Soprano ICE na Água Branca SP."
        canonicalPath="/tecnologias"
        image="/foto-clinica_1.webp"
        keywords={[
          'tecnologias estéticas são paulo',
          'laser lavieen sp',
          'fotona 5d são paulo',
          'ultrassom microfocado hipro',
          'ultraformer iii sp',
          'z-field dual sp',
          'endymed 3deep são paulo',
          'soprano ice platinum sp'
        ]}
        schemaJson={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Tecnologias Médicas e Estéticas - Clínica Nidô',
          description: 'Equipamentos e plataformas de estética avançada e rejuvenescimento em São Paulo.',
          url: 'https://www.nidoestetica.com.br/tecnologias'
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block mb-2">
            Inovação & Padrão Ouro
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#241E1B] font-semibold">
            Tecnologias Médicas e <em className="italic text-[#44342E]">Estéticas</em>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#5C4B44] font-normal leading-relaxed">
            Equipamentos de última geração selecionados para garantir precisão, conforto e estímulo biológico seguro.
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
                placeholder="Qual tecnologia ou queixa procura? (ex: HIPRO, Lavieen, flacidez, músculo...)"
                className="flex-1 min-w-0 py-2 sm:py-3 text-xs sm:text-sm md:text-base placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base text-[#1F1916] placeholder-[#7A6256] bg-transparent focus:outline-none font-medium"
                aria-label="Buscar tecnologia ou indicação"
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
                      <span>Exibir {filteredTechnologies.length} {filteredTechnologies.length === 1 ? 'resultado' : 'resultados'} na página</span>
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

          {/* Filtros de Categoria em flex-wrap centralizados */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#8C7359] font-medium">
              <Filter className="w-3.5 h-3.5 text-[#8C7359]" />
              <span>Filtrar por tipo de plataforma:</span>
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
            Exibindo <strong>{filteredTechnologies.length}</strong> {filteredTechnologies.length === 1 ? 'tecnologia' : 'tecnologias'}
          </span>
          {searchQuery && (
            <span>
              Filtrado por: "<strong>{searchQuery}</strong>"
            </span>
          )}
        </div>

        {/* Ethical / Clinical Role of Technology */}
        <div className="bg-[#EFE6DC] p-5 sm:p-6 rounded-2xl border border-[#E5DAD0] shadow-xs mb-10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#44342E] text-[#FFFFFF] flex items-center justify-center shrink-0 shadow-xs">
            <Cpu className="w-5 h-5 text-[#EFE6DC]" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-[#5C4B44] leading-relaxed font-normal">
            <h3 className="font-serif text-base sm:text-lg font-medium text-[#241E1B]">
              A tecnologia a serviço do diagnóstico humano
            </h3>
            <p>
              Na Clínica Nidô, nenhuma máquina é utilizada de forma isolada ou padronizada. Os aparelhos são ferramentas que potencializam o plano terapêutico customizado definido pelo profissional após a sua avaliação individualizada.
            </p>
          </div>
        </div>

        {/* Technologies Grid */}
        {filteredTechnologies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredTechnologies.map((tech) => (
              <TechnologyCard key={tech.id} tech={tech} />
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DAD0] p-12 text-center max-w-md mx-auto space-y-4 mb-16">
            <Sparkles className="w-8 h-8 text-[#8C7359] mx-auto" />
            <h3 className="font-serif text-xl font-medium text-[#241E1B]">
              Nenhuma tecnologia encontrada
            </h3>
            <p className="text-xs text-[#5C4B44] font-normal">
              Tente buscar com outros termos ou selecione outra categoria para ver os equipamentos disponíveis.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('todas');
                setSearchQuery('');
              }}
              className="bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider py-2.5 px-6 rounded-full transition-colors cursor-pointer shadow-xs"
            >
              Ver todas as tecnologias
            </button>
          </div>
        )}

        {/* Bottom Conversion Box */}
        <div className="bg-[#EFE6DC] text-[#241E1B] border border-[#E5DAD0] rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4 shadow-xs">
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold">
            Dúvidas sobre qual tecnologia é indicada para o seu caso?
          </h3>
          <p className="text-sm text-[#5C4B44] font-normal max-w-lg mx-auto">
            Fale diretamente com a equipe da Nidô no WhatsApp para entender quais tratamentos combinam os equipamentos certos para sua queixa.
          </p>
          <div className="pt-2">
            <button
              onClick={handleGeneralWhatsApp}
              className="inline-flex items-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider px-8 py-4 rounded-full transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <span>Tirar dúvidas sobre tecnologias no WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Ethical reminder */}
        <div className="mt-12 p-4 rounded-xl bg-[#EFE6DC] border border-[#E5DAD0] max-w-3xl mx-auto flex items-start gap-3 text-xs text-[#44342E]">
          <ShieldAlert className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />
          <p className="leading-relaxed font-normal">
            <strong>Informação ética e técnica:</strong> A indicação e a intensidade dos parâmetros de cada tecnologia médica/estética são definidas exclusivamente por profissionais de saúde habilitados em consulta de avaliação individualizada.
          </p>
        </div>
      </div>
    </div>
  );
};
