/**
 * Internal Site Analytics & Visitor Geo-Attribution Tracker for Clínica Nidô.
 * Monitors route clicks, treatment views, CTA clicks, and visitor location.
 */

export interface VisitorLocation {
  city: string;
  state: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
}

const GEO_STORAGE_KEY = 'nido_visitor_geo';
const VIEWED_TREATMENTS_KEY = 'nido_viewed_treatments';

/**
 * Prompts visitor for browser Geolocation API position on site entry or consent
 */
export function requestBrowserLocation(): Promise<VisitorLocation | null> {
  const fallbackLocation: VisitorLocation = {
    city: 'São Paulo',
    state: 'SP',
    neighborhood: 'Água Branca / Zona Oeste',
    latitude: -23.5234,
    longitude: -46.6875
  };

  if (typeof window === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(fallbackLocation);
  }

  return new Promise((resolve) => {
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          let neighborhood = 'Região Atribuída por GPS';
          let city = 'São Paulo';
          
          if (lat < -23.9) {
            city = 'Santos';
            neighborhood = 'Gonzaga / Orla';
          } else if (lat > -23.1) {
            city = 'Campinas';
            neighborhood = 'Cambuí / Centro';
          } else if (lng < -46.8) {
            city = 'Barueri';
            neighborhood = 'Alphaville & Tamboré';
          } else if (lng > -46.55) {
            city = 'Santo André';
            neighborhood = 'Bairro Jardim';
          } else {
            city = 'São Paulo';
            neighborhood = 'Água Branca / Zona Oeste';
          }

          const locationObj: VisitorLocation = {
            city,
            state: 'SP',
            neighborhood,
            latitude: lat,
            longitude: lng
          };

          try {
            sessionStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(locationObj));
          } catch {
            // Ignore storage error
          }
          resolve(locationObj);
        },
        (_err) => {
          // Graceful handling when browser/iframe permission policy restricts raw Geolocation
          try {
            sessionStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(fallbackLocation));
          } catch {
            // Ignore
          }
          resolve(fallbackLocation);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } catch {
      // Permission policy or document restriction catch
      resolve(fallbackLocation);
    }
  });
}

/**
 * Resolves visitor geographic location using device GPS (navigator.geolocation)
 * with graceful fallback to IP-based location and cached in sessionStorage.
 */
export async function getVisitorLocation(): Promise<VisitorLocation> {
  if (typeof window === 'undefined') {
    return {
      city: 'São Paulo',
      state: 'SP',
      neighborhood: 'Água Branca',
      latitude: -23.5234,
      longitude: -46.6875
    };
  }

  // 1. Check existing session cache
  try {
    const cached = sessionStorage.getItem(GEO_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // If cached location has real GPS coordinates, reuse it
      if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
        return parsed;
      }
    }
  } catch {
    // Ignore storage parse error
  }

  // 2. Attempt real device GPS via HTML5 Geolocation API (high accuracy)
  if (navigator && 'geolocation' in navigator) {
    try {
      const gpsPosition = await new Promise<GeolocationPosition | null>((resolve) => {
        const timeoutId = setTimeout(() => resolve(null), 3500); // 3.5s timeout for snappy UX
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          () => {
            clearTimeout(timeoutId);
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 60000
          }
        );
      });

      if (gpsPosition && gpsPosition.coords) {
        const { latitude, longitude } = gpsPosition.coords;

        // Try reverse geocoding coordinates to get neighborhood and city (OpenStreetMap Nominatim)
        let resolvedCity = 'São Paulo';
        let resolvedState = 'SP';
        let resolvedNeighborhood = 'Localização GPS Exata';

        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } }
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            const addr = revData.address || {};
            resolvedCity = addr.city || addr.town || addr.municipality || 'São Paulo';
            resolvedState = addr.state_code || addr.state || 'SP';
            resolvedNeighborhood = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || 'Localização GPS';
          }
        } catch {
          // Keep default labels if reverse geocode fails
        }

        const exactGpsLocation: VisitorLocation = {
          city: resolvedCity,
          state: resolvedState,
          neighborhood: resolvedNeighborhood,
          latitude,
          longitude
        };

        try {
          sessionStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(exactGpsLocation));
        } catch {
          // Ignore storage error
        }

        return exactGpsLocation;
      }
    } catch {
      // Continue to IP fallback
    }
  }

  // 3. Fallback: Query backend IP-based geo detection
  try {
    const res = await fetch('/api/analytics/geo');
    const data = await res.json();
    if (data.success && data.city) {
      const geo: VisitorLocation = {
        city: data.city,
        state: data.state || 'SP',
        neighborhood: data.neighborhood || 'Água Branca',
        latitude: data.latitude || -23.5234,
        longitude: data.longitude || -46.6875
      };
      try {
        sessionStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(geo));
      } catch {
        // Ignore storage error
      }
      return geo;
    }
  } catch (err) {
    console.warn('[Geo Detection Fallback]', err);
  }

  const fallback: VisitorLocation = {
    city: 'São Paulo',
    state: 'SP',
    neighborhood: 'Água Branca / Perdizes',
    latitude: -23.5234,
    longitude: -46.6875
  };
  return fallback;
}

/**
 * Tracks route navigation clicks (menu links, anchor links, internal navigation)
 */
export async function trackRouteClick(routeName: string, label: string): Promise<void> {
  try {
    const loc = await getVisitorLocation();
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'route_click',
        name: routeName,
        label,
        pagePath: typeof window !== 'undefined' ? window.location.pathname : '/',
        city: loc.city,
        neighborhood: loc.neighborhood
      }),
      keepalive: true
    }).catch(() => {});
  } catch {
    // Non-blocking
  }
}

/**
 * Tracks treatment views and keeps a list of visited treatments for lead attribution
 */
export async function trackTreatmentView(treatmentName: string): Promise<void> {
  try {
    // Add to session list of viewed treatments
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(VIEWED_TREATMENTS_KEY);
        const list: string[] = stored ? JSON.parse(stored) : [];
        if (!list.includes(treatmentName)) {
          list.push(treatmentName);
          sessionStorage.setItem(VIEWED_TREATMENTS_KEY, JSON.stringify(list));
        }
      } catch {
        // Ignore storage error
      }
    }

    const loc = await getVisitorLocation();
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'treatment_view',
        name: treatmentName,
        label: `Visualizou: ${treatmentName}`,
        pagePath: typeof window !== 'undefined' ? window.location.pathname : '/',
        city: loc.city,
        neighborhood: loc.neighborhood
      }),
      keepalive: true
    }).catch(() => {});
  } catch {
    // Non-blocking
  }
}

/**
 * Gets the list of treatments this visitor inspected during their session
 */
export function getSessionViewedTreatments(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = sessionStorage.getItem(VIEWED_TREATMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Tracks CTA clicks (WhatsApp, Agendar, Como Chegar / Rotas)
 */
export async function trackCTAClick(label: string, location?: string): Promise<void> {
  try {
    const loc = await getVisitorLocation();
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'cta_click',
        label,
        pagePath: typeof window !== 'undefined' ? window.location.pathname : '/',
        city: loc.city,
        neighborhood: loc.neighborhood,
        metadata: { location }
      }),
      keepalive: true
    }).catch(() => {});
  } catch {
    // Non-blocking
  }
}
