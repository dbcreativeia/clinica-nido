import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  MapPin, 
  Users, 
  MessageCircle, 
  CheckCircle2, 
  Eye, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { openWhatsApp, WhatsAppMessages } from '../utils/whatsapp';
import { ImageModal } from '../components/ImageModal';
import { SEOHead } from '../components/SEOHead';

export const ClinicPage: React.FC = () => {
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
  const clinicImages = [
    '/foto-clinica_1.webp',
    '/foto-clinica_2.webp',
    '/foto-clinica_3.webp',
    'https://lh3.googleusercontent.com/d/1NxQfV36ww36cOTSbgMRgYvfeRFn2ZPcz',
    'https://lh3.googleusercontent.com/d/1P-lu-hNx263-yW6uLMAPaxGiHV74wI21',
    'https://lh3.googleusercontent.com/d/1bF_XxSM6YXPRZHLhXOBAajShKYINmGC1',
    'https://lh3.googleusercontent.com/d/1cc5TqFMtZFyTgFmW7LhxGSaBcdc9wDqo',
    'https://lh3.googleusercontent.com/d/1imcOyh2FQd4KwzV-sJ5-_J8_T_Yl8YlD',
    'https://lh3.googleusercontent.com/d/1o4RDN4Y18ceicrKc__VfzZqPr9OzHxXT',
    'https://lh3.googleusercontent.com/d/1vm4PLoWprrFz2f1XvH9zNLb4VhVQTf4U'
  ];

  const addedPhotos = [
    'https://lh3.googleusercontent.com/d/1NxQfV36ww36cOTSbgMRgYvfeRFn2ZPcz',
    'https://lh3.googleusercontent.com/d/1P-lu-hNx263-yW6uLMAPaxGiHV74wI21',
    'https://lh3.googleusercontent.com/d/1bF_XxSM6YXPRZHLhXOBAajShKYINmGC1',
    'https://lh3.googleusercontent.com/d/1cc5TqFMtZFyTgFmW7LhxGSaBcdc9wDqo',
    'https://lh3.googleusercontent.com/d/1imcOyh2FQd4KwzV-sJ5-_J8_T_Yl8YlD',
    'https://lh3.googleusercontent.com/d/1o4RDN4Y18ceicrKc__VfzZqPr9OzHxXT',
    'https://lh3.googleusercontent.com/d/1vm4PLoWprrFz2f1XvH9zNLb4VhVQTf4U'
  ];

  const patientPhotos = [
    'https://lh3.googleusercontent.com/d/1F57MxOSxhDAQSCBaGkWwqEeHxUNzbAhc',
    'https://lh3.googleusercontent.com/d/1KwXeFzmUklN_yQfweB7iKLMJNrZ_ZS1f',
    'https://lh3.googleusercontent.com/d/1R2yPTw9f96bSrFU-OOJIp3p16puDPr5v',
    'https://lh3.googleusercontent.com/d/1WV0YMUCxU-VlT2aQNP4S76wJbBiVG6bO',
    'https://lh3.googleusercontent.com/d/1_rGw4B804yF6hH398yrabbGPKBtScfSA',
    'https://lh3.googleusercontent.com/d/1ysgbu4M9bE8w9kkOahjLGphuPuyxlQfk'
  ];

  const [activeModalImages, setActiveModalImages] = useState<string[]>(clinicImages);

  const openClinicModal = (index: number) => {
    setActiveModalImages(clinicImages);
    setModalImageIndex(index);
  };

  const openPatientModal = (index: number) => {
    setActiveModalImages(patientPhotos);
    setModalImageIndex(index);
  };

  const handleWhatsApp = () => {
    openWhatsApp(WhatsAppMessages.general(), {
      service_name: 'A Clínica',
      page_path: '/a-clinica',
      cta_location: 'Página A Clínica'
    });
  };

  return (
    <div className="pt-28 pb-20 bg-[#F5EFE7] min-h-screen">
      <SEOHead
        title="A Clínica Nidô | Estrutura, Biossegurança e Conforto na Água Branca SP"
        description="Conheça a estrutura da Clínica Nidô na Rua Dona Germaine Burchard, 499. Consultórios modernos, tecnologia homologada e atendimento humanizado na Água Branca SP."
        canonicalPath="/a-clinica"
        image="/foto-clinica_1.webp"
        keywords={[
          'clínica de estética água branca',
          'clínica estética perdizes sp',
          'estrutura clínica nidô',
          'dra brenda niyama consultório',
          'clínica estética barra funda são paulo',
          'biossegurança estética sp'
        ]}
        schemaJson={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'A Clínica Nidô',
          description: 'Espaço clínico de estética avançada e longevidade na Água Branca, São Paulo.',
          url: 'https://www.nidoestetica.com.br/a-clinica',
          mainEntity: {
            '@type': 'MedicalClinic',
            name: 'Clínica Nidô',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Rua Dona Germaine Burchard, 499',
              addressLocality: 'Água Branca',
              addressRegion: 'SP',
              postalCode: '05002-062',
              addressCountry: 'BR'
            },
            telephone: '+5511963836050'
          }
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block mb-2">
            A Nossa História & Propósito
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#241E1B] font-semibold">
            A Clínica <em className="italic text-[#44342E]">Nidô</em>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#5C4B44] font-normal leading-relaxed">
            Um refúgio de estética avançada onde a ciência médica se une ao acolhimento humano para valorizar a beleza que já é sua.
          </p>
        </div>

        {/* Hero Banner with Clinic Atmosphere */}
        <div className="mb-16">
          <div className="relative rounded-3xl overflow-hidden border border-[#E5DAD0] shadow-xs aspect-16/9 md:aspect-21/9 bg-[#EFE6DC] cursor-pointer hover:opacity-95 transition-opacity" onClick={() => setModalImageIndex(0)}>
            <img
              src="/foto-clinica_1.webp"
              alt="Ambiente acolhedor da Clínica Nidô na Água Branca"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-6 text-center space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#8C7359] font-semibold block">
              Localização Privilegiada
            </span>
            <p className="font-serif text-xl sm:text-2xl text-[#241E1B] font-normal">
              Rua Dona Germaine Burchard, 499 • Água Branca, São Paulo
            </p>
          </div>
        </div>

        {/* Section 1: Filosofia da Naturalidade */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block">
              Filosofia Clínica
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#241E1B] font-semibold leading-tight">
              Realçar traços sem <em className="italic text-[#44342E]">descaracterizar</em> sua essência.
            </h2>
            <p className="text-sm sm:text-base text-[#5C4B44] font-normal leading-relaxed">
              Acreditamos que os melhores procedimentos estéticos são aqueles imperceptíveis: você parece mais descansada, jovial e revitalizada, mantendo sua identidade preservada.
            </p>
            <p className="text-sm sm:text-base text-[#5C4B44] font-normal leading-relaxed">
              Rejeitamos padronizações artificiais de internet. Cada paciente possui uma história de vida, características ósseas e musculares singulares que merecem ser respeitadas.
            </p>

            <div className="pt-2 space-y-2 text-xs sm:text-sm text-[#44342E] font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8C7359]" />
                <span>Avaliação individual prévia sem pressa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8C7359]" />
                <span>Seleção criteriosa de substâncias biocompativeis certificadas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8C7359]" />
                <span>Acompanhamento clínico presencial pós-procedimento</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden border border-[#E5DAD0] shadow-xs bg-[#EFE6DC] cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openClinicModal(1)}>
              <img
                src="/foto-clinica_2.webp"
                alt="Equipamentos e precisão na Clínica Nidô"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Section 2: O Método Espelho - Layout Fluido sem Caixa Fechada */}
        <div className="py-12 my-12 border-y border-[#E5DAD0]/80">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block">
              Metodologia Exclusiva
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#241E1B] font-semibold">
              O Método Espelho da Dra. Brenda Niyama
            </h2>
            <p className="text-sm sm:text-base text-[#5C4B44] font-normal leading-relaxed">
              Criado pela fundadora da Nidô, o Método Espelho é um protocolo de diagnóstico facial e corporal tridimensional que mapeia os pontos de sustentação antes de qualquer aplicação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#EFE6DC]/70 border border-[#E5DAD0]/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#44342E] text-[#FFFFFF] flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#241E1B]">1. Análise Fisionômica Dinâmica</h3>
              <p className="text-xs sm:text-sm text-[#5C4B44] font-normal leading-relaxed">
                Estudo do rosto em movimento (sorriso, fala, expressões), garantindo que os procedimentos não congelem sua mímica natural.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#EFE6DC]/70 border border-[#E5DAD0]/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#44342E] text-[#FFFFFF] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#241E1B]">2. Mapeamento dos Vetores</h3>
              <p className="text-xs sm:text-sm text-[#5C4B44] font-normal leading-relaxed">
                Identificação exata de perdas ósseas e de coxins de gordura, restaurando a ancoragem anatômica com microdoses precisas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#EFE6DC]/70 border border-[#E5DAD0]/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#44342E] text-[#FFFFFF] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#241E1B]">3. Plano Terapêutico Faseado</h3>
              <p className="text-xs sm:text-sm text-[#5C4B44] font-normal leading-relaxed">
                Estruturação de um cronograma em etapas, permitindo que a pele e os tecidos reajam e amadureçam gradualmente com segurança.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Estrutura Física e Conforto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block">
              Estrutura & Privacidade
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#241E1B] font-semibold">
              Salas individuais e tecnologia de alto padrão
            </h2>
            <p className="text-sm sm:text-base text-[#5C4B44] font-normal leading-relaxed">
              Cada consultório e sala de procedimentos da Clínica Nidô foi projetado para oferecer isolamento acústico, climatização controlada, rigorosos protocolos de assepsia e equipamentos de última geração.
            </p>
            <div className="pt-2">
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] font-semibold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Agendar uma visita à clínica</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square rounded-2xl overflow-hidden border border-[#E5DAD0] shadow-xs cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openClinicModal(2)}>
              <img
                src="/foto-clinica_3.webp"
                alt="Ambiente da Clínica Nidô"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden border border-[#E5DAD0] shadow-xs cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openClinicModal(0)}>
              <img
                src="/foto-clinica_1.webp"
                alt="Consultório da Clínica Nidô"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Galeria de Fotos da Clínica */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block">
              Galeria de Ambientes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#241E1B] font-semibold">
              Espaços da Clínica Nidô
            </h2>
            <p className="text-sm sm:text-base text-[#5C4B44] font-normal leading-relaxed">
              Ambientes desenhados para acolhimento, biossegurança e privacidade em cada etapa do seu atendimento. Toque em qualquer foto para ampliar.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {addedPhotos.map((imgUrl, idx) => {
              const fullIndex = 3 + idx;
              const isLast = idx === addedPhotos.length - 1;
              return (
                <div
                  key={imgUrl}
                  onClick={() => openClinicModal(fullIndex)}
                  className={`group relative rounded-2xl overflow-hidden border border-[#E5DAD0] shadow-xs bg-[#EFE6DC] cursor-pointer hover:shadow-md hover:border-[#8C7359]/60 transition-all duration-300 ${
                    isLast ? 'col-span-2 md:col-span-1 lg:col-span-2 aspect-16/10 sm:aspect-16/9 md:aspect-3/4 lg:aspect-16/9' : 'aspect-3/4'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Espaço da Clínica Nidô ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[#241E1B]/0 group-hover:bg-[#241E1B]/20 transition-colors duration-300 flex items-end p-3 sm:p-4">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#44342E]/90 text-white text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs shadow-xs">
                      Ampliar
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloco: Nossas Pacientes */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block">
              Quem Confia em Nós
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#241E1B] font-semibold">
              Nossas Pacientes
            </h2>
            <p className="text-sm sm:text-base text-[#5C4B44] font-normal leading-relaxed">
              Cuidado individualizado, resultados naturais e o carinho de quem escolhe a Clínica Nidô. Toque em qualquer foto para ampliar.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {patientPhotos.map((imgUrl, idx) => (
              <div
                key={imgUrl}
                onClick={() => openPatientModal(idx)}
                className="group relative rounded-2xl overflow-hidden border border-[#E5DAD0] shadow-xs bg-[#EFE6DC] cursor-pointer hover:shadow-md hover:border-[#8C7359]/60 transition-all duration-300 aspect-3/4 sm:aspect-4/5"
              >
                <img
                  src={imgUrl}
                  alt={`Paciente da Clínica Nidô ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#241E1B]/0 group-hover:bg-[#241E1B]/20 transition-colors duration-300 flex items-end p-3 sm:p-4">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#44342E]/90 text-white text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs shadow-xs">
                    Ampliar
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA (Luminoso e Elegante) */}
        <div className="bg-[#EFE6DC] text-[#241E1B] border border-[#E5DAD0] rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4">
          <h3 className="font-serif text-3xl font-semibold">
            Conheça a equipe de perto
          </h3>
          <p className="text-sm text-[#5C4B44] font-normal max-w-lg mx-auto">
            Nossa equipe terá prazer em receber você para uma avaliação individualizada na Água Branca.
          </p>
          <div className="pt-2">
            <Link
              to="/corpo-clinico"
              className="inline-flex items-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider px-7 py-3.5 rounded-full transition-colors shadow-xs active:scale-98"
            >
              <span>Ver Corpo Clínico</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      <ImageModal isOpen={modalImageIndex !== null} onClose={() => setModalImageIndex(null)} images={activeModalImages} currentIndex={modalImageIndex || 0} onNavigate={setModalImageIndex} />
    </div>
  );
};
