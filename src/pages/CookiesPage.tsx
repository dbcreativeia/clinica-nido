import { ShieldCheck, Cookie, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';

export const CookiesPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 bg-[#F7F2EB] min-h-screen">
      <SEOHead
        title="Política de Cookies | Clínica Nidô"
        description="Informações transparentes sobre o uso de cookies estritamente necessários e de preferências no site da Clínica Nidô em São Paulo."
        canonicalPath="/politica-de-cookies"
        keywords={['política de cookies', 'cookies clínica nidô', 'privacidade estética']}
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
              <Cookie className="w-4 h-4 text-[#44342E]" />
              <span>Transparência e Consentimento</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#241E1B] font-semibold">
              Política de <em className="italic text-[#44342E]">Cookies</em>
            </h1>
            <p className="text-xs text-[#8C7359] font-normal">
              Última atualização: Setembro de 2026 • Clínica Nidô Estética Avançada
            </p>
          </div>

          <div className="space-y-6 text-sm text-[#5C4B44] leading-relaxed font-normal">
            <section className="space-y-2">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                1. O que são Cookies?
              </h2>
              <p>
                Cookies são pequenos arquivos de texto armazenados no navegador do seu dispositivo quando você visita um site. Eles servem para permitir a navegação eficiente, memorizar preferências do usuário e prover métricas agregadas de desempenho.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                2. Categorias de Cookies Utilizadas
              </h2>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#EFE6DC] border border-[#E5DAD0]">
                  <h3 className="font-semibold text-[#241E1B] text-sm">a) Cookies Estritamente Necessários</h3>
                  <p className="text-xs text-[#5C4B44] mt-1 font-normal">
                    Indispensáveis para que o site funcione adequadamente, garantindo navegação segura, balanceamento de carga e registro da sua preferência de cookies. Esses cookies não podem ser desativados.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#EFE6DC] border border-[#E5DAD0]">
                  <h3 className="font-semibold text-[#241E1B] text-sm">b) Cookies Analíticos e de Desempenho</h3>
                  <p className="text-xs text-[#5C4B44] mt-1 font-normal">
                    Coletam dados anônimos e agregados sobre quais páginas são mais visitadas e a taxa de cliques em botões de WhatsApp, ajudando-nos a melhorar a organização dos tratamentos. Só são ativados caso você consinta no banner.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                3. Como Gerenciar ou Revogar o Consentimento
              </h2>
              <p>
                Você pode a qualquer momento limpar os cookies nas configurações do seu navegador ou utilizar o banner de preferências exibido no rodapé do nosso site.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
