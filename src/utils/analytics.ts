import { trackMetaContact, trackMetaEvent } from './metaConversions';

// Custom analytics tracking helper compliant with LGPD, GA4, and Meta CAPI
interface TrackingPayload {
  service_name?: string;
  page_path?: string;
  cta_location?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, payload?: TrackingPayload): void {
  // Check if user has given consent for analytics (strict LGPD: false until explicit consent)
  const consentSetting = typeof localStorage !== 'undefined' ? localStorage.getItem('nido_cookie_consent') : null;
  const isConsentGiven = consentSetting ? JSON.parse(consentSetting)?.analytics === true : false;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics Event] ${eventName}:`, payload);
  }

  if (typeof window !== 'undefined' && isConsentGiven) {
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...payload,
        timestamp: new Date().toISOString()
      });
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }

    // Direct Meta Pixel & Conversions API integration
    if (eventName === 'whatsapp_click') {
      if (!payload?.skipMetaContact) {
        trackMetaContact(payload?.service_name, payload?.cta_location);
      }
    } else {
      trackMetaEvent(eventName, {
        customData: payload
      });
    }
  }
}
