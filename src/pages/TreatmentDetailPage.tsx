import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  MessageCircle, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck,
  Sparkles, 
  MapPin, 
  Calendar, 
  Layers,
  Compass,
  HeartHandshake,
  ChevronRight 
} from 'lucide-react';
import { TREATMENTS } from '../data/treatments';
import { FAQAccordion } from '../components/FAQAccordion';
import { ResultGallery } from '../components/ResultGallery';
import { ImageModal } from '../components/ImageModal';
import { openWhatsApp, WhatsAppMessages } from '../utils/whatsapp';
import { SEOHead } from '../components/SEOHead';
import { trackMetaViewContent } from '../utils/metaConversions';

export const TreatmentDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const treatment = TREATMENTS.find((t) => t.slug === slug);

  useEffect(() => {
    if (treatment) {
      trackMetaViewContent(treatment.name, 'Tratamentos');
    }
  }, [treatment]);
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
  const endoslimImages = [
    '/02-endoslim-abdomen-1-sessao-30-dias.webp',
    '/03-endoslim-gluteo-1-sessao-60-dias.webp',
    '/04-endoslim-abdomen-1-sessao-60-dias.webp',
    '/05-endoslim-pescoco-1-sessao-30-dias.webp'
  ];
  const hiproImages = [
    'https://lh3.googleusercontent.com/d/1ca9tRl1zagmU8cg1ncvXzAto0N6oBlLg',
    'https://lh3.googleusercontent.com/d/1onznv0AkvKgVZkEUL7Xs_Yh3WEysv-Q-'
  ];
  const celuliteImages = [
    'https://lh3.googleusercontent.com/d/18ZTR7u99NG8v7XgunDbeJAPqvgalcD-Z',
    'https://lh3.googleusercontent.com/d/1KzPwaaqMA5uynw6eprSj_xFyggSNRtDT',
    'https://lh3.googleusercontent.com/d/1Vi7T5tgMwnDimf8L7NyMfdDvyZ-inad6',
    'https://lh3.googleusercontent.com/d/1lyaGpWH-ve-Q_zTTKOIqo3TbMjGDiQ6G'
  ];
  const bioRegeneracaoImages = [
    'https://lh3.googleusercontent.com/d/1EPQYZh2_XoMw04f9_JK2wIBUP20AatKF'
  ];
  const profhiloImages = [
    'https://lh3.googleusercontent.com/d/1qYWMR_QvI-fbpzjEKzcKbZkOxI6kYkt0'
  ];
  const harmonizacaoImages = [
    'https://lh3.googleusercontent.com/d/1tCcoQRbFzWkH-R0zrK-um778_ZjZMXBu',
    'https://lh3.googleusercontent.com/d/1tbzu-GeRrIKaEULjpaLAyWrnaNMEC4ju',
    'https://lh3.googleusercontent.com/d/1DBzTAgRsS7I1oGhrPa_1eL9FaE1FFVhv',
    'https://lh3.googleusercontent.com/d/1MSIrNRFx0UjyMdYvONIsBsQFdG4Q3K6_',
    'https://lh3.googleusercontent.com/d/1Z6w7D0kU4KULwhh509pwedMjCw8TXmkK',
    'https://lh3.googleusercontent.com/d/1_iQ6s6yipVABPYpcpHfkEvtCCJChN_G4',
    'https://lh3.googleusercontent.com/d/1oYScJxw50fbZsdydWz3yT-Uqbo0Pojy5',
    'https://lh3.googleusercontent.com/d/1sp_pGiIeDLPVrRYgofvLhws2piX_FZSz'
  ];
  const extracaoImages = [
    'https://lh3.googleusercontent.com/d/1CuyqREMFpclJoIrSnB0wg40CVGKOXo3b'
  ];
  const melasmaImages = [
    'https://lh3.googleusercontent.com/d/1YITAXlDD7RF3xqu_tZjzMJsbHa-GBU_2'
  ];
  const toxinaBotulinicaImages = [
    'https://lh3.googleusercontent.com/d/19K5b-1N2tof4fsbZHWzq8f5j0FoZ70R6',
    'https://lh3.googleusercontent.com/d/1O_ExpHoPp9wTwEAC1oVESrB0rA2Eutu3',
    'https://lh3.googleusercontent.com/d/1bp7-I5xbX9qriCdfov_Z_1bhon1QjREt',
    'https://lh3.googleusercontent.com/d/1fuPTFYIR7obH2b6NXgi39PpFLL61m-Ng'
  ];
  const terapiaCapilarImages = [
    'https://lh3.googleusercontent.com/d/14b6fevARNYDGgFPkpY-YilUmlgJhjWCz',
    'https://lh3.googleusercontent.com/d/1BXJteBEHetf7KiRIU2-LYgE254w0vqav',
    'https://lh3.googleusercontent.com/d/1GBjWt5rZBzS_ioAVMLJM_NqzMWWtXdG2',
    'https://lh3.googleusercontent.com/d/1iBoiwZ7LVYPbb75zuqIf700DeW6Vord_'
  ];
  const gorduraLocalizadaImages = [
    'https://lh3.googleusercontent.com/d/1j-HyD2ndFkToBINBPE2uWs00_tkYJsJY',
    'https://lh3.googleusercontent.com/d/16R8VbjB43YG6isoDWRG-4bSGe_pJFUMh',
    'https://lh3.googleusercontent.com/d/1TYqxlP75iRwoSjMgjDdgfc_D_RZnzoem',
    'https://lh3.googleusercontent.com/d/1857kz6-nhYH4H93AgFcIb0xoh4f_uXmm'
  ];
  const nutrologiaImages = [
    'https://lh3.googleusercontent.com/d/16RQp6Nvx5CxXU-l8jl9NOqkJujyoiv9P',
    'https://lh3.googleusercontent.com/d/1DsXauJfl_h-1fxt2ye1QUHQOs60RdwTC',
    'https://lh3.googleusercontent.com/d/1IqYjIEQHQLDKdd5_e9rg7CWWNmtpM6K8',
    'https://lh3.googleusercontent.com/d/1U2BmTYSJCHPx59pvKhzPRsbyiKFF0sxh',
    'https://lh3.googleusercontent.com/d/1URocYuP9LoiqdtTmVUj2iIVZyoFL8kJM'
  ];
  const drenagemImages = [
    'https://lh3.googleusercontent.com/d/1ELMN3geTYc9E1ENpcnbdU0MoXq4lfqLW',
    'https://lh3.googleusercontent.com/d/1VotgBD_jXlyWEWQp6TSoAPYHuy63AanR',
    'https://lh3.googleusercontent.com/d/1gFSM44nFOq2xLCoyhuGcyoURo2Meb_ni',
    'https://lh3.googleusercontent.com/d/1Wp3JoA-EaSIiUjqq9XQm6bTXFJRG0aCo'
  ];

  const activeModalImages = treatment?.slug === 'endoslim' 
    ? endoslimImages 
    : (treatment?.slug === 'hipro-facial-corporal' 
      ? hiproImages 
      : (treatment?.slug === 'celulite-flacidez-corporal' 
        ? celuliteImages 
        : (treatment?.slug === 'bio-regeneracao-celular'
          ? bioRegeneracaoImages
          : (treatment?.slug === 'profhilo'
            ? profhiloImages
            : (treatment?.slug === 'harmonizacao-facial'
              ? harmonizacaoImages
              : (treatment?.slug === 'extracao-regeneradora-peptideos'
                ? extracaoImages
                : (treatment?.slug === 'peeling-dermeskin-melasma'
                  ? melasmaImages
                  : (treatment?.slug === 'linhas-de-expressao-toxina'
                    ? toxinaBotulinicaImages
                    : (treatment?.slug === 'terapias-capilares-regenerativas'
                      ? terapiaCapilarImages
                      : (treatment?.slug === 'gordura-localizada-contorno'
                        ? gorduraLocalizadaImages
                        : (treatment?.slug === 'nutrologia-longevidade-hipertrofia'
                          ? nutrologiaImages
                          : (treatment?.slug === 'drenagem-pos-operatoria-e-linfatica'
                            ? drenagemImages
                            : (treatment?.images || [])))))))))))));

  if (!treatment) {
    return <Navigate to="/tratamentos" replace />;
  }

  const handleWhatsAppHero = () => {
    openWhatsApp(WhatsAppMessages.treatment(treatment.name), {
      service_name: treatment.name,
      page_path: `/tratamentos/${treatment.slug}`,
      cta_location: 'Hero Tratamento'
    });
  };

  const handleWhatsAppFooter = () => {
    openWhatsApp(WhatsAppMessages.treatment(treatment.name), {
      service_name: treatment.name,
      page_path: `/tratamentos/${treatment.slug}`,
      cta_location: 'Final da Página Tratamento'
    });
  };

  return (
    <div className="pt-24 pb-20 bg-[#F7F2EB] min-h-screen">
      <SEOHead
        title={`${treatment.name} em São Paulo | Clínica Nidô`}
        description={`${treatment.summary} Atendimento na Água Branca, São Paulo. Dra. Brenda Niyama.`}
        canonicalPath={`/tratamentos/${treatment.slug}`}
        image={treatment.heroImage}
        type="article"
        keywords={treatment.keywords || [
          treatment.name.toLowerCase(),
          'estética avançada são paulo',
          'clínica nidô',
          'água branca sp',
          'perdizes sp'
        ]}
        schemaJson={[
          {
            '@context': 'https://schema.org',
            '@type': 'MedicalProcedure',
            name: treatment.name,
            description: treatment.whatIs || treatment.summary,
            procedureType: 'NonSurgicalProcedure',
            bodyLocation: treatment.treatedAreas?.join(', ') || 'Corpo e Face',
            howItWorks: treatment.howItWorks,
            url: `https://www.nidoestetica.com.br/tratamentos/${treatment.slug}`,
            image: treatment.heroImage,
            provider: {
              '@type': 'MedicalClinic',
              name: 'Clínica Nidô',
              telephone: '+5511963836050',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Rua Dona Germaine Burchard, 499',
                addressLocality: 'Água Branca',
                addressRegion: 'SP',
                postalCode: '05002-062',
                addressCountry: 'BR'
              }
            }
          },
          ...(treatment.faqs && treatment.faqs.length > 0 ? [{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: treatment.faqs.map(faq => ({
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
                name: 'Tratamentos',
                item: 'https://www.nidoestetica.com.br/tratamentos'
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: treatment.name,
                item: `https://www.nidoestetica.com.br/tratamentos/${treatment.slug}`
              }
            ]
          }
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero com Nome, Benefício Central e CTA de WhatsApp Acima da Dobra */}
        <div className="mb-14 pb-8 border-b border-[#E5DAD0]/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Conteúdo de Texto */}
            <div className={`lg:col-span-12 space-y-5`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#EFE6DC] text-[#44342E] text-xs uppercase tracking-wider font-semibold px-3.5 py-1 rounded-full border border-[#E5DAD0]/80">
                  {treatment.categoryLabel}
                </span>
                {treatment.isPriority && (
                  <span className="bg-[#44342E] text-[#FFFFFF] text-xs uppercase tracking-wider font-semibold px-3.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 text-[#EFE6DC]" /> Destaque Nidô
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#241E1B] font-semibold leading-tight">
                {treatment.name}
              </h1>

              <p className="text-sm uppercase tracking-wider text-[#8C7359] font-medium">
                {treatment.subtitle}
              </p>

              <p className="text-base sm:text-lg text-[#5C4B44] font-normal leading-relaxed">
                {treatment.summary}
              </p>

              {/* Immediate WhatsApp CTA above fold */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleWhatsAppHero}
                  className="inline-flex items-center justify-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] font-semibold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full transition-colors cursor-pointer shadow-xs active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Quero saber mais sobre {treatment.name}</span>
                </button>

                <Link
                  to="/tratamentos"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#241E1B] hover:text-[#44342E] py-3.5 px-4 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ver outros tratamentos</span>
                </Link>
              </div>

              <p className="text-xs text-[#8C7359] font-normal">
                * Atendimento humanizado e individualizado na clínica na Água Branca, São Paulo.
              </p>
            </div>
          </div>
        </div>

        {/* Content Modules Grid - Layout Fluido Editorial sem Caixas Separadas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-16">
          {/* Main detailed content */}
          <div className="lg:col-span-8 space-y-10 divide-y divide-[#E5DAD0]/80">
            {/* 4. O que é o tratamento */}
            <div className="space-y-3 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#241E1B]">
                O que é o tratamento?
              </h2>
              <p className="text-base sm:text-lg text-[#4A3B34] leading-relaxed font-normal">
                {treatment.whatIs}
              </p>
              {treatment.slug === 'endoslim' && (
                <img src="/02-endoslim-abdomen-1-sessao-30-dias.webp" alt="Endoslim Abdômen" className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" onClick={() => setModalImageIndex(0)} />
              )}
              {treatment.slug === 'hipro-facial-corporal' && (
                <div className="space-y-2 pt-2">
                  <img 
                    src="https://lh3.googleusercontent.com/d/1ca9tRl1zagmU8cg1ncvXzAto0N6oBlLg" 
                    alt="Aplicação do HIPRO na Papada" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(0)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Aplicação do HIPRO na região de papada para ancoragem tecidual e estímulo de colágeno. (Clique para ampliar)
                  </p>
                </div>
              )}
              {treatment.slug === 'celulite-flacidez-corporal' && (
                <div className="space-y-3 pt-2">
                  <img 
                    src={celuliteImages[0]} 
                    alt="Tratamento de Celulite e Flacidez Corporal" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(0)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Tratamento de celulite e contorno com reestruturação tecidual nos glúteos. (Clique para ampliar)
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {celuliteImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setModalImageIndex(idx)}
                        className="aspect-4/3 rounded-xl overflow-hidden border border-[#E5DAD0] hover:ring-2 hover:ring-[#8C7359] transition-all shadow-xs group cursor-pointer"
                        title={`Ver foto ${idx + 1} em tela cheia`}
                      >
                        <img 
                          src={img} 
                          alt={`Registro clínico ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {treatment.slug === 'profhilo' && (
                <div className="space-y-2 pt-2">
                  <img 
                    src={profhiloImages[0]} 
                    alt="Profhilo - Bioestimulador e Biorremodelador" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(0)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Bioestimulação e biorremodelação tecidual com alta concentração de ácido hialurônico ultrapuro. (Clique para ampliar)
                  </p>
                </div>
              )}
              {treatment.slug === 'harmonizacao-facial' && (
                <div className="space-y-3 pt-2">
                  <img 
                    src={harmonizacaoImages[0]} 
                    alt="Harmonização Facial Personalizada" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(0)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Registros clínicos de harmonização facial personalizada, valorização de proporções e sustentação tecidual. (Clique para ampliar)
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {harmonizacaoImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setModalImageIndex(idx)}
                        className="aspect-4/3 rounded-xl overflow-hidden border border-[#E5DAD0] hover:ring-2 hover:ring-[#8C7359] transition-all shadow-xs group cursor-pointer"
                        title={`Ver foto de harmonização ${idx + 1} em tela cheia`}
                      >
                        <img 
                          src={img} 
                          alt={`Registro clínico ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {treatment.slug === 'extracao-regeneradora-peptideos' && (
                <div className="space-y-2 pt-2">
                  <img 
                    src={extracaoImages[0]} 
                    alt="Extração Regeneradora Facial com Peptídeos" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(0)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Protocolo de higienização profunda associado à infusão dérmica de peptídeos regeneradores. (Clique para ampliar)
                  </p>
                </div>
              )}
              {treatment.slug === 'peeling-dermeskin-melasma' && (
                <div className="space-y-2 pt-2">
                  <img 
                    src={melasmaImages[0]} 
                    alt="Tratamento para Melasma com Peeling Dermeskin" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(0)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Protocolo despigmentante de alta precisão para controle e clareamento do melasma. (Clique para ampliar)
                  </p>
                </div>
              )}
              {treatment.slug === 'linhas-de-expressao-toxina' && (
                <div className="space-y-3 pt-2">
                  <img 
                    src={toxinaBotulinicaImages[0]} 
                    alt="Toxina Botulínica Preventiva e Reparadora" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(0)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Registros clínicos de aplicação de toxina botulínica preventiva e reparadora. (Clique para ampliar)
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {toxinaBotulinicaImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setModalImageIndex(idx)}
                        className="aspect-4/3 rounded-xl overflow-hidden border border-[#E5DAD0] hover:ring-2 hover:ring-[#8C7359] transition-all shadow-xs group cursor-pointer"
                        title={`Ver foto de toxina botulínica ${idx + 1} em tela cheia`}
                      >
                        <img 
                          src={img} 
                          alt={`Registro clínico ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {treatment.slug === 'terapias-capilares-regenerativas' && (
                <div className="space-y-3 pt-2">
                  <img 
                    src={terapiaCapilarImages[0]} 
                    alt="Terapia Capilar & Tricologia Avançada" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(0)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Registros clínicos de terapia capilar integrativa e recuperação folicular. (Clique para ampliar)
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {terapiaCapilarImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setModalImageIndex(idx)}
                        className="aspect-4/3 rounded-xl overflow-hidden border border-[#E5DAD0] hover:ring-2 hover:ring-[#8C7359] transition-all shadow-xs group cursor-pointer"
                        title={`Ver foto de terapia capilar ${idx + 1} em tela cheia`}
                      >
                        <img 
                          src={img} 
                          alt={`Registro clínico ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {treatment.slug === 'gordura-localizada-contorno' && (
                <div className="space-y-3 pt-2">
                  <img 
                    src={gorduraLocalizadaImages[0]} 
                    alt="Protocolo Redutor de Gordura Localizada" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(0)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Registros clínicos de redução de gordura localizada e contorno corporal. (Clique para ampliar)
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {gorduraLocalizadaImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setModalImageIndex(idx)}
                        className="aspect-4/3 rounded-xl overflow-hidden border border-[#E5DAD0] hover:ring-2 hover:ring-[#8C7359] transition-all shadow-xs group cursor-pointer"
                        title={`Ver foto de gordura localizada ${idx + 1} em tela cheia`}
                      >
                        <img 
                          src={img} 
                          alt={`Registro clínico ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {treatment.slug === 'nutrologia-longevidade-hipertrofia' && (
                <div className="space-y-3 pt-2">
                  <img 
                    src={nutrologiaImages[0]} 
                    alt="Nutrologia, Longevidade & Performance" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(0)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Acompanhamento em Nutrologia, Otimização Metabólica e Performance. (Clique para ampliar)
                  </p>
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {nutrologiaImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setModalImageIndex(idx)}
                        className="aspect-4/3 rounded-xl overflow-hidden border border-[#E5DAD0] hover:ring-2 hover:ring-[#8C7359] transition-all shadow-xs group cursor-pointer"
                        title={`Ver foto ${idx + 1} em tela cheia`}
                      >
                        <img 
                          src={img} 
                          alt={`Registro clínico ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {treatment.slug === 'drenagem-pos-operatoria-e-linfatica' && (
                <div className="space-y-3 pt-2">
                  <img 
                    src={drenagemImages[0]} 
                    alt="Drenagem Linfática Especializada & Pós-Cirúrgico" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(0)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Registros de atendimento e técnicas manuais de drenagem linfática especializada. (Clique para ampliar)
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {drenagemImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setModalImageIndex(idx)}
                        className="aspect-4/3 rounded-xl overflow-hidden border border-[#E5DAD0] hover:ring-2 hover:ring-[#8C7359] transition-all shadow-xs group cursor-pointer"
                        title={`Ver foto de drenagem ${idx + 1} em tela cheia`}
                      >
                        <img 
                          src={img} 
                          alt={`Registro de atendimento ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Para quem pode ser indicado */}
            <div className="space-y-4 pt-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#241E1B]">
                Para quem pode ser indicado?
              </h2>
              {treatment.slug === 'endoslim' && (
                <img src="/03-endoslim-gluteo-1-sessao-60-dias.webp" alt="Endoslim Glúteo" className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" onClick={() => setModalImageIndex(1)} />
              )}
              {treatment.slug === 'celulite-flacidez-corporal' && (
                <div className="space-y-2 pt-2">
                  <img 
                    src={celuliteImages[1]} 
                    alt="Indicações para Celulite e Flacidez Corporal" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(1)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Melhora da frouxidão e aspecto ondulado com reestruturação dos septos fibrosos. (Clique para ampliar)
                  </p>
                </div>
              )}
              <p className="text-xs text-[#8C7359] font-normal">
                A indicação é sempre confirmada após avaliação presencial. Em geral, é recomendado para:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#382B25] font-normal">
                {treatment.forWhom.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-[#FFFFFF]/60 p-3.5 rounded-xl border border-[#E5DAD0]/60">
                    <CheckCircle2 className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 6. Benefícios esperados */}
            <div className="space-y-4 pt-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#241E1B]">
                Benefícios e Resultados Esperados
              </h2>
              {treatment.slug === 'endoslim' && (
                <img src="/04-endoslim-abdomen-1-sessao-60-dias.webp" alt="Endoslim Abdômen" className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" onClick={() => setModalImageIndex(2)} />
              )}
              {treatment.slug === 'celulite-flacidez-corporal' && (
                <div className="space-y-2 pt-2">
                  <img 
                    src={celuliteImages[2]} 
                    alt="Benefícios no aspecto da celulite" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(2)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Alisamento progressivo e redução do aspecto de desníveis e ondulações. (Clique para ampliar)
                  </p>
                </div>
              )}
              {treatment.slug === 'bio-regeneracao-celular' && (
                <div className="space-y-2 pt-2">
                  <img 
                    src={bioRegeneracaoImages[0]} 
                    alt="Antes e Depois - Regeneração de rugas periorais (código de barras)" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(0)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Registro clínico comparativo: suavização de rugas periorais (&ldquo;código de barras&rdquo;) e recuperação da densidade da derme com bio-regeneração tecidual. (Clique para ampliar)
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {treatment.benefits.map((benefit, idx) => {
                  const icons = [
                    <Layers className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />,
                    <ShieldCheck className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />,
                    <Sparkles className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />,
                    <Compass className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />,
                    <CheckCircle2 className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />,
                    <HeartHandshake className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />
                  ];
                  return (
                    <div key={idx} className="p-4 bg-[#EFE6DC]/70 rounded-xl border border-[#E5DAD0]/80 flex items-start gap-2.5 text-sm text-[#241E1B] font-normal">
                      {icons[idx] || icons[0]}
                      <span>{benefit}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7. Como funciona */}
            <div className="space-y-3 pt-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#241E1B]">
                Como funciona o procedimento?
              </h2>
              <p className="text-base text-[#4A3B34] leading-relaxed font-normal">
                {treatment.howItWorks}
              </p>
              {treatment.slug === 'endoslim' && (
                <img src="/05-endoslim-pescoco-1-sessao-30-dias.webp" alt="Endoslim Pescoço" className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" onClick={() => setModalImageIndex(3)} />
              )}
              {treatment.slug === 'hipro-facial-corporal' && (
                <div className="space-y-2 pt-2">
                  <img 
                    src="https://lh3.googleusercontent.com/d/1onznv0AkvKgVZkEUL7Xs_Yh3WEysv-Q-" 
                    alt="Equipamento HIPRO" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(1)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Equipamento HIPRO: ultrassom microfocado contínuo para lifting sem cortes com alto conforto. (Clique para ampliar)
                  </p>
                </div>
              )}
              {treatment.slug === 'celulite-flacidez-corporal' && (
                <div className="space-y-2 pt-2">
                  <img 
                    src={celuliteImages[3]} 
                    alt="Protocolo de Celulite e Flacidez" 
                    className="w-full rounded-2xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" 
                    onClick={() => setModalImageIndex(3)} 
                  />
                  <p className="text-xs text-[#8C7359] text-center font-normal">
                    Atuação profunda sobre travas fibróticas associada a bioestímulo e suporte dérmico. (Clique para ampliar)
                  </p>
                </div>
              )}
            </div>

            {/* 8 & 9. Regiões tratadas & Recuperação */}
            {(treatment.treatedAreas || treatment.recoveryAndCare) && (
              <div className="space-y-6 pt-8">
                {treatment.treatedAreas && (
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#241E1B]">
                      Regiões Frequentemente Tratadas
                    </h3>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {treatment.treatedAreas.map((area, idx) => (
                        <span key={idx} className="bg-[#EFE6DC] text-[#241E1B] text-xs px-3.5 py-1.5 rounded-full border border-[#E5DAD0] font-semibold">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {treatment.recoveryAndCare && (
                  <div className="space-y-2 pt-4">
                    <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#241E1B]">
                      Recuperação e Cuidados Pós-Procedimento
                    </h3>
                    <p className="text-base text-[#4A3B34] leading-relaxed font-normal">
                      {treatment.recoveryAndCare}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Editorial Note if present */}
            {treatment.editorialNote && (
              <div className="pt-8">
                <div className="p-4 rounded-xl bg-[#EFE6DC]/80 border border-[#E5DAD0] text-xs text-[#5C4B44] font-normal flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-[#8C7359] shrink-0 mt-0.5" />
                  <span>{treatment.editorialNote}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info & Direct Conversion Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Context Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFFFF]/80 backdrop-blur-md border border-[#E5DAD0] shadow-sm space-y-5 sticky top-28">
              <h3 className="font-serif text-2xl font-medium text-[#241E1B]">
                Atendimento Personalizado
              </h3>
              <p className="text-xs text-[#5C4B44] font-normal leading-relaxed">
                Tire suas dúvidas técnicas ou agende uma avaliação individual para entender se o {treatment.name} é o procedimento mais indicado para você.
              </p>

              <div className="space-y-3 pt-2 text-xs text-[#44342E] border-t border-[#E5DAD0]">
                {treatment.relatedTechnology && (
                  <div>
                    <span className="text-[#8C7359] block text-[11px] uppercase font-semibold">Tecnologia Empregada:</span>
                    <span className="font-medium text-[#241E1B]">{treatment.relatedTechnology}</span>
                  </div>
                )}

                {treatment.relatedProfessional && (
                  <div>
                    <span className="text-[#8C7359] block text-[11px] uppercase font-semibold">Profissional / Condução:</span>
                    <span className="font-medium text-[#241E1B]">{treatment.relatedProfessional}</span>
                  </div>
                )}

                <div>
                  <span className="text-[#8C7359] block text-[11px] uppercase font-semibold">Local de Atendimento:</span>
                  <span className="font-medium text-[#241E1B]">Água Branca, São Paulo • Sala privativa</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleWhatsAppHero}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] font-semibold text-xs uppercase tracking-wider py-3.5 px-4 rounded-full transition-colors cursor-pointer shadow-xs active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Conversar no WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 10. Resultados autorizados (quando aplicável ao Endoslim) */}
        {treatment.hasResults && treatment.slug !== 'endoslim' && (
          <div className="mb-12">
            <ResultGallery />
          </div>
        )}

        {/* 12. Perguntas Frequentes do Tratamento */}
        {treatment.faqs && treatment.faqs.length > 0 && (
          <div className="bg-[#FFFFFF] p-6 sm:p-10 rounded-3xl border border-[#E5DAD0] shadow-xs mb-12">
            <FAQAccordion 
              items={treatment.faqs} 
              title={`Dúvidas Frequentes sobre ${treatment.name}`} 
            />
          </div>
        )}

        {/* 13. Aviso Regulatório Obrigatório */}
        <div className="p-5 rounded-2xl bg-[#EFE6DC] border border-[#E5DAD0] max-w-3xl mx-auto text-center text-xs text-[#5C4B44] leading-relaxed mb-12 font-normal">
          <p>
            <strong className="text-[#241E1B] font-semibold">Aviso Clínico e Regulatório:</strong> As informações apresentadas nesta página têm caráter meramente informativo e educativo. A indicação precisa, o número de sessões, a resposta tecidual e os cuidados necessários variam de acordo com as particularidades biológicas de cada paciente, devendo ser estipulados estritamente após avaliação presencial.
          </p>
        </div>

        {/* 14. CTA Final Contextual Específico */}
        <div className="bg-[#EFE6DC] text-[#241E1B] border border-[#E5DAD0] rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-5">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block">
            Próximo Passo
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold">
            Deseja saber mais sobre <em className="italic text-[#44342E]">{treatment.name}</em>?
          </h2>
          <p className="text-sm sm:text-base text-[#5C4B44] font-normal max-w-xl mx-auto leading-relaxed">
            Nossa equipe está disponível no WhatsApp para tirar suas dúvidas e orientar sobre como funciona a avaliação na Clínica Nidô.
          </p>
          <div className="pt-2">
            <button
              onClick={handleWhatsAppFooter}
              className="inline-flex items-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider px-8 py-4 rounded-full transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <span>Quero saber mais sobre {treatment.name}</span>
            </button>
          </div>
        </div>
      </div>
      <ImageModal isOpen={modalImageIndex !== null} onClose={() => setModalImageIndex(null)} images={activeModalImages} currentIndex={modalImageIndex || 0} onNavigate={setModalImageIndex} />
    </div>
  );
};
