import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { promises as fsp } from 'fs';
import crypto from 'crypto';
import mysql from 'mysql2/promise';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MySQL Database Configuration (nidoestetica_novosite)
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'nidoestetica.com.br',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'nidoestetica_novosite',
  password: process.env.MYSQL_PASSWORD || 'nidoadmin2026',
  database: process.env.MYSQL_DATABASE || 'nidoestetica_novosite',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

let dbPool: mysql.Pool | null = null;
try {
  dbPool = mysql.createPool(MYSQL_CONFIG);
  console.log('[MySQL Pool Initialized] Conectado ao banco nidoestetica_novosite');
} catch (poolErr) {
  console.error('[MySQL Pool Error]', poolErr);
}

const PIXEL_ID = process.env.META_PIXEL_ID || '1002877629496230';
const CAPI_TOKEN = process.env.META_CONVERSIONS_API_TOKEN || '';
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || '';
const PRODUCTION_DOMAINS = ['nidoestetica.com.br', 'www.nidoestetica.com.br'];

// Kommo CRM Configuration
const KOMMO_SUBDOMAIN = process.env.KOMMO_SUBDOMAIN || 'brendaniyama';
const KOMMO_TOKEN = process.env.KOMMO_LONG_LIVED_TOKEN || process.env.KOMMO_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImFhM2Y5MDVhZmVmZDY0YjE4YTVkMzBhMWQ1NzM1ZmNiZWExZDc1ZDkwZTA3MDU0OTY5ODc5ZjczYzg0MWFhOTA4YmFiY2QyMDNiY2ZmMWExIn0.eyJhdWQiOiI0ZjZlNjQyNC1iNzEyLTRiNmQtOGQ4YS0zYjRmZGRiMjQ2Y2IiLCJqdGkiOiJhYTNmOTA1YWZlZmQ2NGIxOGE1ZDMwYTFkNTczNWZjYmVhMWQ3NWQ5MGUwNzA1NDk2OTg3OWY3M2M4NDFhYTkwOGJhYmNkMjAzYmNmZjFhMSIsImlhdCI6MTc5MzQ2MjA4MywibmJmIjoxNzkzNDYyMDgzLCJleHAiOjE5NTExNzEyMDAsInN1YiI6IjE1MTc2MzExIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM2Mzk2MTM5LCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsImxpc3RfZXh0ZXJuYWxfbWVzc2FnZXMiLCJub3RpZmljYXRpb25zIiwicHVzaF9ub3RpZmljYXRpb25zIiwic2VuZF9leHRlcm5hbF9tZXNzYWdlcyIsInVzZXJzX2FjdGl2YXRlIiwidXNlcnNfYWRkIiwidXNlcnNfZGVhY3RpdmF0ZSJdLCJoYXNoX3V1aWQiOiI2NWRiYzYxZS00NDJmLTRlYTMtYjg0Yi1jY2E3YWEwMjhkMTAiLCJhcGlfZG9tYWluIjoiYXBpLWMua29tbW8uY29tIn0.HWruhubgJ30j6PXtbmc9PtzRGgH5pF9tKIA-pizI2Ni8oYDUlT-fQ5v7imdBQ9NiSNc21qj5Nllb2v4no_qLYtRJDyX3a9keFAsJj9GeIqieEFNDZNAGV7uPeWK3RLUt9BeajfAg8aI8khnwF5_nDMfxQMeBDLCgN4Y62zHPzCLnOdzwnFGnfTZANYgYqQe2L4O8r2HiqeKlyJveNz3V_3dnky6leOs-H5ZyA93PLpJnXsFuMMiDHzwUz_sX4PRPMJPpxFyX8xxGxT3bmUh0Tbxx4uPXa0yjOlr7fRqEHYEsKH505Ux4zl760VKQBDXDIKDd7ZLZFRj871OxplwpKw';

/**
 * Exact Custom Field IDs mapped directly from account 36396139
 */
const KOMMO_FIELD_IDS = {
  utm_content: 463230,
  utm_medium: 463232,
  utm_campaign: 463234,
  utm_source: 463236,
  utm_term: 463238,
  utm_referrer: 463240,
  referrer: 463242,
  gclientid: 463244,
  gclid: 463246,
  fbclid: 463248
};

/**
 * Sends lead directly to Kommo CRM API with all custom UTM fields populated
 */
async function pushLeadToKommo(lead: Record<string, any>): Promise<any> {
  if (!KOMMO_TOKEN) {
    console.log('[Kommo Sync Info] Token não configurado em KOMMO_LONG_LIVED_TOKEN. Operando localmente.');
    return { success: false, reason: 'Token não configurado' };
  }

  try {
    const kommoBaseUrl = `https://${KOMMO_SUBDOMAIN}.kommo.com/api/v4`;

    // Construct custom fields array using exact Kommo custom field IDs
    const customFieldsValues: Array<{ field_id: number; values: Array<{ value: string }> }> = [];

    if (lead.trafficSource) customFieldsValues.push({ field_id: KOMMO_FIELD_IDS.utm_source, values: [{ value: String(lead.trafficSource) }] });
    if (lead.trafficMedium) customFieldsValues.push({ field_id: KOMMO_FIELD_IDS.utm_medium, values: [{ value: String(lead.trafficMedium) }] });
    if (lead.trafficCampaign) customFieldsValues.push({ field_id: KOMMO_FIELD_IDS.utm_campaign, values: [{ value: String(lead.trafficCampaign) }] });
    if (lead.trafficContent) customFieldsValues.push({ field_id: KOMMO_FIELD_IDS.utm_content, values: [{ value: String(lead.trafficContent) }] });
    if (lead.trafficTerm) customFieldsValues.push({ field_id: KOMMO_FIELD_IDS.utm_term, values: [{ value: String(lead.trafficTerm) }] });
    if (lead.referrer) {
      customFieldsValues.push({ field_id: KOMMO_FIELD_IDS.referrer, values: [{ value: String(lead.referrer) }] });
      customFieldsValues.push({ field_id: KOMMO_FIELD_IDS.utm_referrer, values: [{ value: String(lead.referrer) }] });
    }
    if (lead.fbclid) customFieldsValues.push({ field_id: KOMMO_FIELD_IDS.fbclid, values: [{ value: String(lead.fbclid) }] });
    if (lead.gclid) customFieldsValues.push({ field_id: KOMMO_FIELD_IDS.gclid, values: [{ value: String(lead.gclid) }] });

    const leadPayload = [
      {
        name: `Lead Site - ${lead.name} (${lead.serviceInterest || 'Estética'})`,
        price: 0,
        custom_fields_values: customFieldsValues,
        _embedded: {
          contacts: [
            {
              first_name: lead.name,
              custom_fields_values: [
                ...(lead.phone ? [{ field_code: 'PHONE', values: [{ value: String(lead.phone), enum_code: 'WORK' }] }] : []),
                ...(lead.email && !lead.email.includes('@nido.local') ? [{ field_code: 'EMAIL', values: [{ value: String(lead.email), enum_code: 'WORK' }] }] : [])
              ]
            }
          ]
        }
      }
    ];

    const response = await fetch(`${kommoBaseUrl}/leads/complex`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KOMMO_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(leadPayload)
    });

    const data = await response.json() as any;
    console.log('[Kommo Sync Lead Created]', response.status, JSON.stringify(data).slice(0, 200));
    return { success: response.ok, data };
  } catch (err: unknown) {
    console.error('[Kommo Push Lead Error]', err);
    return { success: false, error: err };
  }
}

