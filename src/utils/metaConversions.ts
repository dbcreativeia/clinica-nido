/**
 * Meta Conversions API (CAPI) and Meta Pixel dual-tracking utility with deduplication.
 * Ensures maximum event match quality and resilience against ad blockers / iOS privacy limitations.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export const META_PIXEL_ID = '1002877629496230';

/**
 * Generates a unique event ID for deduplication between Pixel and Conversions API.
 */
export function generateEventId(prefix = 'nido'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Helper to read cookie values by name
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : undefined;
}

/**
 * Extracts fbclid from URL if present and builds Meta standard _fbc string
 */
export function getFbc(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const existingCookie = getCookie('_fbc');
  if (existingCookie) return existingCookie;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    if (fbclid) {
      return `fb.1.${Date.now()}.${fbclid}`;
    }
  } catch {
    // Ignore URL parse error
  }
  return undefined;
}

export interface MetaEventOptions {
  customData?: Record<string, unknown>;
  userData?: {
    em?: string;
    ph?: string;
    fn?: string;
    ln?: string;
    ct?: string;
    st?: string;
    zp?: string;
    country?: string;
    fbp?: string;
    fbc?: string;
  };
  eventId?: string;
}

/**
 * Sends event to both client-side Meta Pixel and server-side Conversions API (CAPI).
 * Deduplicates automatically via matching eventID.
 */
export async function trackMetaEvent(
  eventName: 'PageView' | 'Lead' | 'Contact' | 'ViewContent' | 'Search' | string,
  options: MetaEventOptions = {}
): Promise<string> {
  // Respect LGPD consent for Meta Pixel & CAPI tracking
  const consentSetting = typeof localStorage !== 'undefined' ? localStorage.getItem('nido_cookie_consent') : null;
  if (consentSetting) {
    try {
      const parsed = JSON.parse(consentSetting);
      if (parsed.meta === false) {
        return options.eventId || generateEventId(eventName.toLowerCase());
      }
    } catch {
      // Ignore
    }
  }

  const eventId = options.eventId || generateEventId(eventName.toLowerCase());
  const customData = options.customData || {};
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.nidoestetica.com.br/';

  const fbp = getCookie('_fbp');
  const fbc = getFbc();

  const userData = {
    ...options.userData,
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {})
  };

  // 1. Client-side Meta Pixel Tracking
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', eventName, customData, { eventID: eventId });
    }
  } catch (err) {
    console.warn('[Meta Pixel Client Warning]', err);
  }

  // 2. Server-side Meta Conversions API (CAPI) Tracking
  try {
    if (typeof window !== 'undefined') {
      fetch('/api/meta/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventName,
          eventId,
          eventSourceUrl: currentUrl,
          customData,
          userData
        }),
        keepalive: true
      }).catch(err => {
        // Non-blocking catch
        console.warn('[Meta CAPI Request Warning]', err);
      });
    }
  } catch (err) {
    console.warn('[Meta CAPI Client Dispatch Warning]', err);
  }

  return eventId;
}

/**
 * Tracks a PageView on SPA route navigation
 */
export function trackMetaPageView(path?: string): void {
  const eventId = generateEventId('pageview');
  trackMetaEvent('PageView', {
    eventId,
    customData: {
      page_path: path || (typeof window !== 'undefined' ? window.location.pathname : '/')
    }
  });
}

/**
 * Tracks a Contact event when the user initiates WhatsApp contact or clicks to message.
 * Does NOT fire Lead, preventing ad optimization from counting simple clickers as qualified leads.
 */
export function trackMetaContact(serviceName = 'Geral', ctaLocation = 'Site'): void {
  const eventId = generateEventId('contact');
  
  trackMetaEvent('Contact', {
    eventId,
    customData: {
      content_name: serviceName,
      content_category: 'Contato WhatsApp',
      cta_location: ctaLocation
    }
  });
}

/**
 * Tracks a Qualified Lead event (reserved for qualified leads, appointments, or evaluations).
 */
export function trackMetaLead(serviceName = 'Geral', ctaLocation = 'Site', customData?: Record<string, unknown>): void {
  const eventId = generateEventId('lead');

  // Track Lead only for qualified actions
  trackMetaEvent('Lead', {
    eventId,
    customData: {
      content_name: serviceName,
      content_category: 'Atendimento & Avaliação Qualificada',
      cta_location: ctaLocation,
      currency: 'BRL',
      ...customData
    }
  });
}

/**
 * Tracks ViewContent when viewing a treatment or technology
 */
export function trackMetaViewContent(contentName: string, category: 'Tratamentos' | 'Tecnologias' | string, value?: number): void {
  const eventId = generateEventId('viewcontent');
  trackMetaEvent('ViewContent', {
    eventId,
    customData: {
      content_name: contentName,
      content_category: category,
      content_type: 'product',
      ...(value ? { value, currency: 'BRL' } : {})
    }
  });
}
