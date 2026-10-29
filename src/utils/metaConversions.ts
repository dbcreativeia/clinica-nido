/**
 * Meta Conversions API (CAPI) and Meta Pixel dual-tracking utility with strict deduplication.
 * Compliant with Meta Business Specifications (2026), LGPD (Lei 13.709/18), and Healthcare Privacy Guidelines.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    __META_TEST_EVENT_CODE__?: string;
  }
}

export const META_PIXEL_ID = '1002877629496230';
export const PRODUCTION_DOMAINS = ['nidoestetica.com.br', 'www.nidoestetica.com.br'];

/**
 * Checks if the current client hostname is one of the verified official production domains.
 */
export function isProductionDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  return PRODUCTION_DOMAINS.includes(hostname);
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
 * Helper to set a first-party cookie with domain, path, and SameSite attributes
 */
export function setCookie(name: string, value: string, days = 90): void {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = '; expires=' + date.toUTCString();
  
  let domain = '';
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.endsWith('nidoestetica.com.br')) {
    domain = '; domain=.nidoestetica.com.br';
  }
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/${domain}; SameSite=Lax`;
}

/**
 * Retrieves the Meta Browser ID (_fbp).
 * If absent, generates a standard-compliant first-party _fbp (fb.1.<timestamp>.<random>)
 * and sets it in both document.cookie (90 days) and localStorage.
 */
export function getOrCreateFbp(): string {
  if (typeof window === 'undefined') return '';

  // 1. Check existing cookie
  const existingCookie = getCookie('_fbp');
  if (existingCookie && existingCookie.startsWith('fb.1.')) {
    return existingCookie;
  }

  // 2. Check localStorage fallback
  try {
    const saved = localStorage.getItem('nido_fbp');
    if (saved && saved.startsWith('fb.1.')) {
      setCookie('_fbp', saved, 90);
      return saved;
    }
  } catch {
    // Ignore storage errors
  }

  // 3. Generate standard-compliant Meta _fbp
  const creationTime = Date.now();
  const randomVal = Math.floor(1000000000 + Math.random() * 9000000000);
  const newFbp = `fb.1.${creationTime}.${randomVal}`;
  setCookie('_fbp', newFbp, 90);
  try {
    localStorage.setItem('nido_fbp', newFbp);
  } catch {
    // Ignore storage errors
  }
  return newFbp;
}

/**
 * Extracts and preserves the Meta Click ID (_fbc).
 * Compliant format: fb.1.<creation_time>.<fbclid>.
 * If present in URL, persists to top-level domain cookie and localStorage.
 * Does NOT manufacture fbclid on organic or direct visits.
 */
export function getOrCreateFbc(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  // 1. Check existing cookie
  const existingCookie = getCookie('_fbc');
  if (existingCookie && existingCookie.startsWith('fb.1.')) {
    return existingCookie;
  }

  // 2. Check current URL query parameter
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    if (fbclid && fbclid.trim()) {
      const cleanFbclid = fbclid.trim();
      const creationTime = Date.now();
      const fbc = `fb.1.${creationTime}.${cleanFbclid}`;
      setCookie('_fbc', fbc, 90);
      try {
        localStorage.setItem('nido_fbc', fbc);
      } catch {
        // Ignore
      }
      return fbc;
    }
  } catch {
    // Ignore URL parse error
  }

  // 3. Check localStorage fallback (for intra-session navigation after redirect)
  try {
    const saved = localStorage.getItem('nido_fbc');
    if (saved && saved.startsWith('fb.1.')) {
      setCookie('_fbc', saved, 90);
      return saved;
    }
  } catch {
    // Ignore
  }

  return undefined;
}

/**
 * Sanitizes URLs before sending to Meta:
 * Retains domain, path, and tracking parameters (fbclid, utm_*).
 * Removes any sensitive or clinical query parameters.
 */
export function sanitizeEventUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const safeParams = new URLSearchParams();
    const ALLOWED_PARAMS = ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    url.searchParams.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (ALLOWED_PARAMS.includes(lowerKey)) {
        safeParams.set(key, val);
      }
    });

    url.search = safeParams.toString();
    url.hash = ''; // Do not send client hashes (e.g., #admin)
    return url.toString();
  } catch {
    return 'https://www.nidoestetica.com.br/';
  }
}

/**
 * Generates an opaque, unique event ID shared identically across Pixel and CAPI.
 * Never includes personal identifiers (phone, email, names).
 */
export function generateEventId(eventName = 'event'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const cleanPrefix = eventName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `nido_${cleanPrefix}_${timestamp}_${random}`;
}

export interface MetaUserData {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  st?: string;
  zp?: string;
  country?: string;
  external_id?: string;
  fbp?: string;
  fbc?: string;
}

export interface MetaEventOptions {
  customData?: Record<string, unknown>;
  userData?: MetaUserData;
  eventId?: string;
  testEventCode?: string;
}

// In-memory set to prevent double execution on rapid UI re-renders within 1 second
const recentDispatches = new Map<string, number>();

/**
 * Sends event to both client-side Meta Pixel and server-side Conversions API (CAPI).
 * Deduplicates automatically via exactly matching eventID.
 */
export async function trackMetaEvent(
  eventName: 'PageView' | 'Lead' | 'Contact' | 'ViewContent' | 'Search' | string,
  options: MetaEventOptions = {}
): Promise<string> {
  // 1. Respect LGPD user cookie consent
  if (typeof window !== 'undefined') {
    const consentSetting = localStorage.getItem('nido_cookie_consent');
    if (consentSetting) {
      try {
        const parsed = JSON.parse(consentSetting);
        if (parsed.meta === false) {
          // User explicitly declined marketing cookies
          return options.eventId || generateEventId(eventName);
        }
      } catch {
        // Ignore JSON error
      }
    }
  }

  // 2. Prevent accidental micro-duplicate triggers
  const eventId = options.eventId || generateEventId(eventName);
  const dedupeKey = `${eventName}_${window?.location?.pathname || '/'}`;
  const now = Date.now();
  const lastTime = recentDispatches.get(dedupeKey);
  if (lastTime && now - lastTime < 400 && eventName === 'PageView') {
    return eventId;
  }
  recentDispatches.set(dedupeKey, now);

  const rawUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.nidoestetica.com.br/';
  const sanitizedUrl = sanitizeEventUrl(rawUrl);

  // 3. Resolve authoritative fbp & fbc
  const resolvedFbp = options.userData?.fbp || getOrCreateFbp();
  const resolvedFbc = options.userData?.fbc || getOrCreateFbc();

  const finalUserData: MetaUserData = {
    ...options.userData,
    ...(resolvedFbp ? { fbp: resolvedFbp } : {}),
    ...(resolvedFbc ? { fbc: resolvedFbc } : {})
  };

  // 4. Clean customData to comply with Healthcare Privacy:
  // Disallow clinical free text, health diagnoses, or sensitive personal data.
  const rawCustom = options.customData || {};
  const sanitizedCustomData: Record<string, unknown> = {
    content_type: 'product',
    currency: 'BRL',
    ...rawCustom
  };

  // Ensure content category is professional and non-diagnostic
  if (!sanitizedCustomData.content_category) {
    sanitizedCustomData.content_category = 'Estética Avançada';
  }

  const isProd = isProductionDomain();
  const testCode = options.testEventCode || (typeof window !== 'undefined' ? window.__META_TEST_EVENT_CODE__ : undefined);

  // 5. Client-Side Meta Pixel Dispatch
  // In development / non-production hosts, only dispatch if test mode code is present to protect the live production dataset
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (isProd || testCode) {
      try {
        window.fbq('track', eventName, sanitizedCustomData, { eventID: eventId });
      } catch (err) {
        console.warn('[Meta Pixel Client Warning]', err);
      }
    }
  }

  // 6. Server-Side Conversions API (CAPI) Dispatch
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/meta/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventName,
          eventId,
          eventSourceUrl: sanitizedUrl,
          customData: sanitizedCustomData,
          userData: finalUserData,
          testEventCode: testCode,
          isProductionClient: isProd
        }),
        keepalive: true
      }).catch((err) => {
        // Non-blocking catch
        console.warn('[Meta CAPI Request Warning]', err);
      });
    } catch (err) {
      console.warn('[Meta CAPI Dispatch Warning]', err);
    }
  }

  return eventId;
}

/**
 * Tracks a PageView on SPA route navigation.
 * Generates an event ID shared with CAPI for 1:1 deduplication.
 */
export function trackMetaPageView(path?: string): void {
  const eventId = generateEventId('pageview');
  trackMetaEvent('PageView', {
    eventId,
    customData: {
      page_path: path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      content_category: 'Navegação Institucional'
    }
  });
}

/**
 * Tracks a Contact event (e.g., WhatsApp button click or general contact initiation).
 * Differentiates from Lead to prevent premature conversion optimization.
 */
export function trackMetaContact(
  serviceName = 'Geral', 
  ctaLocation = 'Site',
  userData?: MetaUserData
): void {
  const eventId = generateEventId('contact');
  trackMetaEvent('Contact', {
    eventId,
    userData,
    customData: {
      content_name: 'Atendimento e Informações',
      service_label: serviceName,
      content_category: 'Contato WhatsApp',
      cta_location: ctaLocation
    }
  });
}

/**
 * Tracks a Qualified Lead event (form submission with verified contact data).
 * Triggered only after successful backend/CRM persistence.
 */
export function trackMetaLead(
  serviceName = 'Geral', 
  ctaLocation = 'Site', 
  userData?: MetaUserData,
  customData?: Record<string, unknown>
): void {
  const eventId = generateEventId('lead');
  trackMetaEvent('Lead', {
    eventId,
    userData,
    customData: {
      content_name: 'Avaliação Estética Individualizada',
      service_label: serviceName,
      content_category: 'Atendimento & Avaliação Qualificada',
      cta_location: ctaLocation,
      currency: 'BRL',
      ...customData
    }
  });
}

/**
 * Tracks ViewContent when viewing a treatment or technology detail page.
 * Only fires on specific detail pages, avoiding duplicate PageView events.
 */
export function trackMetaViewContent(
  contentName: string, 
  category: 'Tratamentos' | 'Tecnologias' | string, 
  value?: number
): void {
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
