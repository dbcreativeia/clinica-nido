import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Navigation,
  Car,
  Compass,
  ExternalLink
} from 'lucide-react';
import { openWhatsApp, openDirectWhatsApp, WhatsAppMessages, WHATSAPP_DISPLAY } from '../utils/whatsapp';
import { Link } from 'react-router-dom';
import { TREATMENTS } from '../data/treatments';
import { SEOHead } from '../components/SEOHead';
import { getStoredTrafficAttribution, initTrafficAttribution } from '../utils/trafficSource';
import { trackMetaEvent } from '../utils/metaConversions';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceInterest: 'Geral',
    privacyAccepted: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Coordenadas e endereço da clínica
  const addressQuery = encodeURIComponent('Rua Dona Germaine Burchard, 499 - Água Branca, São Paulo - SP');
  const wazeUrl = 'https://www.waze.com/ul?q=Rua%20Dona%20Germaine%20Burchard%2C%20499%20-%20%C3%81gua%20Branca%2C%20S%C3%A3o%20Paulo&navigate=yes';
  const uberUrl = 'https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=Rua%20Dona%20Germaine%20Burchard%2C%20499%20-%20%C3%81gua%20Branca%2C%20S%C3%A3o%20Paulo&dropoff[latitude]=-23.524856&dropoff[longitude]=-46.680783';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;

  const handleDirectWhatsApp = () => {
    openWhatsApp(WhatsAppMessages.contact(), {
      service_name: 'Geral',
      page_path: '/contato',
      cta_location: 'Botão Direto Página Como Chegar'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.privacyAccepted) {
      setFormError('Por favor, aceite a Política de Privacidade para prosseguir.');
      return;
    }
    setFormError('');

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanPhoneDigits = formData.phone.replace(/\D/g, '');

    const message = `Oi meu nome é ${cleanName}, vim pelo site da Nidô e gostaria de informações sobre ${formData.serviceInterest}. Você pode me orientar?`;
    const traffic = getStoredTrafficAttribution() || initTrafficAttribution();

    // Save lead to CRM
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: formData.phone,
          email: cleanEmail,
          serviceInterest: formData.serviceInterest,
          ctaLocation: 'Formulário Página Como Chegar',
          message,
          trafficChannel: traffic.channel,
          trafficSource: traffic.source,
          trafficMedium: traffic.medium,
          trafficCampaign: traffic.campaign,
          trafficTerm: traffic.term || '',
          trafficContent: traffic.content || '',
          fbclid: traffic.fbclid || '',
          gclid: traffic.gclid || '',
          referrer: traffic.referrer || document.referrer || '',
          pagePath: '/contato'
        })
      });
    } catch (err) {
      console.warn('[CRM Lead Dispatch Warning]', err);
    }

    // Meta tracking
    try {
      trackMetaEvent('Contact', {
        customData: {
          content_name: formData.serviceInterest,
          content_category: 'Atendimento & Avaliação',
          cta_location: 'Formulário Página Como Chegar'
        },
        userData: {
          fn: cleanName,
          ph: cleanPhoneDigits,
          em: cleanEmail.toLowerCase(),
          fbp: traffic.fbclid,
          fbc: traffic.fbclid
        }
      });
    } catch {
      // ignore
    }

    openDirectWhatsApp(message, {
      service_name: formData.serviceInterest,
      page_path: '/contato',
      cta_location: 'Formulário Página Como Chegar'
    });
    setSubmitted(true);
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 bg-[#F5EFE7] min-h-screen">
      <SEOHead
        title="Contato & Localização na Água Branca, São Paulo | Clínica Nidô"
        description="Agende sua avaliação presencial na Clínica Nidô. Rua Dona Germaine Burchard, 499, Água Branca, São Paulo - SP. WhatsApp (11) 96383-6050."
        canonicalPath="/contato"
        image="/foto-clinica_1.webp"
        keywords={[
          'contato clínica nidô',
          'endereço clínica estética água branca',
          'agendamento dra brenda',
          'estética perdizes contato',
          'clínica estética barra funda sp',
          'whatsapp estética são paulo'
        ]}
        schemaJson={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contato e Localização - Clínica Nidô',
          description: 'Canais de atendimento e localização da Clínica Nidô em São Paulo.',
          url: 'https://www.nidoestetica.com.br/contato',
          mainEntity: {
            '@type': 'MedicalClinic',
            name: 'Clínica Nidô',
            telephone: '+5511963836050',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Rua Dona Germaine Burchard, 499',
              addressLocality: 'Água Branca',
              addressRegion: 'SP',
              postalCode: '05002-062',
              addressCountry: 'BR'
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: -23.5284,
              longitude: -46.6782
            }
          }
        }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14">
        
        {/* Topo: Nome Como Chegar? */}
        <div className="text-center max-w-2xl mx-auto pt-2">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7359] block mb-2">
            Localização & Acesso
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1F1916] font-semibold tracking-tight">
            Como Chegar?
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#5C4B44] font-normal leading-relaxed">
            Nossa clínica está localizada na Água Branca, em São Paulo, com acesso ágil pelos bairros de Perdizes, Pompéia e Barra Funda.
          </p>
        </div>

        {/* 1º BLOCO: LOCALIZAÇÃO (Informações + Mapa + Botões Waze e Uber) */}
        <section className="space-y-8 pb-10 border-b border-[#E5DAD0]/80">
          <div className="text-center sm:text-left">
            <span className="text-xs uppercase tracking-wider font-bold text-[#8C7359] block mb-1">
              Endereço & Rota
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1F1916]">
              Localização
            </h2>
          </div>

          {/* Dados do Endereço e Horários */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex items-start gap-3.5 bg-[#FFFFFF]/70 p-4 rounded-2xl border border-[#E5DAD0]/80">
              <div className="w-10 h-10 rounded-2xl bg-[#EFE6DC] flex items-center justify-center text-[#44342E] shrink-0">
                <MapPin className="w-5 h-5 text-[#8C7359]" />
              </div>
              <div>
                <strong className="block text-base text-[#1F1916] font-semibold">Endereço</strong>
                <p className="text-sm text-[#44342E] font-medium mt-0.5 leading-snug">
                  Rua Dona Germaine Burchard, 499
                </p>
                <p className="text-xs text-[#66534B] mt-0.5">
                  Água Branca, São Paulo — SP, CEP 05002-062
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-[#FFFFFF]/70 p-4 rounded-2xl border border-[#E5DAD0]/80">
              <div className="w-10 h-10 rounded-2xl bg-[#EFE6DC] flex items-center justify-center text-[#44342E] shrink-0">
                <Clock className="w-5 h-5 text-[#8C7359]" />
              </div>
              <div>
                <strong className="block text-base text-[#1F1916] font-semibold">Horários de Atendimento</strong>
                <p className="text-sm text-[#44342E] font-medium mt-0.5">
                  Segunda a Sexta: 09h às 20h • Sábados: 09h às 15h
                </p>
              </div>
            </div>
          </div>

          {/* Botões Rápidos: Abrir no Waze, Pedir Uber e Google Maps */}
          <div>
            <span className="block text-xs uppercase tracking-wider font-bold text-[#44342E] mb-3">
              Trace sua rota com 1 clique:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Botão Waze */}
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-[#33CCFF] hover:bg-[#28b5e6] text-[#0B3B4E] font-bold text-sm py-3.5 px-4 rounded-2xl transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Navigation className="w-4 h-4 fill-current" />
                <span>Abrir no Waze</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-auto sm:ml-0" />
              </a>

              {/* Botão Uber */}
              <a
                href={uberUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-[#000000] hover:bg-[#1f1f1f] text-[#FFFFFF] font-bold text-sm py-3.5 px-4 rounded-2xl transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Car className="w-4 h-4" />
                <span>Ir de Uber</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-auto sm:ml-0" />
              </a>

              {/* Botão Google Maps */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-[#FFFFFF] hover:bg-[#EFE6DC] text-[#1F1916] font-bold text-sm py-3.5 px-4 rounded-2xl border border-[#E5DAD0] transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Compass className="w-4 h-4 text-[#44342E]" />
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-auto sm:ml-0" />
              </a>
            </div>
          </div>

          {/* Mapa Certinho Incorporado */}
          <div className="space-y-2 pt-2">
            <div className="aspect-16/10 sm:aspect-21/9 rounded-3xl overflow-hidden border border-[#E5DAD0] relative bg-[#EFE6DC] shadow-sm">
              <iframe
                title="Mapa de Localização da Clínica Nidô"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3658.212726359055!2d-46.68078332386121!3d-23.524856078824147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cef80709b11b9b%3A0xe9634e0631627885!2sR.%20Dona%20Germaine%20Burchard%2C%20499%20-%20%C3%81gua%20Branca%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2005002-062!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-xs text-[#66534B] text-center pt-1 font-medium">
              Rua Dona Germaine Burchard, 499 • Água Branca, São Paulo — SP
            </p>
          </div>
        </section>

        {/* 2º BLOCO: TELEFONE E ATENDIMENTO DIRETO */}
        <section className="py-2 border-b border-[#E5DAD0]/80">
          <div className="bg-[#EFE6DC]/80 backdrop-blur-xs text-[#241E1B] border border-[#E5DAD0] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#44342E] text-white flex items-center justify-center shadow-xs shrink-0 animate-whatsapp-brand-pulse">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#8C7359] font-bold block">
                  Telefone & Atendimento Imediato
                </span>
                <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#241E1B]">
                  {WHATSAPP_DISPLAY}
                </p>
              </div>
            </div>

            <p className="text-sm text-[#5C4B44] font-normal leading-relaxed max-w-2xl">
              Fale diretamente com nossa recepção para confirmar horários de consulta, tirar dúvidas sobre procedimentos específicos ou solicitar instruções de chegada.
            </p>

            <button
              onClick={handleDirectWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] font-bold text-sm sm:text-base uppercase tracking-wider py-4 px-8 rounded-full transition-colors cursor-pointer shadow-sm active:scale-98 animate-whatsapp-brand-pulse"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Falar no WhatsApp</span>
            </button>
          </div>
        </section>

        {/* 3º BLOCO: POR ÚLTIMO, O FORMULÁRIO */}
        <section className="space-y-6 pt-2">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#8C7359] block mb-1">
              Contato por Formulário
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1F1916]">
              Envie sua mensagem
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4B44] font-normal mt-1 leading-relaxed">
              Prefere adiantar sua dúvida? Preencha os campos abaixo e nosso sistema preparará seus dados diretamente para o WhatsApp da clínica.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-[#EFE6DC] rounded-2xl border border-[#E5DAD0] text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#25D366] mx-auto" />
              <h3 className="font-serif text-2xl font-semibold text-[#1F1916]">
                Mensagem preparada com sucesso!
              </h3>
              <p className="text-sm text-[#5C4B44] font-normal max-w-md mx-auto">
                Caso sua janela do WhatsApp não tenha aberto automaticamente, basta clicar no botão abaixo:
              </p>
              <button
                onClick={handleDirectWhatsApp}
                className="inline-flex items-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs uppercase font-bold py-3.5 px-7 rounded-full transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Abrir conversa no WhatsApp</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1916] mb-1.5">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria da Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#F7F2EB] border border-[#E5DAD0] text-sm text-[#1F1916] focus:outline-none focus:border-[#44342E] transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1916] mb-1.5">
                    Seu WhatsApp para Contato *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: (11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#F7F2EB] border border-[#E5DAD0] text-sm text-[#1F1916] focus:outline-none focus:border-[#44342E] transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1916] mb-1.5">
                    Seu E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: seuemail@exemplo.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#F7F2EB] border border-[#E5DAD0] text-sm text-[#1F1916] focus:outline-none focus:border-[#44342E] transition-colors font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1916] mb-1.5">
                  Tratamento ou Área de Interesse
                </label>
                <select
                  value={formData.serviceInterest}
                  onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#F7F2EB] border border-[#E5DAD0] text-sm text-[#1F1916] focus:outline-none focus:border-[#44342E] transition-colors font-medium cursor-pointer"
                >
                  <option value="Geral">Avaliação Geral / Não sei qual procedimento escolher</option>
                  {TREATMENTS.map((treatment) => (
                    <option key={treatment.id} value={treatment.name}>
                      {treatment.name}
                    </option>
                  ))}
                  <option value="Outro Tratamento">Outro Tratamento / Dúvida Geral</option>
                </select>
              </div>

              {/* LGPD Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-[#5C4B44] font-normal leading-relaxed">
                  <input
                    type="checkbox"
                    required
                    checked={formData.privacyAccepted}
                    onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                    className="mt-0.5 accent-[#44342E] w-4 h-4 shrink-0 rounded"
                  />
                  <span>
                    Concordo com o tratamento dos meus dados de contato para retorno do atendimento, em conformidade com a{' '}
                    <Link to="/politica-de-privacidade" className="underline text-[#44342E] font-medium hover:text-[#1F1916]">
                      Política de Privacidade
                    </Link>. (Não solicitamos dados clínicos no site).
                  </span>
                </label>
              </div>

              {formError && (
                <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-full transition-colors cursor-pointer shadow-xs active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Prosseguir para o WhatsApp da Nidô</span>
                </button>
              </div>
            </form>
          )}
        </section>

      </div>
    </div>
  );
};
