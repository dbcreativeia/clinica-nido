import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, X, Lock, CheckCircle2, ChevronRight, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { requestBrowserLocation } from '../utils/internalAnalytics';

export const ConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'prompting' | 'granted' | 'denied'>('idle');

  // Default checkboxes to false for strict LGPD compliance
  const [geoConsent, setGeoConsent] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [metaConsent, setMetaConsent] = useState(false);

  useEffect(() => {
    // Clear stored consent so user can test as a brand new visitor
    localStorage.removeItem('nido_cookie_consent');
    localStorage.removeItem('nido_last_lead');
    sessionStorage.removeItem('nido_visitor_geo');

    const saved = localStorage.getItem('nido_cookie_consent');
    if (!saved) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      try {
        const parsed = JSON.parse(saved);
        if (parsed.geo) setGeoConsent(true);
        if (parsed.analytics) setAnalyticsConsent(true);
        if (parsed.meta) setMetaConsent(true);
      } catch {
        // Ignore parse error
      }
    }

    // Check if permission was already granted in browser
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setGeoStatus('granted');
        } else if (result.state === 'denied') {
          setGeoStatus('denied');
        } else {
          setGeoStatus('idle');
        }
      }).catch(() => {});
    }
  }, []);

  const handleTriggerGeo = async () => {
    setGeoStatus('prompting');
    try {
      const loc = await requestBrowserLocation();
      if (loc) {
        setGeoStatus('granted');
      } else {
        setGeoStatus('denied');
      }
    } catch {
      setGeoStatus('denied');
    }
  };

  const handleAcceptAll = async () => {
    localStorage.setItem(
      'nido_cookie_consent',
      JSON.stringify({ 
        necessary: true, 
        geo: true, 
        analytics: true, 
        meta: true, 
        timestamp: Date.now(),
        lgpdVersion: '13.709/2018'
      })
    );
    setGeoConsent(true);
    setAnalyticsConsent(true);
    setMetaConsent(true);
    // Dismiss banner completely after user accepts
    setIsVisible(false);

    // Prompt browser geolocation directly on user gesture
    await handleTriggerGeo();
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem(
      'nido_cookie_consent',
      JSON.stringify({ 
        necessary: true, 
        geo: false, 
        analytics: false, 
        meta: false, 
        timestamp: Date.now(),
        lgpdVersion: '13.709/2018'
      })
    );
    setGeoConsent(false);
    setAnalyticsConsent(false);
    setMetaConsent(false);
    // Dismiss banner completely after rejecting non-essentials
    setIsVisible(false);
  };

  const handleSaveCustom = async () => {
    localStorage.setItem(
      'nido_cookie_consent',
      JSON.stringify({ 
        necessary: true, 
        geo: geoConsent, 
        analytics: analyticsConsent, 
        meta: metaConsent, 
        timestamp: Date.now(),
        lgpdVersion: '13.709/2018'
      })
    );
    // Dismiss banner completely after saving options
    setIsVisible(false);

    if (geoConsent) {
      await handleTriggerGeo();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] border-t border-[#E5DAD0] shadow-2xl p-3 sm:p-5 text-[#241E1B] animate-in slide-in-from-bottom duration-200">
      <div className="max-w-5xl mx-auto flex flex-col gap-2.5 sm:gap-3">
        
        {/* Header & Compact Close */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FAF6F0] border border-[#E5DAD0] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#8C7359]" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8C7359] block leading-none">
                Privacidade LGPD (Lei 13.709/18)
              </span>
              <h4 className="font-serif text-xs sm:text-base font-bold text-[#1F1916] leading-snug">
                Cookies e Permissão de Geolocalização (GPS)
              </h4>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-[#5C4B44] hover:text-[#1F1916] p-1 cursor-pointer transition-colors rounded-full hover:bg-[#FAF6F0] shrink-0"
            aria-label="Fechar banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Description & Quick Action Card */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 text-[11px] sm:text-xs text-[#5C4B44]">
          <p className="leading-relaxed">
            Utilizamos cookies essenciais e solicitamos seu <strong>GPS</strong> para direcionar a rota de atendimento até nossa clínica na Água Branca/SP.
          </p>

          {/* GPS Quick Status Button */}
          <button
            type="button"
            onClick={handleTriggerGeo}
            className="shrink-0 bg-[#FAF6F0] hover:bg-[#EFE6DC] text-[#44342E] border border-[#E5DAD0] text-[10px] sm:text-xs font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <MapPin className="w-3.5 h-3.5 text-purple-700" />
            <span>
              {geoStatus === 'granted' ? '✅ GPS Ativado' : '📍 Solicitar GPS Nativo'}
            </span>
          </button>
        </div>

        {/* Customization Checkbox Panel */}
        {showCustomize && (
          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E5DAD0] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-[#1F1916] animate-in fade-in">
            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5DAD0]">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5 text-[#8C7359]" />
                <span>Cookies Essenciais</span>
              </div>
              <span className="text-[9px] font-bold text-[#8C7359] bg-[#EFE6DC] px-1.5 py-0.5 rounded">
                Obrigatório
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5DAD0]">
              <div className="flex items-center gap-1.5 font-bold">
                <MapPin className="w-3.5 h-3.5 text-purple-700" />
                <span>Geolocalização / GPS</span>
              </div>
              <input
                type="checkbox"
                checked={geoConsent}
                onChange={(e) => setGeoConsent(e.target.checked)}
                className="accent-[#44342E] w-3.5 h-3.5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5DAD0]">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                <span>Analytics Interno</span>
              </div>
              <input
                type="checkbox"
                checked={analyticsConsent}
                onChange={(e) => setAnalyticsConsent(e.target.checked)}
                className="accent-[#44342E] w-3.5 h-3.5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5DAD0]">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Meta Pixel & Ads</span>
              </div>
              <input
                type="checkbox"
                checked={metaConsent}
                onChange={(e) => setMetaConsent(e.target.checked)}
                className="accent-[#44342E] w-3.5 h-3.5 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Buttons Bar */}
        <div className="flex flex-row items-center justify-between gap-2 pt-1 border-t border-[#E5DAD0]/60">
          <Link to="/politica-de-privacidade" className="text-[10px] text-[#8C7359] font-medium hover:underline hidden sm:inline">
            Política de Privacidade LGPD
          </Link>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            {showCustomize ? (
              <>
                <button
                  onClick={handleSaveCustom}
                  className="flex-1 sm:flex-initial bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setShowCustomize(false)}
                  className="bg-[#FAF6F0] text-[#44342E] border border-[#E5DAD0] py-2 px-2.5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Voltar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] py-2 px-3 sm:px-4 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1"
                >
                  <span>Aceitar Todos & GPS</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-80 hidden sm:inline" />
                </button>
                <button
                  onClick={handleRejectNonEssential}
                  className="bg-[#FAF6F0] hover:bg-[#EFE6DC] text-[#44342E] border border-[#E5DAD0] py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Essenciais
                </button>
                <button
                  onClick={() => setShowCustomize(true)}
                  className="text-xs text-[#8C7359] hover:text-[#44342E] underline py-1 px-1.5 cursor-pointer font-bold transition-colors shrink-0"
                >
                  <Settings className="w-3.5 h-3.5 sm:hidden" />
                  <span className="hidden sm:inline">Opções</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