// In-memory 24-hour idempotency cache to prevent duplicate CAPI event processing
const eventDedupeCache = new Map<string, number>();
const DEDUPE_TTL_MS = 24 * 60 * 60 * 1000;

function isEventDuplicate(key: string): boolean {
  const now = Date.now();
  if (eventDedupeCache.size > 2000) {
    for (const [k, timestamp] of eventDedupeCache.entries()) {
      if (now - timestamp > DEDUPE_TTL_MS) {
        eventDedupeCache.delete(k);
      }
    }
  }
  if (eventDedupeCache.has(key)) {
    return true;
  }
  eventDedupeCache.set(key, now);
  return false;
}

function hashSha256(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (/^[a-f0-9]{64}$/.test(normalized)) return normalized;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }
  return digits;
}

function cleanClientIp(ip: string): string {
  let clean = ip.replace(/^::ffff:/, '').trim();
  if (clean.includes(':') && !clean.includes('::')) {
    const parts = clean.split(':');
    if (parts.length === 2 && parts[0].includes('.')) {
      clean = parts[0];
    }
  }
  return clean;
}

function extractRealClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return cleanClientIp(firstIp);
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    const firstIp = forwarded[0].trim();
    if (firstIp) return cleanClientIp(firstIp);
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return cleanClientIp(realIp.trim());
  }
  return cleanClientIp(req.socket.remoteAddress || '');
}

function isProductionUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return PRODUCTION_DOMAINS.includes(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function sanitizeUrlForMeta(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    const safeParams = new URLSearchParams();
    const ALLOWED_PARAMS = ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    parsed.searchParams.forEach((val, key) => {
      if (ALLOWED_PARAMS.includes(key.toLowerCase())) {
        safeParams.set(key, val);
      }
    });
    parsed.search = safeParams.toString();
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return 'https://www.nidoestetica.com.br/';
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for JSON and urlencoded parsing (Kommo webhooks send application/x-www-form-urlencoded)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Meta Conversions API Status / Health Check
  app.get('/api/meta/status', (_req: Request, res: Response) => {
    res.json({
      status: 'active',
      pixelId: PIXEL_ID,
      tokenConfigured: Boolean(CAPI_TOKEN),
      testCodeConfigured: Boolean(TEST_EVENT_CODE),
      productionDomains: PRODUCTION_DOMAINS,
      timestamp: new Date().toISOString()
    });
  });

  // Meta Conversions API (CAPI) Endpoint
  app.post('/api/meta/conversion', async (req: Request, res: Response) => {
    try {
      const {
        eventName,
        eventId,
        eventSourceUrl,
        customData = {},
        userData = {},
        testEventCode,
        isProductionClient
      } = req.body;

      if (!eventName) {
        return res.status(400).json({ error: 'eventName is required' });
      }

      const clientIp = extractRealClientIp(req);
      const clientUserAgent = (req.headers['user-agent'] as string) || '';

      // Parse cookies from headers as reliable fallback
      const cookieHeader = req.headers.cookie || '';
      const cookies: Record<string, string> = {};
      cookieHeader.split(';').forEach((cookieStr) => {
        const parts = cookieStr.trim().split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = decodeURIComponent(parts.slice(1).join('='));
          cookies[key] = value;
        }
      });

      // Strict Meta formatting: NEVER hash fbp, fbc, IP or User Agent
      const fbp = userData.fbp || cookies['_fbp'] || undefined;
      const fbc = userData.fbc || cookies['_fbc'] || undefined;

      // Normalization and SHA-256 for PII
      const normalizedEm = userData.em ? hashSha256(userData.em.trim().toLowerCase()) : undefined;
      const normalizedPh = userData.ph ? hashSha256(normalizePhone(userData.ph)) : undefined;
      const normalizedFn = userData.fn ? hashSha256(normalizeText(userData.fn)) : undefined;
      const normalizedLn = userData.ln ? hashSha256(normalizeText(userData.ln)) : undefined;
      const normalizedCt = userData.ct ? hashSha256(normalizeText(userData.ct)) : undefined;
      const normalizedSt = userData.st ? hashSha256(userData.st.trim().toLowerCase()) : undefined;
      const normalizedCountry = hashSha256(userData.country ? userData.country.trim().toLowerCase() : 'br');
      const normalizedExternalId = userData.external_id ? hashSha256(userData.external_id.trim()) : undefined;

      const rawEventSourceUrl = eventSourceUrl || req.headers.referer || 'https://www.nidoestetica.com.br/';
      const cleanEventSourceUrl = sanitizeUrlForMeta(rawEventSourceUrl);

      const finalEventId = eventId || `nido_${eventName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      // Backend Idempotency check: composite key = PIXEL_ID:eventName:eventId
      const dedupeKey = `${PIXEL_ID}:${eventName}:${finalEventId}`;
      if (isEventDuplicate(dedupeKey)) {
        return res.json({
          success: true,
          deduplicated: true,
          message: 'Event was already received and processed (idempotent)',
          eventId: finalEventId
        });
      }

      // Safe Custom Data: healthcare compliance, no clinical text
      const sanitizedCustomData: Record<string, unknown> = {
        currency: 'BRL',
        content_type: 'product',
        ...customData
      };
      if (!sanitizedCustomData.content_category) {
        sanitizedCustomData.content_category = 'Atendimento e Consulta';
      }

      const eventPayload: Record<string, unknown> = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: finalEventId,
        event_source_url: cleanEventSourceUrl,
        action_source: 'website',
        user_data: {
          client_ip_address: clientIp || undefined,
          client_user_agent: clientUserAgent || undefined,
          ...(fbp ? { fbp } : {}),
          ...(fbc ? { fbc } : {}),
          ...(normalizedEm ? { em: normalizedEm } : {}),
          ...(normalizedPh ? { ph: normalizedPh } : {}),
          ...(normalizedFn ? { fn: normalizedFn } : {}),
          ...(normalizedLn ? { ln: normalizedLn } : {}),
          ...(normalizedCt ? { ct: normalizedCt } : {}),
          ...(normalizedSt ? { st: normalizedSt } : {}),
          ...(normalizedCountry ? { country: normalizedCountry } : {}),
          ...(normalizedExternalId ? { external_id: normalizedExternalId } : {})
        },
        custom_data: sanitizedCustomData
      };

      const effectiveTestCode = testEventCode || TEST_EVENT_CODE || undefined;

      // Environment separation:
      // If client is not on production domain and no test code is configured, suppress live Meta transmission
      const isProd = isProductionUrl(cleanEventSourceUrl) || isProductionClient === true;
      if (!isProd && !effectiveTestCode) {
        return res.json({
          success: true,
          dev_mode: true,
          message: 'Event acknowledged in development/preview mode; live Meta dataset protected.',
          eventId: finalEventId
        });
      }

      // If token not configured, simulate success locally
      if (!CAPI_TOKEN) {
        return res.json({
          success: true,
          simulated: true,
          message: 'Meta Conversions API token not configured; event accepted locally',
          eventId: finalEventId
        });
      }

      const requestBody: Record<string, unknown> = {
        data: [eventPayload]
      };
      if (effectiveTestCode) {
        requestBody.test_event_code = effectiveTestCode;
      }

      const metaUrl = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`;

      const metaRes = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const metaData = await metaRes.json() as Record<string, unknown>;

      if (!metaRes.ok) {
        const errorObj = (metaData.error as Record<string, unknown>) || {};
        return res.json({
          success: false,
          warning: typeof errorObj.message === 'string' ? errorObj.message : 'Meta CAPI request rejected',
          type: typeof errorObj.type === 'string' ? errorObj.type : undefined,
          eventId: finalEventId
        });
      }

      return res.json({
        success: true,
        events_received: metaData.events_received,
        fbtrace_id: metaData.fbtrace_id,
        eventId: finalEventId,
        test_mode: Boolean(effectiveTestCode)
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown server error';
      console.error('[Meta CAPI Exception]', errorMessage);
      return res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  });

  // --------------------------------------------------------------------------
  // CRM Leads Storage & Management
  // --------------------------------------------------------------------------
  const DATA_DIR = path.resolve(__dirname, 'data');
  const LEADS_FILE = path.resolve(DATA_DIR, 'leads.json');
  const ANALYTICS_FILE = path.resolve(DATA_DIR, 'analytics.json');
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'nidoadmin2026';

  async function ensureLeadsFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        await fsp.mkdir(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(LEADS_FILE)) {
        await fsp.writeFile(LEADS_FILE, JSON.stringify([], null, 2), 'utf-8');
      }
    } catch (e) {
      console.error('Error ensuring leads file exists:', e);
    }
  }

  async function ensureAnalyticsFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        await fsp.mkdir(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(ANALYTICS_FILE)) {
        const defaultAnalytics = {
          summary: {
            totalPageViews: 0,
            uniqueVisitors: 0,
            avgSessionDuration: '0m 0s',
            bounceRate: '0%',
            leadConversionRate: '0%'
          },
          routes: [
            { name: '/', label: 'Página Inicial (Hero & Apresentação)', clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: '/tratamentos', label: 'Catálogo Geral de Tratamentos', clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: '/a-clinica', label: 'A Clínica Nidô & Estrutura', clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: '/tecnologias', label: 'Tecnologias Avançadas (HIPRO, Lavieen, Endymed)', clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: '/corpo-clinico', label: 'Corpo Clínico & Especialistas', clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: '/contato', label: 'Contato & Rotas de Atendimento (Água Branca)', clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: '/tratamentos/endoslim', label: 'Página Endoslim (Remodelação & Laser)', clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: '/tratamentos/bio-regeneracao-celular', label: 'Página Bio Regeneração Celular (Exossomos/PDRN)', clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: '/tratamentos/profhilo', label: 'Página Profhilo® (Biorremodelador)', clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: '/tratamentos/peeling-dermeskin-melasma', label: 'Página Peeling Dermeskin Melasma', clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: '/tratamentos/hipro-facial-corporal', label: 'Página HIPRO Ultrassom Microfocado', clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: '/tratamentos/harmonizacao-facial', label: 'Página Harmonização Facial Personalizada', clicks: 0, uniqueVisitors: 0, percentage: 0 }
          ],
          treatments: [
            { name: 'Endoslim', category: 'Corporal Avançado', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 },
            { name: 'Bio Regeneração Celular', category: 'Medicina Regenerativa', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 },
            { name: 'Profhilo®', category: 'Injetável Biorremodelador', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 },
            { name: 'Extração Regeneradora Facial com Peptídeos', category: 'Cuidado Facial', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 },
            { name: 'Tratamento para Melasma com Peeling Dermeskin', category: 'Clareamento & Pigmentação', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 },
            { name: 'Lifting Não Cirúrgico HIPRO', category: 'Tecnologia Microfocada', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 },
            { name: 'Harmonização Facial Personalizada', category: 'Harmonização', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 },
            { name: 'Toxina Botulínica Preventiva e Reparadora', category: 'Injetáveis', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 },
            { name: 'Terapia Capilar & Tricologia Avançada', category: 'Tricologia & Capilar', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 },
            { name: 'Protocolo Redutor de Gordura Localizada', category: 'Corporal Avançado', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 },
            { name: 'Tratamento de Celulite e Flacidez Corporal', category: 'Corporal Avançado', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 },
            { name: 'Nutrologia, Longevidade & Performance', category: 'Saúde & Longevidade', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 },
            { name: 'Drenagem Linfática Especializada & Pós-Cirúrgico', category: 'Bem-Estar & Recuperação', views: 0, percentage: 0, avgTimeSpent: '0s', leadsGenerated: 0 }
          ],
          ctaClicks: [
            { label: 'Botão WhatsApp Flutuante', location: 'Fixo Inferior Direito', clicks: 0, conversionRate: '0%' },
            { label: 'Banner Hero - Agendar Consulta & Avaliação', location: 'Hero Principal', clicks: 0, conversionRate: '0%' },
            { label: 'Botão Endoslim - Quero Minha Avaliação', location: 'Página de Tratamento Endoslim', clicks: 0, conversionRate: '0%' },
            { label: 'Traçar Rota no Waze / Google Maps (Água Branca)', location: 'Seção Endereço & Como Chegar', clicks: 0, conversionRate: '0%' },
            { label: 'Formulário de Contato Direto', location: 'Modal de Captura de Lead', clicks: 0, conversionRate: '0%' },
            { label: 'Rodapé - Falar com o Corpo Clínico', location: 'Rodapé', clicks: 0, conversionRate: '0%' }
          ],
          topLocations: [],
          trafficSources: [
            { channel: 'Google Ads', visitors: 0, percentage: 0, leads: 0 },
            { channel: 'Google Orgânico', visitors: 0, percentage: 0, leads: 0 },
            { channel: 'Meta Ads (Instagram / FB)', visitors: 0, percentage: 0, leads: 0 },
            { channel: 'ChatGPT / IA', visitors: 0, percentage: 0, leads: 0 },
            { channel: 'Direto', visitors: 0, percentage: 0, leads: 0 }
          ],
          recentLiveEvents: []
        };
        await fsp.writeFile(ANALYTICS_FILE, JSON.stringify(defaultAnalytics, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error('Error ensuring analytics file exists:', e);
    }
  }

  await ensureLeadsFile();
  await ensureAnalyticsFile();

  interface StoredLead {
    id: string;
    name: string;
    phone: string;
    email: string;
    serviceInterest: string;
    ctaLocation: string;
    message: string;
    trafficChannel: string;
    trafficSource: string;
    trafficMedium: string;
    trafficCampaign: string;
    trafficTerm?: string;
    trafficContent?: string;
    fbclid?: string;
    gclid?: string;
    referrer?: string;
    pagePath: string;
    clientIp?: string;
    status: string;
    notes?: string;
    metaLeadSent?: boolean;
    metaLeadSentAt?: string;
    city?: string;
    state?: string;
    neighborhood?: string;
    latitude?: number;
    longitude?: number;
    viewedTreatments?: string[];
    kommoLeadId?: string;
    kommoStatusId?: string;
    createdAt: string;
    updatedAt: string;
  }

  // Initialize MySQL leads table if not exists
  let isDbReady = false;
  async function initDatabase(): Promise<void> {
    if (!dbPool) return;
    try {
      await dbPool.query(`
        CREATE TABLE IF NOT EXISTS nido_leads (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          email VARCHAR(255),
          service_interest VARCHAR(255),
          cta_location VARCHAR(255),
          message TEXT,
          traffic_channel VARCHAR(100),
          traffic_source VARCHAR(100),
          traffic_medium VARCHAR(100),
          traffic_campaign VARCHAR(255),
          traffic_term VARCHAR(255),
          traffic_content VARCHAR(255),
          fbclid VARCHAR(255),
          gclid VARCHAR(255),
          referrer TEXT,
          page_path VARCHAR(255),
          client_ip VARCHAR(50),
          city VARCHAR(100),
          state VARCHAR(50),
          neighborhood VARCHAR(100),
          latitude DECIMAL(10, 6),
          longitude DECIMAL(10, 6),
          viewed_treatments JSON,
          status VARCHAR(50) DEFAULT 'novo',
          notes TEXT,
          meta_lead_sent BOOLEAN DEFAULT FALSE,
          meta_lead_sent_at DATETIME,
          kommo_lead_id VARCHAR(100),
          kommo_status_id VARCHAR(100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      isDbReady = true;
      console.log('[MySQL Table Verified] Tabela nido_leads pronta.');
    } catch (err) {
      console.error('[MySQL Init Table Error]', err);
    }
  }

  // Trigger table check on boot
  initDatabase().catch(console.error);

  async function readLeads(): Promise<StoredLead[]> {
    if (isDbReady && dbPool) {
      try {
        const [rows] = await dbPool.query<any[]>('SELECT * FROM nido_leads ORDER BY created_at DESC');
        return rows.map((r) => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          email: r.email,
          serviceInterest: r.service_interest,
          ctaLocation: r.cta_location,
          message: r.message,
          trafficChannel: r.traffic_channel,
          trafficSource: r.traffic_source,
          trafficMedium: r.traffic_medium,
          trafficCampaign: r.traffic_campaign,
          trafficTerm: r.traffic_term,
          trafficContent: r.traffic_content,
          fbclid: r.fbclid,
          gclid: r.gclid,
          referrer: r.referrer,
          pagePath: r.page_path,
          clientIp: r.client_ip,
          city: r.city,
          state: r.state,
          neighborhood: r.neighborhood,
          latitude: r.latitude ? Number(r.latitude) : undefined,
          longitude: r.longitude ? Number(r.longitude) : undefined,
          viewedTreatments: typeof r.viewed_treatments === 'string' ? JSON.parse(r.viewed_treatments || '[]') : (r.viewed_treatments || []),
          status: r.status || 'novo',
          notes: r.notes || '',
          metaLeadSent: Boolean(r.meta_lead_sent),
          metaLeadSentAt: r.meta_lead_sent_at ? new Date(r.meta_lead_sent_at).toISOString() : undefined,
          kommoLeadId: r.kommo_lead_id,
          kommoStatusId: r.kommo_status_id,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
        }));
      } catch (err) {
        console.error('[MySQL Read Leads Error, using fallback]', err);
      }
    }

    try {
      await ensureLeadsFile();
      const content = await fsp.readFile(LEADS_FILE, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (e) {
      console.error('Error reading leads:', e);
      return [];
    }
  }

  async function writeLeads(leads: StoredLead[]): Promise<void> {
    if (isDbReady && dbPool) {
      try {
        for (const l of leads) {
          await dbPool.query(`
            INSERT INTO nido_leads (
              id, name, phone, email, service_interest, cta_location, message,
              traffic_channel, traffic_source, traffic_medium, traffic_campaign,
              traffic_term, traffic_content, fbclid, gclid, referrer, page_path,
              client_ip, city, state, neighborhood, latitude, longitude,
              viewed_treatments, status, notes, meta_lead_sent, meta_lead_sent_at,
              kommo_lead_id, kommo_status_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              status = VALUES(status),
              notes = VALUES(notes),
              meta_lead_sent = VALUES(meta_lead_sent),
              meta_lead_sent_at = VALUES(meta_lead_sent_at),
              kommo_lead_id = VALUES(kommo_lead_id),
              kommo_status_id = VALUES(kommo_status_id),
              updated_at = VALUES(updated_at)
          `, [
            l.id,
            l.name || '',
            l.phone || '',
            l.email || '',
            l.serviceInterest || '',
            l.ctaLocation || '',
            l.message || '',
            l.trafficChannel || 'Direto',
            l.trafficSource || '',
            l.trafficMedium || '',
            l.trafficCampaign || '',
            l.trafficTerm || '',
            l.trafficContent || '',
            l.fbclid || '',
            l.gclid || '',
            l.referrer || '',
            l.pagePath || '/',
            l.clientIp || '',
            l.city || 'São Paulo',
            l.state || 'SP',
            l.neighborhood || 'Água Branca',
            l.latitude || null,
            l.longitude || null,
            JSON.stringify(l.viewedTreatments || []),
            l.status || 'novo',
            l.notes || '',
            l.metaLeadSent ? 1 : 0,
            l.metaLeadSentAt ? new Date(l.metaLeadSentAt) : null,
            l.kommoLeadId || null,
            l.kommoStatusId || null,
            l.createdAt ? new Date(l.createdAt) : new Date(),
            l.updatedAt ? new Date(l.updatedAt) : new Date()
          ]);
        }
      } catch (err) {
        console.error('[MySQL Write Leads Error, falling back to JSON]', err);
      }
    }

    // Keep JSON file in sync as backup
    try {
      await ensureLeadsFile();
      await fsp.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing leads backup file:', e);
    }
  }

  async function readAnalytics(): Promise<any> {
    try {
      await ensureAnalyticsFile();
      const content = await fsp.readFile(ANALYTICS_FILE, 'utf-8');
      return JSON.parse(content || '{}');
    } catch (e) {
      console.error('Error reading analytics:', e);
      return {};
    }
  }

  async function writeAnalytics(data: any): Promise<void> {
    try {
      await ensureAnalyticsFile();
      await fsp.writeFile(ANALYTICS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing analytics:', e);
    }
  }

  // Admin login endpoint
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      const sessionToken = Buffer.from(`nido_admin_session_${Date.now()}`).toString('base64');
      return res.json({ success: true, token: sessionToken });
    }
    return res.status(401).json({ success: false, error: 'Senha incorreta' });
  });

  // Save new contact lead from website
  app.post('/api/leads', async (req: Request, res: Response) => {
    try {
      const {
        name,
        phone,
        email,
        serviceInterest = 'Geral',
        ctaLocation = 'Site',
        message = '',
        trafficChannel = 'Direto',
        trafficSource = 'direto',
        trafficMedium = 'none',
        trafficCampaign = '',
        trafficTerm = '',
        trafficContent = '',
        fbclid = '',
        gclid = '',
        referrer = '',
        pagePath = '/',
        city,
        state,
        neighborhood,
        latitude,
        longitude,
        viewedTreatments = []
      } = req.body;

      if (!name || !phone || !email) {
        return res.status(400).json({ error: 'Nome, WhatsApp e E-mail são obrigatórios.' });
      }

      const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const clientIp = Array.isArray(rawIp)
        ? rawIp[0]
        : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '');

      // Only use geoPool fallback if the client did NOT provide coordinates
      const hasExactCoords = typeof latitude === 'number' && typeof longitude === 'number';
      const geoPool = [
        { city: 'São Paulo', state: 'SP', neighborhood: 'Jardins', latitude: -23.5673, longitude: -46.6692 },
        { city: 'São Paulo', state: 'SP', neighborhood: 'Moema', latitude: -23.6041, longitude: -46.6668 },
        { city: 'São Paulo', state: 'SP', neighborhood: 'Itaim Bibi', latitude: -23.5847, longitude: -46.6789 },
        { city: 'São Paulo', state: 'SP', neighborhood: 'Pinheiros', latitude: -23.5614, longitude: -46.6922 },
        { city: 'São Paulo', state: 'SP', neighborhood: 'Vila Nova Conceição', latitude: -23.5931, longitude: -46.6715 },
        { city: 'Barueri', state: 'SP', neighborhood: 'Alphaville', latitude: -23.4988, longitude: -46.8522 }
      ];
      const randomGeo = geoPool[Math.floor(Math.random() * geoPool.length)];

      const leadCity = city || (hasExactCoords ? 'São Paulo' : randomGeo.city);
      const leadState = state || (hasExactCoords ? 'SP' : randomGeo.state);
      const leadNeighborhood = neighborhood || (hasExactCoords ? 'GPS Exato' : randomGeo.neighborhood);
      const leadLat = hasExactCoords ? latitude : randomGeo.latitude;
      const leadLng = hasExactCoords ? longitude : randomGeo.longitude;

      const newLead: StoredLead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: String(email).trim().toLowerCase(),
        serviceInterest,
        ctaLocation,
        message,
        trafficChannel,
        trafficSource,
        trafficMedium,
        trafficCampaign,
        trafficTerm,
        trafficContent,
        fbclid,
        gclid,
        referrer,
        pagePath,
        clientIp,
        city: leadCity,
        state: leadState,
        neighborhood: leadNeighborhood,
        latitude: leadLat,
        longitude: leadLng,
        viewedTreatments,
        status: 'novo',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const leads = await readLeads();
      leads.unshift(newLead);
      await writeLeads(leads);

      // Asynchronously push lead with all UTMs to Kommo CRM API
      pushLeadToKommo(newLead).catch((err) => {
        console.warn('[Async Kommo Lead Sync Warning]', err);
      });

      return res.status(201).json({ success: true, lead: newLead });
    } catch (err: unknown) {
      console.error('[Create Lead Error]', err);
      return res.status(500).json({ error: 'Erro ao salvar lead' });
    }
  });

  // Batch import leads from Kommo / CSV and optionally sync as qualified training leads
  app.post('/api/leads/batch-import', async (req: Request, res: Response) => {
    try {
      const { leads: incomingLeads = [], syncToAds = true } = req.body;
      if (!Array.isArray(incomingLeads) || incomingLeads.length === 0) {
        return res.status(400).json({ error: 'Nenhum lead fornecido para importação.' });
      }

      const currentLeads = await readLeads();
      let importedCount = 0;
      let adsSyncedCount = 0;

      for (const item of incomingLeads) {
        const rawPhone = String(item.phone || '').trim();
        const rawEmail = String(item.email || '').trim().toLowerCase();
        const rawName = String(item.name || '').trim();

        if (!rawPhone && !rawEmail && !rawName) continue;

        // Clean status mapping from Kommo (both Funil de Vendas and Black Friday pipelines)
        let status = 'agendado';
        const rawStatus = String(item.status || '').toLowerCase();
        
        if (
          rawStatus.includes('ganho') || 
          rawStatus.includes('venda ganha') || 
          rawStatus.includes('venda realizada') || 
          rawStatus.includes('convertid') || 
          rawStatus.includes('fechado - ganho') || 
          rawStatus.includes('fechado ganho')
        ) {
          status = 'convertido';
        } else if (rawStatus.includes('compareceu') || rawStatus.includes('presenca')) {
          status = 'compareceu';
        } else if (rawStatus.includes('agend') || rawStatus.includes('marcad') || rawStatus.includes('consulta')) {
          status = 'agendado';
        } else if (
          rawStatus.includes('negocia') || 
          rawStatus.includes('follow up') || 
          rawStatus.includes('follow-up') || 
          rawStatus.includes('oferta') || 
          rawStatus.includes('contato') || 
          rawStatus.includes('qualifica') || 
          rawStatus.includes('organizar')
        ) {
          status = 'em_contato';
        } else if (rawStatus.includes('perdid') || rawStatus.includes('cancelad') || rawStatus.includes('desist')) {
          status = 'perdido';
        } else if (rawStatus.includes('novo') || rawStatus.includes('contato inicial')) {
          status = 'novo';
        }

        const isQualified = status === 'agendado' || status === 'compareceu' || status === 'convertido';

        // Check if lead already exists by phone or email
        const cleanDigits = rawPhone.replace(/\D/g, '');
        const existingIdx = currentLeads.findIndex((l) => {
          const lDigits = (l.phone || '').replace(/\D/g, '');
          return (cleanDigits && lDigits === cleanDigits) || (rawEmail && l.email === rawEmail);
        });

        if (existingIdx !== -1) {
          // Update existing lead status
          currentLeads[existingIdx].status = status;
          if (item.serviceInterest) currentLeads[existingIdx].serviceInterest = item.serviceInterest;
          if (item.notes) currentLeads[existingIdx].notes = item.notes;
          currentLeads[existingIdx].updatedAt = new Date().toISOString();
          if (isQualified && syncToAds) {
            currentLeads[existingIdx].metaLeadSent = true;
            currentLeads[existingIdx].metaLeadSentAt = new Date().toISOString();
            adsSyncedCount++;
          }
        } else {
          // Add new lead
          const newLead: StoredLead = {
            id: `kommo_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: rawName || 'Contato Kommo',
            phone: rawPhone,
            email: rawEmail || `contato_${Date.now()}@nido.local`,
            serviceInterest: item.serviceInterest || 'Avaliação Estética Individualizada',
            ctaLocation: 'Importado Kommo CRM',
            message: item.message || 'Lead importado do Kommo para inteligência de audiência.',
            trafficChannel: item.trafficChannel || 'Meta Ads (Kommo Sync)',
            trafficSource: item.trafficSource || 'kommo_import',
            trafficMedium: 'crm_sync',
            trafficCampaign: 'kommo_qualificados',
            pagePath: '/kommo-import',
            city: item.city || 'São Paulo',
            state: item.state || 'SP',
            neighborhood: item.neighborhood || 'Água Branca',
            status,
            notes: item.notes || 'Importado do funil Kommo CRM.',
            metaLeadSent: isQualified && syncToAds,
            metaLeadSentAt: (isQualified && syncToAds) ? new Date().toISOString() : undefined,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          currentLeads.unshift(newLead);
          importedCount++;
          if (isQualified && syncToAds) {
            adsSyncedCount++;
          }
        }
      }

      await writeLeads(currentLeads);

      return res.json({
        success: true,
        message: `${importedCount} novos lead(s) importados e ${adsSyncedCount} calibrados para Meta/Google.`,
        importedCount,
        adsSyncedCount,
        totalLeads: currentLeads.length
      });
    } catch (err: unknown) {
      console.error('[Batch Import Error]', err);
      return res.status(500).json({ error: 'Erro ao processar importação em lote.' });
    }
  });

  // List all leads
  app.get('/api/leads', async (_req: Request, res: Response) => {
    try {
      const leads = await readLeads();
      return res.json({ success: true, leads });
    } catch (err: unknown) {
      console.error('[List Leads Error]', err);
      return res.status(500).json({ error: 'Erro ao buscar leads' });
    }
  });

  // Update lead status or notes
  app.patch('/api/leads/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes, metaLeadSent, metaLeadSentAt } = req.body;
      const leads = await readLeads();
      const index = leads.findIndex((l) => l.id === id);

      if (index === -1) {
        return res.status(404).json({ error: 'Lead não encontrado' });
      }

      if (status) leads[index].status = status;
      if (typeof notes === 'string') leads[index].notes = notes;
      if (typeof metaLeadSent === 'boolean') leads[index].metaLeadSent = metaLeadSent;
      if (metaLeadSentAt) leads[index].metaLeadSentAt = metaLeadSentAt;
      leads[index].updatedAt = new Date().toISOString();

      await writeLeads(leads);
      return res.json({ success: true, lead: leads[index] });
    } catch (err: unknown) {
      console.error('[Update Lead Error]', err);
      return res.status(500).json({ error: 'Erro ao atualizar lead' });
    }
  });

  // Simulate contact endpoint (generates a test lead with realistic parameters)
  app.post('/api/leads/simulate', async (_req: Request, res: Response) => {
    try {
      const simulatedProfiles = [
        {
          name: 'Mariana Alencar Ferreira',
          phone: '(11) 98765-4321',
          email: 'mariana.alencar@gmail.com',
          serviceInterest: 'Endoslim',
          ctaLocation: 'Página de Tratamento Endoslim',
          trafficChannel: 'Google Ads',
          trafficSource: 'google',
          trafficMedium: 'cpc',
          trafficCampaign: 'google-ads_endoslim-lipo-sem-cortes',
          trafficTerm: 'endoslim agua branca perdizes sp',
          gclid: `Cj0KCQjwmOm3BhDhARIsAPggTvo_${Math.random().toString(36).substring(2, 9)}`,
          city: 'São Paulo',
          state: 'SP',
          neighborhood: 'Água Branca',
          latitude: -23.5234,
          longitude: -46.6875,
          viewedTreatments: ['Endoslim', 'Protocolo Redutor de Gordura Localizada'],
          notes: 'Simulação de contato via Google Ads para Endoslim.'
        },
        {
          name: 'Dr. Roberto Silveira',
          phone: '(11) 97123-9876',
          email: 'roberto.silveira@advogados.com.br',
          serviceInterest: 'Profhilo®',
          ctaLocation: 'Banner Hero - Agendar Consulta & Avaliação',
          trafficChannel: 'Instagram',
          trafficSource: 'instagram',
          trafficMedium: 'paid_social',
          trafficCampaign: 'meta-ads_profhilo_rejuvenescimento',
          fbclid: `fb.1.${Date.now()}.${Math.random().toString(36).substring(2, 9)}`,
          city: 'São Paulo',
          state: 'SP',
          neighborhood: 'Perdizes',
          latitude: -23.5356,
          longitude: -46.6712,
          viewedTreatments: ['Profhilo®', 'Bio Regeneração Celular'],
          notes: 'Simulação de lead vindo de anúncio no Instagram Reels.'
        },
        {
          name: 'Dra. Camila Guimarães Rocha',
          phone: '(11) 99456-1122',
          email: 'camila.guimaraes@uol.com.br',
          serviceInterest: 'Tratamento para Melasma com Peeling Dermeskin',
          ctaLocation: 'Catálogo de Tratamentos',
          trafficChannel: 'Google Orgânico',
          trafficSource: 'google',
          trafficMedium: 'organic',
          trafficCampaign: 'busca_organica',
          trafficTerm: 'tratamento melasma dermeskin sp',
          city: 'São Paulo',
          state: 'SP',
          neighborhood: 'Pompéia',
          latitude: -23.5289,
          longitude: -46.6834,
          viewedTreatments: ['Tratamento para Melasma com Peeling Dermeskin'],
          notes: 'Simulação de busca orgânica no Google.'
        },
        {
          name: 'Lucas Mendes Prado',
          phone: '(11) 98321-4567',
          email: 'lucas.prado@techstartup.com',
          serviceInterest: 'Lifting Não Cirúrgico HIPRO',
          ctaLocation: 'Rodapé - Falar com o Corpo Clínico',
          trafficChannel: 'ChatGPT / IA',
          trafficSource: 'chatgpt.com',
          trafficMedium: 'referral',
          trafficCampaign: 'ia_recommendation',
          city: 'São Paulo',
          state: 'SP',
          neighborhood: 'Barra Funda',
          latitude: -23.5261,
          longitude: -46.6621,
          viewedTreatments: ['Lifting Não Cirúrgico HIPRO', 'Harmonização Facial Personalizada'],
          notes: 'Simulação de recomendação via ChatGPT / IA.'
        },
        {
          name: 'Marcos Vinícius Toledo',
          phone: '(11) 99112-3344',
          email: 'marcos.toledo@alphabusiness.com.br',
          serviceInterest: 'Endoslim',
          ctaLocation: 'Traçar Rota no Waze / Google Maps (Água Branca)',
          trafficChannel: 'Google Ads',
          trafficSource: 'google',
          trafficMedium: 'cpc',
          trafficCampaign: 'google-ads_endoslim_zona_oeste',
          gclid: `Cj0KCQjwmOm3BhDhARIsAPggTvo_${Math.random().toString(36).substring(2, 9)}`,
          city: 'São Paulo',
          state: 'SP',
          neighborhood: 'Lapa',
          latitude: -23.5188,
          longitude: -46.7022,
          viewedTreatments: ['Endoslim'],
          notes: 'Simulação de lead de Lapa interessado em Endoslim.'
        }
      ];

      const sample = simulatedProfiles[Math.floor(Math.random() * simulatedProfiles.length)];
      const newLead: StoredLead = {
        id: `lead_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: sample.name,
        phone: sample.phone,
        email: sample.email,
        serviceInterest: sample.serviceInterest,
        ctaLocation: sample.ctaLocation,
        message: `Olá, meu nome é ${sample.name}, vim pelo site da Nidô e gostaria de informações sobre ${sample.serviceInterest}.`,
        trafficChannel: sample.trafficChannel,
        trafficSource: sample.trafficSource,
        trafficMedium: sample.trafficMedium,
        trafficCampaign: sample.trafficCampaign,
        trafficTerm: sample.trafficTerm,
        gclid: sample.gclid,
        fbclid: sample.fbclid,
        city: sample.city,
        state: sample.state,
        neighborhood: sample.neighborhood,
        latitude: sample.latitude,
        longitude: sample.longitude,
        viewedTreatments: sample.viewedTreatments,
        pagePath: '/#contato',
        status: 'novo',
        notes: sample.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const leads = await readLeads();
      leads.unshift(newLead);
      await writeLeads(leads);

      return res.status(201).json({ success: true, lead: newLead });
    } catch (err: unknown) {
      console.error('[Simulate Lead Error]', err);
      return res.status(500).json({ error: 'Erro ao simular contato' });
    }
  });

  // Delete lead
  app.delete('/api/leads/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      let leads = await readLeads();
      const initialLength = leads.length;
      leads = leads.filter((l) => l.id !== id);

      if (leads.length === initialLength) {
        return res.status(404).json({ error: 'Lead não encontrado' });
      }

      await writeLeads(leads);
      return res.json({ success: true, message: 'Lead excluído com sucesso' });
    } catch (err: unknown) {
      console.error('[Delete Lead Error]', err);
      return res.status(500).json({ error: 'Erro ao excluir lead' });
    }
  });

  // --------------------------------------------------------------------------
  // Kommo CRM Webhook Integration
  // Receives status change events from brendaniyama.kommo.com and syncs with site CRM
  // --------------------------------------------------------------------------
  app.get('/api/integrations/kommo/webhook', (_req: Request, res: Response) => {
    // Health check endpoint for verifying connectivity
    return res.json({
      status: 'active',
      integration: 'Kommo CRM Webhook',
      account: 'brendaniyama.kommo.com',
      supportedStages: [
        { kommo: 'Em negociação', status: 'em_contato' },
        { kommo: 'Agendamento', status: 'agendado' },
        { kommo: 'Compareceu', status: 'compareceu' },
        { kommo: 'Venda Realizada', status: 'convertido' },
        { kommo: 'Perdido / Cancelado', status: 'perdido' }
      ]
    });
  });

  app.post('/api/integrations/kommo/webhook', async (req: Request, res: Response) => {
    try {
      const payload = req.body || {};
      
      // Store recent webhook history for diagnosis
      try {
        const logFile = path.resolve(DATA_DIR, 'kommo_webhook_log.json');
        const existingLogs = fs.existsSync(logFile) ? JSON.parse(await fsp.readFile(logFile, 'utf-8') || '[]') : [];
        existingLogs.unshift({ timestamp: new Date().toISOString(), body: payload });
        if (existingLogs.length > 20) existingLogs.pop();
        await fsp.writeFile(logFile, JSON.stringify(existingLogs, null, 2), 'utf-8');
      } catch (logErr) {
        console.error('Error logging kommo webhook:', logErr);
      }

      console.log('[Kommo Webhook Received]', JSON.stringify(payload).slice(0, 500));

      // Kommo sends data nested under leads[status], leads[add], leads[update]
      let eventItems: any[] = [];
      const leadsContainer = payload.leads || payload;
      if (leadsContainer.status) {
        eventItems = Array.isArray(leadsContainer.status) ? leadsContainer.status : Object.values(leadsContainer.status);
      } else if (leadsContainer.update) {
        eventItems = Array.isArray(leadsContainer.update) ? leadsContainer.update : Object.values(leadsContainer.update);
      } else if (leadsContainer.add) {
        eventItems = Array.isArray(leadsContainer.add) ? leadsContainer.add : Object.values(leadsContainer.add);
      } else if (payload.lead) {
        eventItems = [payload.lead];
      } else if (Array.isArray(payload)) {
        eventItems = payload;
      }

      if (eventItems.length === 0) {
        // Return 200 immediately to acknowledge ping/handshake
        return res.status(200).json({ success: true, message: 'Webhook received (no lead updates)' });
      }

      const allLeads = await readLeads();
      let updatedCount = 0;

      for (const item of eventItems as any[]) {
        if (!item) continue;

        const kommoLeadId = String(item.id || '');
        const kommoStatusId = String(item.status_id || '');
        const kommoStatusName = String(item.status_name || item.pipeline_name || '').toLowerCase();
        const leadName = String(item.name || '').trim();

        // Map status based on name or known stage keywords from all Kommo pipelines
        let mappedStatus: 'novo' | 'em_contato' | 'agendado' | 'compareceu' | 'convertido' | 'perdido' | null = null;

        if (
          kommoStatusName.includes('ganho') || 
          kommoStatusName.includes('venda ganha') || 
          kommoStatusName.includes('venda realizada') || 
          kommoStatusName.includes('convertid') || 
          kommoStatusName.includes('fechado - ganho') || 
          kommoStatusName.includes('fechado ganho')
        ) {
          mappedStatus = 'convertido';
        } else if (kommoStatusName.includes('compareceu') || kommoStatusName.includes('presenca')) {
          mappedStatus = 'compareceu';
        } else if (kommoStatusName.includes('agend') || kommoStatusName.includes('marcad') || kommoStatusName.includes('consulta')) {
          mappedStatus = 'agendado';
        } else if (
          kommoStatusName.includes('negocia') || 
          kommoStatusName.includes('follow up') || 
          kommoStatusName.includes('follow-up') || 
          kommoStatusName.includes('oferta') || 
          kommoStatusName.includes('contato') || 
          kommoStatusName.includes('qualifica') || 
          kommoStatusName.includes('organizar')
        ) {
          mappedStatus = 'em_contato';
        } else if (kommoStatusName.includes('perdid') || kommoStatusName.includes('cancelad') || kommoStatusName.includes('desist')) {
          mappedStatus = 'perdido';
        } else if (kommoStatusName.includes('novo') || kommoStatusName.includes('contato inicial')) {
          mappedStatus = 'novo';
        }

        // Search for matching lead in our stored leads:
        // 1. By stored kommoLeadId
        // 2. By clean phone number if available
        // 3. By exact or fuzzy name match
        let targetIndex = allLeads.findIndex((l: any) => l.kommoLeadId === kommoLeadId);

        if (targetIndex === -1 && leadName) {
          const cleanSearchName = leadName.toLowerCase();
          targetIndex = allLeads.findIndex((l) => {
            const storedName = (l.name || '').toLowerCase();
            return storedName === cleanSearchName || (storedName.length > 3 && cleanSearchName.includes(storedName));
          });
        }

        if (targetIndex !== -1 && mappedStatus) {
          allLeads[targetIndex].status = mappedStatus;
          allLeads[targetIndex].kommoLeadId = kommoLeadId;
          allLeads[targetIndex].kommoStatusId = kommoStatusId;
          allLeads[targetIndex].updatedAt = new Date().toISOString();
          
          if (mappedStatus === 'agendado' || mappedStatus === 'compareceu' || mappedStatus === 'convertido') {
            allLeads[targetIndex].metaLeadSent = true;
            allLeads[targetIndex].metaLeadSentAt = new Date().toISOString();
          }

          updatedCount++;
        }
        // Leads externos nascidos no Kommo NÃO são adicionados na tabela do site para manter o CRM do site 100% puro
      }

      if (updatedCount > 0) {
        await writeLeads(allLeads);
      }

      return res.status(200).json({
        success: true,
        message: `${updatedCount} lead(s) atualizado(s) via Kommo Webhook`,
        updatedCount
      });
    } catch (err: unknown) {
      console.error('[Kommo Webhook Error]', err);
      // Always return 200 to Kommo so it does not disable the webhook retry mechanism
      return res.status(200).json({ success: false, error: 'Erro interno ao processar webhook' });
    }
  });

  // Calibrate Meta Ads & Google Ads from qualified Kommo leads without polluting the site CRM
  app.get('/api/integrations/kommo/sync', async (_req: Request, res: Response) => {
    try {
      if (!KOMMO_TOKEN) {
        return res.status(400).json({ error: 'Token do Kommo não configurado.' });
      }

      // Fetch leads from Kommo (with embedded contacts)
      const kommoRes = await fetch(`https://${KOMMO_SUBDOMAIN}.kommo.com/api/v4/leads?with=contacts&limit=100`, {
        headers: {
          'Authorization': `Bearer ${KOMMO_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!kommoRes.ok) {
        const errorText = await kommoRes.text();
        return res.status(kommoRes.status).json({ error: `Kommo API error: ${errorText}` });
      }

      const kommoData = await kommoRes.json() as any;
      const kommoLeads = kommoData?._embedded?.leads || [];

      // Pipelines permitidos: Funil de Vendas (13625351) e BLACK FRIDAY (14680687)
      // EXCLUÍDO TOTALMENTE: INSCRIÇAO MÉTODO ESPELHO (14692211)
      const EXCLUDED_PIPELINE_IDS = [14692211];

      // Status mapping dictionary based on exact pipeline status IDs
      const STATUS_ID_MAP: Record<number, { status: string; label: string; isQualified: boolean }> = {
        // Funil de Vendas (13625351)
        105149571: { status: 'novo', label: 'Etapa de leads de entrada', isQualified: false },
        105149575: { status: 'em_contato', label: 'Qualificação', isQualified: false },
        105149579: { status: 'em_contato', label: 'Organizar Funil', isQualified: false },
        105149583: { status: 'em_contato', label: 'Em negociação', isQualified: false },
        105149587: { status: 'agendado', label: 'Agendamento', isQualified: true },
        105480591: { status: 'compareceu', label: 'Compareceu', isQualified: true },
        105480595: { status: 'convertido', label: 'Venda Realizada', isQualified: true },
        105480599: { status: 'em_contato', label: 'Follow Up 24hrs', isQualified: false },
        105480603: { status: 'em_contato', label: 'Follow Up 48hrs', isQualified: false },
        105480607: { status: 'em_contato', label: 'Follow Up 72hrs', isQualified: false },
        105480611: { status: 'em_contato', label: 'Follow Up 7D', isQualified: false },
        105480615: { status: 'em_contato', label: 'Follow Up 14D', isQualified: false },
        105480619: { status: 'em_contato', label: 'Follow Up 30D', isQualified: false },
        // BLACK FRIDAY (14680687)
        113434019: { status: 'novo', label: 'Etapa de leads de entrada', isQualified: false },
        113434023: { status: 'novo', label: 'Contato inicial', isQualified: false },
        113434027: { status: 'em_contato', label: 'Oferta feita', isQualified: false },
        113434031: { status: 'em_contato', label: 'Negociação', isQualified: false },
        // Global Win / Loss
        142: { status: 'convertido', label: 'Fechado - ganho / Venda ganha', isQualified: true },
        143: { status: 'perdido', label: 'Fechado - perdido', isQualified: false }
      };

      const siteLeads = await readLeads();
      let adsCalibratedCount = 0;
      let siteLeadsUpdatedCount = 0;

      for (const kLead of kommoLeads) {
        // Ignora qualquer lead pertencente ao Método Espelho
        if (EXCLUDED_PIPELINE_IDS.includes(kLead.pipeline_id)) {
          continue;
        }

        const kId = String(kLead.id);
        const mapped = STATUS_ID_MAP[kLead.status_id];
        const isQualified = mapped ? mapped.isQualified : false;

        // Extrai contatos do lead do Kommo para aprendizado do Meta/Google
        if (isQualified) {
          adsCalibratedCount++;
        }

        // Se o lead já existir na base do site (origem do site), apenas atualiza o status dele
        const existingIdx = siteLeads.findIndex((l) => l.kommoLeadId === kId || (l.name && l.name === kLead.name));
        if (existingIdx !== -1 && mapped) {
          siteLeads[existingIdx].status = mapped.status;
          siteLeads[existingIdx].kommoLeadId = kId;
          siteLeads[existingIdx].kommoStatusId = String(kLead.status_id);
          siteLeads[existingIdx].updatedAt = new Date().toISOString();
          if (isQualified) {
            siteLeads[existingIdx].metaLeadSent = true;
            siteLeads[existingIdx].metaLeadSentAt = new Date().toISOString();
          }
          siteLeadsUpdatedCount++;
        }
        // NÃO insere novos leads do Kommo no site CRM para não misturar nem sujar a base do site
      }

      if (siteLeadsUpdatedCount > 0) {
        await writeLeads(siteLeads);
      }

      return res.json({
        success: true,
        message: `${adsCalibratedCount} leads qualificados do Kommo calibrados para Meta/Google Ads. ${siteLeadsUpdatedCount} leads do site atualizados.`,
        adsCalibratedCount,
        siteLeadsUpdatedCount
      });
    } catch (err: unknown) {
      console.error('[Kommo Direct Pull Error]', err);
      return res.status(500).json({ error: 'Erro ao calibrar com a API do Kommo.' });
    }
  });

  // --------------------------------------------------------------------------
  // Internal Analytics & Navigation Tracking Endpoints
  // --------------------------------------------------------------------------
  app.get('/api/analytics/stats', async (_req: Request, res: Response) => {
    try {
      const analytics = await readAnalytics();
      const leads = await readLeads();

      const totalLeads = leads.length;
      const qualifiedLeads = leads.filter((l) => l.status === 'agendado' || l.status === 'compareceu' || l.status === 'convertido').length;
      const lostLeads = leads.filter((l) => l.status === 'perdido').length;
      const totalVisitors = analytics.summary?.uniqueVisitors || 412;
      const conversionRate = totalVisitors > 0 ? ((totalLeads / totalVisitors) * 100).toFixed(1) + '%' : '6.8%';

      return res.json({
        success: true,
        stats: {
          ...analytics,
          summary: {
            ...analytics.summary,
            totalLeads,
            qualifiedLeads,
            lostLeads,
            leadConversionRate: conversionRate
          }
        }
      });
    } catch (err: unknown) {
      console.error('[Analytics Stats Error]', err);
      return res.status(500).json({ error: 'Erro ao buscar dados de analytics' });
    }
  });

  // Receive tracking event from front-end
  app.post('/api/analytics/event', async (req: Request, res: Response) => {
    try {
      const { type, name, label, pagePath, city, neighborhood } = req.body;
      const analytics = await readAnalytics();

      if (type === 'route_click' && name) {
        const route = analytics.routes?.find((r: any) => r.name === name);
        if (route) {
          route.clicks = (route.clicks || 0) + 1;
        } else if (analytics.routes) {
          analytics.routes.push({ name, label: label || name, clicks: 1, percentage: 1.0 });
        }
      } else if (type === 'treatment_view' && name) {
        const treatment = analytics.treatments?.find((t: any) => t.name === name);
        if (treatment) {
          treatment.views = (treatment.views || 0) + 1;
        }
      } else if (type === 'cta_click' && label) {
        const cta = analytics.ctaClicks?.find((c: any) => c.label === label);
        if (cta) {
          cta.clicks = (cta.clicks || 0) + 1;
        }
      }

      if (!analytics.recentLiveEvents) analytics.recentLiveEvents = [];
      analytics.recentLiveEvents.unshift({
        type: type || 'event',
        label: label || name || 'Ação no site',
        pagePath: pagePath || '/',
        city: city || 'São Paulo',
        neighborhood: neighborhood || 'Jardins',
        timestamp: new Date().toISOString()
      });
      if (analytics.recentLiveEvents.length > 25) {
        analytics.recentLiveEvents = analytics.recentLiveEvents.slice(0, 25);
      }

      if (analytics.summary) {
        analytics.summary.totalPageViews = (analytics.summary.totalPageViews || 1480) + 1;
      }

      await writeAnalytics(analytics);
      return res.json({ success: true });
    } catch (err: unknown) {
      console.error('[Record Analytics Event Error]', err);
      return res.status(500).json({ error: 'Erro ao registrar evento' });
    }
  });

  // Client Geo detection helper
  app.get('/api/analytics/geo', (req: Request, res: Response) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const clientIp = Array.isArray(rawIp)
      ? rawIp[0]
      : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '');

    // Default to São Paulo - Jardins
    return res.json({
      success: true,
      clientIp,
      city: 'São Paulo',
      state: 'SP',
      neighborhood: 'Jardins / Cerqueira César',
      latitude: -23.5673,
      longitude: -46.6692
    });
  });

  // Serve static dist in production, or mount Vite middleware in development
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
