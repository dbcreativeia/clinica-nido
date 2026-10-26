import { Technology } from '../types';

export const TECHNOLOGIES: Technology[] = [
  {
    id: 'hipro',
    slug: 'hipro',
    name: 'HIPRO',
    category: 'Ultrassom Microfocado de Alta Precisão',
    tagline: 'Ultrassom microfocado contínuo para lifting sem cirurgia e máximo conforto',
    description: 'O HIPRO é uma plataforma médica de ponta em ultrassom microfocado que atua com precisão micrométrica nas camadas mais profundas da derme e no SMAS (Sistema Músculo-Aponeurótico Superficial). Através de pontos de coagulação térmica milimetricamente controlados, desencadeia uma cascata biológica de neocolagênese e retração muscular sem cortes, promovendo sustentação facial e corporal duradoura.',
    howItWorks: 'A tecnologia do HIPRO utiliza energia acústica convergente de alta frequência para atingir profundidades de 1.5mm a 4.5mm na face (e até 13mm no corpo), preservando a epiderme intacta. Ao aquecer os pontos focais a temperaturas entre 65°C e 70°C, desnatura as fibras de colágeno envelhecidas e estimula os fibroblastos a produzirem novo colágeno tipo I e III ao longo de meses.',
    mechanismHighlights: [
      'Disparo contínuo e uniforme com redução drástica da dor',
      'Atuação precisa no SMAS (a mesma camada tracionada em cirurgias plásticas)',
      'Sem downtime: retorno imediato à rotina após o procedimento',
      'Compatível com bioestimuladores injetáveis para ancoragem tecidual ampliada'
    ],
    keyBenefits: [
      'Estímulo profundo de neocolagênese e elastina',
      'Tecnologia de disparo contínuo com conforto térmico superior',
      'Sem cortes, cicatrizes ou tempo de afastamento',
      'Resultados progressivos que evoluem ao longo de até 180 dias'
    ],
    targetIndications: [
      'Flacidez facial e cervical (pescoço)',
      'Perda de contorno da linha mandibular e papada',
      'Queda de sobrancelhas e pálpebras pesadas',
      'Flacidez corporal de abdômen, braços e acima dos joelhos'
    ],
    sessionDuration: '40 a 75 minutos (conforme a área tratada)',
    recoveryAndComfort: 'Pode haver leve rubor passageiro e discreta sensibilidade muscular ao toque por alguns dias. Não há descamação nem necessidade de repouso.',
    relatedTreatments: [
      { name: 'Lifting Não Cirúrgico HIPRO', slug: 'hipro-facial-corporal' }
    ],
    faqs: [
      {
        question: 'O HIPRO dói muito durante a aplicação?',
        answer: 'Diferente dos equipamentos tradicionais de ultrassom focado que utilizam disparos pontuais abruptos, o HIPRO conta com tecnologia de emissão contínua em movimento, o que diminui sensivelmente o desconforto e torna a sessão muito mais tolerável e confortável.'
      },
      {
        question: 'Quantas sessões de HIPRO são necessárias?',
        answer: 'Na maioria dos casos, 1 sessão anual é recomendada para manutenção do lifting e do colágeno. Em casos com maior grau de flacidez, o profissional pode associar 2 sessões semestrais combinadas com bioestimuladores.'
      },
      {
        question: 'Quando os resultados do HIPRO começam a aparecer?',
        answer: 'Um efeito inicial de contração tecidual já é perceptível nos primeiros 15 dias, mas o pico de produção de novo colágeno e firmeza máxima acontece entre 60 e 180 dias após a aplicação.'
      }
    ],
    image: 'https://lh3.googleusercontent.com/d/1onznv0AkvKgVZkEUL7Xs_Yh3WEysv-Q-',
    images: [
      'https://lh3.googleusercontent.com/d/1onznv0AkvKgVZkEUL7Xs_Yh3WEysv-Q-',
      'https://lh3.googleusercontent.com/d/1ca9tRl1zagmU8cg1ncvXzAto0N6oBlLg'
    ],
    keywords: ['ultraformer', 'ultraformer 3', 'ultraformer iii', 'ultraformer mpt', 'ultrassom microfocado', 'hipro', 'lifting sem cortes', 'bochecha', 'papada'],
    clinicalNote: 'Nota clínica: A indicação precisa entre HIPRO e outras plataformas de ultrassom focado é estabelecida durante a consulta de avaliação individual com o profissional responsável.'
  },
  {
    id: 'ultraformer-iii',
    slug: 'ultraformer-iii',
    name: 'Ultraformer III',
    category: 'Ultrassom Macro & Microfocado',
    tagline: 'Ultrassom macro e microfocado para ancoragem muscular e afinamento de gordura',
    description: 'Plataforma consagrada mundialmente que combina transdutores microfocados para efeito lifting facial e transdutores macrofocados para redução de pequenas bolsas adiposas e flacidez corporal em regiões estratégicas.',
    howItWorks: 'O Ultraformer III emprega ultrassom microfocado para estimular colágeno na derme profunda e no SMAS, e ultrassom macrofocado para induzir apoptose (destruição controlada de células de gordura) em áreas como papada, flancos e abdômen.',
    mechanismHighlights: [
      'Dupla atuação: ancoragem muscular e afinamento de gordura localizada',
      'Ponteiras com profundidades de 1.5mm, 2.0mm, 3.0mm, 4.5mm, 6.0mm, 9.0mm e 13.0mm',
      'Tratamento customizado para face e corpo',
      'Excelente resposta para definição da linha da mandíbula e redução de papada'
    ],
    keyBenefits: [
      'Dupla atuação: ancoragem muscular (SMAS) e compactação tecidual',
      'Ponteiras versáteis para diferentes profundidades e queixas',
      'Excelente resposta para contorno facial e papada'
    ],
    targetIndications: [
      'Flacidez facial e corporal',
      'Gordura submentoniana (papada)',
      'Flacidez ao redor dos olhos e boca',
      'Remodelamento de pequenas áreas corporais'
    ],
    sessionDuration: '30 a 60 minutos',
    recoveryAndComfort: 'Pode ocorrer leve inchaço (edema) ou sensação de dor muscular leve nos primeiros 3 a 5 dias. O paciente pode retomar o trabalho imediatamente.',
    relatedTreatments: [
      { name: 'Harmonização Facial Personalizada', slug: 'harmonizacao-facial' },
      { name: 'Protocolo Redutor de Gordura Localizada', slug: 'gordura-localizada-contorno' }
    ],
    faqs: [
      {
        question: 'Qual a diferença entre a ponteira microfocada e a macrofocada?',
        answer: 'A ponteira microfocada (1.5mm a 4.5mm) concentra energia em pequenos pontos na pele e músculos para criar efeito tensor e firmeza. Já as ponteiras macrofocadas (6mm a 13mm) atingem a camada de gordura subcutânea, promovendo quebra e compactação dos adipócitos.'
      },
      {
        question: 'O procedimento afina muito o rosto?',
        answer: 'Não se for bem planejado. Na Nidô, mapeamos as zonas faciais para aplicar apenas os transdutores tensores nas áreas que não devem perder volume, preservando a harmonia e jovialidade da estrutura facial.'
      }
    ],
    image: 'https://lh3.googleusercontent.com/d/1rI6niIvQ_yMyn54HZCs8ERmN0nVZ52J_',
    images: [
      'https://lh3.googleusercontent.com/d/1rI6niIvQ_yMyn54HZCs8ERmN0nVZ52J_'
    ],
    keywords: ['ultraformer', 'ultraformer 3', 'ultraformer iii', 'ultraformer mpt', 'ultrassom microfocado', 'hipro', 'papada', 'gordura localizada'],
    clinicalNote: 'Aviso editorial: A diferenciação comparativa entre HIPRO e Ultraformer III é definida em consulta técnica com base na densidade de colágeno, espessura cutânea e tolerância do paciente.'
  },
  {
    id: 'lavieen',
    slug: 'lavieen',
    name: 'Lavieen (BB Laser)',
    category: 'Laser Thulium 1927nm Sub-ablativo',
    tagline: 'Renovação da textura, viço, poros e uniformização do tom da pele',
    description: 'O Lavieen é um laser de Thulium fracionado não ablativo/sub-ablativo com altíssima afinidade pela água do tecido. Conhecido mundialmente como "BB Laser", promove um refinamento expressivo dos poros dilatados, clareamento de manchas superficiais, homogeneização do tom e o desejado efeito "glow" saudável, além de criar microcanais que potencializam a absorção de ativos regeneradores (Exossomos, PDRN e Ácido Hialurônico).',
    howItWorks: 'O comprimento de onda de 1927nm gera microzonas térmicas na junção dermoepidérmica sem remover a camada protetora da epiderme. Isso estimula a renovação celular acelerada, a dispersão da melanina acumulada e a proliferação de fibras elásticas, preservando a barreira cutânea.',
    mechanismHighlights: [
      'Renovação uniforme da epiderme sem agressão excessiva',
      'Fechamento imediato de poros e redução da oleosidade excessiva',
      'Criação de microcanais perfeitos para Drug Delivery estéril',
      'Downtime curtíssimo (leve aspecto bronzeado por 2 a 3 dias)'
    ],
    keyBenefits: [
      'Efeito "BB Cream" natural com viço instantâneo e duradouro',
      'Fechamento de poros dilatados e melhora da textura áspera',
      'Potencialização do drug delivery de Exossomos e PDRN',
      'Recuperação rápida e discreta'
    ],
    targetIndications: [
      'Poros abertos e textura irregular',
      'Manchas superficiais, melasma brando e fotoenvelhecimento',
      'Pele opaca, áspera e desvitalizada',
      'Estímulo e drug delivery capilar'
    ],
    sessionDuration: '30 a 45 minutos',
    recoveryAndComfort: 'A pele apresenta vermelhidão moderada por 24 horas e adquire uma textura levemente arenosa ou bronzeada nos 3 dias seguintes, que se desprende naturalmente sem descamação em crostas grossas.',
    relatedTreatments: [
      { name: 'Bio Regeneração Celular', slug: 'bio-regeneracao-celular' },
      { name: 'Extração Regeneradora Facial com Peptídeos', slug: 'extracao-regeneradora-peptideos' }
    ],
    faqs: [
      {
        question: 'O Lavieen descama a pele igual a um peeling químico forte?',
        answer: 'Não. Como atua de forma sub-ablativa fracionada, o Lavieen não provoca feridas abertas nem descamação agressiva. A pele ganha um tom sutilmente bronzeado e textura arenosa finíssima, sendo possível aplicar maquiagem leve após 24 a 48 horas.'
      },
      {
        question: 'Posso fazer o Lavieen se tiver melasma?',
        answer: 'Sim, desde que com parâmetros seguros e suaves ajustados pelo profissional. Na Nidô, o Lavieen é configurado em modo de baixa densidade para evitar rebote térmico e tratar a uniformização com segurança.'
      }
    ],
    image: 'https://lh3.googleusercontent.com/d/1IGUydl61F2IwIDCx8ELFZbxFqbJ5Tdmh',
    images: [
      'https://lh3.googleusercontent.com/d/1IGUydl61F2IwIDCx8ELFZbxFqbJ5Tdmh',
      'https://lh3.googleusercontent.com/d/1gA0GmIOwmU1PcxYki13EN4VLc5mjKJpt',
      'https://lh3.googleusercontent.com/d/1OvAaPWuvq18jkOOiV_lGCSJMHwJ-Q27u'
    ],
    keywords: ['lavieen', 'bblaser', 'bb laser', 'thulium', 'laser thulium', 'poros', 'manchas', 'melasma', 'glow', 'fotona']
  },
  {
    id: 'fotona-5d',
    slug: 'fotona-5d',
    name: 'Fotona 5D',
    category: 'Laser Multidimensional de Alta Performance',
    tagline: 'Abordagem multidimensional em diferentes camadas para firmeza, renovação e contorno facial',
    description: 'O Fotona 5D combina diferentes formas e comprimentos de onda de laser para atuar de maneira estratégica em diferentes camadas e estruturas da região tratada. O resultado é uma abordagem multidimensional que busca tratar não apenas a superfície da pele, mas também as estruturas mais profundas responsáveis pela sustentação e pelo contorno facial, promovendo estímulo intensivo de colágeno, retração tecidual e viço saudável.',
    howItWorks: 'O Fotona 5D combina diferentes formas de aplicação do laser para atuar de maneira estratégica em diferentes camadas e estruturas da região tratada. O protocolo atua de forma sinérgica e multidimensional da profundidade à superfície: atua na região interna da boca quando indicado para estimular tecidos e sustentação de dentro para fora de forma não invasiva, promove aquecimento térmico para remodelar o colágeno e refina a textura epidérmica com precisão milimétrica.',
    mechanismHighlights: [
      'Estimular a produção de colágeno, favorecendo a firmeza e a sustentação da pele',
      'Melhorar a textura e a qualidade da pele, deixando-a mais uniforme e com aspecto mais saudável',
      'Promover efeito de retração e remodelação dos tecidos, contribuindo para um contorno mais definido',
      'Atuar na região interna da boca, quando indicado, estimulando tecidos de forma não invasiva e auxiliando no tratamento da flacidez',
      'Suavizar a aparência de linhas e rugas, por meio do estímulo de renovação e remodelação do colágeno',
      'Melhorar o aspecto geral da pele, contribuindo para mais viço, firmeza e uniformidade'
    ],
    keyBenefits: [
      'Abordagem multidimensional: trata da profundidade à superfície cutânea',
      'Estímulo intensivo de colágeno para firmeza e sustentação',
      'Atuação intraoral pioneira não invasiva no tratamento da flacidez',
      'Efeito de retração e remodelação tecidual para contorno definido',
      'Renovação da textura, viço saudável e uniformidade do relevo',
      'Protocolo individualizado e seguro, sem tempo prolongado de repouso'
    ],
    targetIndications: [
      'Flacidez facial e perda de sustentação tecidual',
      'Perda de definição do contorno da mandíbula e bochechas',
      'Linhas finas, rugas e sulcos faciais (como bigode chinês)',
      'Textura irregular, poros dilatados e opacidade cutânea',
      'Flacidez perioral e ao redor da boca',
      'Rejuvenescimento global e estímulo preventivo de colágeno'
    ],
    sessionDuration: '45 a 75 minutos (conforme o protocolo individualizado)',
    recoveryAndComfort: 'Procedimento não invasivo e muito bem tolerado. Pode ocorrer leve calor e rubor passageiro na pele por algumas horas, sem necessidade de afastamento da rotina. O protocolo é totalmente individualizado.',
    relatedTreatments: [
      { name: 'Bio Regeneração Celular', slug: 'bio-regeneracao-celular' }
    ],
    faqs: [
      {
        question: 'Fotona 5D: como age na pele?',
        answer: 'O Fotona 5D combina diferentes formas de aplicação do laser para atuar de maneira estratégica em diferentes camadas e estruturas da região tratada. O resultado é uma abordagem multidimensional, que busca tratar não apenas a superfície da pele, mas também as estruturas mais profundas responsáveis pela sustentação e pelo contorno facial, promovendo firmeza, retração dos tecidos e renovação do colágeno.'
      },
      {
        question: 'Como funciona a atuação na região interna da boca?',
        answer: 'Quando indicado, o protocolo atua na região interna da boca de forma não invasiva e confortável. A energia térmica alcança os ligamentos e estruturas de sustentação através da mucosa oral, estimulando tecidos de dentro para fora e auxiliando no tratamento da flacidez e atenuação de sulcos como o bigode chinês.'
      },
      {
        question: 'O protocolo é o mesmo para todos os pacientes?',
        answer: 'Não. O protocolo é individualizado de acordo com as características e necessidades de cada paciente. Durante a consulta de avaliação, os parâmetros e etapas do Fotona 5D são planejados exclusivamente para as suas queixas e anatomia facial.'
      }
    ],
    image: 'https://lh3.googleusercontent.com/d/1waPXrJKg8jUJ_NXlm6CL0Ts4Ai06GlDc',
    images: [
      'https://lh3.googleusercontent.com/d/1waPXrJKg8jUJ_NXlm6CL0Ts4Ai06GlDc',
      'https://lh3.googleusercontent.com/d/1jiNqbjoLAygYYyS7BXny8f87VZAnefMK',
      'https://lh3.googleusercontent.com/d/11q_A3z7MdJaYx74-UGtPMYxG0YSWK2bG',
      'https://lh3.googleusercontent.com/d/17FTJYf-1D76xheA0h1sVYcNtjy8f6hXE',
      'https://lh3.googleusercontent.com/d/1-Q0ydBZUcYmhyoGZGWgMyKej41szGORS'
    ],
    keywords: ['fotona', 'fotona 5d', 'fotona 4d', 'laser fotona', 'laser', 'colageno', 'intraoral', 'firmeza', 'flacidez', 'contorno facial', 'rejuvenescimento'],
    clinicalNote: 'Nota clínica: O resultado é uma abordagem multidimensional, que busca tratar não apenas a superfície da pele, mas também as estruturas mais profundas responsáveis pela sustentação e pelo contorno facial. O protocolo é individualizado de acordo com as características e necessidades de cada paciente.'
  },
  {
    id: 'z-field',
    slug: 'z-field',
    name: 'Z-Field Dual',
    category: 'Campo Eletromagnético de Alta Intensidade',
    tagline: 'Campo eletromagnético para hipertrofia, tônus e fortalecimento muscular profundo',
    description: 'Dispositivo médico-estético de alta performance que emite pulsos eletromagnéticos de alta intensidade (até 2.5 Tesla), gerando milhares de contrações musculares supramáximas por sessão — uma intensidade que não pode ser alcançada pelo treino físico voluntário convencional. Promove hipertrofia miofibrilar, tônus rígido e gasto calórico local acelerado.',
    howItWorks: 'O campo magnético penetra as camadas de gordura e atinge os neurônios motores dos músculos profundos, despolarizando as membranas e induzindo contrações forçadas contínuas. Essa sobrecarga fisiológica força as fibras musculares a se remodelarem e aumentarem em densidade e volume.',
    mechanismHighlights: [
      'Gera cerca de 20.000 a 30.000 contrações musculares em apenas 30 minutos',
      'Atua no abdômen, glúteos, braços, posteriores de coxa e panturrilhas',
      'Auxilia no tratamento e fechamento da diástase pós-gestacional',
      'Procedimento 100% não invasivo: realizado sobre roupas confortáveis'
    ],
    keyBenefits: [
      'Contrações supramáximas sem sobrecarga articular ou esforço cardíaco',
      'Aumento expressivo da densidade e do tônus da musculatura',
      'Melhora da postura corporal e sustentação da coluna/core',
      'Procedimento indolor, rápido e sem tempo de recuperação'
    ],
    targetIndications: [
      'Definição abdominal e tonificação do core',
      'Fortalecimento e elevação dos glúteos ("butt lift" não invasivo)',
      'Tonificação de braços (bíceps e tríceps) e pernas',
      'Recuperação de tônus muscular pós-parto e tratamento de diástase'
    ],
    sessionDuration: '30 a 40 minutos por área',
    recoveryAndComfort: 'A sensação é de contração muscular intensa e compassada. Após a sessão, sente-se apenas a fadiga muscular característica de um treino de musculação bem executado.',
    relatedTreatments: [
      { name: 'Protocolo Redutor de Gordura Localizada', slug: 'gordura-localizada-contorno' },
      { name: 'Nutrologia, Longevidade & Performance', slug: 'nutrologia-longevidade-hipertrofia' }
    ],
    faqs: [
      {
        question: 'O Z-Field substitui a academia?',
        answer: 'O Z-Field atua como um potente acelerador e potencializador muscular, alcançando contrações profundas que complementam o treino físico e a alimentação saudável, sendo um aliado valioso para quem busca definição e tonificação acelerada.'
      },
      {
        question: 'Quantas sessões de Z-Field são indicadas?',
        answer: 'Geralmente recomenda-se um protocolo de 4 a 8 sessões, realizadas 1 a 2 vezes por semana, seguido por sessões mensais de manutenção.'
      }
    ],
    image: 'https://lh3.googleusercontent.com/d/1Q58XzY9KmgQ5qm_uFuFuf-9XBHLe2Wm4',
    images: [
      'https://lh3.googleusercontent.com/d/1Q58XzY9KmgQ5qm_uFuFuf-9XBHLe2Wm4',
      'https://lh3.googleusercontent.com/d/13qNc1b2CYR82V69wZmPtR9sRdNLFNDIo',
      'https://lh3.googleusercontent.com/d/1NPpr9YmpxUuh4V_6PUhXDvcwPxiG7Pax',
      'https://lh3.googleusercontent.com/d/1KGgKug0y5G0sctTSMwJBlt8geEMUUXRP',
      'https://lh3.googleusercontent.com/d/1IDbpOJ1pC3nZnwuNHdQyN4s_3Pr_C5Jp',
      'https://lh3.googleusercontent.com/d/1XRo-7E7FClX3nbsfqnHzulcVyyy0K65G',
      'https://lh3.googleusercontent.com/d/1gAPwFO3vTiYh4aZsVWqkuADsFJj8MBMm'
    ],
    keywords: ['zfield', 'z-field', 'emsculpt', 'hiemt', 'musculo', 'hipertrofia', 'gluteos', 'bumbum', 'diastase']
  },
  {
    id: 'endymed',
    slug: 'endymed',
    name: 'Endymed 3DEEP®',
    category: 'Radiofrequência Multipolar Profunda',
    tagline: 'Energia térmica profunda controlada para estímulo de colágeno corporal e facial',
    description: 'Tecnologia patenteada 3DEEP que utiliza múltiplos geradores de radiofrequência faseada para direcionar a energia térmica de forma precisa e profunda na derme e hipoderme, protegendo a superfície epidérmica com alto conforto e sem queimaduras.',
    howItWorks: 'Diferente da radiofrequência monopolar ou bipolar tradicional, a tecnologia 3DEEP controla a fase eletromagnética entre múltiplos eletrodos para forçar o campo de calor até as camadas subcutâneas mais profundas, atingindo 52°C a 55°C internamente mantendo a superfície da pele em confortáveis 40°C a 42°C.',
    mechanismHighlights: [
      'Aquecimento volumétrico 3D homogêneo e controlado por sensores',
      'Estímulo intensivo de novo colágeno e firmeza tecidual',
      'Ação direta na matriz extracelular para tratamento de celulite e contorno',
      'Sessão extremamente relaxante, comparável a uma massagem quente'
    ],
    keyBenefits: [
      'Aquecimento volumétrico profundo altamente controlado',
      'Redução da frouxidão da pele e melhora do aspecto da celulite',
      'Tratamento extremamente agradável e seguro'
    ],
    targetIndications: [
      'Flacidez de braços, abdômen, flancos e coxas',
      'Celulite com componente de frouxidão dérmica',
      'Flacidez e rugas finas de papada, pescoço e colo'
    ],
    sessionDuration: '30 a 50 minutos',
    recoveryAndComfort: 'Apenas uma vermelhidão quente e temporária na área tratada que desaparece em até 1 hora. Não requer nenhum tipo de repouso.',
    relatedTreatments: [
      { name: 'Tratamento de Celulite e Flacidez Corporal', slug: 'celulite-flacidez-corporal' }
    ],
    faqs: [
      {
        question: 'O tratamento com Endymed dói?',
        answer: 'Não, pelo contrário: a sessão é confortável e agradável. Os sensores do aparelho monitoram a temperatura a cada segundo para garantir aquecimento ideal sem risco de desconforto ou queimaduras.'
      },
      {
        question: 'O Endymed pode ser associado com bioestimuladores de colágeno?',
        answer: 'Sim, a associação é frequente nos protocolos corporais da Nidô, criando uma sinergia térmica e bioquímica que potencializa a firmeza da pele.'
      }
    ],
    image: 'https://lh3.googleusercontent.com/d/1NwuviuHJzz1a6LSMeFprcuysZ48JzaQq',
    images: [
      'https://lh3.googleusercontent.com/d/1NwuviuHJzz1a6LSMeFprcuysZ48JzaQq',
      'https://lh3.googleusercontent.com/d/1TojIJ7rLiLq9mpLnVVJjo_O_KiCybpnS',
      'https://lh3.googleusercontent.com/d/1dObAiB2N2eSr9kf2npNux2ZK6Ae4wvgG',
      'https://lh3.googleusercontent.com/d/1hpG-4w_3aQ4CwtnjcG98snJU8gUVWkp4',
      'https://lh3.googleusercontent.com/d/1otGSsJByVxHQYAaZF6OhVnCvmC_WSlG2',
      'https://lh3.googleusercontent.com/d/1se80d0_MOvrhbQD6YTcqrBmjSjMq7yS8',
      'https://lh3.googleusercontent.com/d/1tlN89iLSYhLcIvlZYrzThdY80WNXOFoL'
    ],
    keywords: ['endymed', '3deep', 'radiofrequencia', 'celulite', 'flacidez corporal']
  },
  {
    id: 'soprano-ice-platinum',
    slug: 'soprano-ice-platinum',
    name: 'Soprano ICE Platinum',
    category: 'Depilação a Laser Trio de Ondas',
    tagline: 'A sinergia de 3 comprimentos de onda para máxima segurança, rapidez e eficácia',
    description: 'Reúne os comprimentos de onda Alexandrita (755nm), Diodo (810nm) e Nd:YAG (1064nm) simultaneamente em uma única ponteira. Aquece os folículos gradativamente enquanto a ponteira ICE resfriada a -3°C garante conforto térmico total durante a sessão.',
    howItWorks: 'Através da tecnologia SHR (Super Hair Removal), o Soprano ICE Platinum emite múltiplos disparos de baixa fluência em alta repetição (modo em movimento), elevando a temperatura da raiz do pelo de forma cumulativa e gradual até a destruição do bulbo, sem superaquecer a epiderme.',
    mechanismHighlights: [
      'Combinação 3 em 1: atinge pelos superficiais, médios e profundos ao mesmo tempo',
      'Ponteira com cristal de safira resfriada a -3°C para conforto térmico contínuo',
      'Segurança comprovada para todos os fototipos de pele (I a VI)',
      'Sessões dinâmicas com deslizamento contínuo sobre a pele'
    ],
    keyBenefits: [
      'Eficaz para pelos claros, escuros, finos ou espessos',
      'Segurança comprovada para peles morenas e negras',
      'Sessões rápidas, seguras e com resfriamento contínuo'
    ],
    targetIndications: [
      'Eliminação duradoura de pelos corporais e faciais',
      'Foliculite e pelos encravados em virilha, axilas, barba e pernas',
      'Praticidade e higiene no dia a dia'
    ],
    sessionDuration: '15 a 45 minutos (conforme o tamanho da região)',
    recoveryAndComfort: 'Pode ocorrer leve rubor folicular por algumas horas. Recomendado uso diário de protetor solar e evitar exposição solar direta intensa nos primeiros dias.',
    relatedTreatments: [],
    faqs: [
      {
        question: 'Quem tem pele morena ou negra pode fazer o Soprano ICE Platinum?',
        answer: 'Sim! Graças ao comprimento de onda Nd:YAG (1064nm) integrado e ao modo de aquecimento gradual, o Soprano ICE Platinum é uma das tecnologias mais seguras do mundo para fototipos altos e peles bronzeadas.'
      },
      {
        question: 'Quantas sessões de depilação a laser são necessárias?',
        answer: 'Como os pelos passam por diferentes fases de crescimento (anágena, catágena e telógena), são necessárias em média de 6 a 10 sessões com intervalos de 30 a 45 dias para atingir redução expressiva e duradoura dos pelos.'
      }
    ],
    image: 'https://lh3.googleusercontent.com/d/1KlRkoO23Isc5HWart3jLYeSlvaVN0FXS',
    images: [
      'https://lh3.googleusercontent.com/d/1KlRkoO23Isc5HWart3jLYeSlvaVN0FXS',
      'https://lh3.googleusercontent.com/d/19G8hSZjuXCZmTg8etYuuUq6xrfrOPYhn',
      'https://lh3.googleusercontent.com/d/1fNj_AkgsnlmzPZ39FJoNIxCGYO583nht',
      'https://lh3.googleusercontent.com/d/1HiGmrpK14bYDFEI33VAn6lLl_RCCANrd',
      'https://lh3.googleusercontent.com/d/1du16qMqE1d_3VrQrs18BgyZo7jS5ydnh',
      'https://lh3.googleusercontent.com/d/1PljcIuwf_gVpFAnXUf6yuf7TPaHJdOKV',
      'https://lh3.googleusercontent.com/d/1qoPVnXItAMVHN0yYxinBxpfyEgmHdAPs'
    ],
    keywords: ['soprano', 'soprano ice', 'depilacao', 'depilacao a laser', 'laser de diodo', 'pelos']
  }
];
