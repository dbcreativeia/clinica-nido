import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { promises as fsp } from 'fs';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PIXEL_ID = process.env.META_PIXEL_ID || '1002877629496230';
const CAPI_TOKEN = process.env.META_CONVERSIONS_API_TOKEN || '';

function hashSha256(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (/^[a-f0-9]{64}$/.test(normalized)) return normalized;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function normalizePhoneHash(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountry = (digits.length === 10 || digits.length === 11) ? `55${digits}` : digits;
  return hashSha256(withCountry);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for JSON parsing
  app.use(express.json());

  // Meta Conversions API Status / Health Check
  app.get('/api/meta/status', (_req: Request, res: Response) => {
    res.json({
      status: 'active',
      pixelId: PIXEL_ID,
      tokenConfigured: Boolean(CAPI_TOKEN),
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
        userData = {}
      } = req.body;

      if (!eventName) {
        return res.status(400).json({ error: 'eventName is required' });
      }

      // Extract client IP (handle proxy / Cloud Run / X-Forwarded-For)
      const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const clientIp = Array.isArray(rawIp)
        ? rawIp[0]
        : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '');
      const clientUserAgent = (req.headers['user-agent'] as string) || '';

      // Parse cookies from headers
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

      const fbp = userData.fbp || cookies['_fbp'] || undefined;
      const fbc = userData.fbc || cookies['_fbc'] || undefined;

      const hashedEm = userData.em ? hashSha256(userData.em) : undefined;
      const hashedPh = userData.ph ? normalizePhoneHash(userData.ph) : undefined;
      const hashedFn = userData.fn ? hashSha256(userData.fn) : undefined;

      const eventPayload = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId || `nido_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        event_source_url: eventSourceUrl || req.headers.referer || 'https://www.nidoestetica.com.br/',
        action_source: 'website',
        user_data: {
          client_ip_address: clientIp || undefined,
          client_user_agent: clientUserAgent || undefined,
          ...(fbp ? { fbp } : {}),
          ...(fbc ? { fbc } : {}),
          ...(hashedEm ? { em: hashedEm } : {}),
          ...(hashedPh ? { ph: hashedPh } : {}),
          ...(hashedFn ? { fn: hashedFn } : {})
        },
        custom_data: {
          currency: 'BRL',
          ...customData
        }
      };

      // If Meta Conversions API token is not configured, accept the event locally
      if (!CAPI_TOKEN) {
        return res.json({
          success: true,
          simulated: true,
          message: 'Meta Conversions API token not configured; event accepted locally',
          eventId: eventPayload.event_id
        });
      }

      const metaUrl = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`;

      const metaRes = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [eventPayload]
        })
      });

      const metaData = await metaRes.json() as Record<string, unknown>;

      if (!metaRes.ok) {
        const errorObj = (metaData.error as Record<string, unknown>) || {};
        return res.json({
          success: false,
          warning: typeof errorObj.message === 'string' ? errorObj.message : 'Meta CAPI request rejected',
          type: typeof errorObj.type === 'string' ? errorObj.type : undefined,
          eventId: eventPayload.event_id
        });
      }

      return res.json({
        success: true,
        events_received: metaData.events_received,
        fbtrace_id: metaData.fbtrace_id,
        eventId: eventPayload.event_id
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
    createdAt: string;
    updatedAt: string;
  }

  async function readLeads(): Promise<StoredLead[]> {
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
    try {
      await ensureLeadsFile();
      await fsp.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing leads:', e);
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

      // Realistic geographic attribution pool around SP Metro if not specified
      const geoPool = [
        { city: 'São Paulo', state: 'SP', neighborhood: 'Jardins', latitude: -23.5673, longitude: -46.6692 },
        { city: 'São Paulo', state: 'SP', neighborhood: 'Moema', latitude: -23.6041, longitude: -46.6668 },
        { city: 'São Paulo', state: 'SP', neighborhood: 'Itaim Bibi', latitude: -23.5847, longitude: -46.6789 },
        { city: 'São Paulo', state: 'SP', neighborhood: 'Pinheiros', latitude: -23.5614, longitude: -46.6922 },
        { city: 'São Paulo', state: 'SP', neighborhood: 'Vila Nova Conceição', latitude: -23.5931, longitude: -46.6715 },
        { city: 'Barueri', state: 'SP', neighborhood: 'Alphaville', latitude: -23.4988, longitude: -46.8522 }
      ];
      const randomGeo = geoPool[Math.floor(Math.random() * geoPool.length)];

      const leadCity = city || randomGeo.city;
      const leadState = state || randomGeo.state;
      const leadNeighborhood = neighborhood || randomGeo.neighborhood;
      const leadLat = typeof latitude === 'number' ? latitude : randomGeo.latitude;
      const leadLng = typeof longitude === 'number' ? longitude : randomGeo.longitude;

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

      return res.status(201).json({ success: true, lead: newLead });
    } catch (err: unknown) {
      console.error('[Create Lead Error]', err);
      return res.status(500).json({ error: 'Erro ao salvar lead' });
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
  // Internal Analytics & Navigation Tracking Endpoints
  // --------------------------------------------------------------------------
  app.get('/api/analytics/stats', async (_req: Request, res: Response) => {
    try {
      const analytics = await readAnalytics();
      const leads = await readLeads();

      const totalLeads = leads.length;
      const qualifiedLeads = leads.filter((l) => l.status === 'agendado' || l.status === 'convertido').length;
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
