import { Treatment, Technology } from '../types';

/**
 * Normaliza uma string removendo acentos, pontuação e convertendo para minúsculas.
 */
export const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s]/g, ' ') // substitui pontuação por espaço
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Dicionário de sinônimos, marcas e termos populares de busca do universo estético.
 */
export const SYNONYM_MAP: Record<string, string[]> = {
  // Toxina Botulínica & Botox
  botox: ['linhas-de-expressao-toxina', 'toxina-botulinica', 'rugas', 'testa', 'pes-de-galinha', 'vincos'],
  dysport: ['linhas-de-expressao-toxina'],
  xeomin: ['linhas-de-expressao-toxina'],
  botulift: ['linhas-de-expressao-toxina'],
  toxina: ['linhas-de-expressao-toxina'],
  'toxina botulinica': ['linhas-de-expressao-toxina'],
  rugas: ['linhas-de-expressao-toxina', 'profhilo'],
  'pes de galinha': ['linhas-de-expressao-toxina'],
  'linhas de expressao': ['linhas-de-expressao-toxina'],

  // Preenchimentos & Ácido Hialurônico / Marcas
  preenchimento: ['harmonizacao-facial'],
  'preenchimento labial': ['harmonizacao-facial'],
  labio: ['harmonizacao-facial'],
  labios: ['harmonizacao-facial'],
  'acido hialuronico': ['harmonizacao-facial'],
  hialuronico: ['harmonizacao-facial'],
  juvederm: ['harmonizacao-facial'],
  restylane: ['harmonizacao-facial'],
  rennova: ['harmonizacao-facial'],
  voluma: ['harmonizacao-facial'],
  olheiras: ['harmonizacao-facial', 'lavieen'],
  'bigode chines': ['harmonizacao-facial', 'hipro'],
  mandibula: ['harmonizacao-facial', 'endoslim'],
  queixo: ['harmonizacao-facial', 'endoslim'],

  // Bioestimuladores de Colágeno & Marcas
  sculptra: ['bio-regeneracao-celular'],
  radiesse: ['bio-regeneracao-celular'],
  elleva: ['bio-regeneracao-celular'],
  bioestimulador: ['bio-regeneracao-celular'],
  bioestimuladores: ['bio-regeneracao-celular'],
  colageno: ['profhilo', 'bio-regeneracao-celular', 'hipro'],

  // Profhilo & Bioremodeladores
  profhilo: ['profhilo'],
  profilo: ['profhilo'],
  bioremodelador: ['profhilo'],
  skinbooster: ['profhilo', 'bio-regeneracao-celular'],
  'skin booster': ['profhilo', 'bio-regeneracao-celular'],

  // Ultrassom Microfocado / Ultraformer / HIPRO
  ultraformer: ['hipro', 'ultraformer-iii', 'hipro-facial-corporal'],
  'ultraformer 3': ['hipro', 'ultraformer-iii', 'hipro-facial-corporal'],
  'ultraformer iii': ['hipro', 'ultraformer-iii', 'hipro-facial-corporal'],
  'ultraformer mpt': ['hipro', 'ultraformer-iii', 'hipro-facial-corporal'],
  ultrassom: ['hipro', 'ultraformer-iii', 'hipro-facial-corporal'],
  'ultrassom microfocado': ['hipro', 'ultraformer-iii', 'hipro-facial-corporal'],
  hipro: ['hipro', 'hipro-facial-corporal'],
  papada: ['endoslim', 'hipro', 'ultraformer-iii', 'gordura-localizada-contorno'],

  // Lasers / BB Laser / Lavieen / Fotona
  lavieen: ['lavieen', 'peeling-dermeskin-melasma'],
  bblaser: ['lavieen'],
  'bb laser': ['lavieen'],
  thulium: ['lavieen'],
  'laser thulium': ['lavieen'],
  fotona: ['fotona-5d', 'lavieen', 'peeling-dermeskin-melasma'],
  'fotona 5d': ['fotona-5d'],
  'fotona 4d': ['fotona-5d'],
  'laser fotona': ['fotona-5d'],
  'smoothliftin': ['fotona-5d'],
  manchas: ['peeling-dermeskin-melasma', 'lavieen'],
  melasma: ['peeling-dermeskin-melasma', 'lavieen'],
  poros: ['lavieen', 'extracao-regeneradora-peptideos'],
  'poros dilatados': ['lavieen', 'extracao-regeneradora-peptideos'],

  // Endoslim / Endolaser / Lipo sem cortes
  endoslim: ['endoslim'],
  endolaser: ['endoslim'],
  endolift: ['endoslim'],
  'lipo sem cortes': ['endoslim', 'gordura-localizada-contorno'],
  'gordura localizada': ['endoslim', 'gordura-localizada-contorno'],
  gordura: ['endoslim', 'gordura-localizada-contorno'],
  barriga: ['endoslim', 'gordura-localizada-contorno', 'celulite-flacidez-corporal'],

  // Z-Field / Músculo / Emsculpt
  zfield: ['z-field'],
  'z-field': ['z-field'],
  emsculpt: ['z-field'],
  hiemt: ['z-field'],
  musculo: ['z-field'],
  hipertrofia: ['z-field', 'nutrologia-longevidade-hipertrofia'],
  bumbum: ['z-field', 'celulite-flacidez-corporal'],
  gluteos: ['z-field', 'celulite-flacidez-corporal'],

  // Soprano & Depilação
  soprano: ['soprano-ice-platinum', 'depilacao-a-laser-soprano'],
  depilacao: ['soprano-ice-platinum', 'depilacao-a-laser-soprano'],
  'depilacao a laser': ['soprano-ice-platinum', 'depilacao-a-laser-soprano'],
  pelos: ['soprano-ice-platinum', 'depilacao-a-laser-soprano'],

  // Medicina Regenerativa & Exossomos
  exossomos: ['bio-regeneracao-celular'],
  exossomo: ['bio-regeneracao-celular'],
  pdrn: ['bio-regeneracao-celular'],
  peptideos: ['bio-regeneracao-celular', 'extracao-regeneradora-peptideos'],

  // Limpeza de pele
  'limpeza de pele': ['extracao-regeneradora-peptideos'],
  cravos: ['extracao-regeneradora-peptideos'],
  acne: ['extracao-regeneradora-peptideos', 'lavieen'],

  // Capilar
  cabelo: ['terapias-capilares-regenerativas'],
  'queda de cabelo': ['terapias-capilares-regenerativas'],
  alopecia: ['terapias-capilares-regenerativas'],
  mmp: ['terapias-capilares-regenerativas'],

  // Nutrologia & Emagrecimento
  nutrologia: ['nutrologia-longevidade-hipertrofia'],
  emagrecimento: ['nutrologia-longevidade-hipertrofia', 'endoslim'],
  ozempic: ['nutrologia-longevidade-hipertrofia'],
  mounjaro: ['nutrologia-longevidade-hipertrofia'],
  'chip da beleza': ['nutrologia-longevidade-hipertrofia'],
  soroterapia: ['nutrologia-longevidade-hipertrofia'],

  // Drenagem
  drenagem: ['drenagem-pos-operatoria-e-linfatica'],
  'pos operatorio': ['drenagem-pos-operatoria-e-linfatica'],
  inchaco: ['drenagem-pos-operatoria-e-linfatica'],
};

