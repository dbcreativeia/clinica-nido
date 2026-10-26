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
              Última atualização: Setembro de 2026 • Clínica Nidô Estética Avançada
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
                <li><strong>Dados de Contato Inicial:</strong> Nome e telefone/WhatsApp, fornecidos voluntariamente pelo usuário para retorno de dúvidas e solicitação de horários de avaliação.</li>
                <li><strong>Dados Técnicos de Navegação:</strong> Informações anônimas de dispositivo, páginas acessadas e cliques em links de atendimento (via cookies analíticos, mediante seu consentimento).</li>
              </ul>
              <p className="p-3.5 rounded-xl bg-[#EFE6DC] border border-[#E5DAD0] text-xs text-[#44342E] font-normal">
                <strong className="text-[#241E1B] font-semibold">Não coletamos dados médicos sensíveis em formulários abertos na web.</strong> Quaisquer dados clínicos e de saúde são coletados presencialmente no consultório durante a anamnese médica ou biomédica, sob estrito sigilo profissional.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                3. Finalidade e Base Legal do Tratamento
              </h2>
              <p>
                Os dados de contato fornecidos são tratados exclusivamente com base no seu consentimento (art. 7º, I da LGPD) e na execução de procedimentos preliminares a pedido do titular (art. 7º, V da LGPD), única e exclusivamente para responder às solicitações iniciadas pelo visitante.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                4. Compartilhamento de Dados
              </h2>
              <p>
                A Clínica Nidô <strong>não comercializa, não aluga e não compartilha</strong> suas informações pessoais com terceiros para fins publicitários. O compartilhamento ocorre apenas com prestadores de tecnologia essenciais à operação (como provedor de hospedagem e mensageria segura do WhatsApp), sujeitos a cláusulas de confidencialidade.
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

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                6. Contato com o Encarregado de Dados (DPO)
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
