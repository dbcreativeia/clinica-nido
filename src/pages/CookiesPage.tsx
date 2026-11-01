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
              Última atualização: 1 de novembro de 2026 • Clínica Nidô Estética Avançada
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
                    Medem páginas visitadas, cliques e tempo de navegação pelo Analytics Interno e pelo Google Analytics (Google). Os registros internos usam identificadores de visitante e sessão e podem ser vinculados ao contato enviado no formulário. Não são necessariamente anônimos. Só são ativados após autorização válida de Analytics. A recusa não impede atendimento ou acesso ao site.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#EFE6DC] border border-[#E5DAD0]">
                  <h3 className="font-semibold text-[#241E1B] text-sm">c) Publicidade e mensuração de anúncios</h3>
                  <p className="text-xs text-[#5C4B44] mt-1">Com autorização de Publicidade, usamos Meta Pixel e API de Conversões para compartilhar eventos institucionais, IP, dados do navegador e identificadores de clique e cookies (_fbp e _fbc) com a Meta. Ao enviar um formulário, nome, e-mail e telefone podem ser normalizados e enviados com hash para correspondência. Hash não torna esses dados anônimos. Os eventos também podem refletir etapas de qualificação do contato no CRM. A autorização para atendimento não substitui a de Publicidade.</p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-medium text-[#241E1B]">
                3. Como Gerenciar ou Revogar o Consentimento
              </h2>
              <p>
                Você pode aceitar todos os cookies opcionais, recusá-los com a mesma facilidade ou escolher por categoria. Os opcionais começam desativados. Use “Preferências de Privacidade” no rodapé para revisar ou retirar sua autorização. Fechar o aviso ou continuar navegando não significa aceitar. Preferências válidas são lembradas por até 180 dias, prazo operacional adotado pela clínica, e podem ser alteradas antes disso.
              </p>
            </section>
            <section className="space-y-2"><h2 className="font-serif text-xl font-medium text-[#241E1B]">4. Localização e serviços externos</h2><p>Aceitar cookies não autoriza GPS. Na página Como chegar, você pode solicitar uma rota usando sua localização. Coordenadas usadas só para preparar a rota não são armazenadas no CRM e são compartilhadas com o Google Maps quando você abre o link calculado. Guardar coordenadas nos sistemas da Nidô depende de autorização específica e opcional. O mapa incorporado é carregado automaticamente na página Como chegar, conectando seu navegador ao Google, que pode receber dados técnicos como IP. Isso não autoriza o GPS nem o armazenamento de coordenadas no CRM. Google Maps, Waze e Uber têm políticas próprias.</p></section>
            <section className="space-y-2"><h2 className="font-serif text-xl font-medium text-[#241E1B]">5. Registro das escolhas</h2><p>Registramos a data, a versão do aviso, as categorias escolhidas e identificadores aleatórios para documentar suas preferências, sem incluir nome, contato ou coordenadas no recibo. O histórico local e a fila de sincronização são limitados a 100 registros e até 180 dias. Recibos recebidos pelo servidor ficam por até 12 meses. Se a conexão falhar, a escolha continua valendo no navegador e o envio do recibo é tentado novamente. A retirada de autorização interrompe novos envios por ela controlados; dados já recebidos podem ser objeto de solicitação de exclusão pelos canais da Política de Privacidade.</p></section>
          </div>
        </div>
      </div>
    </div>
  );
};
