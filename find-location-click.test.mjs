import test from 'node:test';
import assert from 'node:assert/strict';
import { detectLocationApp } from './src/utils/internalAnalytics.ts';
import { trackMetaFindLocation, trackMetaViewContent } from './src/utils/metaConversions.ts';

function createMockElement(tagName, attrs = {}, parent = null, children = []) {
  const el = {
    tagName: tagName.toUpperCase(),
    getAttribute: (name) => attrs[name] || null,
    closest: (selector) => {
      let curr = el;
      while (curr) {
        const selectors = selector.split(',').map(s => s.trim().toLowerCase());
        for (const sel of selectors) {
          if (sel === 'a' && curr.tagName === 'A') return curr;
          if (sel === 'button' && curr.tagName === 'BUTTON') return curr;
          if (sel === '[role="button"]' && curr.getAttribute('role') === 'button') return curr;
          if (sel === '[data-location-app]' && curr.getAttribute('data-location-app')) return curr;
          if (sel === '[data-analytics-ignore]' && curr.getAttribute('data-analytics-ignore')) return curr;
        }
        curr = curr.parent;
      }
      return null;
    },
    parent,
    children: []
  };
  el.children = children.map(c => {
    if (typeof c === 'string') {
      return { tagName: '#TEXT', textContent: c, parent: el, closest: (s) => el.closest(s) };
    }
    c.parent = el;
    return c;
  });
  return el;
}

function setupEnvironment(consent) {
  const storage = new Map();
  if (consent) {
    storage.set('nido_cookie_consent', JSON.stringify(consent));
  }
  
  globalThis.localStorage = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, v),
    removeItem: (k) => storage.delete(k)
  };

  let cookie = '';
  globalThis.document = {
    get cookie() { return cookie; },
    set cookie(v) { cookie = v; },
    createElement: (tag) => ({ tagName: tag.toUpperCase(), src: '', async: false }),
    head: { appendChild: () => {} }
  };

  const fetchCalls = [];
  globalThis.fetch = async (url, opts) => {
    fetchCalls.push({ url, body: opts?.body ? JSON.parse(opts.body) : null });
    return { ok: true, json: async () => ({ success: true }) };
  };

  globalThis.window = {
    location: {
      hostname: 'www.nidoestetica.com.br',
      pathname: '/contato',
      search: '?fbclid=abc123xyz',
      href: 'https://www.nidoestetica.com.br/contato',
      protocol: 'https:'
    },
    localStorage: globalThis.localStorage,
    fetch: globalThis.fetch
  };

  return { fetchCalls };
}

test('1. detectLocationApp accurately classifies Maps, Waze, and Uber without generic label fallback', () => {
  const wazeLink = createMockElement('a', { href: 'https://www.waze.com/ul?q=Nido' });
  assert.equal(detectLocationApp(wazeLink, 'https://www.waze.com/ul?q=Nido'), 'Waze');

  const uberLink = createMockElement('a', { href: 'https://m.uber.com/ul/?action=setPickup' });
  assert.equal(detectLocationApp(uberLink, 'https://m.uber.com/ul/?action=setPickup'), 'Uber');

  const gmapsLink = createMockElement('a', { href: 'https://www.google.com/maps/search/?api=1&query=Nido' });
  assert.equal(detectLocationApp(gmapsLink, 'https://www.google.com/maps/search/?api=1&query=Nido'), 'Google Maps');

  const explicitBtn = createMockElement('button', { 'data-location-app': 'Waze' });
  assert.equal(detectLocationApp(explicitBtn, ''), 'Waze');

  const whatsappLink = createMockElement('a', { href: 'https://wa.me/5511963836050' });
  assert.equal(detectLocationApp(whatsappLink, 'https://wa.me/5511963836050'), null);

  const genericAddressLink = createMockElement('a', { href: 'https://example.com/endereco' });
  assert.equal(detectLocationApp(genericAddressLink, 'https://example.com/endereco'), null);
});

