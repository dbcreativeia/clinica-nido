import { validCoordinates } from './tracking-context.mjs';

const geoCache = new Map();

/**
 * Reverse geocodes GPS coordinates into human-readable address with city, state, neighborhood, and street.
 */
export async function reverseGeocodeCoordinates(latitude, longitude) {
  const numLat = Number(latitude);
  const numLon = Number(longitude);

  if (!validCoordinates(numLat, numLon)) {
    return null;
  }

  // Quantize coordinates to 4 decimal places (~11 meters) for cache lookup
  const cacheKey = `${numLat.toFixed(4)},${numLon.toFixed(4)}`;
  if (geoCache.has(cacheKey)) {
    return geoCache.get(cacheKey);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${numLat}&lon=${numLon}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ClinicaNidoCRM/1.0 (contato@nidoestetica.com.br)',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) {
      throw new Error(`Geocoder HTTP ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const city = addr.city || addr.town || addr.municipality || addr.city_district || addr.village || 'São Paulo';
    let state = 'SP';
    if (addr['ISO3166-2-lvl4'] && addr['ISO3166-2-lvl4'].startsWith('BR-')) {
      state = addr['ISO3166-2-lvl4'].replace('BR-', '');
    } else if (addr.state === 'São Paulo') {
      state = 'SP';
    } else if (addr.state) {
      state = addr.state.slice(0, 50);
    }

    const neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || addr.residential || 'Região Central';
    const road = addr.road || addr.pedestrian || addr.street || '';
    const houseNumber = addr.house_number || '';

    let displayAddress = '';
    if (road && houseNumber) {
      displayAddress = `${road}, ${houseNumber} - ${neighborhood}, ${city} - ${state}`;
    } else if (road) {
      displayAddress = `${road} - ${neighborhood}, ${city} - ${state}`;
    } else {
      displayAddress = `${neighborhood}, ${city} - ${state}`;
    }

    const result = {
      city,
      state,
      neighborhood,
      road,
      houseNumber,
      displayAddress,
      addressSource: 'geocoder'
    };

    geoCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('[Reverse Geocode Warning]', err instanceof Error ? err.message : String(err));
    // Fallback heuristic for São Paulo metropolitan coordinates
    if (numLat >= -24.0 && numLat <= -23.3 && numLon >= -47.0 && numLon <= -46.3) {
      const fallback = {
        city: 'São Paulo',
        state: 'SP',
        neighborhood: 'São Paulo (Região Metropolitana)',
        road: '',
        houseNumber: '',
        displayAddress: 'São Paulo - SP',
        addressSource: 'geocoder'
      };
      geoCache.set(cacheKey, fallback);
      return fallback;
    }
    return null;
  }
}
