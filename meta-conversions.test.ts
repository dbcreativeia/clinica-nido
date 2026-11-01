import test from 'node:test';
import assert from 'node:assert/strict';
import { getOrCreateFbc, sanitizeEventUrl, trackMetaEvent } from './src/utils/metaConversions.ts';

test('1. new fbclid updates cookie and localStorage', () => {
  let cookies = '';
  const storage = new Map();
  global.document = {
    get cookie() { return cookies; },
    set cookie(val) { cookies = val; }
  } as any;
  global.localStorage = {
    getItem: (k: string) => storage.get(k) || null,
    setItem: (k: string, v: string) => storage.set(k, v),
    removeItem: (k: string) => storage.delete(k),
    clear: () => storage.clear(),
    key: () => null,
    length: storage.size
  } as any;
  global.window = {
    location: { search: '?fbclid=test123abc', hostname: 'nidoestetica.com.br' },
    localStorage: global.localStorage
  } as any;

  global.localStorage.setItem('nido_cookie_consent',JSON.stringify({meta:true,timestamp:Date.now()}));
  const fbc = getOrCreateFbc();
  assert.match(fbc || '', /^fb\.1\.\d+\.test123abc$/);
  assert.equal(storage.get('nido_fbc'), fbc);
});

test('2. same click preserves timestamp', () => {
  let cookies = '_fbc=fb.1.1000000000000.test123abc';
  const storage = new Map([['nido_fbc', 'fb.1.1000000000000.test123abc']]);
  global.document = {
    get cookie() { return cookies; },
    set cookie(val) { cookies = val; }
  } as any;
  global.window = {
    location: { search: '?fbclid=test123abc', hostname: 'nidoestetica.com.br' },
    localStorage: {
      getItem: (k: string) => storage.get(k) || null,
      setItem: (k: string, v: string) => storage.set(k, v)
    }
  } as any;

  global.localStorage.setItem('nido_cookie_consent',JSON.stringify({meta:true,timestamp:Date.now()}));
  const fbc = getOrCreateFbc();
  assert.equal(fbc, 'fb.1.1000000000000.test123abc');
});

test('3. direct visit without fbclid does not manufacture fbc', () => {
  let cookies = '';
  const storage = new Map();
  global.document = {
    get cookie() { return cookies; },
    set cookie(val) { cookies = val; }
  } as any;
  global.localStorage = {
    getItem: (k: string) => storage.get(k) || null,
    setItem: (k: string, v: string) => storage.set(k, v),
    removeItem: (k: string) => storage.delete(k),
    clear: () => storage.clear(),
    key: () => null,
    length: storage.size
  } as any;
  global.window = {
    location: { search: '', hostname: 'nidoestetica.com.br' },
    localStorage: global.localStorage
  } as any;

  global.localStorage.setItem('nido_cookie_consent',JSON.stringify({meta:true,timestamp:Date.now()}));
  const fbc = getOrCreateFbc();
  assert.equal(fbc, undefined);
});

test('4. consent denial blocks meta tracking', async () => {
  const storage = new Map([['nido_cookie_consent', JSON.stringify({ meta: false })]]);
  global.localStorage = {
    getItem: (k: string) => storage.get(k) || null,
    setItem: (k: string, v: string) => storage.set(k, v),
    removeItem: (k: string) => storage.delete(k),
    clear: () => storage.clear(),
    key: () => null,
    length: storage.size
  } as any;
  global.window = {
    location: { pathname: '/', hostname: 'nidoestetica.com.br' },
    localStorage: global.localStorage
  } as any;

  let fbqCalled = false;
  global.window.fbq = () => { fbqCalled = true; };

  const eventId = await trackMetaEvent('PageView');
  assert.equal(fbqCalled, false);
  assert.ok(eventId);
});

test('5. sanitizeEventUrl strips sensitive parameters', () => {
  const raw = 'https://www.nidoestetica.com.br/tratamentos?email=test@example.com&fbclid=abc123xyz&utm_source=meta';
  const sanitized = sanitizeEventUrl(raw);
  assert.equal(sanitized, 'https://www.nidoestetica.com.br/tratamentos?fbclid=abc123xyz&utm_source=meta');
});