test('2. analytics=false / meta=true: FindLocation sent to Meta CAPI, internal analytics suppressed', async () => {
  const { fetchCalls } = setupEnvironment({
    meta: true,
    timestamp: Date.now()
  });

  const eventId = await trackMetaFindLocation('Waze', '/contato');
  assert.ok(eventId);

  const metaEvents = fetchCalls.filter(c => c.url === '/api/meta/conversion');
  const analyticsEvents = fetchCalls.filter(c => c.url === '/api/analytics/event');

  assert.equal(metaEvents.length, 1);
  assert.equal(metaEvents[0].body.eventName, 'FindLocation');
  assert.equal(metaEvents[0].body.customData.destination_app, 'Waze');
  assert.equal(metaEvents[0].body.customData.cta_location, 'Contato');
  assert.equal(analyticsEvents.length, 0);
});

test('3. analytics=true / meta=false: internal analytics allowed, Meta FindLocation blocked', async () => {
  const { fetchCalls } = setupEnvironment({
    analytics: true,
    meta: false,
    timestamp: Date.now()
  });

  await trackMetaFindLocation('Google Maps', '/contato');

  const metaEvents = fetchCalls.filter(c => c.url === '/api/meta/conversion');
  assert.equal(metaEvents.length, 0);
});

test('4. analytics=false / meta=false: both Meta FindLocation and internal analytics blocked', async () => {
  const { fetchCalls } = setupEnvironment({
    analytics: false,
    meta: false,
    timestamp: Date.now()
  });

  await trackMetaFindLocation('Uber', '/contato');

  const metaEvents = fetchCalls.filter(c => c.url === '/api/meta/conversion');
  const analyticsEvents = fetchCalls.filter(c => c.url === '/api/analytics/event');

  assert.equal(metaEvents.length, 0);
  assert.equal(analyticsEvents.length, 0);
});

test('5. Child icon element resolves parent clickable and returns valid location app', () => {
  const parentAnchor = createMockElement('a', {
    href: 'https://www.waze.com/ul?navigate=yes',
    'data-location-app': 'Waze'
  });
  const childSvg = createMockElement('svg', {}, parentAnchor);

  const clickable = childSvg.closest('a, button, [role="button"]');
  assert.equal(clickable, parentAnchor);

  const detected = detectLocationApp(clickable, parentAnchor.getAttribute('href'));
  assert.equal(detected, 'Waze');
});

test('6. FindLocation sanitizes destination_app and maps free path to fixed institutional cta_location', async () => {
  const { fetchCalls } = setupEnvironment({
    meta: true,
    timestamp: Date.now()
  });

  // Attempt to pass invalid app name and free treatment path
  await trackMetaFindLocation('InvalidApp', '/tratamentos/endoslim');

  const metaEvents = fetchCalls.filter(c => c.url === '/api/meta/conversion');
  assert.equal(metaEvents.length, 1);
  const cd = metaEvents[0].body.customData;
  assert.equal(cd.destination_app, 'Google Maps'); // fallback to approved enum
  assert.equal(cd.cta_location, 'Site'); // fixed institutional label, free treatment path stripped
});

test('7. ViewContent and generic non-FindLocation events preserve generic customData without clinical treatment names', async () => {
  const { fetchCalls } = setupEnvironment({
    meta: true,
    timestamp: Date.now()
  });

  // Pass clinical treatment name in trackMetaViewContent
  trackMetaViewContent('Endoslim - Gordura Localizada', 'Tratamentos');

  const metaEvents = fetchCalls.filter(c => c.url === '/api/meta/conversion');
  assert.equal(metaEvents.length, 1);
  const cd = metaEvents[0].body.customData;

  // Must equal generic institutional customData
  assert.equal(cd.content_name, 'Informações institucionais');
  assert.equal(cd.content_category, 'Site');
  assert.equal(cd.currency, 'BRL');
  assert.equal(JSON.stringify(cd).includes('Endoslim'), false);
});
