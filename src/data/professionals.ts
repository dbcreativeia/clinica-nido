import { Professional } from '../types';

export const PROFESSIONALS: Professional[] = [
  {
    id: 'dra-brenda-niyama',
    name: 'Dra. Brenda Niyama',
    role: 'Biomédica Esteta • Responsável Técnica',
    registration: 'CRBM 35047',
    badge: 'Responsável Técnica & Fundadora',
    isTechnicalLead: true,
    shortBio: 'Fundadora da Clínica Nidô e do Instituto de Medicina Aya, criadora do Método Espelho de avaliação anatômica e pioneira no protocolo autoral Endoslim.',
    fullBio: 'Com trajetória dedicada à estética avançada e harmonização natural, a Dra. Brenda Niyama fundou a Clínica Nidô com o propósito de devolver a autoestima respeitando rigorosamente a fisionomia e a identidade de cada paciente. Desenvolveu o Método Espelho, uma metodologia que estuda a dinâmica facial e corporal de maneira global antes de qualquer intervenção, além de liderar a técnica Endoslim para retração tecidual subdérmica.',
    specialties: [
      'Harmonização Facial e Corporal Estruturada',
      'Endoslim (Procedimento Subdérmico Autoral)',
      'Medicina Regenerativa (Exossomos, Peptídeos e PDRN)',
      'Bioestimuladores de Colágeno e Biorremodeladores (Profhilo®)'
    ],
    image: '/drabrenda.webp',
    imagePosition: 'object-[center_15%]',
    validationNote: 'Mais de 5 mil atendimentos realizados.'
  },
  {
    id: 'dr-deangelo-lima',
    name: 'Dr. Deangelo Lima',
    role: 'Médico',
    registration: 'CRM 171085',
    badge: 'Corpo Clínico Médico',
    shortBio: 'Atuação médica integrada em Nutrologia Clínica, Otimização Metabólica, Longevidade Ativa e Hipertrofia.',
    fullBio: 'O Dr. Deangelo Lima integra o corpo clínico médico da Nidô proporcionando uma visão holística e baseada em evidências sobre o metabolismo, composição corporal e equilíbrio hormonal. Atua na investigação de deficiências nutricionais, fadiga crônica, emagrecimento saudável e suporte metabólico para hipertrofia e longevidade.',
    specialties: [
      'Nutrologia Clínica e Otimização Metabólica',
      'Composição Corporal e Ganho de Massa Magra',
      'Medicina Preventiva e Longevidade Ativa',
      'Suplementação Injetável e Reposição de Micronutrientes'
    ],
    image: '/drdeangelo.webp',
    imagePosition: 'object-[center_20%]',
    imageStyle: { transformOrigin: '55% 22%', transform: 'scale(1.7) translate(-8%, -12%)' }
  },
  {
    id: 'dra-lorena-ciriaco',
    name: 'Dra. Lorena Ciriaco',
    role: 'Médica',
    registration: 'CRM 274247',
    badge: 'Corpo Clínico Médico',
    shortBio: 'Atuação clínica médica com foco em Dermatologia Estética, cuidados com a barreira cutânea e protocolos avançados de rejuvenescimento.',
    fullBio: 'Dedicada ao diagnóstico minucioso das alterações cutâneas e ao tratamento de condições dermatológicas estéticas, a Dra. Lorena Ciriaco combina precisão técnica e sensibilidade no manejo de melasma, flacidez, cicatrizes e rejuvenescimento integrativo.',
    specialties: [
      'Dermatologia Estética Clínica',
      'Manejo Avançado de Melasma e Hipercromias',
      'Injetáveis e Bioestimulação Cutânea',
      'Tecnologias a Laser e Ultrassom Focado'
    ],
    image: '/dralorena.webp',
    imagePosition: 'object-[center_15%]'
  },
  {
    id: 'dra-nathalia-ramazzotti',
    name: 'Dra. Nathalia Ramazzotti',
    role: 'Biomédica Esteta',
    registration: 'CRBM 72632',
    badge: 'Corpo Clínico Biomédico',
    shortBio: 'Atuação em procedimentos estéticos injetáveis, rejuvenescimento facial, peelings químicos e terapias corporais.',
    fullBio: 'A Dra. Nathalia Ramazzotti alia conhecimento técnico detalhado em anatomia e fisiologia da pele para conduzir procedimentos estéticos com gentileza, precisão e foco no bem-estar e na segurança integral do paciente.',
    specialties: [
      'Biomedicina Estética Avançada',
      'Limpeza de Pele Regenerativa e Peelings',
      'Intradermoterapia Facial e Corporal',
      'Preenchimentos e Toxina Botulínica'
    ],
    image: '/dranathalia.webp',
    imagePosition: 'object-[center_15%]'
  }
];
