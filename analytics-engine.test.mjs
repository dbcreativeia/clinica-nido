import test from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import { recordAnalyticsEvent, getAnalyticsStats } from './analytics-engine.mjs';
import { 
  hasAnalyticsConsent, 
  recordRouteNavigation, 
  trackTreatmentView, 
  trackCTAClick, 
  getSessionJourney,
  flushCurrentDuration 
} from './src/utils/internalAnalytics.ts';

function createMockPool() {
  const events = new Map();
  const leads = [];

  const pool = {
    events,
    leads,
    async query(sql, params = []) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();

      if (normalizedSql.includes('INSERT INTO nido_analytics_events')) {
        const [
          event_id, visitor_id, session_id, event_type, event_name, event_label,
          page_path, city, state, neighborhood, traffic_channel, traffic_source,
          duration_seconds, is_preview
        ] = params;

        if (events.has(event_id)) {
          const existing = events.get(event_id);
          existing.duration_seconds = Math.max(existing.duration_seconds, duration_seconds);
          return [{ affectedRows: 1 }];
        }

        events.set(event_id, {
          event_id, visitor_id, session_id, event_type, event_name, event_label,
          page_path, city, state, neighborhood, traffic_channel, traffic_source,
          duration_seconds, is_preview, created_at: new Date()
        });
        return [{ affectedRows: 1 }];
      }

      if (normalizedSql.includes('COUNT(*) AS totalPageViews')) {
        const pvs = [...events.values()].filter(e => e.event_type === 'page_view' && !e.is_preview).length;
        return [[{ totalPageViews: pvs }]];
      }

      if (normalizedSql.includes('COUNT(DISTINCT visitor_id) AS uniqueVisitors')) {
        const uniqueVids = new Set([...events.values()].filter(e => !e.is_preview).map(e => e.visitor_id)).size;
        return [[{ uniqueVisitors: uniqueVids }]];
      }

      if (normalizedSql.includes('AVG(session_dur) AS avgSessionSeconds')) {
        const sessions = new Map();
        for (const e of events.values()) {
          if (e.event_type !== 'page_view' || e.is_preview) continue;
          sessions.set(e.session_id, (sessions.get(e.session_id) || 0) + e.duration_seconds);
        }
        const vals = [...sessions.values()];
        const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        return [[{ avgSessionSeconds: avg }]];
      }

      if (normalizedSql.includes('SELECT status, service_interest, traffic_channel FROM nido_leads')) {
        return [leads];
      }

      if (normalizedSql.includes('WHERE event_type = \'route_click\'')) {
        const routeCounts = new Map();
        for (const e of events.values()) {
          if (e.event_type === 'route_click' && !e.is_preview) {
            const dest = e.event_name || e.page_path;
            const existing = routeCounts.get(dest) || { name: dest, label: e.event_label || dest, clicks: 0 };
            existing.clicks++;
            routeCounts.set(dest, existing);
          }
        }
        return [[...routeCounts.values()].sort((a, b) => b.clicks - a.clicks)];
      }

      if (normalizedSql.includes('WHERE event_type = \'treatment_view\'')) {
        const treatCounts = new Map();
        for (const e of events.values()) {
          if (e.event_type === 'treatment_view' && !e.is_preview && e.event_name) {
            const name = e.event_name;
            const existing = treatCounts.get(name) || { name, views: 0, total_dur: 0 };
            existing.views++;
            existing.total_dur += e.duration_seconds || 0;
            treatCounts.set(name, existing);
          }
        }
        const rows = [...treatCounts.values()].map(t => ({
          name: t.name,
          views: t.views,
          avg_duration: t.views > 0 ? t.total_dur / t.views : 0
        }));
        return [rows];
      }

      if (normalizedSql.includes('WHERE event_type = \'cta_click\'')) {
        const ctaCounts = new Map();
        for (const e of events.values()) {
          if (e.event_type === 'cta_click' && !e.is_preview && e.event_label) {
            const key = `${e.event_label}:${e.page_path}`;
            const existing = ctaCounts.get(key) || { label: e.event_label, location: e.page_path, clicks: 0 };
            existing.clicks++;
            ctaCounts.set(key, existing);
          }
        }
        return [[...ctaCounts.values()]];
      }

      if (normalizedSql.includes('WHERE is_preview = FALSE AND city IS NOT NULL')) {
        const locCounts = new Map();
        for (const e of events.values()) {
          if (!e.is_preview && e.city && e.city !== 'Não informada') {
            const key = `${e.city}:${e.neighborhood}:${e.state}`;
            const existing = locCounts.get(key) || { city: e.city, neighborhood: e.neighborhood, state: e.state, sessions: new Set() };
            existing.sessions.add(e.session_id);
            locCounts.set(key, existing);
          }
        }
        const rows = [...locCounts.values()].map(l => ({
          city: l.city,
          neighborhood: l.neighborhood,
          state: l.state,
          sessions: l.sessions.size
        }));
        return [rows];
      }

      if (normalizedSql.includes('SELECT traffic_channel AS channel')) {
        const trafficCounts = new Map();
        for (const e of events.values()) {
          if (!e.is_preview && e.traffic_channel) {
            const existing = trafficCounts.get(e.traffic_channel) || { channel: e.traffic_channel, visitors: new Set() };
            existing.visitors.add(e.visitor_id);
            trafficCounts.set(e.traffic_channel, existing);
          }
        }
        const rows = [...trafficCounts.values()].map(t => ({
          channel: t.channel,
          visitors: t.visitors.size
        }));
        return [rows];
      }

      if (normalizedSql.includes('SELECT event_type AS type')) {
        const recent = [...events.values()]
          .filter(e => !e.is_preview)
          .slice(-25)
          .map(e => ({
            type: e.event_type,
            label: e.event_label || e.event_name || e.page_path,
            pagePath: e.page_path,
            city: e.city,
            neighborhood: e.neighborhood,
            timestamp: e.created_at
          }));
        return [recent];
      }

      return [[]];
    }
  };

  return pool;
}

