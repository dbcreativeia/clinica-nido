import { Treatment } from '../types';

export const TREATMENTS: Treatment[] = [
  // --- PRIORITÁRIOS / NOVOS TRATAMENTOS ---
  {
    id: 'endoslim',
    slug: 'endoslim',
    name: 'Endoslim',
    subtitle: 'Remodelação corporal e retração tecidual avançada',
    category: 'corporais',
    categoryLabel: 'Corporal Avançado',
    isPriority: true,
    isNew: true,
    summary: 'Técnica autoral da Dra. Brenda utilizando fibra óptica e laser de diodo para tratar gordura localizada, flacidez e promover retração tecidual.',
    heroImage: '/02-endoslim-abdomen-1-sessao-30-dias.webp',
    whatIs: 'O Endoslim é uma técnica autoral desenvolvida pela Dra. Brenda Niyama que utiliza fibra óptica de calibre micrométrico associada a laser de diodo para atuar diretamente no plano subdérmico. O procedimento promove emulsificação seletiva do tecido adiposo e aquecimento controlado das fibras colágenas, estimulando intensa retração tecidual (skin tightening).',
    forWhom: [
      'Pessoas com gordura localizada resistente a dietas e exercícios físicos',
      'Casos de flacidez corporal leve a moderada com desejo de retração cutânea',
      'Pacientes que buscam redefinição do contorno corporal sem cortes cirúrgicos extensos',
      'Indivíduos que desejam melhora da firmeza e da qualidade global da pele',
      'Regiões como abdômen, flancos, papada/pescoço, braços, costas e glúteos'
    ],
    benefits: [
      'Redução pontual e remodeladora da gordura localizada',
      'Retração e aumento da firmeza da pele por estímulo térmico',
      'Intenso estímulo progressivo à neocolagênese (produção de novo colágeno)',
      'Redefinição expressiva do contorno corporal',
      'Procedimento minimamente invasivo realizado em consultório',
      'Resultados graduais, harmoniosos e com aspecto natural'
    ],
    howItWorks: 'O procedimento é realizado em ambiente de consultório estruturado com anestesia local tumescente, garantindo conforto ao paciente. Uma cânula delicada contendo uma fibra óptica estéril é introduzida sob a pele na camada de gordura. A energia do laser é liberada com precisão micrométrica, aquecendo os septos fibrosos e estimulando a retração cutânea enquanto liquefaz células adiposas selecionadas.',
    treatedAreas: ['Abdômen superior e inferior', 'Flancos e cintura', 'Papada e contorno mandibular', 'Região subglútea (bananinha)', 'Braços e face interna de coxas'],
    recoveryAndCare: 'Por ser um procedimento minimamente invasivo, a recuperação costuma ser favorável. Recomenda-se o uso de cinta compressiva modeladora conforme orientação da profissional, repouso relativo inicial e sessões de drenagem linfática para otimizar a retração e o escoamento de edemas. A recuperação varia de acordo com a resposta individual de cada organismo.',
    relatedTechnology: 'Laser de Diodo Subdérmico com Fibra Óptica',
    relatedProfessional: 'Dra. Brenda Niyama (CRBM 35047)',
    keywords: ['endoslim', 'endolaser', 'endolift', 'lipo sem cortes', 'retração de pele', 'gordura na papada', 'gordura na barriga', 'gordura localizada', 'flacidez', 'diode laser', 'gordura localizada'],
    hasResults: true,
    editorialNote: 'A indicação e a resposta ao procedimento dependem de criteriosa avaliação individual pela profissional responsável.',
    faqs: [
      {
        question: 'O Endoslim substitui uma cirurgia plástica como lipoaspiração convencional?',
        answer: 'Não. O Endoslim é indicado para depósitos pontuais de gordura e flacidez leve a moderada, com foco em retração da pele e contorno. Casos com excesso severo de pele ou grandes volumes de gordura podem necessitar de indicação cirúrgica tradicional, definida após avaliação.'
      },
      {
        question: 'É necessária internação hospitalar?',
        answer: 'Não. O procedimento é minimamente invasivo e realizado inteiramente em consultório médico-clínico sob anestesia local, permitindo retorno para casa logo após o término.'
      },
      {
        question: 'Em quanto tempo os resultados começam a ser percebidos?',
        answer: 'A redução de volume já começa a ser notada nas primeiras semanas à medida que o edema diminui. A retração da pele e a produção de novo colágeno são progressivas, alcançando maturação entre 60 e 90 dias após a sessão.'
      }
    ]
  },
  {
    id: 'bio-regeneracao-celular',
    slug: 'bio-regeneracao-celular',
    name: 'Bio Regeneração Celular',
    subtitle: 'Protocolo avançado de Medicina Regenerativa com Exossomos, Peptídeos e PDRN',
    category: 'regenerativos',
    categoryLabel: 'Medicina Regenerativa',
    isPriority: true,
    isNew: true,
    summary: 'Hub de tecnologias biológicas inteligentes que restauram o ambiente celular cutâneo, estimulando síntese de colágeno, luminosidade e firmeza.',
    heroImage: 'https://lh3.googleusercontent.com/d/1EPQYZh2_XoMw04f9_JK2wIBUP20AatKF',
    images: [
      'https://lh3.googleusercontent.com/d/1EPQYZh2_XoMw04f9_JK2wIBUP20AatKF'
    ],
    whatIs: 'A Bio Regeneração Celular na Nidô combina as três mais modernas frentes da biotecnologia estética: Exossomos (nanovesículas de comunicação intercelular), Peptídeos Bioativos (sinalizadores de síntese) e PDRN (polidesoxirribonucleotídeo derivado de DNA biológico purificado). Juntos, esses ativos reorganizam o microambiente tecidual da derme.',
    forWhom: [
      'Pele desvitalizada, desidratada ou com afinamento dérmico',
      'Pessoas que buscam prevenção e desaceleração do envelhecimento biológico',
      'Recuperação intensiva após procedimentos ablativos ou laser',
      'Queda capilar e miniaturização dos fios (protocolo capilar regenerativo)',
      'Pacientes que buscam regeneração profunda sem volume artificial'
    ],
    benefits: [
      'Regeneração celular profunda e bioestimulação tecidual',
      'Aumento da síntese de colágeno tipo I e elastina',
      'Restauração do viço, textura refinada e luminosidade saudável',
      'Aceleração significativa da cicatrização e barreira cutânea',
      'Ação anti-inflamatória e protetora contra o estresse oxidativo'
    ],
    howItWorks: 'Após higienização e preparo da pele, os bioativos estéreis selecionados (Exossomos, Peptídeos ou PDRN) são entregues nas camadas adequadas por meio de tecnologias de microinfusão, drug delivery assistido por laser (como Lavieen) ou aplicação intradérmica delicada, respeitando a indicação clínica.',
    treatedAreas: ['Face completa', 'Pescoço e colo', 'Dorso das mãos', 'Couro cabeludo'],
    recoveryAndCare: 'Recuperação rápida. Pode ocorrer leve rubor nas primeiras horas. Evitar exposição solar direta e utilizar protetor solar de amplo espectro recomendado.',
    relatedTechnology: 'Laser Lavieen e Microinfusão de Medicamentos',
    relatedProfessional: 'Corpo Clínico Integrado Nidô',
    keywords: ['exossomos', 'pdrn', 'peptideos', 'medicina regenerativa', 'sculptra', 'radiesse', 'salmão', 'colágeno', 'drug delivery'],
    faqs: [
      {
        question: 'O que são Exossomos?',
        answer: 'Exossomos são minúsculas vesículas produzidas por células-tronco que contêm fatores de crescimento, peptídeos e proteínas sinalizadoras. Na estética, agem diretamente reprogramando células envelhecidas para um comportamento mais jovem e reparador.'
      },
      {
        question: 'O que é PDRN?',
        answer: 'PDRN é uma molécula de alta biocompatibilidade com o organismo humano que atua como bloco construtor celular, ativando receptores de adenosina que estimulam a regeneração celular e o fluxo microcirculatório.'
      },
      {
        question: 'O procedimento causa inchaço ou altera os traços do meu rosto?',
        answer: 'Não. Os bio-regeneradores não são preenchedores de volume, portanto não alteram o formato nem o contorno do rosto; apenas revitalizam a densidade e o frescor da pele.'
      }
    ]
  },
  {
    id: 'profhilo',
    slug: 'profhilo',
    name: 'Profhilo®',
    subtitle: 'Bioestimulação e hidratação profunda da pele',
    category: 'regenerativos',
    categoryLabel: 'Injetável Biorremodelador',
    isPriority: true,
    isNew: true,
    summary: 'Tratamento injetável à base de ácido hialurônico ultrapuro, desenvolvido para melhorar a qualidade da pele através de bioestimulação multinível.',
    heroImage: 'https://lh3.googleusercontent.com/d/1qYWMR_QvI-fbpzjEKzcKbZkOxI6kYkt0',
    images: [
      'https://lh3.googleusercontent.com/d/1qYWMR_QvI-fbpzjEKzcKbZkOxI6kYkt0'
    ],
    whatIs: 'O Profhilo® é uma inovação mundial em biorremodelação tecidual com uma das maiores concentrações de ácido hialurônico puro do mercado, formulado sem agentes químicos reticulantes (BDDE-free). Ele não atua como preenchedor estático, mas sim como um bioestimulador biológico que se difunde homogeneamente por toda a extensão da pele.',
    forWhom: [
      'Pessoas com flacidez e perda de turgor na pele da face, pescoço ou colo',
      'Pele desidratada, opaca e com linhas finas do tipo crepom',
      'Pacientes que buscam rejuvenescimento com naturalidade absoluta sem ganho de volume'
    ],
    benefits: [
      'Estimulação de 4 tipos diferentes de colágeno e elastina',
      'Hidratação profunda e duradoura da matriz extracelular',
      'Melhora visível da firmeza, elasticidade e luminosidade',
      'Poucos pontos estratégicos de aplicação (pontos BAP)',
      'Sem efeito de preenchimento ou descaracterização fisionômica'
    ],
    howItWorks: 'Realizado através de 5 pontos bioestéticos específicos em cada hemiface (Bio Aesthetic Points - BAP), minimizando desconfortos. O produto se difunde suavemente por toda a área tratada nos dias seguintes.',
    treatedAreas: ['Face completa', 'Pescoço', 'Colo', 'Mãos'],
    recoveryAndCare: 'Retorno imediato às atividades. Pequenas pápulas no local da injeção somem naturalmente em até 24 a 48 horas.',
    relatedProfessional: 'Dra. Brenda Niyama e Dra. Lorena Ciriaco',
    keywords: ['profhilo', 'profilo', 'bioremodelador', 'skinbooster', 'skin booster', 'hidratação profunda', 'ácido hialurônico puro', 'pontos bap', 'bioestimulador', 'sculptra', 'radiesse', 'colageno'],
    faqs: [
      {
        question: 'Profhilo® é a mesma coisa que preenchimento facial?',
        answer: 'Não. O preenchimento tradicional utiliza ácido hialurônico reticulado para dar volume ou projetar áreas (como mandíbula ou maçãs do rosto). O Profhilo® não confere volume: ele se espalha hidratando e bioestimulando a derme de forma fluida e homogênea.'
      },
      {
        question: 'Qual a diferença entre o Profhilo® e bioestimuladores como Sculptra® ou Radiesse®?',
        answer: 'O Profhilo® atua como biorremodelador celular fluido com foco em hidratação multinível e regeneração da matriz extracelular da derme. Já bioestimuladores particulados como Sculptra® (ácido poli-L-láctico) e Radiesse® (hidroxiapatita de cálcio) focam no estímulo fibroblástico para sustentação e espessamento dérmico. Ambos podem atuar de forma complementar na mesma pessoa em planos de tratamento personalizados.'
      },
      {
        question: 'Quantas sessões são recomendadas?',
        answer: 'O protocolo padrão geralmente consiste em 2 sessões com intervalo de 30 dias entre elas, com manutenções semestrais ou anuais a critério da avaliação.'
      }
    ]
  },
  {
    id: 'extracao-regeneradora-peptideos',
    slug: 'extracao-regeneradora-peptideos',
    name: 'Extração Regeneradora Facial com Peptídeos',
    subtitle: 'Limpeza profunda com regeneração e revitalização da pele',
    category: 'faciais',
    categoryLabel: 'Cuidado Facial',
    isPriority: true,
    isNew: true,
    summary: 'Combina limpeza de pele completa e meticulosa com aplicação de peptídeos bioativos para desobstrução, hidratação e reparação da barreira cutânea.',
    heroImage: 'https://lh3.googleusercontent.com/d/1CuyqREMFpclJoIrSnB0wg40CVGKOXo3b',
    images: ['https://lh3.googleusercontent.com/d/1CuyqREMFpclJoIrSnB0wg40CVGKOXo3b'],
    whatIs: 'Um protocolo exclusivo que eleva a clássica limpeza de pele a um patamar clínico e regenerativo. Após a extração minuciosa de comedões e impurezas sob emoliência suave, a pele recebe peptídeos biomiméticos que aceleram a reparação cutânea, acalmam irritações e restauram o microbioma da barreira.',
    forWhom: [
      'Pele com comedões (cravos), poros dilatados e excesso de oleosidade',
      'Pele asfixiada, opaca ou agredida por poluição e estresse urbano',
      'Preparo essencial antes de procedimentos injetáveis, laser ou peelings',
      'Pessoas com pele sensível que buscam uma limpeza sem traumas intensos'
    ],
    benefits: [
      'Desobstrução profunda e purificação de impurezas e células mortas',
      'Ação regeneradora imediata promovida por peptídeos bioativos',
      'Restauração do filme hidrolipídico e fortalecimento da barreira',
      'Acalmamento eficaz de vermelhidões pós-extração',
      'Pele com viço limpo, sedosa e visivelmente revitalizada'
    ],
    howItWorks: 'Higienização inicial com tensoativos suaves, esfoliação enzimática, emoliência morna, extração por sucção e manual delicada, alta frequência antisséptica, aplicação da máscara regeneradora de peptídeos e finalização com sérum antioxidante e fotoproteção.',
    treatedAreas: ['Face', 'Pescoço', 'Costas (se indicado)'],
    recoveryAndCare: 'Praticamente sem tempo de inatividade. Recomenda-se não utilizar ácidos ou maquiagens pesadas nas primeiras 24 horas.',
    faqs: [
      {
        question: 'A pele fica muito marcada ou vermelha após a sessão?',
        answer: 'Como o protocolo associa peptídeos cicatrizantes e máscaras calmantes, a vermelhidão pós-extração é significativamente minimizada em comparação com limpezas convencionais.'
      }
    ]
  },
  {
    id: 'peeling-dermeskin-melasma',
    slug: 'peeling-dermeskin-melasma',
    name: 'Tratamento para Melasma com Peeling Dermeskin',
    subtitle: 'Renovação da pele com foco no controle do melasma',
    category: 'faciais',
    categoryLabel: 'Clareamento & Pigmentação',
    isPriority: true,
    isNew: true,
    summary: 'Protocolo de renovação cutânea controlada desenvolvido para clareamento progressivo do melasma, uniformização do tom e respeito à integridade da barreira.',
    heroImage: 'https://lh3.googleusercontent.com/d/1YITAXlDD7RF3xqu_tZjzMJsbHa-GBU_2',
    images: ['https://lh3.googleusercontent.com/d/1YITAXlDD7RF3xqu_tZjzMJsbHa-GBU_2'],
    whatIs: 'O Peeling Dermeskin para Melasma é um protocolo químico magistral que combina despigmentantes de última geração (como ácido tranexâmico, ácido kójico e resorcinol estabilizado) para inibir a tirosinase e reduzir a transferência de melanossomos sem gerar calor excessivo que possa causar efeito rebote.',
    forWhom: [
      'Pessoas com melasma dérmico, epidérmico ou misto',
      'Hiperpigmentação pós-inflamatória decorrente de acne ou traumas',
      'Manchas solares (lentigos solares) e irregularidades de tonalidade',
      'Pele opaca com textura áspera e falta de viço'
    ],
    benefits: [
      'Clareamento gradual e seguro de manchas escuras',
      'Uniformização do tom e luminosidade refinada',
      'Renovação do estrato córneo sem agressão térmica descontrolada',
      'Controle da vascularização inflamatória associada ao melasma',
      'Plano acompanhado de home care individualizado'
    ],
    howItWorks: 'Realizado em etapas de aplicação tópica controlada em consultório, seguido pela prescrição de protocolo de manutenção domiciliar essencial para consolidar o clareamento e impedir o rebote.',
    treatedAreas: ['Face (bochechas, testa, buço)', 'Colo'],
    recoveryAndCare: 'Ocorre uma descamação fina e controlada entre o 2º e o 5º dia. O uso rigoroso de protetor solar com cor (filtro físico) a cada 3 horas é indispensável.',
    editorialNote: 'Nota clínica: O melasma é uma condição crônica recidivante influenciada por fatores hormonais, genéticos e radiação solar. Seu controle exige acompanhamento contínuo e fotoproteção diária.',
    faqs: [
      {
        question: 'O melasma tem cura definitiva?',
        answer: 'O melasma é uma alteração crônica da pigmentação, portanto não possui "cura definitiva", mas sim excelente controle e clareamento quando tratado de forma multidisciplinar com protocolos adequados e fotoproteção contínua.'
      },
      {
        question: 'Pode ser feito no verão?',
        answer: 'Sim, desde que com fórmulas adequadas para o período e com comprometimento irrestrito do paciente com a proteção solar.'
      }
    ]
  },

  // --- TRATAMENTOS COMPLETOS REVISADOS ---
  {
    id: 'hipro-facial-corporal',
    slug: 'hipro-facial-corporal',
    name: 'Lifting Não Cirúrgico HIPRO',
    subtitle: 'Ultrassom microfocado avançado para firmeza e neocolagênese',
    category: 'faciais',
    categoryLabel: 'Tecnologia Microfocada',
    summary: 'Tecnologia de ultrassom microfocado de disparo circular contínuo que atinge o SMAS para promover lifting tecidual sem cirurgia e com máximo conforto.',
    heroImage: 'https://lh3.googleusercontent.com/d/1ca9tRl1zagmU8cg1ncvXzAto0N6oBlLg',
    images: [
      'https://lh3.googleusercontent.com/d/1ca9tRl1zagmU8cg1ncvXzAto0N6oBlLg',
      'https://lh3.googleusercontent.com/d/1onznv0AkvKgVZkEUL7Xs_Yh3WEysv-Q-'
    ],
    whatIs: 'O HIPRO atua por ondas ultrassônicas microfocadas que criam microzonas de coagulação térmica profunda desde a derme até a fáscia muscular (SMAS). Isso desencadeia retração imediata e síntese de novo colágeno nos meses subsequentes.',
    forWhom: ['Flacidez de pálpebras e sobrancelhas', 'Papada e perda de contorno mandibular', 'Flacidez no pescoço e colo'],
    benefits: ['Lifting não invasivo', 'Sem cortes ou tempo de recuperação', 'Aplicação dinâmica mais confortável', 'Estímulo de colágeno por até 6 meses'],
    howItWorks: 'A ponteira desliza sobre a pele com gel condutor, emitindo energia térmica precisa nas profundidades calibradas.',
    treatedAreas: ['Face completa', 'Submento (papada)', 'Pescoço', 'Colo'],
    relatedTechnology: 'HIPRO Ultrassom Focado',
    keywords: ['ultraformer', 'ultraformer 3', 'ultraformer iii', 'ultraformer mpt', 'ultrassom microfocado', 'hipro', 'lifting sem cortes', 'bochecha', 'papada', 'flacidez'],
    faqs: [
      {
        question: 'Dói fazer o HIPRO?',
        answer: 'A tecnologia do HIPRO utiliza emissão contínua em movimento linear, tornando o procedimento muito mais tolerável e confortável do que ultrassons tradicionais de disparos estáticos.'
      }
    ]
  },
  {
    id: 'harmonizacao-facial',
    slug: 'harmonizacao-facial',
    name: 'Harmonização Facial Personalizada',
    subtitle: 'Equilíbrio, sustentação tecidual e valorização dos seus traços únicos',
    category: 'faciais',
    categoryLabel: 'Harmonização',
    summary: 'Plano integrado com ácido hialurônico e bioestimuladores de colágeno consagrados (como Sculptra® e Radiesse®) para sustentação, firmeza e valorização elegante dos seus traços únicos.',
    heroImage: 'https://lh3.googleusercontent.com/d/1tCcoQRbFzWkH-R0zrK-um778_ZjZMXBu',
    images: [
      'https://lh3.googleusercontent.com/d/1tCcoQRbFzWkH-R0zrK-um778_ZjZMXBu',
      'https://lh3.googleusercontent.com/d/1tbzu-GeRrIKaEULjpaLAyWrnaNMEC4ju',
      'https://lh3.googleusercontent.com/d/1DBzTAgRsS7I1oGhrPa_1eL9FaE1FFVhv',
      'https://lh3.googleusercontent.com/d/1MSIrNRFx0UjyMdYvONIsBsQFdG4Q3K6_',
      'https://lh3.googleusercontent.com/d/1Z6w7D0kU4KULwhh509pwedMjCw8TXmkK',
      'https://lh3.googleusercontent.com/d/1_iQ6s6yipVABPYpcpHfkEvtCCJChN_G4',
      'https://lh3.googleusercontent.com/d/1oYScJxw50fbZsdydWz3yT-Uqbo0Pojy5',
      'https://lh3.googleusercontent.com/d/1sp_pGiIeDLPVrRYgofvLhws2piX_FZSz'
    ],
    whatIs: 'A harmonização na Nidô não segue padrões pré-moldados da internet. É um estudo fisionômico individual que associa o ácido hialurônico para volumização e contorno, e bioestimuladores de colágeno de alta performance — como Sculptra® (ácido poli-L-láctico) e Radiesse® (hidroxiapatita de cálcio) — para promover sustentação estrutural dos tecidos, neocolagênese profunda e efeito lifting duradouro, restaurando proporções com naturalidade absoluta.',
    forWhom: ['Assimetrias faciais e perda de contorno', 'Flacidez cutânea com necessidade de ancoragem tecidual', 'Mento retraído ou lábios com perda de contorno e hidratação', 'Pessoas que buscam rejuvenescimento e refinamento estético consciente'],
    benefits: ['Proporções equilibradas e preservação da fisionomia', 'Bioestímulo avançado de colágeno com Sculptra® e Radiesse® para firmeza tecidual', 'Realce refinado dos pontos de luz e contorno do rosto', 'Prevenção de quedas teciduais com sustentação estrutural'],
    howItWorks: 'Mapeamento fisionômico detalhado seguido de aplicação milimétrica de ácido hialurônico estéril e/ou bioestimuladores de colágeno nas camadas corretas (supraperiosteal ou subdérmica), respeitando a anatomia vascular e a harmonia de cada rosto.',
    treatedAreas: ['Têmporas e Terço Médio (malar e zigomático)', 'Contorno mandibular e Ângulo da mandíbula', 'Mento (queixo)', 'Lábios e região perioral', 'Bioestímulo global de face'],
    keywords: ['preenchimento', 'preenchimento labial', 'labios', 'labio', 'acido hialuronico', 'hialuronico', 'juvederm', 'restylane', 'rennova', 'voluma', 'olheiras', 'mandibula', 'queixo', 'bigode chines', 'codigo de barras', 'sculptra', 'radiesse', 'bioestimulador', 'bioestimuladores', 'colageno', 'hidroxiapatita de calcio', 'acido poli-l-lactico', 'md codes'],
    faqs: [
      {
        question: 'Qual a diferença entre ácido hialurônico e bioestimuladores como Sculptra® ou Radiesse® na harmonização?',
        answer: 'O ácido hialurônico confere suporte, refinamento de contorno imediato e preenchimento volumétrico suave. Já os bioestimuladores (Sculptra® e Radiesse®) agem estimulando os fibroblastos a produzirem seu próprio colágeno ao longo dos meses, gerando firmeza, espessamento da pele e efeito lifting sem inflar o rosto. Na harmonização personalizada, combinamos ambos de forma estratégica.'
      },
      {
        question: 'Quanto tempo dura o preenchimento com ácido hialurônico e os bioestimuladores?',
        answer: 'A durabilidade do ácido hialurônico varia entre 12 e 18 meses. O colágeno estimulado por Sculptra® e Radiesse® tem durabilidade de até 24 meses, promovendo um resultado gradual e duradouro.'
      }
    ]
  },
  {
    id: 'linhas-de-expressao-toxina',
    slug: 'linhas-de-expressao-toxina',
    name: 'Toxina Botulínica Preventiva e Reparadora',
    subtitle: 'Suavização natural de rugas dinâmicas mantendo sua expressividade',
    category: 'faciais',
    categoryLabel: 'Injetáveis',
    summary: 'Aplicação personalizada de toxina botulínica para atenuar linhas de expressão na testa, glabela e pés de galinha com movimentação natural.',
    heroImage: 'https://lh3.googleusercontent.com/d/19K5b-1N2tof4fsbZHWzq8f5j0FoZ70R6',
    images: [
      'https://lh3.googleusercontent.com/d/19K5b-1N2tof4fsbZHWzq8f5j0FoZ70R6',
      'https://lh3.googleusercontent.com/d/1O_ExpHoPp9wTwEAC1oVESrB0rA2Eutu3',
      'https://lh3.googleusercontent.com/d/1bp7-I5xbX9qriCdfov_Z_1bhon1QjREt',
      'https://lh3.googleusercontent.com/d/1fuPTFYIR7obH2b6NXgi39PpFLL61m-Ng'
    ],
    whatIs: 'A toxina botulínica age relaxando temporariamente a musculatura hipercinética responsável pela formação de vincos e rugas dinâmicas na pele.',
    forWhom: ['Linhas na testa e entre as sobrancelhas ("ar de bravo")', 'Pés de galinha ao redor dos olhos', 'Prevenção de rugas estáticas profundas'],
    benefits: ['Aparência mais descansada e jovial', 'Preservação da mímica facial natural', 'Prevenção de marcas permanentes'],
    howItWorks: 'Microinjeções precisas em pontos musculares mapeados previamente.',
    treatedAreas: ['Glabela', 'Frontal (testa)', 'Periocular (pés de galinha)', 'Bunnylines (nariz)'],
    keywords: ['botox', 'botox®', 'dysport', 'xeomin', 'botulift', 'toxina botulinica', 'rugas', 'testa', 'pes de galinha', 'glabela', 'vincos', 'marcas de expressao'],
    faqs: [
      {
        question: 'Ficarei sem expressão no rosto?',
        answer: 'Não. Na Nidô utilizamos a técnica de microdosagem modulada, que suaviza as rugas preservando seu sorriso e seus movimentos autênticos.'
      }
    ]
  },
  {
    id: 'terapias-capilares-regenerativas',
    slug: 'terapias-capilares-regenerativas',
    name: 'Terapia Capilar & Tricologia Avançada',
    subtitle: 'Tratamento clínico integrado para queda de cabelo e fortalecimento dos fios',
    category: 'capilares',
    categoryLabel: 'Tricologia & Capilar',
    summary: 'Protocolo para controle de alopecias, eflúvio telógeno e miniaturização folicular com bioestimulação, laser e ativos regenerativos.',
    heroImage: 'https://lh3.googleusercontent.com/d/14b6fevARNYDGgFPkpY-YilUmlgJhjWCz',
    images: [
      'https://lh3.googleusercontent.com/d/14b6fevARNYDGgFPkpY-YilUmlgJhjWCz',
      'https://lh3.googleusercontent.com/d/1BXJteBEHetf7KiRIU2-LYgE254w0vqav',
      'https://lh3.googleusercontent.com/d/1GBjWt5rZBzS_ioAVMLJM_NqzMWWtXdG2',
      'https://lh3.googleusercontent.com/d/1iBoiwZ7LVYPbb75zuqIf700DeW6Vord_'
    ],
    whatIs: 'Uma abordagem médica e biomédica integrativa para diagnosticar e tratar as causas da perda capilar, combinando microinfusão de medicamentos (MMP), laser de baixa potência e fatores de crescimento.',
    forWhom: ['Homens e mulheres com afinamento capilar ou rarefação', 'Queda acentuada pós-estresse ou pós-parto', 'Alopecia androgenética inicial ou moderada'],
    benefits: ['Estímulo à circulação do couro cabeludo', 'Fortalecimento e aumento do diâmetro da haste', 'Desaceleração da queda capilar'],
    howItWorks: 'Tricoscopia digital para análise do couro cabeludo, seguida de aplicação de fatores bioestimulantes e fotobiomodulação.',
    treatedAreas: ['Couro cabeludo'],
    faqs: [
      {
        question: 'Quantas sessões de terapia capilar são necessárias?',
        answer: 'Os ciclos de tratamento capilar costumam variar entre 4 e 10 sessões quinzenais, seguidas por acompanhamento e manutenção individualizada.'
      }
    ]
  },
  {
    id: 'gordura-localizada-contorno',
    slug: 'gordura-localizada-contorno',
    name: 'Protocolo Redutor de Gordura Localizada',
    subtitle: 'Tecnologia sinérgica e intradermoterapia para áreas resistentes',
    category: 'corporais',
    categoryLabel: 'Corporal Avançado',
    summary: 'Associação de ativos lipolíticos de alta pureza e tecnologias para redução pontual de medidas em abdômen, flancos e culotes.',
    heroImage: 'https://lh3.googleusercontent.com/d/1j-HyD2ndFkToBINBPE2uWs00_tkYJsJY',
    images: [
      'https://lh3.googleusercontent.com/d/1j-HyD2ndFkToBINBPE2uWs00_tkYJsJY',
      'https://lh3.googleusercontent.com/d/16R8VbjB43YG6isoDWRG-4bSGe_pJFUMh',
      'https://lh3.googleusercontent.com/d/1TYqxlP75iRwoSjMgjDdgfc_D_RZnzoem',
      'https://lh3.googleusercontent.com/d/1857kz6-nhYH4H93AgFcIb0xoh4f_uXmm'
    ],
    whatIs: 'Protocolo multifatorial que alia mesoterapia com substâncias lipolíticas farmacêuticas e tecnologias de drenagem e quebra de adipócitos para acelerar a queima local de gordura.',
    forWhom: ['Gordura no abdômen inferior', 'Flancos e gordura do sutiã', 'Culotes e dobra do glúteo'],
    benefits: ['Redução de medidas corporais', 'Melhora da firmeza e textura da derme', 'Tratamento focado sem necessidade de cirurgia'],
    howItWorks: 'Microaplicações estéreis de enzimas combinadas a tecnologias complementares indicadas na avaliação.',
    treatedAreas: ['Abdômen', 'Flancos', 'Braços', 'Costas'],
    faqs: [
      {
        question: 'Preciso fazer dieta durante o tratamento?',
        answer: 'Uma alimentação balanceada e hidratação adequada são essenciais para potencializar a drenagem e a eliminação dos subprodutos lipídicos mobilizados.'
      }
    ]
  },
  {
    id: 'celulite-flacidez-corporal',
    slug: 'celulite-flacidez-corporal',
    name: 'Tratamento de Celulite e Flacidez Corporal',
    subtitle: 'Reestruturação dos septos fibrosos e bioestímulo de colágeno',
    category: 'corporais',
    categoryLabel: 'Corporal Avançado',
    summary: 'Combinação de bioestimuladores corporais, radiofrequência Endymed e drenagem para devolver firmeza aos glúteos e pernas.',
    heroImage: 'https://lh3.googleusercontent.com/d/18ZTR7u99NG8v7XgunDbeJAPqvgalcD-Z',
    images: [
      'https://lh3.googleusercontent.com/d/18ZTR7u99NG8v7XgunDbeJAPqvgalcD-Z',
      'https://lh3.googleusercontent.com/d/1KzPwaaqMA5uynw6eprSj_xFyggSNRtDT',
      'https://lh3.googleusercontent.com/d/1Vi7T5tgMwnDimf8L7NyMfdDvyZ-inad6',
      'https://lh3.googleusercontent.com/d/1lyaGpWH-ve-Q_zTTKOIqo3TbMjGDiQ6G'
    ],
    whatIs: 'Aborda os múltiplos fatores da celulite (lipodistrofia ginoide): má circulação, fibrose dos septos e flacidez da pele que acentua os desníveis.',
    forWhom: ['Pele com aspecto "casca de laranja"', 'Frouxidão de pele nas coxas e glúteos', 'Ondulações pós-emagrecimento'],
    benefits: ['Alisamento da superfície cutânea', 'Aumento da sustentação e tônus tecidual', 'Estímulo duradouro de colágeno dérmico'],
    howItWorks: 'Descolamento suave de travas fibróticas associado à radiofrequência profunda 3DEEP para aquecimento tecidual seguro.',
    treatedAreas: ['Glúteos', 'Posterior de coxa', 'Culotes'],
    relatedTechnology: 'Radiofrequência Endymed 3DEEP',
    keywords: ['celulite', 'flacidez', 'estrias', 'drenagem linfatica', 'pos-cirurgico', 'fibrose', 'radiofrequencia', 'massagem', 'escalda pes', 'spa dos pes', 'hidromassagem', 'esfoliacao corporal', 'corporais'],
    faqs: [
      {
        question: 'O tratamento melhora celulites de graus avançados?',
        answer: 'Sim, a abordagem combinada visa melhorar a circulação e liberar as retrações fibrosas, proporcionando alívio visual importante mesmo em graus 3 e 4.'
      }
    ]
  },
  {
    id: 'nutrologia-longevidade-hipertrofia',
    slug: 'nutrologia-longevidade-hipertrofia',
    name: 'Nutrologia, Longevidade & Performance',
    subtitle: 'Acompanhamento médico para otimização metabólica e composição corporal',
    category: 'saude-e-bem-estar',
    categoryLabel: 'Saúde & Longevidade',
    summary: 'Avaliação clínica e laboratorial completa com Dr. Deangelo Lima para equilíbrio hormonal, ganho de massa magra e vitalidade.',
    heroImage: 'https://lh3.googleusercontent.com/d/16RQp6Nvx5CxXU-l8jl9NOqkJujyoiv9P',
    images: [
      'https://lh3.googleusercontent.com/d/16RQp6Nvx5CxXU-l8jl9NOqkJujyoiv9P',
      'https://lh3.googleusercontent.com/d/1DsXauJfl_h-1fxt2ye1QUHQOs60RdwTC',
      'https://lh3.googleusercontent.com/d/1IqYjIEQHQLDKdd5_e9rg7CWWNmtpM6K8',
      'https://lh3.googleusercontent.com/d/1U2BmTYSJCHPx59pvKhzPRsbyiKFF0sxh',
      'https://lh3.googleusercontent.com/d/1URocYuP9LoiqdtTmVUj2iIVZyoFL8kJM'
    ],
    whatIs: 'A Nutrologia Clínica na Nidô analisa o paciente em sua totalidade metabólica, hormonal e nutricional para prevenir doenças, otimizar a disposição e ajustar a taxa de gordura corporal.',
    forWhom: ['Pessoas com cansaço crônico e lentidão metabólica', 'Dificuldade para emagrecer ou ganhar massa magra', 'Prevenção de doenças e suporte à longevidade ativa'],
    benefits: ['Plano individualizado de suplementação e nutrição', 'Análise minuciosa de exames laboratoriais', 'Equilíbrio da saúde intestinal e metabólica'],
    howItWorks: 'Consulta médica completa, bioimpedância tetrapolar de alta precisão e plano terapêutico customizado.',
    treatedAreas: ['Corpo e metabolismo integral'],
    relatedProfessional: 'Dr. Deangelo Lima (CRM 171085)',
    faqs: [
      {
        question: 'É necessário levar exames anteriores na primeira consulta?',
        answer: 'Sim, qualquer exame de sangue ou imagem recente (realizado nos últimos 6 meses) auxilia bastante na construção do histórico médico.'
      }
    ]
  },
  {
    id: 'drenagem-pos-operatoria-e-linfatica',
    slug: 'drenagem-pos-operatoria-e-linfatica',
    name: 'Drenagem Linfática Especializada & Pós-Cirúrgico',
    subtitle: 'Cuidado manual suave para redução de edemas e prevenção de fibroses',
    category: 'corporais',
    categoryLabel: 'Bem-Estar & Recuperação',
    summary: 'Técnicas manuais delicadas executadas por fisioterapeutas para desobstrução linfática, alívio do inchaço e aceleração da recuperação.',
    heroImage: 'https://lh3.googleusercontent.com/d/1ELMN3geTYc9E1ENpcnbdU0MoXq4lfqLW',
    images: [
      'https://lh3.googleusercontent.com/d/1ELMN3geTYc9E1ENpcnbdU0MoXq4lfqLW',
      'https://lh3.googleusercontent.com/d/1VotgBD_jXlyWEWQp6TSoAPYHuy63AanR',
      'https://lh3.googleusercontent.com/d/1gFSM44nFOq2xLCoyhuGcyoURo2Meb_ni',
      'https://lh3.googleusercontent.com/d/1Wp3JoA-EaSIiUjqq9XQm6bTXFJRG0aCo'
    ],
    whatIs: 'A drenagem especializada da Nidô respeita o sentido fisiológico do sistema linfático para direcionar o líquido intersticial aos gânglios de drenagem, proporcionando alívio imediato e modelação sutil.',
    forWhom: ['Pacientes em recuperação de procedimentos cirúrgicos ou estéticos', 'Retenção de líquidos e sensação de pernas pesadas', 'Gestantes autorizadas pelo médico obstetra'],
    benefits: ['Eliminação de toxinas e redução de inchaços', 'Prevenção e tratamento precoce de fibroses teciduais', 'Sensação profunda de relaxamento e leveza'],
    howItWorks: 'Manobras lentas, rítmicas e indolores ao longo das vias linfáticas do corpo.',
    treatedAreas: ['Corpo completo', 'Pernas', 'Abdômen'],
    faqs: [
      {
        question: 'Drenagem linfática dói?',
        answer: 'Não. A drenagem verdadeira é muito suave e confortável. Manobras fortes podem romper microvasos linfáticos e são contraindicadas.'
      }
    ]
  }
];
