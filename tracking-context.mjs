export const UNKNOWN_LOCATION = 'Não informada';
const text = (value, max = 255) => typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, '').trim().slice(0, max) : '';
export function knownParameter(value) {
  const cleaned = text(value);
  return /[{}]/.test(cleaned) ? '' : cleaned;
}
export function validCoordinates(latitude, longitude) {
  return typeof latitude === 'number' && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
    typeof longitude === 'number' && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}
// Old coordinates have no trustworthy provenance: never turn them into map points.
export function normalizeLocation(input = {}, checkAge = true) {
  const unknown = {city:UNKNOWN_LOCATION,state:UNKNOWN_LOCATION,neighborhood:UNKNOWN_LOCATION,
    geoConsent:false,locationSource:'unknown',locationCapturedAt:null,latitude:undefined,longitude:undefined,accuracy:undefined};
  const captured = Date.parse(input.locationCapturedAt || '');
  if (input.geoConsent !== true || input.locationSource !== 'browser_gps' || !Number.isFinite(captured) ||
      captured > Date.now() || (checkAge && Date.now()-captured > 24*60*60*1000) ||
      !validCoordinates(input.latitude,input.longitude)) return unknown;
  return {...unknown,geoConsent:true,locationSource:'browser_gps',locationCapturedAt:new Date(captured).toISOString(),
    latitude:input.latitude,longitude:input.longitude,
    accuracy:typeof input.accuracy==='number' && Number.isFinite(input.accuracy) && input.accuracy>=0 ? input.accuracy : undefined,
    // Address labels require a real geocoding provider. Coordinates alone do not identify a city.
    city:input.addressSource==='geocoder' ? text(input.city,100)||UNKNOWN_LOCATION : UNKNOWN_LOCATION,
    state:input.addressSource==='geocoder' ? text(input.state,50)||UNKNOWN_LOCATION : UNKNOWN_LOCATION,
    neighborhood:input.addressSource==='geocoder' ? text(input.neighborhood,100)||UNKNOWN_LOCATION : UNKNOWN_LOCATION};
}
export function normalizeAttribution(input = {}) {
  return Object.fromEntries(['campaignId','adSet','adSetId','adName','adId','placement','keyword',
    'campaign','source','medium','content','term','visitorId','sessionId'].map(key=>[key,knownParameter(input[key])]));
}
export function parseContext(value) {
  try { return typeof value==='string' ? JSON.parse(value) || {} : value || {}; } catch { return {}; }
}