export interface SearchMatch {
  score: number;
}

/**
 * Calcula a relevância da busca para um item (Tratamento ou Tecnologia).
 */
export const calculateSearchScore = (
  rawQuery: string,
  item: {
    id: string;
    slug: string;
    name: string;
    subtitle?: string;
    tagline?: string;
    summary?: string;
    description?: string;
    whatIs?: string;
    categoryLabel?: string;
    category?: string;
    treatedAreas?: string[];
    forWhom?: string[];
    targetIndications?: string[];
    keyBenefits?: string[];
    keywords?: string[];
  }
): number => {
  const q = normalizeText(rawQuery);
  if (!q) return 0;

  const normalizedName = normalizeText(item.name);
  const normalizedSubtitle = normalizeText(item.subtitle || item.tagline || '');
  const normalizedSummary = normalizeText(item.summary || item.description || item.whatIs || '');
  const normalizedCategory = normalizeText(item.categoryLabel || item.category || '');
  
  const allKeywords = [
    ...(item.keywords || []),
    ...(item.treatedAreas || []),
    ...(item.forWhom || []),
    ...(item.targetIndications || []),
    ...(item.keyBenefits || []),
  ].map(normalizeText);

  let score = 0;

  // 1. Nome do item (Match exato ou parcial)
  if (normalizedName === q) {
    score += 100;
  } else if (normalizedName.startsWith(q)) {
    score += 80;
  } else if (normalizedName.includes(q)) {
    score += 60;
  }

  // 2. Checagem do mapa de sinônimos/marcas
  for (const [synonymKey, targetIds] of Object.entries(SYNONYM_MAP)) {
    const normSyn = normalizeText(synonymKey);
    if (q.includes(normSyn) || normSyn.includes(q)) {
      if (targetIds.includes(item.id) || targetIds.includes(item.slug)) {
        score += 75;
      }
    }
  }

  // 3. Subtítulo / Tagline
  if (normalizedSubtitle.includes(q)) {
    score += 40;
  }

  // 4. Palavras-chave / Áreas tratadas / Indicações
  for (const kw of allKeywords) {
    if (kw === q) {
      score += 50;
    } else if (kw.includes(q) || q.includes(kw)) {
      score += 30;
    }
  }

  // 5. Categoria
  if (normalizedCategory.includes(q)) {
    score += 20;
  }

  // 6. Resumo / Descrição
  if (normalizedSummary.includes(q)) {
    score += 15;
  }

  // 7. Tokenização de palavras da busca (ex: "botox testa" -> busca "botox" e "testa")
  const tokens = q.split(' ').filter(t => t.length >= 3);
  if (tokens.length > 1) {
    let tokenMatches = 0;
    for (const token of tokens) {
      const tokenInName = normalizedName.includes(token);
      const tokenInSub = normalizedSubtitle.includes(token);
      const tokenInKw = allKeywords.some(kw => kw.includes(token));
      const tokenInSyn = Object.entries(SYNONYM_MAP).some(([synKey, targetIds]) => {
        return normalizeText(synKey).includes(token) && (targetIds.includes(item.id) || targetIds.includes(item.slug));
      });

      if (tokenInName || tokenInSub || tokenInKw || tokenInSyn) {
        tokenMatches += 1;
      }
    }
    score += tokenMatches * 15;
  }

  return score;
};
