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

export function hasMetaConsent(): boolean {
  try {
    const c=JSON.parse(localStorage.getItem('nido_cookie_consent') || 'null');
    const age=Date.now()-c?.timestamp;
    return c?.meta===true && typeof c.timestamp==='number' && age>=0 && age<180*86400000 && (!c.expiresAt || c.expiresAt>Date.now());
  } catch { return false; }
}
let pixelInitialized=false;
function initializePixel(userData: MetaUserData): void {
  if(!isProductionDomain() || !hasMetaConsent()) return;
  if(!window.fbq) {
    const q:any=function(...args:unknown[]){if(q.callMethod)q.callMethod(...args);else q.queue.push(args)};
    q.queue=[];q.push=q;q.loaded=true;q.version='2.0';window.fbq=q;window._fbq=q;
    const script=document.createElement('script');script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }
  window.fbq?.('consent','grant');
  if(!pixelInitialized) {
    const matching:Record<string,string>={};
    for(const key of ['em','ph','fn','ln','country'] as const) if(userData[key])matching[key]=userData[key]!;
    window.fbq?.('init',META_PIXEL_ID,matching);pixelInitialized=true;
  }
  // Later form identifiers enrich CAPI. Pixel automatic matching remains enabled.
  // Do not use undocumented update commands or repeatedly initialize the same pixel.
}
export function refreshMetaConsent(): void {
  if(!hasMetaConsent()) window.fbq?.('consent','revoke');
}

/**
 * Helper to read cookie values by name
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
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
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/${domain}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

/**
 * Retrieves the Meta Browser ID (_fbp).
 * If absent, generates a standard-compliant first-party _fbp (fb.1.<timestamp>.<random>)
 * and sets it in both document.cookie (90 days) and localStorage.
 */
export function getOrCreateFbp(): string {
  if (typeof window === 'undefined' || !hasMetaConsent() || !isProductionDomain()) return '';

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
  if (typeof window === 'undefined' || !hasMetaConsent() || !isProductionDomain()) return undefined;

  let urlFbclid: string | null = null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get('fbclid');
    if (param && param.trim()) {
      urlFbclid = param.trim();
    }
  } catch {
    // Ignore
  }

  const existingCookie = getCookie('_fbc');
  let existingLocalStorage: string | null = null;
  try {
    existingLocalStorage = localStorage.getItem('nido_fbc');
  } catch {
    // Ignore
  }

  // If new fbclid is present in URL
  if (urlFbclid) {
    const existingFbc = existingCookie || existingLocalStorage;
    if (existingFbc && existingFbc.startsWith('fb.1.')) {
      const parts = existingFbc.split('.');
      const storedFbclid = parts.slice(3).join('.');
      if (storedFbclid === urlFbclid) {
        return existingFbc;
      }
    }
    // New fbclid detected: create new fbc
    const creationTime = Date.now();
    const fbc = `fb.1.${creationTime}.${urlFbclid}`;
    setCookie('_fbc', fbc, 90);
    try {
      localStorage.setItem('nido_fbc', fbc);
    } catch {
      // Ignore
    }
    return fbc;
  }

  // No URL fbclid: check existing cookie
  if (existingCookie && existingCookie.startsWith('fb.1.')) {
    return existingCookie;
  }

  // Check localStorage fallback
  if (existingLocalStorage && existingLocalStorage.startsWith('fb.1.')) {
    setCookie('_fbc', existingLocalStorage, 90);
    return existingLocalStorage;
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
  if(typeof window==='undefined' || !isProductionDomain() || !hasMetaConsent()) return options.eventId || generateEventId(eventName);
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
    ...(resolvedFbp ? {fbp:resolvedFbp}:{}), ...(resolvedFbc ? {fbc:resolvedFbc}:{})
  };
  const supplied=options.userData || {};
  for(const key of ['em','ph','fn','ln','ct','st','zp','country','external_id'] as const) {
    let value=String(supplied[key] || '').trim().toLowerCase();
    if(key==='em' && (!value.includes('@') || value.endsWith('@nido.local'))) value='';
    if(key==='ph') {value=value.replace(/\D/g,'');if(value.length===10 || value.length===11)value='55'+value;if(!/^55\d{10,11}$/.test(value))value='';}
    if(value)finalUserData[key]=value;
  }
  let sanitizedCustomData: Record<string, unknown> = {
    content_name: 'Informações institucionais',
    content_category: 'Site',
    currency: 'BRL'
  };

  if (eventName === 'FindLocation') {
    const rawCustom = options.customData || {};
    let app: 'Google Maps' | 'Waze' | 'Uber' = 'Google Maps';
    if (rawCustom.destination_app === 'Waze') app = 'Waze';
    else if (rawCustom.destination_app === 'Uber') app = 'Uber';

    let locLabel = 'Site';
    if (rawCustom.cta_location === 'Rodapé') locLabel = 'Rodapé';
    else if (rawCustom.cta_location === 'Contato' || rawCustom.cta_location === '/contato' || (typeof rawCustom.cta_location === 'string' && rawCustom.cta_location.toLowerCase().includes('contato'))) locLabel = 'Contato';

    sanitizedCustomData = {
      content_name: 'Clínica Nidô - Água Branca, São Paulo',
      content_category: 'Localização & Rota',
      currency: 'BRL',
      destination_app: app,
      cta_location: locLabel
    };
  }
  initializePixel(finalUserData);
  const pixelMethod = eventName === 'WhatsAppFormOpen' ? 'trackCustom' : 'track';
  window.fbq?.(pixelMethod,eventName,sanitizedCustomData,{eventID:eventId});
  const body=JSON.stringify({eventName,eventId,eventTime:Math.floor(Date.now()/1000),eventSourceUrl:sanitizedUrl,customData:sanitizedCustomData,userData:finalUserData,marketingConsent:true});
  // Only retry the server copy. The browser event and CRM form are never repeated.
  for(let attempt=0;attempt<2;attempt++) {
    if(!hasMetaConsent()) break;
    try {
      const response=await fetch('/api/meta/conversion',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true});
      const result=await response.json();
      if(response.ok && result.success===true) break;
      if(attempt===0 && (response.status===429 || response.status>=500)) {await new Promise(resolve=>setTimeout(resolve,400));continue;}
      console.warn('[Meta CAPI] Evento não confirmado',response.status);break;
    } catch {
      if(attempt===0) {await new Promise(resolve=>setTimeout(resolve,400));continue;}
      console.warn('[Meta CAPI] Falha de rede');
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
 * Tracks a FindLocation event (e.g., clicking Google Maps, Waze, Uber or viewing address).
 */
export function trackMetaFindLocation(
  destinationApp = 'Google Maps',
  ctaLocation = 'Site'
): Promise<string> {
  const eventId = generateEventId('findlocation');
  return trackMetaEvent('FindLocation', {
    eventId,
    customData: {
      content_name: 'Clínica Nidô - Água Branca, São Paulo',
      destination_app: destinationApp,
      content_category: 'Localização & Rota',
      cta_location: ctaLocation
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