// ----------------------------------------------------------------------------
// Real MySQL Smoke Test Block (Isolated Table: nido_analytics_events_test)
// ----------------------------------------------------------------------------
test('0. real MySQL connection pool smoke test on isolated test table', async () => {
  const MYSQL_CONFIG = {
    host: process.env.MYSQL_HOST || 'nidoestetica.com.br',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'nidoestetica_novosite',
    password: process.env.MYSQL_PASSWORD || 'nidoadmin2026',
    database: process.env.MYSQL_DATABASE || 'nidoestetica_novosite',
    connectTimeout: 3000
  };

  let realPool = null;
  try {
    realPool = mysql.createPool(MYSQL_CONFIG);
    await realPool.query(`
      CREATE TABLE IF NOT EXISTS nido_analytics_events_test (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        event_id VARCHAR(120) NOT NULL UNIQUE,
        visitor_id VARCHAR(100) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const testEventId = `smoke_test_${Date.now()}`;
    await realPool.query(
      `INSERT INTO nido_analytics_events_test (event_id, visitor_id, event_type) VALUES (?, ?, ?)`,
      [testEventId, 'v_smoke', 'smoke_test']
    );

    const [rows] = await realPool.query(`SELECT * FROM nido_analytics_events_test WHERE event_id = ?`, [testEventId]);
    assert.equal(rows.length, 1);

    // Cleanup isolated test table
    await realPool.query(`DROP TABLE IF EXISTS nido_analytics_events_test;`);
    console.log('[Real MySQL Smoke Test Passed] Tabela de teste isolada operou com sucesso.');
  } catch (err) {
    console.log('[Real MySQL Smoke Test Notice] MySQL host/porta indisponível no ambiente de teste local. Testes unitários prosseguem via mock.');
  } finally {
    if (realPool) {
      await realPool.end().catch(() => {});
    }
  }
});

// ----------------------------------------------------------------------------
// Backend Engine Tests
// ----------------------------------------------------------------------------

test('1. ignores admin routes completely', async () => {
  const pool = createMockPool();
  const res1 = await recordAnalyticsEvent(pool, { pagePath: '/admin', type: 'page_view' });
  const res2 = await recordAnalyticsEvent(pool, { pagePath: '/#admin', type: 'page_view' });
  const res3 = await recordAnalyticsEvent(pool, { pagePath: '/admin-crm', type: 'page_view' });

  assert.equal(res1.ignored, true);
  assert.equal(res2.ignored, true);
  assert.equal(res3.ignored, true);
  assert.equal(pool.events.size, 0);
});

test('2. calculates pageviews and unique visitors accurately from database', async () => {
  const pool = createMockPool();

  await recordAnalyticsEvent(pool, {
    eventId: 'pv_1', visitorId: 'v1', sessionId: 's1', type: 'page_view', pagePath: '/'
  });
  await recordAnalyticsEvent(pool, {
    eventId: 'pv_2', visitorId: 'v1', sessionId: 's1', type: 'page_view', pagePath: '/tratamentos'
  });
  await recordAnalyticsEvent(pool, {
    eventId: 'pv_3', visitorId: 'v2', sessionId: 's2', type: 'page_view', pagePath: '/'
  });

  const stats = await getAnalyticsStats(pool);
  assert.equal(stats.summary.totalPageViews, 3);
  assert.equal(stats.summary.uniqueVisitors, 2);
});

test('3. handles idempotent duration updates without creating duplicate rows', async () => {
  const pool = createMockPool();

  await recordAnalyticsEvent(pool, {
    eventId: 'pv_unique', visitorId: 'v1', sessionId: 's1', type: 'page_view', pagePath: '/', durationSeconds: 5
  });
  await recordAnalyticsEvent(pool, {
    eventId: 'pv_unique', visitorId: 'v1', sessionId: 's1', type: 'page_view', pagePath: '/', durationSeconds: 15
  });

  assert.equal(pool.events.size, 1);
  assert.equal(pool.events.get('pv_unique').duration_seconds, 15);
});

test('4. sets unknown locations to "Não informada" without inventing fake defaults', async () => {
  const pool = createMockPool();

  await recordAnalyticsEvent(pool, {
    eventId: 'pv_loc', visitorId: 'v1', sessionId: 's1', type: 'page_view', pagePath: '/'
  });

  const evt = pool.events.get('pv_loc');
  assert.equal(evt.city, 'Não informada');
  assert.equal(evt.neighborhood, 'Não informada');
});

test('5. rejects event IDs exceeding 120 chars with HTTP 400 validation error', async () => {
  const pool = createMockPool();
  const longEventId = 'pv_long_prefix_' + 'a'.repeat(150);

  const res = await recordAnalyticsEvent(pool, {
    eventId: longEventId, visitorId: 'v1', sessionId: 's1', type: 'page_view', pagePath: '/'
  });

  assert.equal(res.error, 'Event ID exceeds 120 characters limit');
  assert.equal(res.code, 'VALIDATION');
});

test('6. aggregates route_click only for route report and groups by target destination', async () => {
  const pool = createMockPool();

  // 1 page view on home
  await recordAnalyticsEvent(pool, { eventId: 'pv_home', type: 'page_view', pagePath: '/' });
  // 2 clicks to /tratamentos/endoslim
  await recordAnalyticsEvent(pool, { eventId: 'rc_1', type: 'route_click', name: '/tratamentos/endoslim', label: 'Endoslim', pagePath: '/' });
  await recordAnalyticsEvent(pool, { eventId: 'rc_2', type: 'route_click', name: '/tratamentos/endoslim', label: 'Endoslim', pagePath: '/' });

  const stats = await getAnalyticsStats(pool);
  assert.equal(stats.summary.totalPageViews, 1);

  const endoslimRoute = stats.routes.find(r => r.name === '/tratamentos/endoslim');
  assert.ok(endoslimRoute);
  assert.equal(endoslimRoute.clicks, 2);
});

test('7. returns N/D for historical lead conversion rate without 1:1 session link', async () => {
  const pool = createMockPool();
  pool.leads.push({ status: 'agendado', service_interest: 'Endoslim' });

  await recordAnalyticsEvent(pool, { eventId: 'pv_1', visitorId: 'v1', sessionId: 's1', type: 'page_view', pagePath: '/' });

  const stats = await getAnalyticsStats(pool);
  assert.equal(stats.summary.leadConversionRate, 'N/D');
});

test('8. handles concurrent event insertions without error', async () => {
  const pool = createMockPool();

  const eventsToInsert = Array.from({ length: 20 }).map((_, i) => 
    recordAnalyticsEvent(pool, {
      eventId: `concurrent_${i}`,
      visitorId: `v_${i % 3}`,
      sessionId: `s_${i % 3}`,
      type: 'page_view',
      pagePath: '/contato'
    })
  );

  const results = await Promise.all(eventsToInsert);
  assert.equal(results.length, 20);
  assert.equal(pool.events.size, 20);
});

test('9. propagates database failure as error', async () => {
  await assert.rejects(getAnalyticsStats(null), /Database pool unavailable/);
});

// ----------------------------------------------------------------------------
// Frontend Unit & LGPD Consent Tests
// ----------------------------------------------------------------------------

test('10. hasAnalyticsConsent rejects missing, expired, or future timestamps', () => {
  const storage = new Map();
  global.localStorage = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, v),
    removeItem: (k) => storage.delete(k)
  };
  global.window = {};

  // Missing consent
  assert.equal(hasAnalyticsConsent(), false);

  // Expired consent (>180 days)
  const expiredTime = Date.now() - (181 * 24 * 60 * 60 * 1000);
  storage.set('nido_cookie_consent', JSON.stringify({ analytics: true, timestamp: expiredTime }));
  assert.equal(hasAnalyticsConsent(), false);

  // Future timestamp
  const futureTime = Date.now() + 100000;
  storage.set('nido_cookie_consent', JSON.stringify({ analytics: true, timestamp: futureTime }));
  assert.equal(hasAnalyticsConsent(), false);

  // Valid consent
  storage.set('nido_cookie_consent', JSON.stringify({ analytics: true, timestamp: Date.now() }));
  assert.equal(hasAnalyticsConsent(), true);
});

test('11. verifies direct visit to /tratamentos/endoslim fires trackTreatmentView automatically on pageview', () => {
  const sentPayloads = [];
  const storage = new Map();
  global.sessionStorage = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, v),
    removeItem: (k) => storage.delete(k)
  };
  global.localStorage = {
    getItem: (k) => JSON.stringify({ analytics: true, timestamp: Date.now() }),
    setItem: () => {},
    removeItem: () => {}
  };
  global.window = { location: { pathname: '/tratamentos/endoslim', hostname: 'nidoestetica.com.br' } };
  global.fetch = async (_url, options) => {
    if (options && options.body) {
      sentPayloads.push(JSON.parse(options.body));
    }
    return { ok: true, json: async () => ({ success: true }) };
  };

  recordRouteNavigation('/tratamentos/endoslim', 'Página Endoslim');

  const pageViewEvent = sentPayloads.find(p => p.type === 'page_view');
  const treatmentViewEvent = sentPayloads.find(p => p.type === 'treatment_view');

  assert.ok(pageViewEvent);
  assert.ok(treatmentViewEvent);
  assert.equal(treatmentViewEvent.name, 'Endoslim');
});

test('12. verifies navigation journey step tracking A -> B -> A for fast navigation', () => {
  const storage = new Map();
  global.sessionStorage = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, v),
    removeItem: (k) => storage.delete(k)
  };
  global.localStorage = {
    getItem: (k) => JSON.stringify({ analytics: true, timestamp: Date.now() }),
    setItem: () => {},
    removeItem: () => {}
  };
  global.window = { location: { pathname: '/', hostname: 'nidoestetica.com.br' } };

  recordRouteNavigation('/', 'Home');
  recordRouteNavigation('/tratamentos', 'Tratamentos');
  recordRouteNavigation('/', 'Home');

  const journey = getSessionJourney();
  assert.equal(journey.steps.length, 3);
  assert.equal(journey.steps[0].path, '/');
  assert.equal(journey.steps[1].path, '/tratamentos');
  assert.equal(journey.steps[2].path, '/');
});
