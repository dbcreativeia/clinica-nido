import React, { useState, useEffect } from 'react';
import { X, Send, Lock, Sparkles, MessageCircle, CheckCircle2 } from 'lucide-react';
import { 
  formatPersonalizedWhatsAppMessage, 
  openDirectWhatsApp, 
  WhatsAppContext 
} from '../utils/whatsapp';
import { getStoredTrafficAttribution, initTrafficAttribution } from '../utils/trafficSource';
import { trackMetaEvent } from '../utils/metaConversions';
import { getVisitorLocation, getSessionViewedTreatments } from '../utils/internalAnalytics';

interface ModalDetail {
  message: string;
  context?: WhatsAppContext;
}

export const LeadCaptureModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rawMessage, setRawMessage] = useState('');
  const [context, setContext] = useState<WhatsAppContext | undefined>(undefined);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill if previously stored
  useEffect(() => {
    try {
      const savedLead = localStorage.getItem('nido_last_lead');
      if (savedLead) {
        const parsed = JSON.parse(savedLead);
        if (parsed.name) setName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.email) setEmail(parsed.email);
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<ModalDetail>;
      if (customEvent.detail) {
        setRawMessage(customEvent.detail.message || '');
        setContext(customEvent.detail.context);
        setError(null);
        setIsOpen(true);
      }
    };

    window.addEventListener('nido:open-lead-capture', handleOpen);
    return () => {
      window.removeEventListener('nido:open-lead-capture', handleOpen);
    };
  }, []);

  // Format phone number as user types: (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhone(value);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanPhoneDigits = phone.replace(/\D/g, '');
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    if (cleanPhoneDigits.length < 10) {
      setError('Por favor, informe um WhatsApp válido com DDD (Ex: 11 99999-9999).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }

    if (!lgpdAccepted) {
      setError('É necessário declarar o aceite dos termos de privacidade (LGPD) para prosseguir.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Traffic attribution data
      const traffic = getStoredTrafficAttribution() || initTrafficAttribution();
      const serviceInterest = context?.service_name || 'Geral';
      const ctaLocation = context?.cta_location || 'Botão Site';
      const pagePath = context?.page_path || window.location.pathname;

      // Personalized WhatsApp message
      const personalizedMessage = formatPersonalizedWhatsAppMessage(cleanName, rawMessage);

      // Geo location & browsing history
      const visitorGeo = await getVisitorLocation();
      const viewedTreatments = getSessionViewedTreatments();

      // Save lead locally as immediate fallback
      const leadData = {
        name: cleanName,
        phone,
        email: cleanEmail,
        serviceInterest,
        ctaLocation,
        message: personalizedMessage,
        trafficChannel: traffic.channel,
        trafficSource: traffic.source,
        trafficMedium: traffic.medium,
        trafficCampaign: traffic.campaign,
        trafficTerm: traffic.term || '',
        trafficContent: traffic.content || '',
        fbclid: traffic.fbclid || '',
        gclid: traffic.gclid || '',
        referrer: traffic.referrer || document.referrer || '',
        pagePath,
        city: visitorGeo.city,
        state: visitorGeo.state,
        neighborhood: visitorGeo.neighborhood,
        latitude: visitorGeo.latitude,
        longitude: visitorGeo.longitude,
        viewedTreatments,
        lgpdConsent: true,
        lgpdConsentAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('nido_last_lead', JSON.stringify({ name: cleanName, phone, email: cleanEmail }));
      } catch {
        // LocalStorage fallback
      }

      // Send to backend CRM API
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData)
        });
      } catch (err) {
        console.warn('[CRM Lead Dispatch Warning]', err);
      }

      // Meta Conversions API & Pixel Contact event with rich matching data
      try {
        const nameParts = cleanName.split(/\s+/);
        const firstName = nameParts[0] || cleanName;
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

        trackMetaEvent('Contact', {
          customData: {
            content_name: 'Atendimento e Consulta Estética',
            service_label: serviceInterest || 'Avaliação Geral',
            content_category: 'Atendimento WhatsApp CRM',
            cta_location: ctaLocation
          },
          userData: {
            fn: firstName,
            ...(lastName ? { ln: lastName } : {}),
            ph: cleanPhoneDigits,
            em: cleanEmail.toLowerCase(),
            country: 'br',
            st: 'sp',
            ct: 'sao paulo'
          }
        });
      } catch (metaErr) {
        console.warn('[Meta Tracking Warning]', metaErr);
      }

      // Open WhatsApp directly with personalized message, skipping duplicate Contact trigger
      openDirectWhatsApp(personalizedMessage, {
        ...context,
        skipMetaContact: true
      });

      // Close modal
      setIsOpen(false);
    } catch (err) {
      console.error('Error submitting lead:', err);
      setError('Ocorreu um erro ao processar. Você será redirecionado para o WhatsApp.');
      // Fallback: still open WhatsApp
      const fallbackMsg = formatPersonalizedWhatsAppMessage(cleanName, rawMessage);
      openDirectWhatsApp(fallbackMsg, context);
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const serviceName = context?.service_name || 'Atendimento & Avaliação';

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-lead-title"
    >
      <div 
        className="relative w-full max-w-lg bg-[#FAF6F0] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E5DAD0] p-4.5 sm:p-8 my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Fechar formulário"
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EFE6DC] hover:bg-[#E5DAD0] text-[#5C4B44] flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 sm:space-y-2 mb-3.5 sm:mb-6 pr-6 sm:pr-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#EFE6DC] text-[#8C7359] text-[10px] sm:text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Atendimento Exclusivo Nidô</span>
          </div>

          <h2 id="modal-lead-title" className="font-serif text-lg sm:text-2xl font-semibold text-[#1F1916]">
            Iniciar Atendimento no WhatsApp
          </h2>

          <p className="text-[11px] sm:text-sm text-[#5C4B44] max-w-sm mx-auto leading-relaxed">
            Informe seus dados para conectarmos você imediatamente à nossa equipe especializada:
          </p>

          {serviceName && serviceName !== 'Geral' && (
            <div className="pt-0.5 sm:pt-1">
              <span className="inline-block text-[11px] sm:text-xs bg-[#44342E]/10 text-[#44342E] px-2.5 py-0.5 sm:py-1 rounded-lg font-medium border border-[#44342E]/15">
                Interesse: <strong>{serviceName}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1916] mb-1.5">
              Seu Nome Completo *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Dra. Ana Paula / Maria Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#FFFFFF] border border-[#E5DAD0] text-xs sm:text-sm text-[#1F1916] focus:outline-none focus:border-[#44342E] focus:ring-1 focus:ring-[#44342E] transition-colors font-medium shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1916] mb-1">
              WhatsApp com DDD *
            </label>
            <input
              type="tel"
              required
              placeholder="Ex: (11) 99999-9999"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#FFFFFF] border border-[#E5DAD0] text-xs sm:text-sm text-[#1F1916] focus:outline-none focus:border-[#44342E] focus:ring-1 focus:ring-[#44342E] transition-colors font-medium shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1916] mb-1">
              Seu E-mail *
            </label>
            <input
              type="email"
              required
              placeholder="Ex: seuemail@exemplo.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#FFFFFF] border border-[#E5DAD0] text-xs sm:text-sm text-[#1F1916] focus:outline-none focus:border-[#44342E] focus:ring-1 focus:ring-[#44342E] transition-colors font-medium shadow-xs"
            />
          </div>

          {/* LGPD Consent Checkbox */}
          <div className="pt-1.5 pb-0.5">
            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] sm:text-xs text-[#5C4B44] leading-relaxed">
              <input
                type="checkbox"
                required
                checked={lgpdAccepted}
                onChange={(e) => setLgpdAccepted(e.target.checked)}
                className="mt-0.5 accent-[#44342E] w-4 h-4 rounded-md border-[#E5DAD0] cursor-pointer shrink-0"
              />
              <span>
                Estou de acordo com a <strong className="text-[#1F1916]">Política de Privacidade</strong> e autorizo a Clínica Nidô a entrar em contato via WhatsApp e E-mail para atendimento e avaliação estética, conforme a <strong className="text-[#1F1916]">LGPD (Lei 13.709/2018)</strong>. *
              </span>
            </label>
          </div>

          {/* Privacy reassurance */}
          <div className="flex items-center gap-1.5 pt-0.5 text-[10px] sm:text-[11px] text-[#7A675E]">
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8C7359] shrink-0" />
            <span>Dados criptografados e protegidos. Sem envio de spam.</span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-70 mt-1 sm:mt-2"
          >
            {isSubmitting ? (
              <span>Conectando...</span>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 fill-current text-[#25D366]" />
                <span>Continuar para o WhatsApp</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
