import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  MessageCircle, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Layers,
  HelpCircle,
  Activity
} from 'lucide-react';
import { TECHNOLOGIES } from '../data/technologies';
import { FAQAccordion } from '../components/FAQAccordion';
import { ImageModal } from '../components/ImageModal';
import { openWhatsApp, WhatsAppMessages } from '../utils/whatsapp';
import { SEOHead } from '../components/SEOHead';
import { trackMetaViewContent } from '../utils/metaConversions';

export const TechnologyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const tech = TECHNOLOGIES.find((t) => t.slug === slug);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (tech) {
      trackMetaViewContent(tech.name, 'Tecnologias');
    }
  }, [tech]);

  if (!tech) {
    return <Navigate to="/tecnologias" replace />;
  }

  const allImages = tech.images && tech.images.length > 0 ? tech.images : [tech.image];

  const handleWhatsAppHero = () => {
    openWhatsApp(WhatsAppMessages.technology(tech.name), {
      service_name: `Tecnologia: ${tech.name}`,
      page_path: `/tecnologias/${tech.slug}`,
      cta_location: 'Hero Tecnologia'
    });
  };

  const handleWhatsAppFooter = () => {
    openWhatsApp(WhatsAppMessages.technology(tech.name), {
      service_name: `Tecnologia: ${tech.name}`,
      page_path: `/tecnologias/${tech.slug}`,
      cta_location: 'Final da Página Tecnologia'
    });
  };

  return (
    <div className="pt-24 pb-20 bg-[#F7F2EB] min-h-screen">
      <SEOHead
        title={`${tech.name} em São Paulo: ${tech.category} | Nidô`}
        description={`${tech.tagline}. Equipamento original homologado na Clínica Nidô na Água Branca, São Paulo.`}
        canonicalPath={`/tecnologias/${tech.slug}`}
        image={allImages[0] || tech.image}
        type="article"
        keywords={tech.keywords || [
          tech.name.toLowerCase(),
          'tecnologia estética sp',
          'clínica nidô',
          'água branca sp',
          'perdizes sp'
        ]}
        schemaJson={[
          {
            '@context': 'https://schema.org',
            '@type': 'MedicalDevice',
            name: tech.name,
            description: tech.description,
            purpose: tech.tagline,
            procedure: tech.howItWorks,
            image: allImages[0] || tech.image,
            url: `https://www.nidoestetica.com.br/tecnologias/${tech.slug}`,
            recognizingAuthority: {
              '@type': 'GovernmentOrganization',
              name: 'ANVISA'
            }
          },
          ...(tech.faqs && tech.faqs.length > 0 ? [{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: tech.faqs.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
              }
            }))
          }] : []),
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Início',
                item: 'https://www.nidoestetica.com.br/'
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Tecnologias',
                item: 'https://www.nidoestetica.com.br/tecnologias'
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: tech.name,
                item: `https://www.nidoestetica.com.br/tecnologias/${tech.slug}`
              }
            ]
          }
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero da Tecnologia */}
        <div className="mb-14 pb-8 border-b border-[#E5DAD0]/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Imagem do Equipamento/Procedimento (Primeira) */}
            <div className="lg:col-span-5 space-y-3">
              <div 
                className="aspect-4/3 rounded-3xl overflow-hidden bg-[#181310] relative shadow-md cursor-pointer group"
                onClick={() => setModalImageIndex(activeImageIndex)}
              >
                <img
                  src={allImages[activeImageIndex] || tech.image}
                  alt={`Equipamento ${tech.name} na Clínica Nidô`}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181310]/50 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 bg-[#FFFFFF]/90 backdrop-blur-md p-3 rounded-2xl border border-white/60 text-xs text-[#241E1B] flex items-center gap-2 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-[#8C7359] shrink-0" />
                  <span className="font-normal text-[11px] leading-tight text-[#44342E]">
                    Equipamento original homologado e operado por profissionais de saúde especializados.
                  </span>
                </div>
              </div>

              {allImages.length > 1 && (
                <div className={`grid ${allImages.length === 3 ? 'grid-cols-3' : allImages.length === 5 ? 'grid-cols-5' : allImages.length >= 4 ? 'grid-cols-4' : 'grid-cols-2'} gap-2 sm:gap-3 pt-1`}>
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-4/3 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#44342E] shadow-sm ring-2 ring-[#44342E]/20'
                          : 'border-[#E5DAD0] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${tech.name} foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Conteúdo de Texto (Segundo) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#EFE6DC] text-[#44342E] text-xs uppercase tracking-wider font-semibold px-3.5 py-1 rounded-full border border-[#E5DAD0]/80">
                  {tech.category}
                </span>
                <span className="bg-[#44342E] text-[#FFFFFF] text-xs uppercase tracking-wider font-semibold px-3.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <Cpu className="w-3 h-3 text-[#EFE6DC]" /> Alta Tecnologia Nidô
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#241E1B] font-semibold leading-tight">
                {tech.name}
              </h1>

              <p className="text-sm uppercase tracking-wider text-[#8C7359] font-medium">
                {tech.tagline}
              </p>

              <p className="text-base sm:text-lg text-[#5C4B44] font-normal leading-relaxed">
                {tech.description}
              </p>

              {/* Botões de Ação Imediata */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleWhatsAppHero}
                  className="inline-flex items-center justify-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] font-medium text-xs uppercase tracking-wider px-7 py-3.5 rounded-full transition-colors cursor-pointer shadow-xs active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Dúvidas sobre {tech.name} no WhatsApp</span>
                </button>

                <Link
                  to="/tecnologias"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#241E1B] hover:text-[#44342E] py-3.5 px-4 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para Tecnologias</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Fluido Editorial sem Caixas Fechadas */}
        <div className="space-y-12 divide-y divide-[#E5DAD0]/80 mb-16">
          {/* 3. Como a Tecnologia Atua & Mecanismo Biológico */}
          {tech.howItWorks && (
            <div className="space-y-6 pt-2">
              <div className="max-w-3xl">
                <span className="text-xs uppercase tracking-wider font-medium text-[#8C7359] block mb-1">
                  Fundamentação Científica
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#241E1B]">
                  Como a tecnologia atua no organismo?
                </h2>
                <p className="mt-3 text-base sm:text-lg text-[#4A3B34] font-normal leading-relaxed">
                  {tech.howItWorks}
                </p>
              </div>

              {tech.slug === 'hipro' && (
                <div className="pt-4 max-w-2xl space-y-2">
                  <div 
                    className="rounded-2xl overflow-hidden border border-[#E5DAD0] shadow-xs cursor-pointer group"
                    onClick={() => setModalImageIndex(1)}
                  >
                    <img
                      src="https://lh3.googleusercontent.com/d/1ca9tRl1zagmU8cg1ncvXzAto0N6oBlLg"
                      alt="Aplicação do HIPRO na Papada"
                      className="w-full h-auto object-cover group-hover:scale-101 transition-transform"
                    />
                  </div>
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Aplicação do HIPRO na região de papada para retração dérmica e sustentação do contorno facial. (Clique para ampliar)
                  </p>
                </div>
              )}

              {tech.mechanismHighlights && tech.mechanismHighlights.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {tech.mechanismHighlights.map((highlight, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#EFE6DC]/60 border border-[#E5DAD0]/80 flex items-start gap-3">
                      <Activity className="w-5 h-5 text-[#8C7359] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#332923] font-normal leading-snug">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Grid de Indicações & Diferenciais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-10">
            {/* Principais Indicações */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFE6DC] text-[#44342E] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#8C7359]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#241E1B]">
                    Principais Indicações
                  </h3>
                  <p className="text-xs text-[#8C7359] font-medium">Quando esta tecnologia é recomendada</p>
                </div>
              </div>

              <ul className="space-y-3 pt-2 text-sm text-[#382B25]">
                {tech.targetIndications.map((ind, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-[#FFFFFF]/60 p-3 rounded-xl border border-[#E5DAD0]/60">
                    <CheckCircle2 className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />
                    <span className="font-normal">{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Diferenciais e Benefícios */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFE6DC] text-[#44342E] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#8C7359]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#241E1B]">
                    Benefícios em Destaque
                  </h3>
                  <p className="text-xs text-[#8C7359] font-medium">Vantagens clínicas comprovadas</p>
                </div>
              </div>

              <ul className="space-y-3 pt-2 text-sm text-[#382B25]">
                {tech.keyBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-[#EFE6DC]/50 p-3 rounded-xl border border-[#E5DAD0]/60">
                    <span className="w-2 h-2 rounded-full bg-[#8C7359] shrink-0 mt-1.5" />
                    <span className="font-normal">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5. Dados de Sessão e Conforto */}
          {(tech.sessionDuration || tech.recoveryAndComfort) && (
            <div className="pt-10">
              <div className="bg-[#EFE6DC]/80 backdrop-blur-xs rounded-3xl p-6 sm:p-8 border border-[#E5DAD0]">
                <h3 className="font-serif text-2xl font-semibold text-[#241E1B] mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#8C7359]" />
                  Tempo de Sessão e Recuperação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#44342E]">
                  {tech.sessionDuration && (
                    <div>
                      <strong className="block text-xs uppercase tracking-wider text-[#8C7359] font-semibold mb-1">
                        Duração média da sessão
                      </strong>
                      <p className="font-normal leading-relaxed">{tech.sessionDuration}</p>
                    </div>
                  )}
                  {tech.recoveryAndComfort && (
                    <div>
                      <strong className="block text-xs uppercase tracking-wider text-[#8C7359] font-semibold mb-1">
                        Recuperação & Conforto Pós-procedimento
                      </strong>
                      <p className="font-normal leading-relaxed">{tech.recoveryAndComfort}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. Protocolos e Tratamentos Relacionados */}
        {tech.relatedTreatments && tech.relatedTreatments.length > 0 && (
          <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-10 border border-[#E5DAD0] shadow-xs mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#EFE6DC] flex items-center justify-center text-[#44342E]">
                <Layers className="w-5 h-5 text-[#8C7359]" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#241E1B]">
                  Protocolos da Clínica Nidô com {tech.name}
                </h3>
                <p className="text-xs text-[#8C7359] font-medium">
                  Tratamentos integrados que combinam esta plataforma para potencializar resultados
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tech.relatedTreatments.map((t, idx) => (
                <Link
                  key={idx}
                  to={`/tratamentos/${t.slug}`}
                  className="group p-5 rounded-2xl bg-[#F7F2EB] hover:bg-[#EFE6DC] border border-[#E5DAD0] transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8C7359] tracking-wider block mb-1">
                      Protocolo Clínico
                    </span>
                    <h4 className="font-serif text-lg font-medium text-[#241E1B] group-hover:text-[#44342E] transition-colors">
                      {t.name}
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#44342E] mt-4">
                    Ver detalhes do protocolo <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 7. Perguntas Frequentes (FAQ) */}
        {tech.faqs && tech.faqs.length > 0 && (
          <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-10 border border-[#E5DAD0] shadow-xs mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#EFE6DC] flex items-center justify-center text-[#44342E]">
                <HelpCircle className="w-5 h-5 text-[#8C7359]" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#241E1B]">
                  Dúvidas Frequentes sobre {tech.name}
                </h3>
                <p className="text-xs text-[#8C7359] font-medium">
                  Respostas claras para você se sentir seguro(a)
                </p>
              </div>
            </div>
            <FAQAccordion items={tech.faqs} title="" />
          </div>
        )}

        {/* 8. Nota Clínica e Ética */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#EFE6DC] border border-[#E5DAD0] flex items-start gap-3 text-xs text-[#5C4B44] leading-relaxed mb-12">
          <ShieldCheck className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#241E1B] font-semibold">Avaliação Clínica Individualizada Obrigatória: </strong>
            {tech.clinicalNote || 'A definição do protocolo de aplicação, parâmetros de energia e quantidade de sessões são estabelecidos pelo profissional habilitado após consulta de avaliação individualizada, respeitando a anatomia, biotipo e histórico de cada paciente.'}
          </div>
        </div>

        {/* 9. Card Final de Conversão */}
        <div className="bg-[#44342E] text-[#FFFFFF] rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4 shadow-md">
          <h3 className="font-serif text-3xl font-semibold">
            Deseja saber se {tech.name} é o procedimento ideal para você?
          </h3>
          <p className="text-sm text-[#EFE6DC] font-normal max-w-lg mx-auto leading-relaxed">
            Fale diretamente com nossa equipe no WhatsApp para tirar dúvidas detalhadas e agendar sua avaliação na Clínica Nidô.
          </p>
          <div className="pt-2">
            <button
              onClick={handleWhatsAppFooter}
              className="inline-flex items-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider px-8 py-4 rounded-full transition-colors cursor-pointer shadow-xs active:scale-98 animate-whatsapp-brand-pulse"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Falar com a equipe no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
      <ImageModal
        isOpen={modalImageIndex !== null}
        onClose={() => setModalImageIndex(null)}
        images={allImages}
        currentIndex={modalImageIndex || 0}
        onNavigate={setModalImageIndex}
      />
    </div>
  );
};
