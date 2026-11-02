/**
 * Internal Site Analytics & Visitor Attribution Tracker for Clínica Nidô.
 * Monitors route clicks, page views, treatment views, CTA clicks, and visitor location with MySQL persistence.
 */

import { getStoredTrafficAttribution, initTrafficAttribution } from './trafficSource.ts';
import {hasCrmLocationConsent} from './privacyConsent.ts';
import { normalizeLocation } from '../../tracking-context.mjs';
import { TREATMENTS } from '../data/treatments.ts';
import { TECHNOLOGIES } from '../data/technologies.ts';
import { trackMetaFindLocation } from './metaConversions.ts';

export interface VisitorLocation {
  city: string;
  state: string;
  neighborhood: string;
  latitude?: number;
  longitude?: number;
  geoConsent?: boolean;
  locationSource?: string;
  locationCapturedAt?: string | null;
  accuracy?: number;
}

const GEO_STORAGE_KEY = 'nido_visitor_geo';
const VIEWED_TREATMENTS_KEY = 'nido_viewed_treatments';
const SESSION_JOURNEY_KEY = 'nido_session_journey';
const CONSENT_DURATION_MS = 180 * 24 * 60 * 60 * 1000;

// Construct catalog map for resolving routes to official treatment/technology names
const CATALOG_MAP = new Map<string, string>();
if (Array.isArray(TREATMENTS)) {
  for (const t of TREATMENTS) {
    if (t && t.slug && t.name) CATALOG_MAP.set(t.slug.toLowerCase(), t.name);
  }
}
if (Array.isArray(TECHNOLOGIES)) {
  for (const tech of TECHNOLOGIES) {
    if (tech && tech.slug && tech.name) CATALOG_MAP.set(tech.slug.toLowerCase(), tech.name);
  }
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const consentSetting = localStorage.getItem('nido_cookie_consent');
    if (!consentSetting) return false;
    const parsed = JSON.parse(consentSetting);
    if (parsed.analytics !== true) return false;

    const timestamp = typeof parsed.timestamp === 'number' ? parsed.timestamp : 0;
    const now = Date.now();

    // Strict timestamp validation: 0 < timestamp <= now
    if (timestamp <= 0 || timestamp > now) {
      return false;
    }

    const expiresAt = typeof parsed.expiresAt === 'number' ? parsed.expiresAt : (timestamp + CONSENT_DURATION_MS);

    if (now > expiresAt || (now - timestamp) > CONSENT_DURATION_MS) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return 'v_server';
  try {
    let vid = localStorage.getItem('nido_visitor_id');
    if (!vid) {
      vid = `v_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('nido_visitor_id', vid);
    }
    return vid;
  } catch {
    return `v_temp_${Date.now()}`;
  }
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 's_server';
  try {
    let sid = sessionStorage.getItem('nido_session_id');
    if (!sid) {
      sid = `s_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem('nido_session_id', sid);
    }
    return sid;
  } catch {
    return `s_temp_${Date.now()}`;
  }
}

export function isIgnoredPath(pathname: string): boolean {
  if (!pathname) return false;
  const lower = pathname.toLowerCase();
  if (
    lower.startsWith('/admin') || 
    lower.includes('#admin') || 
    lower === '/admin-crm' || 
    lower === '/login'
  ) {
    return true;
  }
  if (typeof window !== 'undefined' && window.location.hash === '#admin') {
    return true;
  }
  return false;
}

export function requestBrowserLocation(options: {storeInCrm?:boolean} = {}): Promise<VisitorLocation | null> {
  const store=options.storeInCrm===true;
  if (typeof window==='undefined' || !navigator.geolocation || (store&&!hasCrmLocationConsent())) return Promise.resolve(null);
  return new Promise(resolve=>{
    try {navigator.geolocation.getCurrentPosition(pos=>{
      const loc:VisitorLocation={city:'Não informada',state:'Não informada',neighborhood:'Não informada',latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy,geoConsent:store&&hasCrmLocationConsent(),locationSource:'browser_gps',locationCapturedAt:new Date().toISOString()};
      if(store&&hasCrmLocationConsent()){
        try{sessionStorage.setItem(GEO_STORAGE_KEY,JSON.stringify(loc));}catch{}
        window.dispatchEvent(new CustomEvent('nido:location-changed'));
      }
      resolve(loc);
    },()=>{if(store)clearVisitorLocation();resolve(null);},{timeout:10000,enableHighAccuracy:false,maximumAge:0});}
    catch{if(store)clearVisitorLocation();resolve(null);}
  });
}

