/**
 * Traffic attribution utility for Clínica Nidô CRM.
 * Captures UTM parameters, click IDs (gclid, fbclid), and referrers to accurately attribute lead origins.
 */

import { getOrCreateFbc, getOrCreateFbp, hasMetaConsent } from './metaConversions.ts';
import { knownParameter } from '../../tracking-context.mjs';

export type TrafficChannel = 
  | 'Google Ads'
  | 'Google Orgânico'
  | 'Meta Ads'
  | 'Instagram'
  | 'Facebook'
  | 'ChatGPT / IA'
  | 'TikTok'
  | 'WhatsApp'
  | 'Direto'
  | 'Outro';

export interface TrafficData {
  channel: TrafficChannel;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  campaignId?: string;
  adSet?: string;
  adSetId?: string;
  adName?: string;
  adId?: string;
  placement?: string;
  keyword?: string;
  fbclid?: string;
  gclid?: string;
  referrer: string;
  landingPage: string;
  capturedAt: string;
}

const STORAGE_KEY = 'nido_traffic_attribution';

/**
 * Initializes and stores the initial acquisition source upon first visit.
 */
export function initTrafficAttribution(): TrafficData {
  if (typeof window === 'undefined') {
    return {
      channel: 'Direto',
      source: 'direto',
      medium: 'none',
      campaign: 'direto',
      referrer: '',
      landingPage: '/',
      capturedAt: new Date().toISOString()
    };
  }

  // Resolve and preserve Meta _fbp and _fbc cookies only if marketing consent is valid
  const consentSetting = localStorage.getItem('nido_cookie_consent');
  let hasMetaConsent = false;
  if (consentSetting) {
    try {
      const parsed = JSON.parse(consentSetting);
      if (parsed.meta === true && (!parsed.expiresAt || Date.now() <= parsed.expiresAt)) {
        hasMetaConsent = true;
      }
    } catch {}
  }

  if (hasMetaConsent) {
    getOrCreateFbp();
    getOrCreateFbc();
  }

  // Check if we already have first-touch attribution saved
  const existing = getStoredTrafficAttribution();

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = (urlParams.get('utm_source') || '').trim();
  const utmMedium = (urlParams.get('utm_medium') || '').trim();
  const utmCampaign = (urlParams.get('utm_campaign') || '').trim();
  const utmTerm = (urlParams.get('utm_term') || '').trim();
  const utmContent = (urlParams.get('utm_content') || '').trim();
  const fbclid = (urlParams.get('fbclid') || '').trim();
  const gclid = (urlParams.get('gclid') || urlParams.get('gbraid') || urlParams.get('wbraid') || '').trim();
  const referrer = typeof document !== 'undefined' ? document.referrer || '' : '';
  const landingPage = window.location.pathname + window.location.search;

  // Determine channel
  let channel: TrafficChannel = 'Direto';
  const lowerSource = utmSource.toLowerCase();
  const lowerMedium = utmMedium.toLowerCase();
  const lowerRef = referrer.toLowerCase();
  const isPaidMedium = ['cpc', 'ppc', 'paid', 'paid_social', 'paid-social', 'paid_search', 'ads', 'ad', 'sponsored', 'display'].includes(lowerMedium);

  // 1. Google Ads (click ID or Google with paid medium)
  if (gclid || (['google', 'adwords'].includes(lowerSource) && isPaidMedium)) {
    channel = 'Google Ads';
  } 
  // 2. Google Orgânico (referrer from google or organic utm)
  else if (
    (!utmSource && lowerRef.includes('google.') && !lowerRef.includes('googleads') && !gclid) ||
    (lowerSource === 'google' && ['organic', 'organico', 'busca', 'search'].includes(lowerMedium))
  ) {
    channel = 'Google Orgânico';
  } 
  // 3. Meta Ads (fbclid or Meta sources with paid medium)
  else if (
    (['facebook', 'instagram', 'meta', 'fb', 'ig', 'an', 'msg', 'th'].includes(lowerSource) && isPaidMedium) ||
    (lowerSource === 'meta-ads' && (isPaidMedium || ['instagram','facebook'].includes(lowerMedium)))
  ) {
    channel = 'Meta Ads';
  } 
  // 4. Instagram Orgânico / Social
  else if (
    lowerRef.includes('instagram.com') ||
    lowerSource.includes('instagram') ||
    lowerSource === 'ig'
  ) {
    channel = 'Instagram';
  } 
  // 5. Facebook Orgânico / Social
  else if (
    fbclid || lowerRef.includes('facebook.com') ||
    lowerRef.includes('fb.me') ||
    lowerSource.includes('facebook') ||
    lowerSource === 'fb'
  ) {
    channel = 'Facebook';
  } 
  // 6. ChatGPT / Inteligência Artificial (OpenAI, Perplexity, Claude, Copilot)
  else if (
    lowerRef.includes('chatgpt.com') ||
    lowerRef.includes('openai.com') ||
    lowerRef.includes('perplexity.ai') ||
    lowerRef.includes('claude.ai') ||
    lowerRef.includes('android-app://com.openai.chatgpt') ||
    lowerRef.includes('bing.com/chat') ||
    lowerRef.includes('copilot') ||
    ['chatgpt', 'openai', 'perplexity', 'claude', 'copilot', 'ai', 'gemini'].includes(lowerSource)
  ) {
    channel = 'ChatGPT / IA';
  } 
  // 7. TikTok
  else if (lowerRef.includes('tiktok.com') || lowerSource.includes('tiktok')) {
    channel = 'TikTok';
  } 
  // 8. WhatsApp
  else if (lowerRef.includes('whatsapp') || lowerSource.includes('whatsapp')) {
    channel = 'WhatsApp';
  } 
  // 9. Other UTM source
  else if (utmSource) {
    channel = 'Outro';
  } 
  // 10. External Referrer
  else if (referrer && !lowerRef.includes(window.location.hostname)) {
    channel = 'Outro';
  } 
  // 11. Direct
  else {
    channel = 'Direto';
  }

  const currentAttribution: TrafficData = {
    channel,
    source: utmSource || (
      channel === 'Google Ads' ? 'google_ads' :
      channel === 'Google Orgânico' ? 'google_organico' :
      channel === 'Meta Ads' ? 'meta_ads' :
      channel === 'Instagram' ? 'instagram' :
      channel === 'Facebook' ? 'facebook' :
      channel === 'ChatGPT / IA' ? 'chatgpt_ia' :
      channel === 'TikTok' ? 'tiktok' :
      channel === 'WhatsApp' ? 'whatsapp' :
      channel === 'Direto' ? 'direto' : 'referral'
    ),
    medium: utmMedium || (
      channel === 'Google Ads' || channel === 'Meta Ads' ? 'cpc' :
      channel === 'Google Orgânico' ? 'organico' :
      channel === 'Instagram' || channel === 'Facebook' || channel === 'TikTok' ? 'social' :
      channel === 'ChatGPT / IA' ? 'ai_referral' :
      channel === 'WhatsApp' ? 'messaging' :
      channel === 'Direto' ? 'none' : 'referral'
    ),
    campaign: knownParameter(utmCampaign),
    campaignId: knownParameter(urlParams.get('campaign_id') || urlParams.get('utm_id')),
    adSet: knownParameter(urlParams.get('adset_name') || urlParams.get('adgroup_name') || (channel === 'Meta Ads' ? utmTerm : '')),
    adSetId: knownParameter(urlParams.get('adset_id') || urlParams.get('adgroup_id')),
    adName: knownParameter(urlParams.get('ad_name') || utmContent),
    adId: knownParameter(urlParams.get('ad_id') || urlParams.get('creative_id')),
    placement: knownParameter(urlParams.get('placement')),
    keyword: channel === 'Google Ads' ? knownParameter(utmTerm) : '',
    term: knownParameter(utmTerm) || undefined,
    content: knownParameter(utmContent) || undefined,
    fbclid: fbclid || undefined,
    gclid: gclid || undefined,
    referrer,
    landingPage,
    capturedAt: new Date().toISOString()
  };

  // If new paid traffic arrived or nothing was stored, store it
  if (!existing || fbclid || gclid || utmSource) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentAttribution));
    } catch {
      // Ignore localStorage failure
    }
    return currentAttribution;
  }

  return existing;
}

export function getStoredTrafficAttribution(): TrafficData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const age = Date.now() - Date.parse(parsed.capturedAt);
      if(parsed.source==='meta-ads' && ['instagram','facebook','paid_social','cpc'].includes(parsed.medium)){parsed.channel='Meta Ads';parsed.adSet=parsed.adSet||parsed.term||'';}
      if (!Number.isFinite(age) || age < 0 || age > 30 * 86400000) return null;
      if (['padrao','campanha_google_ads','campanha_meta_ads'].includes(parsed.campaign)) parsed.campaign = '';
      return parsed;
    }
  } catch {
    // fallback
  }
  return null;
}
