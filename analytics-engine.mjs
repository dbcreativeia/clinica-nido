import { normalizeLocation, normalizeAttribution, parseContext } from './tracking-context.mjs';
export async function initAnalyticsDatabase(pool) {
  if (!pool) throw new Error('Database pool unavailable');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS nido_analytics_events (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      event_id VARCHAR(120) NOT NULL UNIQUE,
      visitor_id VARCHAR(100) NOT NULL,
      session_id VARCHAR(100) NOT NULL,
      event_type VARCHAR(50) NOT NULL,
      event_name VARCHAR(100),
      event_label VARCHAR(255),
      page_path VARCHAR(255) NOT NULL,
      city VARCHAR(100) DEFAULT 'Não informada',
      state VARCHAR(50) DEFAULT 'Não informada',
      neighborhood VARCHAR(100) DEFAULT 'Não informada',
      traffic_channel VARCHAR(100) DEFAULT 'Direto',
      traffic_source VARCHAR(100) DEFAULT 'direto',
      duration_seconds INT DEFAULT 0,
      is_preview BOOLEAN DEFAULT FALSE,
      attribution_context JSON,
      location_context JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_event_type (event_type),
      INDEX idx_visitor_id (visitor_id),
      INDEX idx_session_id (session_id),
      INDEX idx_page_path (page_path),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  for (const column of ['attribution_context JSON NULL','location_context JSON NULL']) {
    try { await pool.query(`ALTER TABLE nido_analytics_events ADD COLUMN ${column}`); }
    catch (err) { if (err.code !== 'ER_DUP_FIELDNAME') throw err; }
  }
}

export async function recordAnalyticsEvent(pool, event) {
  if (!pool) throw new Error('Database pool unavailable');

  const pagePath = String(event.pagePath || '/').trim();
  const lowerPath = pagePath.toLowerCase();

  // Strict exclusion of admin routes
  if (
    lowerPath.startsWith('/admin') || 
    lowerPath.includes('#admin') || 
    lowerPath === '/admin-crm' || 
    lowerPath === '/login'
  ) {
    return { ignored: true, reason: 'admin_route' };
  }

  const rawEventId = String(event.eventId || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`).trim();
  if (rawEventId.length > 120) {
    return { error: 'Event ID exceeds 120 characters limit', code: 'VALIDATION' };
  }
  const eventId = rawEventId;

  const visitorId = String(event.visitorId || 'v_anon').slice(0, 100);
  const sessionId = String(event.sessionId || 's_anon').slice(0, 100);
  const eventType = String(event.type || 'page_view').slice(0, 50);
  const eventName = event.name ? String(event.name).trim().slice(0, 100) : null;
  const eventLabel = event.label ? String(event.label).trim().slice(0, 255) : null;

  const location = normalizeLocation(event);
  const {city,state,neighborhood} = location;
  const attribution = normalizeAttribution(event.attribution || {});

  const trafficChannel = String(event.trafficChannel || 'Direto').trim().slice(0, 100);
  const trafficSource = String(event.trafficSource || 'direto').trim().slice(0, 100);
  const durationSeconds = Number.isInteger(Number(event.durationSeconds)) ? Math.max(0, Number(event.durationSeconds)) : 0;
  const isPreview = Boolean(event.isPreview);

  const query = `
    INSERT INTO nido_analytics_events (
      event_id, visitor_id, session_id, event_type, event_name, event_label,
      page_path, city, state, neighborhood, traffic_channel, traffic_source,
      duration_seconds, is_preview, attribution_context, location_context
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      duration_seconds = GREATEST(duration_seconds, VALUES(duration_seconds)),
      city=VALUES(city), state=VALUES(state), neighborhood=VALUES(neighborhood), location_context=VALUES(location_context)
  `;

  const [result] = await pool.query(query, [
    eventId, visitorId, sessionId, eventType, eventName, eventLabel,
    pagePath, city, state, neighborhood, trafficChannel, trafficSource,
    durationSeconds, isPreview, JSON.stringify(attribution), JSON.stringify(location)
  ]);

  return { success: true, affectedRows: result.affectedRows, eventId };
}

export async function getAnalyticsStats(pool, leadsPool = pool) {
  if (!pool) throw new Error('Database pool unavailable');

  // 1. Summary Metrics
  const [[pvRow]] = await pool.query(`
    SELECT COUNT(*) AS totalPageViews
    FROM nido_analytics_events
    WHERE event_type = 'page_view' AND is_preview = FALSE
  `);

  const [[uvRow]] = await pool.query(`
    SELECT COUNT(DISTINCT visitor_id) AS uniqueVisitors
    FROM nido_analytics_events
    WHERE is_preview = FALSE
  `);

  const [[durRow]] = await pool.query(`
    SELECT AVG(session_dur) AS avgSessionSeconds
    FROM (
      SELECT session_id, SUM(duration_seconds) AS session_dur
      FROM nido_analytics_events
      WHERE event_type = 'page_view' AND is_preview = FALSE
      GROUP BY session_id
    ) AS session_durations
  `);

  const totalPageViews = Number(pvRow?.totalPageViews || 0);
  const uniqueVisitors = Number(uvRow?.uniqueVisitors || 0);
  const avgSeconds = Math.round(Number(durRow?.avgSessionSeconds || 0));

  let avgSessionDuration = 'N/D';
  if (avgSeconds >= 60) {
    const mins = Math.floor(avgSeconds / 60);
    const secs = avgSeconds % 60;
    avgSessionDuration = `${mins}m ${secs}s`;
  } else if (avgSeconds > 0) {
    avgSessionDuration = `${avgSeconds}s`;
  }

  // 2. Real Leads stats from nido_leads
  let totalLeads = 0;
  let qualifiedLeads = 0;
  let lostLeads = 0;
  let leadRows = [];

  if (leadsPool) {
    try {
      const [rows] = await leadsPool.query(`
        SELECT status, service_interest, traffic_channel FROM nido_leads WHERE deleted_at IS NULL
      `);
      leadRows = rows || [];
      totalLeads = leadRows.length;
      qualifiedLeads = leadRows.filter(l => ['agendado', 'compareceu', 'convertido'].includes(l.status)).length;
      lostLeads = leadRows.filter(l => l.status === 'perdido').length;
    } catch (err) {
      // Do not swallow DB failures silently if pool exists but query failed unexpectedly
      if (err && err.code !== 'ER_NO_SUCH_TABLE') {
        console.warn('[Analytics Leads Query Warning]', err);
      }
    }
  }

  // Do NOT divide all historical leads by new site unique visitors. Return 'N/D' until a verifiable link exists.
  const leadConversionRate = 'N/D';

  // 3. Routes Stats (ONLY route_click events counted as route clicks, grouped by destination route/label)
  const [routeRows] = await pool.query(`
    SELECT COALESCE(event_name, page_path) AS name, COALESCE(MAX(event_label), MAX(event_name), MAX(page_path)) AS label, COUNT(*) AS clicks, COUNT(DISTINCT visitor_id) AS routeVisitors
    FROM nido_analytics_events
    WHERE event_type = 'route_click' AND is_preview = FALSE
    GROUP BY COALESCE(event_name, page_path)
    ORDER BY clicks DESC
  `);

  const defaultRoutes = [
    { name: '/', label: 'Página Inicial (Home)', clicks: 0, percentage: 0 },
    { name: '/a-clinica', label: 'A Clínica & Filosofia', clicks: 0, percentage: 0 },
    { name: '/tratamentos', label: 'Catálogo de Tratamentos', clicks: 0, percentage: 0 },
    { name: '/tecnologias', label: 'Tecnologias de Ponta', clicks: 0, percentage: 0 },
    { name: '/corpo-clinico', label: 'Corpo Clínico & Especialistas', clicks: 0, percentage: 0 },
    { name: '/contato', label: 'Página de Contato & Localização', clicks: 0, percentage: 0 },
    { name: '/tratamentos/endoslim', label: 'Página Endoslim', clicks: 0, percentage: 0 },
    { name: '/tratamentos/profhilo', label: 'Página Profhilo®', clicks: 0, percentage: 0 }
  ];

  const totalRouteClicks = routeRows.reduce((acc, r) => acc + Number(r.clicks), 0) || 0;
  const routeMap = new Map(routeRows.map(r => [r.name, {
    name: r.name,
    label: r.label || r.name,
    clicks: Number(r.clicks),
    uniqueVisitors: Number(r.routeVisitors || 0),
    percentage: totalRouteClicks > 0 ? Math.round((Number(r.clicks) / totalRouteClicks) * 1000) / 10 : 0
  }]));

  for (const def of defaultRoutes) {
    if (!routeMap.has(def.name)) {
      routeMap.set(def.name, def);
    }
  }
  const routes = [...routeMap.values()].sort((a, b) => b.clicks - a.clicks);

  // 4. Treatments Stats (query treatment views and match leads)
  const [treatmentRows] = await pool.query(`
    SELECT t.event_name AS name, COUNT(*) AS views, AVG(p.avg_duration) AS avg_duration
    FROM nido_analytics_events t
    LEFT JOIN (SELECT page_path, AVG(duration_seconds) AS avg_duration FROM nido_analytics_events
      WHERE event_type='page_view' AND is_preview=FALSE GROUP BY page_path) p ON p.page_path=t.page_path
    WHERE event_type = 'treatment_view' AND is_preview = FALSE AND event_name IS NOT NULL
    GROUP BY event_name
    ORDER BY views DESC
  `);

  const totalTreatViews = treatmentRows.reduce((acc, t) => acc + Number(t.views), 0) || 0;
  const treatments = treatmentRows.map(t => {
    const views = Number(t.views);
    const avgSec = Math.round(Number(t.avg_duration || 0));
    const avgTimeSpent = avgSec > 0 ? `${avgSec}s` : 'N/D';

    // Count real matching leads from nido_leads
    const matchedLeads = leadRows.filter(l => 
      l.service_interest && l.service_interest.toLowerCase().includes(String(t.name).toLowerCase())
    ).length;

    return {
      name: t.name,
      category: 'Tratamento Estético',
      views,
      percentage: totalTreatViews > 0 ? Math.round((views / totalTreatViews) * 1000) / 10 : 0,
      avgTimeSpent,
      leadsGenerated: matchedLeads
    };
  });

  // 5. CTA Clicks
  const [ctaRows] = await pool.query(`
    SELECT event_label AS label, page_path AS location, COUNT(*) AS clicks
    FROM nido_analytics_events
    WHERE event_type = 'cta_click' AND is_preview = FALSE AND event_label IS NOT NULL
    GROUP BY event_label, page_path
    ORDER BY clicks DESC
  `);

  const ctaClicks = ctaRows.map(c => {
    const clicks = Number(c.clicks);
    return {
      label: c.label,
      location: c.location || 'Site',
      clicks,
      conversionRate: 'N/D'
    };
  });

  // 6. Top Locations
  const [locRows] = await pool.query(`
    SELECT city, neighborhood, state, COUNT(DISTINCT session_id) AS sessions
    FROM nido_analytics_events
    WHERE is_preview = FALSE AND city IS NOT NULL AND city != 'Não informada' AND city != ''
    GROUP BY city, neighborhood, state
    ORDER BY sessions DESC
    LIMIT 10
  `);

  const totalLocSessions = locRows.reduce((acc, l) => acc + Number(l.sessions), 0) || 0;
  const topLocations = locRows.map(l => ({
    city: l.city,
    neighborhood: l.neighborhood || 'Geral',
    state: l.state || 'Não informada',
    sessions: Number(l.sessions),
    percentage: totalLocSessions > 0 ? Math.round((Number(l.sessions) / totalLocSessions) * 1000) / 10 : 0
  }));

  // 7. Traffic Sources
  const [trafficRows] = await pool.query(`
    SELECT traffic_channel AS channel, COUNT(DISTINCT visitor_id) AS visitors
    FROM nido_analytics_events
    WHERE is_preview = FALSE AND traffic_channel IS NOT NULL
    GROUP BY traffic_channel
    ORDER BY visitors DESC
  `);

  const totalTrafficVisitors = trafficRows.reduce((acc, tr) => acc + Number(tr.visitors), 0) || 0;
  const trafficSources = trafficRows.map(tr => {
    const channel = tr.channel;
    const matchedLeads = leadRows.filter(l => 
      l.traffic_channel && l.traffic_channel.toLowerCase() === String(channel).toLowerCase()
    ).length;

    return {
      channel,
      visitors: Number(tr.visitors),
      percentage: totalTrafficVisitors > 0 ? Math.round((Number(tr.visitors) / totalTrafficVisitors) * 1000) / 10 : 0,
      leads: matchedLeads
    };
  });

  const [campaignRows] = await pool.query(`
    SELECT traffic_channel AS channel,
      COALESCE(JSON_UNQUOTE(JSON_EXTRACT(attribution_context,'$.campaign')),'') AS campaign,
      COALESCE(JSON_UNQUOTE(JSON_EXTRACT(attribution_context,'$.campaignId')),'') AS campaignId,
      COALESCE(JSON_UNQUOTE(JSON_EXTRACT(attribution_context,'$.adSet')),'') AS adSet,
      COALESCE(JSON_UNQUOTE(JSON_EXTRACT(attribution_context,'$.adSetId')),'') AS adSetId,
      COALESCE(JSON_UNQUOTE(JSON_EXTRACT(attribution_context,'$.adName')),'') AS adName,
      COALESCE(JSON_UNQUOTE(JSON_EXTRACT(attribution_context,'$.adId')),'') AS adId,
      COALESCE(JSON_UNQUOTE(JSON_EXTRACT(attribution_context,'$.placement')),'') AS placement,
      COUNT(DISTINCT visitor_id) AS visitors, COUNT(DISTINCT session_id) AS sessions,
      SUM(event_type='page_view') AS pageViews, SUM(event_type='cta_click') AS clicks
    FROM nido_analytics_events WHERE is_preview=FALSE
    GROUP BY traffic_channel,campaign,campaignId,adSet,adSetId,adName,adId,placement
    ORDER BY visitors DESC LIMIT 200
  `);
  const campaigns = campaignRows.map(row=>({...row,visitors:Number(row.visitors),sessions:Number(row.sessions),pageViews:Number(row.pageViews),clicks:Number(row.clicks)}));
  const [pageRows] = await pool.query(`
    SELECT page_path AS path,COUNT(*) AS views,COUNT(DISTINCT visitor_id) AS visitors,
      ROUND(AVG(duration_seconds)) AS avgSeconds
    FROM nido_analytics_events WHERE event_type='page_view' AND is_preview=FALSE
    GROUP BY page_path ORDER BY views DESC LIMIT 100
  `);
  const pages = pageRows.map(row=>({...row,views:Number(row.views),visitors:Number(row.visitors),avgSeconds:Number(row.avgSeconds)}));

  // 8. Recent Live Events
  const [liveRows] = await pool.query(`
    SELECT event_type AS type, COALESCE(event_label, event_name, page_path) AS label, page_path AS pagePath, city, neighborhood, created_at AS timestamp
    FROM nido_analytics_events
    WHERE is_preview = FALSE
    ORDER BY created_at DESC
    LIMIT 25
  `);

  const recentLiveEvents = (liveRows || []).map(lr => ({
    type: lr.type,
    label: lr.label || 'Ação no site',
    pagePath: lr.pagePath || '/',
    city: lr.city || 'Não informada',
    neighborhood: lr.neighborhood || 'Não informada',
    timestamp: lr.timestamp ? new Date(lr.timestamp).toISOString() : new Date().toISOString()
  }));

  // 9. Directions / Como Chegar Stats (Google Maps, Waze, Uber)
  let directionRows = [];
  try {
    const [dRows] = await pool.query(`
      SELECT 
        CASE 
          WHEN LOWER(COALESCE(event_label, event_name, '')) LIKE '%waze%' THEN 'Waze'
          WHEN LOWER(COALESCE(event_label, event_name, '')) LIKE '%uber%' THEN 'Uber'
          WHEN LOWER(COALESCE(event_label, event_name, '')) LIKE '%maps%' THEN 'Google Maps'
          ELSE 'Outro'
        END AS app,
        page_path AS pagePath,
        COUNT(*) AS clicks,
        COUNT(DISTINCT visitor_id) AS visitors
      FROM nido_analytics_events
      WHERE is_preview = FALSE AND (
        LOWER(COALESCE(event_label, event_name, '')) LIKE '%waze%' OR
        LOWER(COALESCE(event_label, event_name, '')) LIKE '%uber%' OR
        LOWER(COALESCE(event_label, event_name, '')) LIKE '%maps%'
      )
      GROUP BY app, page_path
      ORDER BY clicks DESC
    `);
    directionRows = dRows || [];
  } catch {
    directionRows = [];
  }

  const validDirectionRows = (directionRows || []).filter(r => ['Google Maps', 'Waze', 'Uber'].includes(r.app));
  const appAggregates = {
    'Google Maps': { clicks: 0, visitors: 0, byPage: [] },
    'Waze': { clicks: 0, visitors: 0, byPage: [] },
    'Uber': { clicks: 0, visitors: 0, byPage: [] }
  };
  for (const r of validDirectionRows) {
    if (appAggregates[r.app]) {
      appAggregates[r.app].clicks += Number(r.clicks || 0);
      appAggregates[r.app].visitors += Number(r.visitors || 0);
      appAggregates[r.app].byPage.push({ page: r.pagePath, clicks: Number(r.clicks || 0) });
    }
  }
  const totalDirectionsClicks = (
    appAggregates['Google Maps'].clicks + 
    appAggregates['Waze'].clicks + 
    appAggregates['Uber'].clicks
  );
  const directions = {
    totalClicks: totalDirectionsClicks,
    apps: [
      {
        app: 'Google Maps',
        clicks: appAggregates['Google Maps'].clicks,
        uniqueVisitors: appAggregates['Google Maps'].visitors,
        percentage: totalDirectionsClicks > 0 ? Math.round((appAggregates['Google Maps'].clicks / totalDirectionsClicks) * 1000) / 10 : 0
      },
      {
        app: 'Waze',
        clicks: appAggregates['Waze'].clicks,
        uniqueVisitors: appAggregates['Waze'].visitors,
        percentage: totalDirectionsClicks > 0 ? Math.round((appAggregates['Waze'].clicks / totalDirectionsClicks) * 1000) / 10 : 0
      },
      {
        app: 'Uber',
        clicks: appAggregates['Uber'].clicks,
        uniqueVisitors: appAggregates['Uber'].visitors,
        percentage: totalDirectionsClicks > 0 ? Math.round((appAggregates['Uber'].clicks / totalDirectionsClicks) * 1000) / 10 : 0
      }
    ]
  };

  // 10. Visitor Sessions & User Journeys (detailed user navigation, time spent, clicks, hot leads)
  let visitorSessions = [];
  try {
    const [sessionRows] = await pool.query(`
      SELECT 
        session_id AS sessionId,
        visitor_id AS visitorId,
        MAX(city) AS city,
        MAX(neighborhood) AS neighborhood,
        MAX(state) AS state,
        MAX(traffic_channel) AS trafficChannel,
        MAX(traffic_source) AS trafficSource,
        SUM(CASE WHEN event_type = 'page_view' THEN duration_seconds ELSE 0 END) AS totalDurationSeconds,
        SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS totalPageViews,
        COUNT(*) AS totalEvents,
        MAX(created_at) AS lastSeen
      FROM nido_analytics_events
      WHERE is_preview = FALSE
      GROUP BY session_id, visitor_id
      ORDER BY MAX(created_at) DESC
      LIMIT 40
    `);

    if (Array.isArray(sessionRows) && sessionRows.length > 0) {
      const sessionIds = sessionRows.map(s => s.sessionId).filter(Boolean);
      let detailEvents = [];
      if (sessionIds.length > 0) {
        try {
          const [dEvents] = await pool.query(`
            SELECT 
              session_id AS sessionId,
              event_type AS type,
              COALESCE(event_label, event_name, page_path) AS label,
              page_path AS pagePath,
              duration_seconds AS durationSeconds,
              created_at AS createdAt
            FROM nido_analytics_events
            WHERE session_id IN (?) AND is_preview = FALSE
            ORDER BY created_at ASC
          `, [sessionIds]);
          detailEvents = dEvents || [];
        } catch {
          detailEvents = [];
        }
      }

      const eventsBySession = new Map();
      for (const ev of detailEvents) {
        if (!eventsBySession.has(ev.sessionId)) eventsBySession.set(ev.sessionId, []);
        eventsBySession.get(ev.sessionId).push(ev);
      }

      visitorSessions = sessionRows.map(s => {
        const sEvents = eventsBySession.get(s.sessionId) || [];
        const steps = [];
        const actions = [];
        let hotScore = 0;
        let hasDirections = false;
        let hasWhatsApp = false;
        let treatmentsCount = 0;

        for (const ev of sEvents) {
          if (ev.type === 'page_view') {
            steps.push({
              path: ev.pagePath,
              title: ev.label || ev.pagePath,
              durationSeconds: Number(ev.durationSeconds || 0),
              time: ev.createdAt ? new Date(ev.createdAt).toISOString() : undefined
            });
          } else {
            actions.push({
              type: ev.type,
              label: ev.label,
              path: ev.pagePath,
              time: ev.createdAt ? new Date(ev.createdAt).toISOString() : undefined
            });
            const lowerLabel = String(ev.label || '').toLowerCase();
            if (lowerLabel.includes('maps') || lowerLabel.includes('waze') || lowerLabel.includes('uber')) {
              hasDirections = true;
            }
            if (lowerLabel.includes('whatsapp') || lowerLabel.includes('wa.me') || lowerLabel.includes('contato')) {
              hasWhatsApp = true;
            }
          }
          if (ev.type === 'treatment_view') {
            treatmentsCount++;
          }
        }

        if (hasDirections) hotScore += 35;
        if (hasWhatsApp) hotScore += 30;
        hotScore += Math.min(treatmentsCount * 15, 30);
        const durationSecs = Number(s.totalDurationSeconds || 0);
        if (durationSecs >= 120) hotScore += 15;
        else if (durationSecs >= 45) hotScore += 10;
        const pagesCount = Number(s.totalPageViews || 0);
        if (pagesCount >= 3) hotScore += 10;

        return {
          sessionId: s.sessionId,
          visitorId: s.visitorId,
          city: s.city || 'Não informada',
          neighborhood: s.neighborhood || 'Não informada',
          state: s.state || 'Não informada',
          trafficChannel: s.trafficChannel || 'Direto',
          trafficSource: s.trafficSource || 'direto',
          totalDurationSeconds: durationSecs,
          totalPageViews: pagesCount,
          steps,
          actions,
          hotScore,
          isHotLead: hotScore >= 50,
          lastSeen: s.lastSeen ? new Date(s.lastSeen).toISOString() : new Date().toISOString()
        };
      });
    }
  } catch {
    visitorSessions = [];
  }

  return {
    summary: {
      totalPageViews,
      uniqueVisitors,
      avgSessionDuration,
      bounceRate: 'N/D',
      leadConversionRate,
      totalLeads,
      qualifiedLeads,
      lostLeads
    },
    campaigns,
    pages,
    routes,
    treatments,
    ctaClicks,
    topLocations,
    trafficSources,
    recentLiveEvents,
    directions,
    visitorSessions
  };
}
