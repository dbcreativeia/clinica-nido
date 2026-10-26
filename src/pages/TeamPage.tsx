import React from 'react';
import { ShieldCheck, MessageCircle } from 'lucide-react';
import { PROFESSIONALS } from '../data/professionals';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { openWhatsApp, WhatsAppMessages } from '../utils/whatsapp';
import { SEOHead } from '../components/SEOHead';

export const TeamPage: React.FC = () => {
  const handleGeneralWhatsApp = () => {
    openWhatsApp(WhatsAppMessages.contact(), {
      service_name: 'Corpo Clínico',
      page_path: '/corpo-clinico',
      cta_location: 'Página Corpo Clínico'
    });
  };

  return (
    <div className="pt-28 pb-20 bg-[#F5EFE7] min-h-screen">
      <SEOHead
        title="Corpo Clínico da Clínica Nidô | Dra. Brenda Niyama e Especialistas SP"
        description="Profissionais de saúde graduados e habilitados: Dra. Brenda Niyama (Biomédica Esteta), Dr. Deangelo Lima (Nutrólogo) e equipe na Água Branca, São Paulo."
        canonicalPath="/corpo-clinico"
        image="/foto-clinica_1.webp"
        keywords={[
          'dra brenda niyama',
          'dr deangelo lima nutrologia',
          'corpo clínico clínica nidô',
          'biomédica esteta são paulo',
          'médico nutrólogo perdizes',
          'equipe clínica estética sp'
        ]}
        schemaJson={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'Corpo Clínico da Clínica Nidô',
          description: 'Equipe multidisciplinar de profissionais de saúde habilitados na Clínica Nidô.',
          url: 'https://www.nidoestetica.com.br/corpo-clinico',
          mainEntity: PROFESSIONALS.map(prof => ({
            '@type': 'Person',
            name: prof.name,
            jobTitle: prof.role,
            identifier: prof.registration,
            description: prof.shortBio || prof.fullBio,
            worksFor: {
              '@type': 'MedicalClinic',
              name: 'Clínica Nidô'
            }
          }))
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block mb-2">
            Equipe Multidisciplinar
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#241E1B] font-semibold">
            Corpo Clínico da <em className="italic text-[#44342E]">Nidô</em>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#5C4B44] font-normal leading-relaxed">
            Profissionais dedicados à estética avançada, medicina integrada e bem-estar, com registros oficiais e compromisso rigoroso com a naturalidade.
          </p>
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
          {PROFESSIONALS.map((prof) => (
            <ProfessionalCard key={prof.id} professional={prof} />
          ))}
        </div>

        {/* Technical Lead Highlight Banner - Alinhado à esquerda, menor e posicionado antes do agendamento */}
        <div className="bg-[#EFE6DC]/80 p-5 sm:p-6 rounded-3xl border border-[#E5DAD0]/80 max-w-3xl mx-auto mb-12">
          <div className="flex items-start gap-3.5 text-left">
            <ShieldCheck className="w-5 h-5 text-[#8C7359] shrink-0 mt-0.5" />
            <div className="space-y-1 text-left">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-[#8C7359] block">
                Diretriz de Segurança e Responsabilidade
              </span>
              <h2 className="font-serif text-sm sm:text-base font-semibold text-[#241E1B]">
                Responsabilidade Técnica: Dra. Brenda Niyama (CRBM 35047)
              </h2>
              <p className="text-xs text-[#5C4B44] font-normal leading-relaxed">
                Todos os protocolos clínicos, calibrações de equipamentos e insumos utilizados na clínica passam pela supervisão direta da nossa responsável técnica, assegurando conformidade com as normas sanitárias e éticas.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Scheduling Banner */}
        <div className="text-[#241E1B] pt-8 border-t border-[#E5DAD0]/80 text-center max-w-3xl mx-auto space-y-4">
          <h3 className="font-serif text-3xl font-semibold">
            Deseja agendar sua avaliação presencial?
          </h3>
          <p className="text-sm text-[#5C4B44] font-normal max-w-lg mx-auto">
            Nossa equipe de recepção auxilia você a escolher o profissional e o horário mais convenientes para sua rotina.
          </p>
          <div className="pt-2">
            <button
              onClick={handleGeneralWhatsApp}
              className="inline-flex items-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider px-8 py-4 rounded-full transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <span>Agendar Avaliação pelo WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
