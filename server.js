import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";
import { promises as fsp } from "fs";
import crypto from "crypto";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PIXEL_ID = process.env.META_PIXEL_ID || "1002877629496230";
const CAPI_TOKEN = process.env.META_CONVERSIONS_API_TOKEN || "EAAZAuhmQGdR0BS1O4SAyXTDFtRd2jOxwXxDxO9fCJZCPgpv4OPPwA8tpPQArZAuZCUinn2WsXUrNmrI8aGNkG7NKTiDfENdv3OReyVL96IkIl6FBxyCvmwv5tinBC0xZBWJsryyHiPvWZCk5bFF3eUuNL4md3BIwdLPhYODOcP8DQHg5BeNN9seFtCZC6G5tqvg0AZDZD";
function hashSha256(value) {
  const normalized = value.trim().toLowerCase();
  if (/^[a-f0-9]{64}$/.test(normalized)) return normalized;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}
function normalizePhoneHash(phone) {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
  return hashSha256(withCountry);
}
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3e3;
  app.use(express.json());
  app.get("/api/meta/status", (_req, res) => {
    res.json({
      status: "active",
      pixelId: PIXEL_ID,
      tokenConfigured: Boolean(CAPI_TOKEN),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.post("/api/meta/conversion", async (req, res) => {
    try {
      const {
        eventName,
        eventId,
        eventSourceUrl,
        customData = {},
        userData = {}
      } = req.body;
      if (!eventName) {
        return res.status(400).json({ error: "eventName is required" });
      }
      const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
      const clientIp = Array.isArray(rawIp) ? rawIp[0] : typeof rawIp === "string" ? rawIp.split(",")[0].trim() : "";
      const clientUserAgent = req.headers["user-agent"] || "";
      const cookieHeader = req.headers.cookie || "";
      const cookies = {};
      cookieHeader.split(";").forEach((cookieStr) => {
        const parts = cookieStr.trim().split("=");
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = decodeURIComponent(parts.slice(1).join("="));
          cookies[key] = value;
        }
      });
      const fbp = userData.fbp || cookies["_fbp"] || void 0;
      const fbc = userData.fbc || cookies["_fbc"] || void 0;
      const hashedEm = userData.em ? hashSha256(userData.em) : void 0;
      const hashedPh = userData.ph ? normalizePhoneHash(userData.ph) : void 0;
      const hashedFn = userData.fn ? hashSha256(userData.fn) : void 0;
      const eventPayload = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1e3),
        event_id: eventId || `nido_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        event_source_url: eventSourceUrl || req.headers.referer || "https://www.nidoestetica.com.br/",
        action_source: "website",
        user_data: {
          client_ip_address: clientIp || void 0,
          client_user_agent: clientUserAgent || void 0,
          ...fbp ? { fbp } : {},
          ...fbc ? { fbc } : {},
          ...hashedEm ? { em: hashedEm } : {},
          ...hashedPh ? { ph: hashedPh } : {},
          ...hashedFn ? { fn: hashedFn } : {}
        },
        custom_data: {
          currency: "BRL",
          ...customData
        }
      };
      const metaUrl = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`;
      const metaRes = await fetch(metaUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: [eventPayload]
        })
      });
      const metaData = await metaRes.json();
      if (!metaRes.ok) {
        console.warn("[Meta CAPI Warning]", metaData);
        return res.status(metaRes.status).json({
          success: false,
          error: metaData.error || "Meta API returned an error",
          eventId: eventPayload.event_id
        });
      }
      return res.json({
        success: true,
        events_received: metaData.events_received,
        fbtrace_id: metaData.fbtrace_id,
        eventId: eventPayload.event_id
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown server error";
      console.error("[Meta CAPI Exception]", errorMessage);
      return res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  });
  const DATA_DIR = path.resolve(__dirname, "data");
  const LEADS_FILE = path.resolve(DATA_DIR, "leads.json");
  const ANALYTICS_FILE = path.resolve(DATA_DIR, "analytics.json");
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "nidoadmin2026";
  async function ensureLeadsFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        await fsp.mkdir(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(LEADS_FILE)) {
        await fsp.writeFile(LEADS_FILE, JSON.stringify([], null, 2), "utf-8");
      }
    } catch (e) {
      console.error("Error ensuring leads file exists:", e);
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
            avgSessionDuration: "0m 0s",
            bounceRate: "0%",
            leadConversionRate: "0%"
          },
          routes: [
            { name: "/", label: "P\xE1gina Inicial (Hero & Apresenta\xE7\xE3o)", clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: "/tratamentos", label: "Cat\xE1logo Geral de Tratamentos", clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: "/a-clinica", label: "A Cl\xEDnica Nid\xF4 & Estrutura", clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: "/tecnologias", label: "Tecnologias Avan\xE7adas (HIPRO, Lavieen, Endymed)", clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: "/corpo-clinico", label: "Corpo Cl\xEDnico & Especialistas", clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: "/contato", label: "Contato & Rotas de Atendimento (\xC1gua Branca)", clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: "/tratamentos/endoslim", label: "P\xE1gina Endoslim (Remodela\xE7\xE3o & Laser)", clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: "/tratamentos/bio-regeneracao-celular", label: "P\xE1gina Bio Regenera\xE7\xE3o Celular (Exossomos/PDRN)", clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: "/tratamentos/profhilo", label: "P\xE1gina Profhilo\xAE (Biorremodelador)", clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: "/tratamentos/peeling-dermeskin-melasma", label: "P\xE1gina Peeling Dermeskin Melasma", clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: "/tratamentos/hipro-facial-corporal", label: "P\xE1gina HIPRO Ultrassom Microfocado", clicks: 0, uniqueVisitors: 0, percentage: 0 },
            { name: "/tratamentos/harmonizacao-facial", label: "P\xE1gina Harmoniza\xE7\xE3o Facial Personalizada", clicks: 0, uniqueVisitors: 0, percentage: 0 }
          ],
          treatments: [
            { name: "Endoslim", category: "Corporal Avan\xE7ado", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 },
            { name: "Bio Regenera\xE7\xE3o Celular", category: "Medicina Regenerativa", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 },
            { name: "Profhilo\xAE", category: "Injet\xE1vel Biorremodelador", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 },
            { name: "Extra\xE7\xE3o Regeneradora Facial com Pept\xEDdeos", category: "Cuidado Facial", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 },
            { name: "Tratamento para Melasma com Peeling Dermeskin", category: "Clareamento & Pigmenta\xE7\xE3o", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 },
            { name: "Lifting N\xE3o Cir\xFArgico HIPRO", category: "Tecnologia Microfocada", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 },
            { name: "Harmoniza\xE7\xE3o Facial Personalizada", category: "Harmoniza\xE7\xE3o", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 },
            { name: "Toxina Botul\xEDnica Preventiva e Reparadora", category: "Injet\xE1veis", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 },
            { name: "Terapia Capilar & Tricologia Avan\xE7ada", category: "Tricologia & Capilar", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 },
            { name: "Protocolo Redutor de Gordura Localizada", category: "Corporal Avan\xE7ado", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 },
            { name: "Tratamento de Celulite e Flacidez Corporal", category: "Corporal Avan\xE7ado", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 },
            { name: "Nutrologia, Longevidade & Performance", category: "Sa\xFAde & Longevidade", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 },
            { name: "Drenagem Linf\xE1tica Especializada & P\xF3s-Cir\xFArgico", category: "Bem-Estar & Recupera\xE7\xE3o", views: 0, percentage: 0, avgTimeSpent: "0s", leadsGenerated: 0 }
          ],
          ctaClicks: [
            { label: "Bot\xE3o WhatsApp Flutuante", location: "Fixo Inferior Direito", clicks: 0, conversionRate: "0%" },
            { label: "Banner Hero - Agendar Consulta & Avalia\xE7\xE3o", location: "Hero Principal", clicks: 0, conversionRate: "0%" },
            { label: "Bot\xE3o Endoslim - Quero Minha Avalia\xE7\xE3o", location: "P\xE1gina de Tratamento Endoslim", clicks: 0, conversionRate: "0%" },
            { label: "Tra\xE7ar Rota no Waze / Google Maps (\xC1gua Branca)", location: "Se\xE7\xE3o Endere\xE7o & Como Chegar", clicks: 0, conversionRate: "0%" },
            { label: "Formul\xE1rio de Contato Direto", location: "Modal de Captura de Lead", clicks: 0, conversionRate: "0%" },
            { label: "Rodap\xE9 - Falar com o Corpo Cl\xEDnico", location: "Rodap\xE9", clicks: 0, conversionRate: "0%" }
          ],
          topLocations: [],
          trafficSources: [
            { channel: "Google Ads", visitors: 0, percentage: 0, leads: 0 },
            { channel: "Google Org\xE2nico", visitors: 0, percentage: 0, leads: 0 },
            { channel: "Meta Ads (Instagram / FB)", visitors: 0, percentage: 0, leads: 0 },
            { channel: "ChatGPT / IA", visitors: 0, percentage: 0, leads: 0 },
            { channel: "Direto", visitors: 0, percentage: 0, leads: 0 }
          ],
          recentLiveEvents: []
        };
        await fsp.writeFile(ANALYTICS_FILE, JSON.stringify(defaultAnalytics, null, 2), "utf-8");
      }
    } catch (e) {
      console.error("Error ensuring analytics file exists:", e);
    }
  }
  await ensureLeadsFile();
  await ensureAnalyticsFile();
  async function readLeads() {
    try {
      await ensureLeadsFile();
      const content = await fsp.readFile(LEADS_FILE, "utf-8");
      return JSON.parse(content || "[]");
    } catch (e) {
      console.error("Error reading leads:", e);
      return [];
    }
  }
  async function writeLeads(leads) {
    try {
      await ensureLeadsFile();
      await fsp.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing leads:", e);
    }
  }
  async function readAnalytics() {
    try {
      await ensureAnalyticsFile();
      const content = await fsp.readFile(ANALYTICS_FILE, "utf-8");
      return JSON.parse(content || "{}");
    } catch (e) {
      console.error("Error reading analytics:", e);
      return {};
    }
  }
  async function writeAnalytics(data) {
    try {
      await ensureAnalyticsFile();
      await fsp.writeFile(ANALYTICS_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing analytics:", e);
    }
  }
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      const sessionToken = Buffer.from(`nido_admin_session_${Date.now()}`).toString("base64");
      return res.json({ success: true, token: sessionToken });
    }
    return res.status(401).json({ success: false, error: "Senha incorreta" });
  });
  app.post("/api/leads", async (req, res) => {
    try {
      const {
        name,
        phone,
        email,
        serviceInterest = "Geral",
        ctaLocation = "Site",
        message = "",
        trafficChannel = "Direto",
        trafficSource = "direto",
        trafficMedium = "none",
        trafficCampaign = "",
        trafficTerm = "",
        trafficContent = "",
        fbclid = "",
        gclid = "",
        referrer = "",
        pagePath = "/",
        city,
        state,
        neighborhood,
        latitude,
        longitude,
        viewedTreatments = []
      } = req.body;
      if (!name || !phone || !email) {
        return res.status(400).json({ error: "Nome, WhatsApp e E-mail s\xE3o obrigat\xF3rios." });
      }
      const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
      const clientIp = Array.isArray(rawIp) ? rawIp[0] : typeof rawIp === "string" ? rawIp.split(",")[0].trim() : "";
      const geoPool = [
        { city: "S\xE3o Paulo", state: "SP", neighborhood: "Jardins", latitude: -23.5673, longitude: -46.6692 },
        { city: "S\xE3o Paulo", state: "SP", neighborhood: "Moema", latitude: -23.6041, longitude: -46.6668 },
        { city: "S\xE3o Paulo", state: "SP", neighborhood: "Itaim Bibi", latitude: -23.5847, longitude: -46.6789 },
        { city: "S\xE3o Paulo", state: "SP", neighborhood: "Pinheiros", latitude: -23.5614, longitude: -46.6922 },
        { city: "S\xE3o Paulo", state: "SP", neighborhood: "Vila Nova Concei\xE7\xE3o", latitude: -23.5931, longitude: -46.6715 },
        { city: "Barueri", state: "SP", neighborhood: "Alphaville", latitude: -23.4988, longitude: -46.8522 }
      ];
      const randomGeo = geoPool[Math.floor(Math.random() * geoPool.length)];
      const leadCity = city || randomGeo.city;
      const leadState = state || randomGeo.state;
      const leadNeighborhood = neighborhood || randomGeo.neighborhood;
      const leadLat = typeof latitude === "number" ? latitude : randomGeo.latitude;
      const leadLng = typeof longitude === "number" ? longitude : randomGeo.longitude;
      const newLead = {
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
        status: "novo",
        notes: "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const leads = await readLeads();
      leads.unshift(newLead);
      await writeLeads(leads);
      return res.status(201).json({ success: true, lead: newLead });
    } catch (err) {
      console.error("[Create Lead Error]", err);
      return res.status(500).json({ error: "Erro ao salvar lead" });
    }
  });
  app.get("/api/leads", async (_req, res) => {
    try {
      const leads = await readLeads();
      return res.json({ success: true, leads });
    } catch (err) {
      console.error("[List Leads Error]", err);
      return res.status(500).json({ error: "Erro ao buscar leads" });
    }
  });
  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes, metaLeadSent, metaLeadSentAt } = req.body;
      const leads = await readLeads();
      const index = leads.findIndex((l) => l.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Lead n\xE3o encontrado" });
      }
      if (status) leads[index].status = status;
      if (typeof notes === "string") leads[index].notes = notes;
      if (typeof metaLeadSent === "boolean") leads[index].metaLeadSent = metaLeadSent;
      if (metaLeadSentAt) leads[index].metaLeadSentAt = metaLeadSentAt;
      leads[index].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      await writeLeads(leads);
      return res.json({ success: true, lead: leads[index] });
    } catch (err) {
      console.error("[Update Lead Error]", err);
      return res.status(500).json({ error: "Erro ao atualizar lead" });
    }
  });
  app.post("/api/leads/simulate", async (_req, res) => {
    try {
      const simulatedProfiles = [
        {
          name: "Mariana Alencar Ferreira",
          phone: "(11) 98765-4321",
          email: "mariana.alencar@gmail.com",
          serviceInterest: "Endoslim",
          ctaLocation: "P\xE1gina de Tratamento Endoslim",
          trafficChannel: "Google Ads",
          trafficSource: "google",
          trafficMedium: "cpc",
          trafficCampaign: "google-ads_endoslim-lipo-sem-cortes",
          trafficTerm: "endoslim agua branca perdizes sp",
          gclid: `Cj0KCQjwmOm3BhDhARIsAPggTvo_${Math.random().toString(36).substring(2, 9)}`,
          city: "S\xE3o Paulo",
          state: "SP",
          neighborhood: "\xC1gua Branca",
          latitude: -23.5234,
          longitude: -46.6875,
          viewedTreatments: ["Endoslim", "Protocolo Redutor de Gordura Localizada"],
          notes: "Simula\xE7\xE3o de contato via Google Ads para Endoslim."
        },
        {
          name: "Dr. Roberto Silveira",
          phone: "(11) 97123-9876",
          email: "roberto.silveira@advogados.com.br",
          serviceInterest: "Profhilo\xAE",
          ctaLocation: "Banner Hero - Agendar Consulta & Avalia\xE7\xE3o",
          trafficChannel: "Instagram",
          trafficSource: "instagram",
          trafficMedium: "paid_social",
          trafficCampaign: "meta-ads_profhilo_rejuvenescimento",
          fbclid: `fb.1.${Date.now()}.${Math.random().toString(36).substring(2, 9)}`,
          city: "S\xE3o Paulo",
          state: "SP",
          neighborhood: "Perdizes",
          latitude: -23.5356,
          longitude: -46.6712,
          viewedTreatments: ["Profhilo\xAE", "Bio Regenera\xE7\xE3o Celular"],
          notes: "Simula\xE7\xE3o de lead vindo de an\xFAncio no Instagram Reels."
        },
        {
          name: "Dra. Camila Guimar\xE3es Rocha",
          phone: "(11) 99456-1122",
          email: "camila.guimaraes@uol.com.br",
          serviceInterest: "Tratamento para Melasma com Peeling Dermeskin",
          ctaLocation: "Cat\xE1logo de Tratamentos",
          trafficChannel: "Google Org\xE2nico",
          trafficSource: "google",
          trafficMedium: "organic",
          trafficCampaign: "busca_organica",
          trafficTerm: "tratamento melasma dermeskin sp",
          city: "S\xE3o Paulo",
          state: "SP",
          neighborhood: "Pomp\xE9ia",
          latitude: -23.5289,
          longitude: -46.6834,
          viewedTreatments: ["Tratamento para Melasma com Peeling Dermeskin"],
          notes: "Simula\xE7\xE3o de busca org\xE2nica no Google."
        },
        {
          name: "Lucas Mendes Prado",
          phone: "(11) 98321-4567",
          email: "lucas.prado@techstartup.com",
          serviceInterest: "Lifting N\xE3o Cir\xFArgico HIPRO",
          ctaLocation: "Rodap\xE9 - Falar com o Corpo Cl\xEDnico",
          trafficChannel: "ChatGPT / IA",
          trafficSource: "chatgpt.com",
          trafficMedium: "referral",
          trafficCampaign: "ia_recommendation",
          city: "S\xE3o Paulo",
          state: "SP",
          neighborhood: "Barra Funda",
          latitude: -23.5261,
          longitude: -46.6621,
          viewedTreatments: ["Lifting N\xE3o Cir\xFArgico HIPRO", "Harmoniza\xE7\xE3o Facial Personalizada"],
          notes: "Simula\xE7\xE3o de recomenda\xE7\xE3o via ChatGPT / IA."
        },
        {
          name: "Marcos Vin\xEDcius Toledo",
          phone: "(11) 99112-3344",
          email: "marcos.toledo@alphabusiness.com.br",
          serviceInterest: "Endoslim",
          ctaLocation: "Tra\xE7ar Rota no Waze / Google Maps (\xC1gua Branca)",
          trafficChannel: "Google Ads",
          trafficSource: "google",
          trafficMedium: "cpc",
          trafficCampaign: "google-ads_endoslim_zona_oeste",
          gclid: `Cj0KCQjwmOm3BhDhARIsAPggTvo_${Math.random().toString(36).substring(2, 9)}`,
          city: "S\xE3o Paulo",
          state: "SP",
          neighborhood: "Lapa",
          latitude: -23.5188,
          longitude: -46.7022,
          viewedTreatments: ["Endoslim"],
          notes: "Simula\xE7\xE3o de lead de Lapa interessado em Endoslim."
        }
      ];
      const sample = simulatedProfiles[Math.floor(Math.random() * simulatedProfiles.length)];
      const newLead = {
        id: `lead_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: sample.name,
        phone: sample.phone,
        email: sample.email,
        serviceInterest: sample.serviceInterest,
        ctaLocation: sample.ctaLocation,
        message: `Ol\xE1, meu nome \xE9 ${sample.name}, vim pelo site da Nid\xF4 e gostaria de informa\xE7\xF5es sobre ${sample.serviceInterest}.`,
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
        pagePath: "/#contato",
        status: "novo",
        notes: sample.notes,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const leads = await readLeads();
      leads.unshift(newLead);
      await writeLeads(leads);
      return res.status(201).json({ success: true, lead: newLead });
    } catch (err) {
      console.error("[Simulate Lead Error]", err);
      return res.status(500).json({ error: "Erro ao simular contato" });
    }
  });
  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      let leads = await readLeads();
      const initialLength = leads.length;
      leads = leads.filter((l) => l.id !== id);
      if (leads.length === initialLength) {
        return res.status(404).json({ error: "Lead n\xE3o encontrado" });
      }
      await writeLeads(leads);
      return res.json({ success: true, message: "Lead exclu\xEDdo com sucesso" });
    } catch (err) {
      console.error("[Delete Lead Error]", err);
      return res.status(500).json({ error: "Erro ao excluir lead" });
    }
  });
  app.get("/api/analytics/stats", async (_req, res) => {
    try {
      const analytics = await readAnalytics();
      const leads = await readLeads();
      const totalLeads = leads.length;
      const qualifiedLeads = leads.filter((l) => l.status === "agendado" || l.status === "convertido").length;
      const lostLeads = leads.filter((l) => l.status === "perdido").length;
      const totalVisitors = analytics.summary?.uniqueVisitors || 412;
      const conversionRate = totalVisitors > 0 ? (totalLeads / totalVisitors * 100).toFixed(1) + "%" : "6.8%";
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
    } catch (err) {
      console.error("[Analytics Stats Error]", err);
      return res.status(500).json({ error: "Erro ao buscar dados de analytics" });
    }
  });
  app.post("/api/analytics/event", async (req, res) => {
    try {
      const { type, name, label, pagePath, city, neighborhood } = req.body;
      const analytics = await readAnalytics();
      if (type === "route_click" && name) {
        const route = analytics.routes?.find((r) => r.name === name);
        if (route) {
          route.clicks = (route.clicks || 0) + 1;
        } else if (analytics.routes) {
          analytics.routes.push({ name, label: label || name, clicks: 1, percentage: 1 });
        }
      } else if (type === "treatment_view" && name) {
        const treatment = analytics.treatments?.find((t) => t.name === name);
        if (treatment) {
          treatment.views = (treatment.views || 0) + 1;
        }
      } else if (type === "cta_click" && label) {
        const cta = analytics.ctaClicks?.find((c) => c.label === label);
        if (cta) {
          cta.clicks = (cta.clicks || 0) + 1;
        }
      }
      if (!analytics.recentLiveEvents) analytics.recentLiveEvents = [];
      analytics.recentLiveEvents.unshift({
        type: type || "event",
        label: label || name || "A\xE7\xE3o no site",
        pagePath: pagePath || "/",
        city: city || "S\xE3o Paulo",
        neighborhood: neighborhood || "Jardins",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (analytics.recentLiveEvents.length > 25) {
        analytics.recentLiveEvents = analytics.recentLiveEvents.slice(0, 25);
      }
      if (analytics.summary) {
        analytics.summary.totalPageViews = (analytics.summary.totalPageViews || 1480) + 1;
      }
      await writeAnalytics(analytics);
      return res.json({ success: true });
    } catch (err) {
      console.error("[Record Analytics Event Error]", err);
      return res.status(500).json({ error: "Erro ao registrar evento" });
    }
  });
  app.get("/api/analytics/geo", (req, res) => {
    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const clientIp = Array.isArray(rawIp) ? rawIp[0] : typeof rawIp === "string" ? rawIp.split(",")[0].trim() : "";
    return res.json({
      success: true,
      clientIp,
      city: "S\xE3o Paulo",
      state: "SP",
      neighborhood: "Jardins / Cerqueira C\xE9sar",
      latitude: -23.5673,
      longitude: -46.6692
    });
  });
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== "true" },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
