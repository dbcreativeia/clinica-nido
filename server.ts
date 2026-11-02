import {initConsentReceipts,recordConsentReceipt,isStoredMarketingAllowed} from './privacy-consent.mjs';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { promises as fsp } from 'fs';
import crypto from 'crypto';
import mysql from 'mysql2/promise';
import { CRM_VERSION, normalizedPhone, synchronizeKommo, receiveKommoWebhook, createKommoRepository } from './crm-sync.mjs';
import { sendMetaConversionEvent, getMetaDispatchDiagnostics } from './meta-capi.mjs';
import { normalizeMetaContext, initCrmMetaOutbox, createCrmMetaQueue } from './crm-meta.mjs';
import { normalizeLocation, normalizeAttribution, parseContext, validCoordinates } from './tracking-context.mjs';
import { initAnalyticsDatabase, recordAnalyticsEvent, getAnalyticsStats } from './analytics-engine.mjs';
import { reverseGeocodeCoordinates } from './geocoder.mjs';

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
  queueLimit: 100,
  connectTimeout: 8000,
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
        pipeline_id: 13625351, // Funil de Vendas oficial da Clínica
        status_id: 105149571, // Etapa de leads de entrada
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

    // Extract created Kommo lead ID
    let createdKommoId: string | undefined;
    if (Array.isArray(data) && data[0]?.id) {
      createdKommoId = String(data[0].id);
    }

    return { success: response.ok, kommoLeadId: createdKommoId, data };
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
  app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Meta Conversions API Status / Health Check
  app.get('/api/meta/status', (req: Request, res: Response) => {
    const isProdEnv = process.env.NODE_ENV === 'production';
    const testModeActive = !isProdEnv && process.env.META_FORCE_TEST_MODE === 'true' && Boolean(TEST_EVENT_CODE);
    res.json({
      version: 'nido-meta-v4',
      status: 'active',
      pixelId: PIXEL_ID,
      tokenConfigured: Boolean(CAPI_TOKEN),
      dispatchDiagnostics: getMetaDispatchDiagnostics(),
      testCodeConfigured: Boolean(TEST_EVENT_CODE),
      testModeActive,
      productionDomains: PRODUCTION_DOMAINS,
      crmQualification: {mode:'server-outbox',ready:Boolean(crmMetaQueue)},
      timestamp: new Date().toISOString()
    });
  });

  // Meta Conversions API (CAPI) Endpoint
  app.post('/api/meta/conversion', async (req: Request, res: Response) => {
    try {
      const {
        eventName,
        eventId,
        eventTime,
        marketingConsent,
        eventSourceUrl,
        customData = {},
        userData = {},
        testEventCode,
        isProductionClient
      } = req.body;

      if (!eventName) {
        return res.status(400).json({ error: 'eventName is required' });
      }

      if(eventName==='Lead') return res.status(400).json({success:false,error:'Lead qualification is dispatched by the CRM server.'});
      if(marketingConsent!==true) return res.status(400).json({success:false,error:'Marketing consent required'});
      if(typeof eventName!=='string' || !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(eventName) || typeof eventId!=='string' || !/^nido_[a-z0-9_]{1,150}$/.test(eventId)) return res.status(400).json({success:false,error:'Invalid event identifiers'});
      const eventSeconds=Number(eventTime);
      if(!Number.isInteger(eventSeconds) || eventSeconds<Math.floor(Date.now()/1000)-86400 || eventSeconds>Math.floor(Date.now()/1000)+60) return res.status(400).json({success:false,error:'Invalid event time'});
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
      const normalizedEm = userData.em && !String(userData.em).toLowerCase().endsWith('@nido.local') ? hashSha256(userData.em.trim().toLowerCase()) : undefined;
      const normalizedPh = userData.ph ? hashSha256(normalizePhone(userData.ph)) : undefined;
      const normalizedFn = userData.fn ? hashSha256(normalizeText(userData.fn)) : undefined;
      const normalizedLn = userData.ln ? hashSha256(normalizeText(userData.ln)) : undefined;
      const normalizedCt = userData.ct ? hashSha256(normalizeText(userData.ct)) : undefined;
      const normalizedSt = userData.st ? hashSha256(userData.st.trim().toLowerCase()) : undefined;
      const normalizedCountry = userData.country ? hashSha256(userData.country.trim().toLowerCase()) : undefined;
      const normalizedZip = userData.zp ? hashSha256(String(userData.zp).replace(/\D/g,'')) : undefined;
      const normalizedExternalId = userData.external_id ? hashSha256(userData.external_id.trim()) : undefined;

      const rawEventSourceUrl = eventSourceUrl || req.headers.referer || 'https://www.nidoestetica.com.br/';
      const cleanEventSourceUrl = sanitizeUrlForMeta(rawEventSourceUrl);

      const finalEventId = eventId || `nido_${eventName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      let sanitizedCustomData: Record<string, unknown> = {
        currency: 'BRL',
        content_name: 'Informações institucionais',
        content_category: 'Site'
      };

      if (eventName === 'FindLocation') {
        let app: string | undefined = undefined;
        if (['Google Maps', 'Waze', 'Uber'].includes(customData.destination_app)) {
          app = customData.destination_app;
        }
        let locLabel = 'Site';
        if (customData.cta_location === 'Rodapé') locLabel = 'Rodapé';
        else if (customData.cta_location === 'Contato' || customData.cta_location === '/contato') locLabel = 'Contato';

        sanitizedCustomData = {
          currency: 'BRL',
          content_name: 'Clínica Nidô - Água Branca, São Paulo',
          content_category: 'Localização & Rota',
          ...(app ? { destination_app: app } : {}),
          cta_location: locLabel
        };
      }

      const eventPayload: Record<string, unknown> = {
        event_name: eventName,
        event_time: eventSeconds,
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
          ...(normalizedZip ? { zp: normalizedZip } : {}),
          ...(normalizedCountry ? { country: normalizedCountry } : {}),
          ...(normalizedExternalId ? { external_id: normalizedExternalId } : {})
        },
        custom_data: sanitizedCustomData
      };

      const officialRequest=PRODUCTION_DOMAINS.includes(req.hostname.toLowerCase()) && isProductionUrl(cleanEventSourceUrl);
      const liveMode=process.env.NODE_ENV==='production' && officialRequest;
      const effectiveTestCode=process.env.NODE_ENV!=='production' && process.env.META_FORCE_TEST_MODE==='true' ? TEST_EVENT_CODE || undefined : undefined;
      if(!liveMode && !effectiveTestCode) return res.json({success:true,dev_mode:true,eventId:finalEventId});

      // If token not configured, return 503 and success false
      if (!CAPI_TOKEN) {
        return res.status(503).json({
          success: false,
          error: 'CAPI token not configured'
        });
      }

      const requestBody: Record<string, unknown> = {
        data: [eventPayload]
      };

      if (effectiveTestCode) {
        requestBody.test_event_code = effectiveTestCode;
      }

      const capiRes = await sendMetaConversionEvent(requestBody, {
        token: CAPI_TOKEN,
        pixelId: PIXEL_ID,
        maxRetries: 3
      });

      if (!capiRes.success) {
        return res.status(capiRes.status===400?400:503).json({
          success: false,
          warning: capiRes.error || 'Meta CAPI request rejected',
          status: capiRes.status,
          eventId: finalEventId
        });
      }

      return res.json({
        success: true,
        events_received: capiRes.events_received,
        fbtrace_id: capiRes.fbtrace_id,
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
  const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(__dirname, 'data');
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
    attribution?: Record<string, any>;
    geoConsent?: boolean;
    locationSource?: string;
    locationCapturedAt?: string | null;
    accuracy?: number;
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
    road?: string;
    houseNumber?: string;
    displayAddress?: string;
    viewedTreatments?: string[];
    sessionJourney?: {
      startedAt?: string;
      totalDurationSeconds?: number;
      totalPageViews?: number;
      deviceType?: string;
      browser?: string;
      steps?: Array<{
        path: string;
        title: string;
        enteredAt: number;
        durationSeconds: number;
      }>;
    };
    procedureCycles?: Array<{
      cycleId: string;
      procedureName: string;
      date: string;
      status: string;
      trafficSource?: string;
      trafficCampaign?: string;
      notes?: string;
    }>;
    kommoLeadId?: string;
    kommoStatusId?: string;
    kommoUpdatedAt?: number;
    createdAt: string;
    updatedAt: string;
  }

  // Initialize MySQL leads table if not exists
  let isDbReady = false;
  let isAnalyticsDbReady = false;
  let isPrivacyReady=false;
  const privacyRate=new Map<string,{count:number,until:number}>();
  app.get('/api/privacy/status',(_req,res)=>res.json({version:'nido-privacy-v1',ready:isPrivacyReady}));
  app.post('/api/privacy/consent',async(req,res)=>{
    const origin=req.headers.origin;
    if(origin && !['https://nidoestetica.com.br','https://www.nidoestetica.com.br'].includes(origin) && process.env.NODE_ENV==='production')return res.status(403).json({success:false});
    const key=extractRealClientIp(req)||'unknown',now=Date.now();
    if(privacyRate.size>5000)for(const [k,v] of privacyRate)if(v.until<now)privacyRate.delete(k);
    const quota=privacyRate.get(key);if(quota&&quota.until>now&&quota.count>=120)return res.status(429).json({success:false});
    privacyRate.set(key,{count:quota&&quota.until>now?quota.count+1:1,until:quota&&quota.until>now?quota.until:now+3600000});
    if(!dbPool)return res.status(503).json({success:false});
    try{if(!isPrivacyReady){await initConsentReceipts(dbPool);isPrivacyReady=true;}
      const receiptId=await recordConsentReceipt(dbPool,req.body);return res.json({success:true,receiptId});
    }catch(error){if(error instanceof Error && error.message==='Invalid privacy receipt')return res.status(400).json({success:false});return res.status(503).json({success:false});}
  });

  async function initAnalyticsTable(): Promise<void> {
    if (!dbPool) return;
    try {
      await initAnalyticsDatabase(dbPool);
      isAnalyticsDbReady = true;
      console.log('[MySQL Analytics Table Verified] Tabela nido_analytics_events pronta.');
    } catch (err) {
      console.error('[MySQL Analytics Init Table Error]', err);
      isAnalyticsDbReady = false;
    }
  }

  let crmMetaQueue: ReturnType<typeof createCrmMetaQueue> | null = null;
  let metaQueueStarting: Promise<void> | null = null;
  async function ensureMetaQueue(): Promise<void> {
    if (crmMetaQueue || !dbPool) return;
    if (!metaQueueStarting) metaQueueStarting=(async()=>{
      await initCrmMetaOutbox(dbPool);
      crmMetaQueue=createCrmMetaQueue({pool:dbPool,isAllowed:(lead:any)=>isStoredMarketingAllowed(dbPool,lead),send:async(payload: any)=> {
        if(process.env.NODE_ENV!=='production') return {success:false,events_received:0};
        return sendMetaConversionEvent(payload,{token:CAPI_TOKEN,pixelId:PIXEL_ID,maxRetries:3});
      }});
    })().finally(()=>{metaQueueStarting=null;});
    await metaQueueStarting;
  }
  async function enqueueQualifiedMeta(id: string) {
    try { await ensureMetaQueue(); return await crmMetaQueue?.qualify(id); }
    catch { console.warn('[CRM Meta] Qualification delivery pending database recovery.'); return {status:'unavailable'}; }
  }
  async function processCrmMetaQueue() {
    if(!isDbReady || !dbPool) return;
    await ensureMetaQueue();
    const [rows]=await dbPool.query<mysql.RowDataPacket[]>(`SELECT id FROM nido_leads WHERE deleted_at IS NULL AND status IN ('agendado','compareceu','convertido') AND COALESCE(meta_lead_sent,0)=0 AND JSON_EXTRACT(attribution_context,'$.meta.marketingConsent')=true AND CAST(JSON_UNQUOTE(JSON_EXTRACT(attribution_context,'$.meta.expiresAt')) AS UNSIGNED)>? AND NOT EXISTS (SELECT 1 FROM nido_meta_outbox o WHERE o.lead_id=nido_leads.id AND o.cycle_id=COALESCE(JSON_UNQUOTE(JSON_EXTRACT(nido_leads.procedure_cycles,'$[0].cycleId')),CONCAT('initial_',nido_leads.id))) LIMIT 100`,[Date.now()]);
    for(const row of rows) await crmMetaQueue?.qualify(row.id);
    await crmMetaQueue?.flush();
  }

  app.get('/api/meta/crm-status',async(_req: Request,res: Response)=>{
    try {
      await ensureMetaQueue();
      const pool = requireLeadDatabase();
      if (!pool) return res.json({version:'nido-crm-meta-v1',ready:false,counts:{}});
      const [rows]=await pool.query<mysql.RowDataPacket[]>('SELECT state,COUNT(*) AS total FROM nido_meta_outbox GROUP BY state');
      return res.json({version:'nido-crm-meta-v1',ready:Boolean(crmMetaQueue),counts:Object.fromEntries(rows.map(r=>[r.state,Number(r.total)]))});
    } catch {return res.status(503).json({ready:false,error:'Qualification queue unavailable'});}
  });

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
          session_journey JSON,
          procedure_cycles JSON,
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

      try {
        await dbPool.query(`ALTER TABLE nido_leads ADD COLUMN session_journey JSON AFTER viewed_treatments;`);
      } catch {}
      try {
        await dbPool.query(`ALTER TABLE nido_leads ADD COLUMN procedure_cycles JSON AFTER session_journey;`);
      } catch {}

      for (const definition of ['deleted_at DATETIME NULL', 'kommo_updated_at BIGINT NOT NULL DEFAULT 0', 'location_context JSON NULL', 'attribution_context JSON NULL']) {
        try { await dbPool.query(`ALTER TABLE nido_leads ADD COLUMN ${definition}`); }
        catch (error: any) { if (error.code !== 'ER_DUP_FIELDNAME') throw error; }
      }
      isDbReady = true;
      await ensureMetaQueue().catch(()=>console.warn('[CRM Meta] Outbox initialization pending.'));
      console.log('[MySQL Table Verified] Tabela nido_leads pronta.');
    } catch (err) {
      console.error('[MySQL Init Leads Table Error]', err);
      isDbReady = false;
    }

    await initAnalyticsTable().catch(console.error);
    if(dbPool)try{await initConsentReceipts(dbPool);isPrivacyReady=true;}catch{isPrivacyReady=false;}
  }

  // Trigger table check on boot and await
  await initDatabase().catch(console.error);
  void enrichExistingLeadsWithAddress().catch(() => {});
  const metaDeliveryTimer=setInterval(()=>{void processCrmMetaQueue().catch(()=>console.warn('[CRM Meta] Outbox retry pending.'));},30000);
  metaDeliveryTimer.unref();
  void processCrmMetaQueue().catch(()=>{});
  let databaseRetry: Promise<void> | null = null;
  let analyticsRetry: Promise<void> | null = null;

  app.use(['/api/leads', '/api/integrations/kommo'], async (_req, res, next) => {
    if (!isDbReady) {
      if (!databaseRetry) databaseRetry = initDatabase().finally(() => { databaseRetry = null; });
      await databaseRetry.catch(() => {});
    }
    next();
  });

  app.use('/api/analytics', async (_req, res, next) => {
    if (!isAnalyticsDbReady) {
      if (!analyticsRetry) analyticsRetry = initAnalyticsTable().finally(() => { analyticsRetry = null; });
      await analyticsRetry.catch(() => {});
    }
    next();
  });

  let isEnrichingLeads = false;
  async function enrichExistingLeadsWithAddress(): Promise<void> {
    if (!dbPool || !isDbReady || isEnrichingLeads) return;
    isEnrichingLeads = true;
    try {
      const [rows] = await dbPool.query<any[]>(
        "SELECT id, latitude, longitude, location_context, city, neighborhood FROM nido_leads WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND (city = 'Não informada' OR neighborhood = 'Não informada' OR city IS NULL)"
      );
      for (const row of rows) {
        const lat = Number(row.latitude);
        const lon = Number(row.longitude);
        if (validCoordinates(lat, lon)) {
          const geo = await reverseGeocodeCoordinates(lat, lon);
          if (geo) {
            const locContext = parseContext(row.location_context);
            locContext.city = geo.city;
            locContext.state = geo.state;
            locContext.neighborhood = geo.neighborhood;
            locContext.displayAddress = geo.displayAddress;
            locContext.road = geo.road;
            locContext.houseNumber = geo.houseNumber;
            locContext.addressSource = 'geocoder';
            await dbPool.query(
              "UPDATE nido_leads SET city = ?, state = ?, neighborhood = ?, location_context = ? WHERE id = ?",
              [geo.city, geo.state, geo.neighborhood, JSON.stringify(locContext), row.id]
            );
            console.log(`[Lead Address Enriched] ${row.id} -> ${geo.neighborhood}, ${geo.city} - ${geo.state}`);
          }
        }
      }
    } catch (err) {
      console.warn('[Enrich Existing Leads Warning]', err);
    } finally {
      isEnrichingLeads = false;
    }
  }

  function requireLeadDatabase(): mysql.Pool | null {
    if (!dbPool || !isDbReady) return null;
    return dbPool;
  }

  async function saveLeadsToFile(leads: StoredLead[]) {
    try {
      await ensureLeadsFile();
      await fsp.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving leads to file:', e);
    }
  }

  async function readLeads(): Promise<StoredLead[]> {
    let mysqlRows: any[] = [];
    const pool = requireLeadDatabase();
    if (pool) {
      try {
        const [rows] = await pool.query<any[]>('SELECT * FROM nido_leads WHERE deleted_at IS NULL ORDER BY created_at DESC');
        mysqlRows = rows || [];
      } catch (err) {
        console.warn('[MySQL Read Leads Fallback] Using local file leads.json:', err);
      }
    }

    let fileLeads: StoredLead[] = [];
    try {
      await ensureLeadsFile();
      const content = await fsp.readFile(LEADS_FILE, 'utf-8');
      fileLeads = JSON.parse(content || '[]');
    } catch (e) {
      console.warn('[File Read Leads Fallback Error]', e);
    }

    const leadMap = new Map<string, StoredLead>();
    for (const fl of fileLeads) {
      if (fl && fl.id) leadMap.set(fl.id, fl);
    }

    for (const r of mysqlRows) {
      const locContext = parseContext(r.location_context);
      const normLoc = normalizeLocation(locContext, false);
      const city = (r.city && r.city !== 'Não informada') ? r.city : (normLoc.city !== 'Não informada' ? normLoc.city : (locContext.city && locContext.city !== 'Não informada' ? locContext.city : 'Não informada'));
      const neighborhood = (r.neighborhood && r.neighborhood !== 'Não informada') ? r.neighborhood : (normLoc.neighborhood !== 'Não informada' ? normLoc.neighborhood : (locContext.neighborhood && locContext.neighborhood !== 'Não informada' ? locContext.neighborhood : 'Não informada'));
      const state = (r.state && r.state !== 'Não informada') ? r.state : (normLoc.state !== 'Não informada' ? normLoc.state : (locContext.state && locContext.state !== 'Não informada' ? locContext.state : 'Não informada'));
      const displayAddress = locContext.displayAddress || (neighborhood !== 'Não informada' && city !== 'Não informada' ? `${neighborhood}, ${city} - ${state}` : undefined);

      const parsedLead: StoredLead = {
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
        ...normLoc,
        city,
        neighborhood,
        state,
        latitude: normLoc.latitude ?? (r.latitude != null ? Number(r.latitude) : undefined),
        longitude: normLoc.longitude ?? (r.longitude != null ? Number(r.longitude) : undefined),
        road: locContext.road,
        houseNumber: locContext.houseNumber,
        displayAddress,
        attribution: normalizeAttribution(r.attribution_context ? parseContext(r.attribution_context) : {
          campaign:r.traffic_campaign,source:r.traffic_source,medium:r.traffic_medium,content:r.traffic_content,term:r.traffic_term,
          campaignId:/^\d+$/.test(r.traffic_campaign||'') ? r.traffic_campaign : '',
          adSet:/^\d+$/.test(r.traffic_term||'') ? '' : r.traffic_term,
          adSetId:/^\d+$/.test(r.traffic_term||'') && String(r.traffic_channel||'').includes('Meta') ? r.traffic_term : '',
          adId:/^\d+$/.test(r.traffic_content||'') ? r.traffic_content : '',
          adName:/^\d+$/.test(r.traffic_content||'') ? '' : r.traffic_content
        }),
        viewedTreatments: typeof r.viewed_treatments === 'string' ? JSON.parse(r.viewed_treatments || '[]') : (r.viewed_treatments || []),
        sessionJourney: typeof r.session_journey === 'string' ? JSON.parse(r.session_journey || 'null') : (r.session_journey || undefined),
        procedureCycles: typeof r.procedure_cycles === 'string' ? JSON.parse(r.procedure_cycles || '[]') : (r.procedure_cycles || []),
        status: r.status || 'novo',
        notes: r.notes || '',
        metaLeadSent: Boolean(r.meta_lead_sent),
        metaLeadSentAt: r.meta_lead_sent_at ? new Date(r.meta_lead_sent_at).toISOString() : undefined,
        kommoLeadId: r.kommo_lead_id,
        kommoStatusId: r.kommo_status_id,
        kommoUpdatedAt: Number(r.kommo_updated_at) || 0,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
      };
      leadMap.set(r.id, parsedLead);
    }

    const combinedLeads = Array.from(leadMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (combinedLeads.length > 0) {
      void saveLeadsToFile(combinedLeads);
    }

    const needsEnrichment = combinedLeads.some(r => r.latitude && r.longitude && (!r.city || r.city === 'Não informada' || !r.neighborhood || r.neighborhood === 'Não informada'));
    if (needsEnrichment && !isEnrichingLeads) {
      void enrichExistingLeadsWithAddress().catch(() => {});
    }

    return combinedLeads;
  }

  async function insertLead(l: StoredLead): Promise<void> {
    const pool = requireLeadDatabase();
    if (pool) {
      try {
        const locContext = {
          ...normalizeLocation(l, false),
          city: l.city,
          state: l.state,
          neighborhood: l.neighborhood,
          road: l.road,
          houseNumber: l.houseNumber,
          displayAddress: l.displayAddress,
          addressSource: l.displayAddress ? 'geocoder' : l.locationSource
        };

        await pool.query(`
          INSERT INTO nido_leads (
            id, name, phone, email, service_interest, cta_location, message,
            traffic_channel, traffic_source, traffic_medium, traffic_campaign,
            traffic_term, traffic_content, fbclid, gclid, referrer, page_path,
            client_ip, city, state, neighborhood, latitude, longitude,
            viewed_treatments, session_journey, procedure_cycles, status, notes, meta_lead_sent, meta_lead_sent_at,
            kommo_lead_id, kommo_status_id, created_at, updated_at, location_context, attribution_context
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          l.city || 'Não informada',
          l.state || 'Não informada',
          l.neighborhood || 'Não informada',
          l.latitude ?? null,
          l.longitude ?? null,
          JSON.stringify(l.viewedTreatments || []),
          l.sessionJourney ? JSON.stringify(l.sessionJourney) : null,
          JSON.stringify(l.procedureCycles || []),
          l.status || 'novo',
          l.notes || '',
          l.metaLeadSent ? 1 : 0,
          l.metaLeadSentAt ? new Date(l.metaLeadSentAt) : null,
          l.kommoLeadId || null,
          l.kommoStatusId || null,
          l.createdAt ? new Date(l.createdAt) : new Date(),
          l.updatedAt ? new Date(l.updatedAt) : new Date(),
          JSON.stringify(locContext),
          JSON.stringify(normalizeAttribution(l.attribution || {}))
        ]);
      } catch (err) {
        console.warn('[MySQL Insert Lead Warning]', err);
      }
    }

    const current = await readLeads();
    const existingIdx = current.findIndex(item => item.id === l.id);
    if (existingIdx !== -1) {
      current[existingIdx] = l;
    } else {
      current.unshift(l);
    }
    await saveLeadsToFile(current);
  }

  async function updateLeadFields(id: string, changes: Record<string, any>): Promise<boolean> {
    const pool = requireLeadDatabase();
    let mysqlSuccess = false;
    if (pool) {
      try {
        const columns: Record<string, string> = {
          status:'status', notes:'notes', metaLeadSent:'meta_lead_sent', metaLeadSentAt:'meta_lead_sent_at',
          serviceInterest:'service_interest', procedureCycles:'procedure_cycles', sessionJourney:'session_journey', viewedTreatments:'viewed_treatments', attribution:'attribution_context', locationContext:'location_context'
        };
        const entries = Object.entries(changes).filter(([key,value]) => columns[key] && value !== undefined);
        if (entries.length > 0) {
          const jsonKeys = ['procedureCycles','sessionJourney','viewedTreatments','attribution','locationContext'];
          const values = entries.map(([key,value]) => jsonKeys.includes(key) ? JSON.stringify(value) : key === 'metaLeadSentAt' ? (value ? new Date(value) : null) : key === 'metaLeadSent' ? Number(Boolean(value)) : value);
          const [result] = await pool.query<mysql.ResultSetHeader>(
            `UPDATE nido_leads SET ${entries.map(([key])=>`${columns[key]}=?`).join(',')}, updated_at=NOW() WHERE id=? AND deleted_at IS NULL`, [...values,id]);
          mysqlSuccess = result.affectedRows > 0;
        }
      } catch (err) {
        console.warn('[MySQL Update Lead Warning]', err);
      }
    }

    const current = await readLeads();
    const idx = current.findIndex(item => item.id === id);
    if (idx !== -1) {
      Object.assign(current[idx], changes, { updatedAt: new Date().toISOString() });
      await saveLeadsToFile(current);
      return true;
    }
    return mysqlSuccess;
  }

  const kommoRepo = {
    list: readLeads,
    apply: async (id: string, k: any, status: string, options: any = {}) => {
      const applied=await createKommoRepository(requireLeadDatabase(),readLeads).apply(id,k,status,options);
      if(applied) {await enqueueQualifiedMeta(id);void crmMetaQueue?.flush().catch(()=>{});}
      return applied;
    },
    remove: async (id: string) => createKommoRepository(requireLeadDatabase(), readLeads).remove(id)
  };
  async function kommoRequest(resource: string): Promise<any> {
    if (!KOMMO_TOKEN) throw new Error('Token do Kommo não configurado');
    const response = await fetch(`https://${KOMMO_SUBDOMAIN}.kommo.com/api/v4/${resource}`, {
      headers: {Authorization:`Bearer ${KOMMO_TOKEN}`,Accept:'application/hal+json'}, signal:AbortSignal.timeout(15000)
    });
    if (response.status === 404 || response.status === 204) return null;
    if (!response.ok) throw new Error(`Kommo HTTP ${response.status}`);
    return await response.json();
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
        viewedTreatments = [],
        sessionJourney
      } = req.body;

      if (!name || !phone || !email) {
        return res.status(400).json({ error: 'Nome, WhatsApp e E-mail são obrigatórios.' });
      }

      const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const clientIp = Array.isArray(rawIp)
        ? rawIp[0]
        : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '');

      let verifiedLocation: any = normalizeLocation(req.body);
      let geocodedAddress: any = null;
      if (verifiedLocation.geoConsent && validCoordinates(verifiedLocation.latitude, verifiedLocation.longitude)) {
        try {
          geocodedAddress = await reverseGeocodeCoordinates(verifiedLocation.latitude, verifiedLocation.longitude);
          if (geocodedAddress) {
            verifiedLocation = {
              ...verifiedLocation,
              city: geocodedAddress.city,
              state: geocodedAddress.state,
              neighborhood: geocodedAddress.neighborhood,
              displayAddress: geocodedAddress.displayAddress,
              road: geocodedAddress.road,
              houseNumber: geocodedAddress.houseNumber,
              addressSource: 'geocoder'
            };
          }
        } catch (geoErr) {
          console.warn('[Geocode Error on Lead Creation]', geoErr);
        }
      }
      const attribution = {...normalizeAttribution({...req.body.attribution, campaign:trafficCampaign, source:trafficSource, medium:trafficMedium, content:trafficContent, term:trafficTerm}),meta:normalizeMetaContext(req.body.metaContext,{ip:extractRealClientIp(req),userAgent:req.headers['user-agent'] || ''})};

      const cleanDigitsPhone = normalizedPhone(phone);
      const leads = await readLeads();

      // Check if this patient already exists by phone digits (or exact email)
      const existingPatientIdx = leads.findIndex((l) => {
        const existingDigits = normalizedPhone(l.phone);
        if (cleanDigitsPhone && existingDigits && existingDigits === cleanDigitsPhone) {
          return true;
        }
        if (email && l.email && l.email.toLowerCase() === email.toLowerCase()) {
          return true;
        }
        return false;
      });

      let leadToSave: StoredLead;

      if (existingPatientIdx !== -1) {
        // Recurrent Patient: Append new procedure cycle to existing record
        const existing = leads[existingPatientIdx];
        const newCycle = {
          cycleId: `cycle_${Date.now()}`,
          procedureName: serviceInterest,
          date: new Date().toISOString(),
          status: 'novo',
          trafficSource,
          trafficCampaign,
          notes: `Novo contato via ${ctaLocation}: "${message || 'Interesse em ' + serviceInterest}"`
        };

        const existingCycles = Array.isArray(existing.procedureCycles) ? existing.procedureCycles : [];
        // If this is the second contact, preserve cycle 1
        if (existingCycles.length === 0) {
          existingCycles.push({
            cycleId: `cycle_initial_${existing.id}`,
            procedureName: existing.serviceInterest || 'Primeiro Procedimento',
            date: existing.createdAt,
            status: existing.status || 'convertido',
            trafficSource: existing.trafficSource,
            trafficCampaign: existing.trafficCampaign,
            notes: 'Primeiro contato registrado no site'
          });
        }
        existingCycles.unshift(newCycle);

        existing.serviceInterest = `${serviceInterest} (Recorrente: ${existingCycles.length}º ciclo)`;
        existing.procedureCycles = existingCycles;
        existing.metaLeadSent=false;existing.metaLeadSentAt=undefined;
        existing.status = 'novo'; // Re-open for negotiation of new procedure
        existing.updatedAt = new Date().toISOString();
        Object.assign(existing, verifiedLocation);
        existing.attribution = attribution;
        if (sessionJourney) existing.sessionJourney = sessionJourney;
        if (viewedTreatments && viewedTreatments.length > 0) {
          existing.viewedTreatments = Array.from(new Set([...(existing.viewedTreatments || []), ...viewedTreatments]));
        }

        leadToSave = existing;
        leads[existingPatientIdx] = existing;
      } else {
        // Brand new patient: Initialize with Cycle 1
        leadToSave = {
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
          ...verifiedLocation,
          attribution,
          viewedTreatments,
          sessionJourney,
          procedureCycles: [
            {
              cycleId: `cycle_1_${Date.now()}`,
              procedureName: serviceInterest,
              date: new Date().toISOString(),
              status: 'novo',
              trafficSource,
              trafficCampaign,
              notes: 'Primeiro contato registrado'
            }
          ],
          status: 'novo',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        leads.unshift(leadToSave);
      }

      if (existingPatientIdx === -1) await insertLead(leadToSave);
      else {
        const updated = await updateLeadFields(leadToSave.id, {
          status: leadToSave.status, serviceInterest: leadToSave.serviceInterest, procedureCycles: leadToSave.procedureCycles,
          sessionJourney: leadToSave.sessionJourney, viewedTreatments: leadToSave.viewedTreatments,
          attribution, locationContext: verifiedLocation,metaLeadSent:false,metaLeadSentAt:null
        });
        if (!updated) return res.status(409).json({success:false,error:'O contato foi excluído durante a operação. Envie novamente.'});
      }

      // Push lead to Kommo CRM API
      if (!leadToSave.kommoLeadId) pushLeadToKommo(leadToSave).then(async (kommoResult) => {
        if (kommoResult && kommoResult.kommoLeadId) {
          const pool = requireLeadDatabase();
          if (pool) {
            await pool.query(
              'UPDATE nido_leads SET kommo_lead_id=? WHERE id=? AND deleted_at IS NULL AND (kommo_lead_id IS NULL OR kommo_lead_id=?)',
              [String(kommoResult.kommoLeadId),leadToSave.id,String(kommoResult.kommoLeadId)]);
          }
        }
      }).catch((err) => {
        console.warn('[Async Kommo Lead Sync Warning]', err);
      });

      return res.status(201).json({ success: true, lead: leadToSave, isRecurrent: existingPatientIdx !== -1 });
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
          const entry = currentLeads[existingIdx];
          await updateLeadFields(entry.id, {status:entry.status,serviceInterest:entry.serviceInterest,notes:entry.notes});
          if(isQualified && syncToAds && (await enqueueQualifiedMeta(entry.id))?.status==='queued')adsSyncedCount++;
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
            city: 'Não informada',
            state: 'Não informada',
            neighborhood: 'Não informada',
            status,
            notes: item.notes || 'Importado do funil Kommo CRM.',
            metaLeadSent: false,
            metaLeadSentAt: undefined,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await insertLead(newLead);
          currentLeads.unshift(newLead);
          importedCount++;
          if(isQualified && syncToAds && (await enqueueQualifiedMeta(newLead.id))?.status==='queued')adsSyncedCount++;
        }
      }



      return res.json({
        success: true,
        message: `${importedCount} novos lead(s) importados e ${adsSyncedCount} qualificações elegíveis na fila da Meta.`,
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
      const { status, notes } = req.body;
      const leads = await readLeads();
      const index = leads.findIndex((l) => l.id === id);

      if (index === -1) {
        return res.status(404).json({ error: 'Lead não encontrado' });
      }

      if (status) leads[index].status = status;
      if (typeof notes === 'string') leads[index].notes = notes;
      leads[index].updatedAt = new Date().toISOString();

      const updated = await updateLeadFields(id, {status,notes});
      if (!updated) return res.status(404).json({success:false,error:'Lead não encontrado'});
      const metaDelivery=await enqueueQualifiedMeta(id);
      void crmMetaQueue?.flush().catch(()=>{});
      return res.json({ success: true, lead: leads[index],metaDelivery });
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
      await insertLead(newLead);

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

      await kommoRepo.remove(String(id));

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
      const result = await receiveKommoWebhook({repo:kommoRepo,request:kommoRequest,payload:req.body || {}});
      return res.json({success:true,...result});
    } catch (error) {
      console.error('[Kommo Webhook Error]', error instanceof Error ? error.message : 'Unknown error');
      return res.status(503).json({success:false,error:'Não foi possível persistir o webhook. Tente novamente.'});
    }
  });

  app.get('/api/integrations/kommo/sync', async (_req: Request, res: Response) => {
    try {
      const result = await synchronizeKommo({repo:kommoRepo,request:kommoRequest});
      return res.json({success:true,...result,siteLeadsUpdatedCount:result.updatedCount,
        message:`${result.updatedCount} lead(s) atualizado(s) do Kommo. Qualificações elegíveis são enviadas pela fila persistente da Meta.`});
    } catch (error) {
      console.error('[Kommo Sync Error]', error instanceof Error ? error.message : 'Unknown error');
      return res.status(503).json({success:false,version:CRM_VERSION,error:'Sincronização incompleta: verifique a conexão com MySQL e Kommo.'});
    }
  });

  // --------------------------------------------------------------------------
  // Internal Analytics & Navigation Tracking Endpoints
  // --------------------------------------------------------------------------
  app.get('/api/analytics/stats', async (_req: Request, res: Response) => {
    try {
      if (!isAnalyticsDbReady || !dbPool) {
        return res.status(503).json({ success: false, error: 'Banco de dados de analytics indisponível' });
      }
      const stats = await getAnalyticsStats(dbPool);
      return res.json({
        success: true,
        version: 'nido-analytics-v2',
        storage: 'mysql',
        ready: true,
        stats
      });
    } catch (err: unknown) {
      console.error('[Analytics Stats Error]', err);
      return res.status(503).json({ success: false, error: 'Banco de dados de analytics indisponível' });
    }
  });

  // Receive tracking event from front-end
  app.post('/api/analytics/event', async (req: Request, res: Response) => {
    try {
      if (!isAnalyticsDbReady || !dbPool) {
        return res.status(503).json({ success: false, error: 'Banco de dados de analytics indisponível' });
      }
      const result = await recordAnalyticsEvent(dbPool, req.body || {});
      if (result.error) {
        return res.status(400).json({ success: false, ...result });
      }
      return res.json({ success: true, ...result });
    } catch (err: unknown) {
      console.error('[Record Analytics Event Error]', err);
      return res.status(503).json({ success: false, error: 'Erro ao registrar evento de analytics' });
    }
  });

  // Client Geo detection helper (no fake default location)
  app.get('/api/analytics/geo', (req: Request, res: Response) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const clientIp = Array.isArray(rawIp)
      ? rawIp[0]
      : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '');

    return res.json({
      success: true,
      clientIp,
      city: 'Não informada',
      state: 'Não informada',
      neighborhood: 'Não informada'
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