export function clearVisitorLocation(): void {
  try { sessionStorage.removeItem(GEO_STORAGE_KEY); } catch {}
}

export function getCurrentVisitorLocation(): VisitorLocation {
  try {
    if (!hasCrmLocationConsent()) {
      clearVisitorLocation();
      return normalizeLocation({});
    }
    return normalizeLocation(JSON.parse(sessionStorage.getItem(GEO_STORAGE_KEY) || '{}'));
  } catch { return normalizeLocation({}); }
}

export async function getVisitorLocation(): Promise<VisitorLocation> {
  const fallback: VisitorLocation = {
    city: 'Não informada',
    state: 'Não informada',
    neighborhood: 'Não informada'
  };

  if (typeof window === 'undefined') return fallback;

  return getCurrentVisitorLocation();
}

function generateShortEventId(prefix: string): string {
  const shortSession = getSessionId().replace(/[^a-z0-9]/gi, '').slice(-6);
  const timeStr = Date.now().toString(36);
  const randStr = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${shortSession}_${timeStr}_${randStr}`;
}

export function sendAnalyticsEventPayload(payload: Record<string, unknown>, useBeacon = false): void {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return;
  const pagePath = String(payload.pagePath || window.location.pathname);
  if (isIgnoredPath(pagePath)) return;

  const attribution = initTrafficAttribution();
  const location = getCurrentVisitorLocation();
  const isPreview = !['nidoestetica.com.br', 'www.nidoestetica.com.br'].includes(window.location.hostname.toLowerCase());

  const body = JSON.stringify({
    ...payload,
    ...location,
    attribution,
    trafficChannel: payload.trafficChannel || attribution?.channel || 'Direto',
    trafficSource: payload.trafficSource || attribution?.source || 'direto',
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    isPreview
  });

  if (useBeacon && navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon('/api/analytics/event', blob)) return;
    } catch {}
  }

  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => {});
}

let currentPagePath = '';
let pageEventId = '';
let accumulatedMs = 0;
let activeSince: number | null = null;
let heartbeatInterval: any = null;

function getActiveDurationSeconds(): number {
  const now = Date.now();
  const currentActiveMs = accumulatedMs + (activeSince === null ? 0 : Math.max(0, now - activeSince));
  return Math.max(1, Math.round(currentActiveMs / 1000));
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

function startHeartbeat() {
  stopHeartbeat();
  if (typeof window === 'undefined') return;
  heartbeatInterval = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible' && currentPagePath && pageEventId) {
      const seconds = getActiveDurationSeconds();
      sendAnalyticsEventPayload({
        type: 'page_view',
        eventId: pageEventId,
        pagePath: currentPagePath,
        durationSeconds: seconds
      }, false);
    }
  }, 30000);
  if (heartbeatInterval && typeof heartbeatInterval.unref === 'function') {
    heartbeatInterval.unref();
  }
}

export function flushCurrentDuration(): void {
  if (currentPagePath && pageEventId) {
    const seconds = getActiveDurationSeconds();
    try {
      const journey=JSON.parse(sessionStorage.getItem(SESSION_JOURNEY_KEY)||'null');
      const last=journey?.steps?.[journey.steps.length-1];
      if(last?.path===currentPagePath) {last.durationSeconds=seconds;sessionStorage.setItem(SESSION_JOURNEY_KEY,JSON.stringify(journey));}
    } catch {}
    sendAnalyticsEventPayload({
      type: 'page_view',
      eventId: pageEventId,
      pagePath: currentPagePath,
      durationSeconds: seconds
    }, true);
  }
}

export function recordRouteNavigation(newPath: string, newTitle: string): void {
  if (typeof window === 'undefined' || isIgnoredPath(newPath)) return;
  if (!hasAnalyticsConsent()) return;

  // StrictMode deduplication: ONLY ignore if navigating to the exact same currentPagePath that is ALREADY active with pageEventId
  if (newPath === currentPagePath && pageEventId !== '') {
    return;
  }

  // Flush duration of previous page if active
  if (currentPagePath && pageEventId) {
    flushCurrentDuration();
  }

  // Reset active counters for new page
  currentPagePath = newPath;
  accumulatedMs = 0;
  activeSince = Date.now();
  pageEventId = generateShortEventId('pv');

  let loc: VisitorLocation | null = null;
  try {
    const storedGeo = sessionStorage.getItem(GEO_STORAGE_KEY);
    if (storedGeo) loc = JSON.parse(storedGeo);
  } catch {}

  sendAnalyticsEventPayload({
    type: 'page_view',
    eventId: pageEventId,
    pagePath: newPath,
    label: newTitle || newPath,
    city: loc?.city || 'Não informada',
    state: loc?.state || 'Não informada',
    neighborhood: loc?.neighborhood || 'Não informada',
    durationSeconds: 0
  });

  // Check if this route belongs to a treatment or technology page and trigger treatment_view once per pageview
  const lower = newPath.toLowerCase();
  if (lower.startsWith('/tratamentos/') || lower.startsWith('/tecnologias/')) {
    const slug = lower.replace(/^\/(tratamentos|tecnologias)\//, '').split('?')[0].split('#')[0];
    const treatmentName = CATALOG_MAP.get(slug) || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    trackTreatmentView(treatmentName);
  }

  // Maintain local session journey for lead capture modal
  try {
    const now = Date.now();
    const raw = sessionStorage.getItem(SESSION_JOURNEY_KEY);
    const journey = raw ? JSON.parse(raw) : {
      startedAt: new Date().toISOString(),
      totalDurationSeconds: 0,
      totalPageViews: 0,
      steps: [],
      ...detectDeviceInfo()
    };
    
    journey.steps.push({ path: newPath, title: newTitle || newPath, enteredAt: now, durationSeconds: 0 });
    journey.totalPageViews = journey.steps.length;
    sessionStorage.setItem(SESSION_JOURNEY_KEY, JSON.stringify(journey));
  } catch {}

  startHeartbeat();
}

export function trackRouteClick(routeName: string, label: string): void {
  if (isIgnoredPath(routeName) || !hasAnalyticsConsent()) return;
  const eventId = generateShortEventId('rc');
  sendAnalyticsEventPayload({
    type: 'route_click',
    eventId,
    name: routeName,
    label: label || routeName,
    pagePath: typeof window !== 'undefined' ? window.location.pathname : '/'
  });
}

export function trackTreatmentView(treatmentName: string): void {
  if (!hasAnalyticsConsent()) return;
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(VIEWED_TREATMENTS_KEY);
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(treatmentName)) {
        list.push(treatmentName);
        sessionStorage.setItem(VIEWED_TREATMENTS_KEY, JSON.stringify(list));
      }
    } catch {}
  }

  const eventId = generateShortEventId('tv');
  sendAnalyticsEventPayload({
    type: 'treatment_view',
    eventId,
    name: treatmentName,
    label: `Visualizou: ${treatmentName}`,
    pagePath: typeof window !== 'undefined' ? window.location.pathname : '/'
  });
}

export function trackCTAClick(label: string, location?: string): void {
  if (!hasAnalyticsConsent()) return;
  const eventId = generateShortEventId('cta');
  sendAnalyticsEventPayload({
    type: 'cta_click',
    eventId,
    label,
    name: location || '',
    pagePath: typeof window !== 'undefined' ? window.location.pathname : '/'
  });
}

export function getSessionViewedTreatments(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = sessionStorage.getItem(VIEWED_TREATMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export interface PageVisitStep {
  path: string;
  title: string;
  enteredAt: number;
  durationSeconds: number;
}

export interface SessionJourney {
  startedAt: string;
  totalDurationSeconds: number;
  totalPageViews: number;
  steps: PageVisitStep[];
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
  browser: string;
}

export function detectDeviceInfo(): { deviceType: 'Mobile' | 'Desktop' | 'Tablet'; browser: string } {
  if (typeof window === 'undefined') return { deviceType: 'Desktop', browser: 'Unknown' };
  const ua = navigator.userAgent || '';
  let deviceType: 'Mobile' | 'Desktop' | 'Tablet' = 'Desktop';
  if (/iPad|tablet/i.test(ua)) deviceType = 'Tablet';
  else if (/Mobi|Android|iPhone/i.test(ua)) deviceType = 'Mobile';

  let browser = 'Navegador Web';
  if (ua.includes('Instagram')) browser = 'Instagram In-App Browser';
  else if (ua.includes('FBAN') || ua.includes('FBAV')) browser = 'Facebook In-App Browser';
  else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Google Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Apple Safari';
  else if (ua.includes('Edg')) browser = 'Microsoft Edge';
  else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';

  return { deviceType, browser };
}

export function getSessionJourney(): SessionJourney {
  const fallback: SessionJourney = {
    startedAt: new Date().toISOString(),
    totalDurationSeconds: 0,
    totalPageViews: 1,
    steps: [{ path: currentPagePath || '/', title: 'Início', enteredAt: Date.now(), durationSeconds: 0 }],
    ...detectDeviceInfo()
  };

  if (typeof window === 'undefined') return fallback;

  try {
    const raw = sessionStorage.getItem(SESSION_JOURNEY_KEY);
    const journey: SessionJourney = raw ? JSON.parse(raw) : fallback;

    const activeSecs = getActiveDurationSeconds();
    if (journey.steps.length > 0) {
      const last = journey.steps[journey.steps.length - 1];
      if (last.path === currentPagePath) {
        last.durationSeconds = Math.max(last.durationSeconds || 0, activeSecs);
      }
    }

    journey.totalDurationSeconds = journey.steps.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
    journey.totalPageViews = journey.steps.length;
    const device = detectDeviceInfo();
    journey.deviceType = device.deviceType;
    journey.browser = device.browser;

    return journey;
  } catch {
    return fallback;
  }
}

export function detectLocationApp(
  clickable: HTMLElement,
  href: string
): 'Google Maps' | 'Waze' | 'Uber' | null {
  if (!clickable) return null;

  // 1. Check explicit data-location-app attribute on element or parent
  const dataAttr = clickable.getAttribute('data-location-app') || clickable.closest('[data-location-app]')?.getAttribute('data-location-app');
  if (dataAttr) {
    const attrLower = dataAttr.trim().toLowerCase();
    if (attrLower === 'waze') return 'Waze';
    if (attrLower === 'uber') return 'Uber';
    if (attrLower.includes('maps') || attrLower === 'google maps' || attrLower === 'google_maps') return 'Google Maps';
  }

  // 2. Strict URL / Domain / Hostname classification
  if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))) {
    try {
      const urlString = href.startsWith('//') ? `https:${href}` : href;
      const url = new URL(urlString);
      const host = url.hostname.toLowerCase();
      const path = url.pathname.toLowerCase();

      // Waze domain matching
      if (host === 'waze.com' || host.endsWith('.waze.com')) {
        return 'Waze';
      }

      // Uber domain matching
      if (host === 'uber.com' || host.endsWith('.uber.com')) {
        return 'Uber';
      }

      // Google Maps domain & path matching
      if (host === 'maps.google.com' || host === 'maps.app.goo.gl' || host === 'goo.gl') {
        return 'Google Maps';
      }
      if ((host === 'google.com' || host.endsWith('.google.com') || host.endsWith('.google.com.br')) && (path.startsWith('/maps') || url.searchParams.has('query'))) {
        return 'Google Maps';
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  return null;
}

function setupGlobalListeners() {
  if (typeof window === 'undefined') return;

  // Listen for consent changes dynamically without requiring reload
  window.addEventListener('nido:analytics-consent-changed', () => {
    if (hasAnalyticsConsent()) {
      if (!currentPagePath) {
        recordRouteNavigation(window.location.pathname, document.title);
      } else {
        activeSince = Date.now();
        startHeartbeat();
        // Trigger treatment view if current path is a treatment/technology page
        const lower = currentPagePath.toLowerCase();
        if (lower.startsWith('/tratamentos/') || lower.startsWith('/tecnologias/')) {
          const slug = lower.replace(/^\/(tratamentos|tecnologias)\//, '').split('?')[0].split('#')[0];
          const treatmentName = CATALOG_MAP.get(slug) || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          trackTreatmentView(treatmentName);
        }
      }
    } else {
      activeSince = null;
      accumulatedMs = 0;
      stopHeartbeat();
    }
  });

  // Handle tab visibility changes to pause duration while hidden
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (activeSince !== null) {
        accumulatedMs += Math.max(0, Date.now() - activeSince);
        activeSince = null;
      }
      stopHeartbeat();
      flushCurrentDuration();
    } else if (document.visibilityState === 'visible' && hasAnalyticsConsent()) {
      activeSince = Date.now();
      startHeartbeat();
    }
  });

  window.addEventListener('pagehide', () => {
    if (activeSince !== null) {
      accumulatedMs += Math.max(0, Date.now() - activeSince);
      activeSince = null;
    }
    flushCurrentDuration();
    stopHeartbeat();
  });

  // Delegated click listener for links & CTA buttons
  document.addEventListener('click', (ev) => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (isIgnoredPath(currentPath)) return;

    const target = ev.target as HTMLElement | null;
    if (target?.closest('[data-analytics-ignore]')) return;
    if (!target) return;

    // Skip form inputs, textareas, selects
    const tag = target.tagName.toLowerCase();
    if (['input', 'textarea', 'select', 'option'].includes(tag)) return;

    const clickable = target.closest('a, button, [role="button"]') as HTMLElement | null;
    if (!clickable) return;

    const rawLabel = (
      clickable.getAttribute('aria-label') || 
      clickable.getAttribute('title') || 
      clickable.innerText || 
      ''
    ).replace(/\s+/g, ' ').trim().slice(0, 80);

    const href = clickable.getAttribute('href') || '';
    const locationApp = detectLocationApp(clickable, href);

    // Meta FindLocation tracking (governed independently by hasMetaConsent in trackMetaFindLocation)
    if (locationApp) {
      try {
        trackMetaFindLocation(locationApp, currentPath);
      } catch {
        // Safe execution, never blocks navigation
      }
    }

    // Internal Analytics tracking (governed strictly by hasAnalyticsConsent)
    if (hasAnalyticsConsent()) {
      if (href) {
        if (href.startsWith('http') || href.startsWith('//')) {
          const lowerHref = href.toLowerCase();
          if (lowerHref.includes('wa.me') || lowerHref.includes('whatsapp') || locationApp) {
            trackCTAClick(locationApp ? `Rota ${locationApp}` : (rawLabel || 'Contato Externo'), href);
          } else {
            trackRouteClick(href, rawLabel || href);
          }
        } else if (href.startsWith('/') || href.startsWith('#')) {
          const cleanPath = href.split('?')[0].split('#')[0];
          if (cleanPath && !isIgnoredPath(cleanPath)) {
            trackRouteClick(cleanPath, rawLabel || cleanPath);
          }
        }
      } else if (clickable.tagName.toLowerCase() === 'button' || clickable.getAttribute('role') === 'button') {
        const buttonType = clickable.getAttribute('type');
        if (buttonType !== 'submit' && rawLabel) {
          trackCTAClick(rawLabel, currentPath);
        }
      }
    }
  });
}

// Auto-run global listeners on client import
if (typeof window !== 'undefined') {
  setupGlobalListeners();
}
