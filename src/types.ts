export type TreatmentCategory = 
  | 'faciais' 
  | 'corporais' 
  | 'regenerativos' 
  | 'capilares' 
  | 'saude-e-bem-estar';

export interface Treatment {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: TreatmentCategory;
  categoryLabel: string;
  summary: string;
  heroImage: string;
  images?: string[];
  isPriority?: boolean;
  isNew?: boolean;
  whatIs: string;
  forWhom: string[];
  benefits: string[];
  howItWorks: string;
  treatedAreas?: string[];
  recoveryAndCare?: string;
  relatedTechnology?: string;
  relatedProfessional?: string;
  faqs: { question: string; answer: string }[];
  hasResults?: boolean;
  editorialNote?: string;
  keywords?: string[];
}

export interface Technology {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  keyBenefits: string[];
  targetIndications: string[];
  relatedTreatments: { name: string; slug: string }[];
  image: string;
  images?: string[];
  clinicalNote?: string;
  howItWorks?: string;
  mechanismHighlights?: string[];
  sessionDuration?: string;
  recoveryAndComfort?: string;
  faqs?: { question: string; answer: string }[];
  keywords?: string[];
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  registration: string; // e.g. CRBM 35047, CRM 171085
  badge?: string;
  shortBio: string;
  fullBio: string;
  specialties: string[];
  image: string;
  imagePosition?: string;
  imageClass?: string;
  imageStyle?: React.CSSProperties;
  isTechnicalLead?: boolean;
  validationNote?: string;
}

export interface CaseResult {
  id: string;
  treatmentName: string;
  region: string;
  timeframe: string;
  sessions: string;
  description: string;
  imageBefore: string;
  imageAfter: string;
}

export interface Testimonial {
  id: string;
  patientInitials: string;
  patientAge?: string;
  treatment: string;
  comment: string;
  rating: number;
}
