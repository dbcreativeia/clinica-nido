import { trackEvent } from './analytics';

export const WHATSAPP_NUMBER = '5511963836050';
export const WHATSAPP_DISPLAY = '(11) 96383-6050';

/**
 * Builds a direct WhatsApp click-to-chat URL with proper encoding.
 */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Predefined contextual WhatsApp messages recommended in the briefing
 */
export const WhatsAppMessages = {
  general: () => 
    'Olá! Vim pelo site da Nidô e gostaria de conhecer os tratamentos. Você pode me orientar?',
  
  treatment: (treatmentName: string) => 
    `Olá! Vim pelo site da Nidô e gostaria de informações sobre ${treatmentName}. Você pode me orientar?`,
  
  endoslim: () => 
    'Olá! Vim pelo site da Nidô e gostaria de saber se o Endoslim pode ser indicado para o meu caso.',
  
  technology: (techName: string) => 
    `Olá! Vim pelo site da Nidô e gostaria de entender quais tratamentos utilizam a tecnologia ${techName}.`,
    
  team: (professionalName: string) =>
    `Olá! Vim pelo site da Nidô e gostaria de agendar uma avaliação com ${professionalName}.`,
    
  contact: () =>
    'Olá! Gostaria de falar com a equipe de atendimento da Clínica Nidô para agendar minha avaliação.'
};

/**
 * Personalizes the WhatsApp message according to the user specification:
 * "Oi meu nome é (o que preencheu no campo nome), vim pelo site da Nidô (e aí pode manter a mensagem de cada produto ou de cada parte do site)"
 */
export function formatPersonalizedWhatsAppMessage(name: string, originalMessage: string): string {
  const cleanName = name.trim();
  if (!cleanName) return originalMessage;

  if (originalMessage.startsWith('Olá! Vim pelo site da Nidô e ')) {
    return `Oi meu nome é ${cleanName}, vim pelo site da Nidô e ${originalMessage.replace('Olá! Vim pelo site da Nidô e ', '')}`;
  }
  if (originalMessage.startsWith('Olá! Vim pelo site da Nidô ')) {
    return `Oi meu nome é ${cleanName}, vim pelo site da Nidô ${originalMessage.replace('Olá! Vim pelo site da Nidô ', '')}`;
  }
  if (originalMessage.startsWith('Olá! Gostaria de falar ')) {
    return `Oi meu nome é ${cleanName}, vim pelo site da Nidô e gostaria de falar ${originalMessage.replace('Olá! Gostaria de falar ', '')}`;
  }
  if (originalMessage.startsWith('Olá! ')) {
    return `Oi meu nome é ${cleanName}, vim pelo site da Nidô e ${originalMessage.replace('Olá! ', '')}`;
  }

  return `Oi meu nome é ${cleanName}, vim pelo site da Nidô. ${originalMessage}`;
}

export interface WhatsAppContext {
  service_name?: string;
  page_path?: string;
  cta_location?: string;
}

/**
 * Directly opens WhatsApp and dispatches analytics without opening modal
 * (used after lead form submission)
 */
export function openDirectWhatsApp(
  message: string,
  context?: WhatsAppContext
): void {
  const pagePath = context?.page_path || (typeof window !== 'undefined' ? window.location.pathname : '');
  const serviceName = context?.service_name || 'Geral';
  const ctaLocation = context?.cta_location || 'Botão Desconhecido';

  trackEvent('whatsapp_click', {
    service_name: serviceName,
    page_path: pagePath,
    cta_location: ctaLocation
  });

  const url = buildWhatsAppUrl(message);
  if (typeof window !== 'undefined') {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Intercepts contact clicks to open the Lead Capture Modal requiring Name, WhatsApp, and Email.
 */
export function openWhatsApp(
  message: string, 
  context?: WhatsAppContext
): void {
  if (typeof window !== 'undefined') {
    // Dispatch event to show the lead modal
    window.dispatchEvent(
      new CustomEvent('nido:open-lead-capture', {
        detail: {
          message,
          context: {
            service_name: context?.service_name || 'Geral',
            page_path: context?.page_path || window.location.pathname,
            cta_location: context?.cta_location || 'Botão Desconhecido'
          }
        }
      })
    );
  }
}
