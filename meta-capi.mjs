// Aggregate counters only: no event IDs, tokens, IPs or customer payloads.
const diagnosticStartedAt=new Date().toISOString();
const diagnosticEvents=Object.fromEntries(['PageView','ViewContent','Contact','WhatsAppFormOpen','FindLocation','Lead','Other'].map(name=>[name,{requests:0,attempts:0,cacheHits:0,inFlightReuses:0,acknowledged:0,eventsReceived:0,failures:0}]));
export function getMetaDispatchDiagnostics(){
 return {version:'nido-meta-dispatch-v1',scope:'current-process',startedAt:diagnosticStartedAt,events:structuredClone(diagnosticEvents)};
}
const acknowledgedEvents = new Map(); // key -> {timestamp}
const pendingPromises = new Map(); // key -> Promise

export async function sendMetaConversionEvent(payload, { 
  fetchFn = fetch, 
  token = process.env.META_CONVERSIONS_API_TOKEN, 
  pixelId = process.env.META_PIXEL_ID || '1002877629496230', 
  maxRetries = 3 
} = {}) {
  if (!token) {
    return { success: false, status: 503, error: 'CAPI token not configured' };
  }

  const eventObj = payload?.data?.[0] || {};
  const eventName = eventObj.event_name || 'event';
  const eventId = eventObj.event_id || 'no_id';
  const dedupeKey = `${pixelId}:${eventName}:${eventId}`;
  const counters=diagnosticEvents[Object.hasOwn(diagnosticEvents,eventName)?eventName:'Other'];
  counters.requests++;

  // Check TTL24h acknowledged cache
  const cached = acknowledgedEvents.get(dedupeKey);
  if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
    counters.cacheHits++;
    return { success: true, events_received: cached.events_received, cached: true };
  }

  // Prevent concurrent duplicate requests for the same eventId
  if (pendingPromises.has(dedupeKey)) {
    counters.inFlightReuses++;
    return pendingPromises.get(dedupeKey);
  }

  const promise = (async () => {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`;
    let attempt = 0;
    let lastError = null;

    for(const [key,value] of acknowledgedEvents) if(Date.now()-value.timestamp>=24*60*60*1000)acknowledgedEvents.delete(key);
    while (attempt < maxRetries) {
      attempt++;
      counters.attempts++;
      try {

        const response = await fetchFn(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000)
        });

        let data = {};
        try {
          data = await response.json();
        } catch {
          // ignore json parse error
        }

        if (response.ok && Number(data.events_received) > 0) {
          const eventsReceived = Number(data.events_received);
          counters.acknowledged++;
          counters.eventsReceived+=eventsReceived;
          acknowledgedEvents.set(dedupeKey, { timestamp: Date.now(), events_received: eventsReceived });
          pendingPromises.delete(dedupeKey);
          return {
            success: true,
            status: response.status,
            events_received: eventsReceived,
            fbtrace_id: data.fbtrace_id
          };
        }

        // Permanent client error (4xx except 429) should not retry
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          pendingPromises.delete(dedupeKey);
          counters.failures++;
          return {
            success: false,
            status: response.status === 400 ? 400 : 502,
            error: `Client error rejected by Meta (HTTP ${response.status})`
          };
        }

        lastError = new Error(`Meta CAPI HTTP ${response.status}`);
      } catch (err) {
        lastError = err;
      }

      if (attempt < maxRetries) {
        await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 100));
      }
    }

    pendingPromises.delete(dedupeKey);
    counters.failures++;
    return {
      success: false,
      status: 503,
      error: 'Meta CAPI delivery was not acknowledged'
    };
  })();

  pendingPromises.set(dedupeKey, promise);
  return promise;
}
