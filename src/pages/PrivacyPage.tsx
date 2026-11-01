import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WHATSAPP_DISPLAY } from '../utils/whatsapp';
import { SEOHead } from '../components/SEOHead';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 bg-[#F7F2EB] min-h-screen">
      <SEOHead
        title="Política de Privacidade | Clínica Nidô (LGPD)"
        description="Termos de privacidade e tratamento de dados pessoais da Clínica Nidô em conformidade com a LGPD (Lei nº 13.709/2018). São Paulo, SP."
        canonicalPath="/politica-de-privacidade"
        keywords={['política de privacidade', 'lgpd estética', 'dados pessoais clínica nidô']}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#241E1B] hover:text-[#44342E] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Início</span>
        </Link>

        <div className="bg-[#FFFFFF] p-8 sm:p-12 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-8 text-[#241E1B]">
          <div className="space-y-2 border-b border-[#E5DAD0] pb-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#8C7359]">
              <ShieldCheck className="w-4 h-4 text-[#44342E]" />
              <span>Conformidade com a LGPD (Lei nº 13.709/2018)</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#241E1B] font-semibold">
              Política de <em className="italic text-[#44342E]">Privacidade</em>
            </h1>
            <p className="text-xs text-[#8C7359] font-normal">
              Última atualização: 1 de novembro de 2026 • Clínica Nidô Estética Avançada
            </p>
          </div>

          <div className="space-y-6 text-sm text-[#5C4B44] leading-relaxed font-normal">
            <section className="space-y-2">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                1. Compromisso com a sua Privacidade
              </h2>
              <p>
                A <strong>Clínica Nidô</strong> (com sede na Rua Dona Germaine Burchard, 499 — Água Branca, São Paulo — SP, CEP 05002-062), sob a responsabilidade técnica da Dra. Brenda Niyama (CRBM 35047), tem como princípio o respeito absoluto aos direitos fundamentais de liberdade e privacidade de seus pacientes e visitantes.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                2. Quais Dados Coletamos e Por Quê
              </h2>
              <p>
                Limitamos a coleta estritamente ao mínimo indispensável para o fornecimento dos nossos serviços:
              </p>
              <ul className="space-y-1.5 list-disc pl-5">
                <li><strong>Dados de Contato Inicial:</strong> Nome, e-mail e telefone/WhatsApp, fornecidos voluntariamente pelo usuário para retorno de dúvidas e solicitação de horários de avaliação.</li>
                <li><strong>Dados Técnicos de Navegação:</strong> Informações de dispositivo, páginas acessadas, cliques e tempo ativo, mediante autorização de Analytics. Identificadores de visitante e sessão podem relacionar a navegação ao contato, portanto esses registros não são necessariamente anônimos.</li>
                <li><strong>Mensuração de anúncios:</strong> mediante autorização específica de Publicidade, compartilhamos com a Meta eventos institucionais, identificadores de clique/cookies e dados técnicos. Nome, e-mail e telefone fornecidos no formulário podem ser enviados com hash para correspondência. Hash é uma medida de proteção, não anonimização.</li>
                <li><strong>Localização:</strong> GPS é opcional. Na entrada do site, você pode autorizar ou recusar a captura para o CRM. O navegador só solicita a localização após clicar em Permitir localização. Também pode solicitar uma rota em Como chegar. Utilização temporária para rota e armazenamento de coordenadas no CRM são escolhas distintas. Coordenadas só são associadas ao contato ou à navegação da clínica quando você autoriza especificamente esse armazenamento.</li>
              </ul>
              <p className="p-3.5 rounded-xl bg-[#EFE6DC] border border-[#E5DAD0] text-xs text-[#44342E] font-normal">
                <strong className="text-[#241E1B] font-semibold">Não envie exames, prontuários ou informações detalhadas de saúde pelos formulários públicos.</strong> O interesse selecionado no atendimento pode revelar informações pessoais e é tratado para responder à solicitação. Os eventos enviados pela integração de publicidade usam descrições institucionais, sem nomes de tratamentos, mensagens ou coordenadas do paciente.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                3. Finalidade e Base Legal do Tratamento
              </h2>
              <p>
                Tratamos os dados de contato para responder à solicitação e realizar procedimentos preliminares a pedido do visitante (art. 7º, V da LGPD), conforme a natureza do dado e do atendimento. As finalidades opcionais de Analytics, Publicidade e armazenamento de localização dependem de autorizações próprias. O consentimento para uma finalidade não autoriza automaticamente as outras. Você pode solicitar atendimento mesmo recusando cookies opcionais e GPS.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                4. Compartilhamento de Dados
              </h2>
              <p>
                Usamos prestadores de hospedagem, CRM (Kommo) e mensageria (WhatsApp) para atender às solicitações. Com autorização de Analytics, utilizamos também Google Analytics. Com autorização de Publicidade, a Meta recebe eventos e identificadores para mensurar anúncios e fazer correspondência. Esses provedores podem tratar dados fora do Brasil, conforme seus serviços e políticas. Não enviamos pela integração de anúncios as mensagens de atendimento, nomes de tratamentos ou coordenadas do visitante. Ao abrir Google Maps, Waze ou Uber, você utiliza serviços externos sujeitos às políticas deles.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                5. Seus Direitos como Titular de Dados
              </h2>
              <p>
                Conforme o art. 18 da LGPD, você possui o direito de solicitar a confirmação do tratamento, acesso aos dados, correção de dados incompletos ou inexatos, anonimização, eliminação de dados tratados com consentimento e revogação do consentimento a qualquer momento.
              </p>
            </section>

            <section className="space-y-2"><h2 className="font-serif text-xl font-medium text-[#241E1B]">Conservação e retirada da autorização</h2><p>As preferências de cookies e de armazenamento de localização valem por até 180 dias, sem impedir sua alteração a qualquer momento. Coordenadas no navegador ficam durante a sessão e por até 24 horas; se enviadas mediante autorização, são registradas no CRM ou Analytics da clínica. A revogação impede novas coletas controladas por essa autorização e não apaga automaticamente registros já recebidos. Você pode pedir acesso, correção e exclusão pelos canais abaixo, observadas as hipóteses de conservação previstas em lei. Guardamos recibos de escolhas por até 12 meses para documentar as autorizações e retiradas.</p><button type="button" onClick={()=>window.dispatchEvent(new CustomEvent('nido:open-cookie-settings'))} className="underline font-semibold cursor-pointer">Revisar minhas preferências de privacidade</button></section>
            <section className="space-y-2">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                6. Canal de privacidade e exercício de direitos
              </h2>
              <p>
                Para exercer seus direitos ou esclarecer qualquer dúvida sobre o tratamento dos seus dados, entre em contato diretamente pelo WhatsApp oficial <strong>{WHATSAPP_DISPLAY}</strong> ou presencialmente em nossa clínica na Água Branca, São Paulo.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
