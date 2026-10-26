import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  Compass, 
  MapPin, 
  Sparkles, 
  Activity, 
  RefreshCw, 
  ArrowUpRight, 
  CheckCircle2, 
  MousePointerClick, 
  Filter,
  Navigation,
  Globe2
} from 'lucide-react';

interface RouteStat {
  name: string;
  label: string;
  clicks: number;
  uniqueVisitors?: number;
  percentage: number;
}

interface TreatmentStat {
  name: string;
  category: string;
  views: number;
  percentage: number;
  avgTimeSpent: string;
  leadsGenerated: number;
}

interface CTAClickStat {
  label: string;
  location: string;
  clicks: number;
  conversionRate: string;
}

interface LocationStat {
  city: string;
  neighborhood: string;
  state: string;
  sessions: number;
  percentage: number;
}

interface TrafficStat {
  channel: string;
  visitors: number;
  percentage: number;
  leads: number;
}

interface LiveEvent {
  type: string;
  label: string;
  pagePath: string;
  city: string;
  neighborhood: string;
  timestamp: string;
}

interface AnalyticsData {
  summary: {
    totalPageViews: number;
    uniqueVisitors: number;
    avgSessionDuration: string;
    bounceRate: string;
    leadConversionRate: string;
    totalLeads?: number;
    qualifiedLeads?: number;
    lostLeads?: number;
  };
  routes: RouteStat[];
  treatments: TreatmentStat[];
  ctaClicks: CTAClickStat[];
  topLocations: LocationStat[];
  trafficSources: TrafficStat[];
  recentLiveEvents: LiveEvent[];
}

export const InternalAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'rotas' | 'tratamentos' | 'ctas' | 'locais'>('geral');

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/stats');
      const json = await res.json();
      if (json.success && json.stats) {
        setData(json.stats);
      }
    } catch (err) {
      console.error('Error fetching internal analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !data) {
    return (
      <div className="bg-[#FFFFFF] p-12 rounded-3xl border border-[#E5DAD0] text-center">
        <RefreshCw className="w-8 h-8 text-[#8C7359] animate-spin mx-auto mb-3" />
        <p className="font-serif text-lg font-bold text-[#1F1916]">Carregando métricas de navegação...</p>
        <p className="text-xs text-[#66534B] mt-1">Lendo cliques para rotas, visualizações de tratamentos e eventos do site.</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, routes, treatments, ctaClicks, topLocations, trafficSources, recentLiveEvents } = data;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Refresh */}
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DAD0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-[#8C7359]">
              Google Analytics Interno
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Monitoramento em Tempo Real
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1916] mt-1">
            Monitoramento de Navegação & Comportamento
          </h2>
          <p className="text-xs text-[#66534B] mt-0.5">
            Métricas completas do site: cliques para rotas da clínica, tratamentos mais visualizados, cliques em botões e cidades dos visitantes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 bg-[#FAF6F0] hover:bg-[#EFE6DC] text-[#44342E] px-4 py-2.5 rounded-xl border border-[#E5DAD0] text-xs font-bold transition-colors cursor-pointer w-full md:w-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar Leituras</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Pageviews */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5DAD0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#8C7359]">Visualizações</span>
            <Eye className="w-4 h-4 text-[#8C7359]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#1F1916] mt-2">
            {summary.totalPageViews.toLocaleString('pt-BR')}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
            <TrendingUp className="w-3 h-3" /> Páginas e Seções
          </span>
        </div>

        {/* Unique Visitors */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5DAD0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#8C7359]">Visitantes Únicos</span>
            <Users className="w-4 h-4 text-[#8C7359]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#1F1916] mt-2">
            {summary.uniqueVisitors.toLocaleString('pt-BR')}
          </p>
          <span className="text-[11px] text-[#66534B]">Dispositivos rastreados</span>
        </div>

        {/* Avg Duration */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5DAD0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#8C7359]">Tempo no Site</span>
            <Clock className="w-4 h-4 text-[#8C7359]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#1F1916] mt-2">
            {summary.avgSessionDuration}
          </p>
          <span className="text-[11px] text-[#66534B]">Média por sessão</span>
        </div>

        {/* Route Clicks */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5DAD0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#8C7359]">Cliques p/ Rotas</span>
            <Navigation className="w-4 h-4 text-[#8C7359]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#1F1916] mt-2">
            {routes.reduce((acc, curr) => acc + curr.clicks, 0)}
          </p>
          <span className="text-[11px] text-[#66534B]">Navegação & mapas</span>
        </div>

        {/* Leads Qualificados */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-purple-800">Qualificados</span>
            <Sparkles className="w-4 h-4 text-purple-700" />
          </div>
          <p className="text-2xl font-serif font-bold text-purple-900 mt-2">
            {summary.qualifiedLeads ?? 4}
          </p>
          <span className="text-[11px] text-purple-700 font-semibold">Agendados / Convertidos</span>
        </div>

        {/* Lead Conversion Rate */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-emerald-800">Conversão Site</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-serif font-bold text-emerald-900 mt-2">
            {summary.leadConversionRate}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">Visitantes → Leads</span>
        </div>

      </div>

      {/* Sub Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('geral')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'geral'
              ? 'bg-[#44342E] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#66534B] hover:bg-[#FAF6F0] border border-[#E5DAD0]'
          }`}
        >
          Visão Geral & Funil
        </button>
        <button
          onClick={() => setActiveSubTab('rotas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'rotas'
              ? 'bg-[#44342E] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#66534B] hover:bg-[#FAF6F0] border border-[#E5DAD0]'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Cliques para Rotas ({routes.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('tratamentos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'tratamentos'
              ? 'bg-[#44342E] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#66534B] hover:bg-[#FAF6F0] border border-[#E5DAD0]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Tratamentos Mais Vistos ({treatments.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('ctas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'ctas'
              ? 'bg-[#44342E] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#66534B] hover:bg-[#FAF6F0] border border-[#E5DAD0]'
          }`}
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>Cliques em Botões / CTAs ({ctaClicks.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('locais')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'locais'
              ? 'bg-[#44342E] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#66534B] hover:bg-[#FAF6F0] border border-[#E5DAD0]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Cidades & Regiões</span>
        </button>
      </div>

      {/* Main Content Sections based on SubTab */}
      {activeSubTab === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Tratamentos Mais Vistos (Preview) */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#8C7359]">Interesse & Demanda</span>
                <h3 className="font-serif text-xl font-bold text-[#1F1916]">Tratamentos Mais Vistos</h3>
              </div>
              <button 
                onClick={() => setActiveSubTab('tratamentos')}
                className="text-xs text-[#8C7359] hover:text-[#44342E] font-bold underline cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {treatments.slice(0, 5).map((t, index) => (
                <div key={t.name} className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E5DAD0]/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#1F1916]">
                      #{index + 1} {t.name}
                    </span>
                    <span className="text-[#8C7359]">{t.views} views ({t.percentage}%)</span>
                  </div>
                  <div className="w-full bg-[#E5DAD0]/60 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#8C7359] h-full rounded-full transition-all duration-500"
                      style={{ width: `${t.percentage * 2.2}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#66534B]">
                    <span>Tempo de atenção: {t.avgTimeSpent}</span>
                    <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {t.leadsGenerated} leads gerados
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cliques para Rotas & Seções (Preview) */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#8C7359]">Fluxo de Navegação</span>
                <h3 className="font-serif text-xl font-bold text-[#1F1916]">Cliques para Rotas do Site</h3>
              </div>
              <button 
                onClick={() => setActiveSubTab('rotas')}
                className="text-xs text-[#8C7359] hover:text-[#44342E] font-bold underline cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {routes.map((r, index) => (
                <div key={r.name} className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E5DAD0]/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#EFE6DC] text-[#44342E] flex items-center justify-center text-[10px] font-mono">
                        {index + 1}
                      </span>
                      <span className="text-[#1F1916]">{r.label}</span>
                    </div>
                    <span className="text-[#44342E] font-mono">{r.clicks} cliques</span>
                  </div>
                  <div className="w-full bg-[#E5DAD0]/60 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#44342E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${r.percentage * 2.8}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#66534B]">
                    <span className="font-mono text-[10px] text-[#8C7359]">{r.name}</span>
                    <span>{r.uniqueVisitors ? `${r.uniqueVisitors} visitantes únicos` : `${r.percentage}% do tráfego`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cidades e Localização dos Visitantes */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#8C7359]">Geolocalização</span>
                <h3 className="font-serif text-xl font-bold text-[#1F1916]">De Onde Vêm os Visitantes</h3>
              </div>
              <MapPin className="w-4 h-4 text-[#8C7359]" />
            </div>

            <div className="divide-y divide-[#E5DAD0]/60">
              {topLocations.map((loc) => (
                <div key={loc.neighborhood} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1F1916] block">{loc.neighborhood}</span>
                    <span className="text-[11px] text-[#66534B]">{loc.city} - {loc.state}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#44342E] block">{loc.sessions} sessões</span>
                    <span className="text-[10px] text-[#8C7359] font-medium">{loc.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Origens de Tráfego no Site */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#8C7359]">Canais de Aquisição</span>
                <h3 className="font-serif text-xl font-bold text-[#1F1916]">Tráfego por Origem</h3>
              </div>
              <Globe2 className="w-4 h-4 text-[#8C7359]" />
            </div>

            <div className="space-y-3">
              {trafficSources.map((source) => (
                <div key={source.channel} className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E5DAD0]/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1F1916] block">{source.channel}</span>
                    <span className="text-[11px] text-[#66534B]">{source.visitors} visitantes ({source.percentage}%)</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg text-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      {source.leads} leads
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab: Rotas Detalhadas */}
      {activeSubTab === 'rotas' && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#8C7359]">
              Navegação Interna & Trajetos
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#1F1916]">
              Relatório de Cliques para Rotas do Site
            </h3>
            <p className="text-xs text-[#66534B] mt-1">
              Descubra quais caminhos os visitantes mais escolhem para navegar, consultar tratamentos, ver a equipe ou traçar rota até a clínica.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF6F0] border-b border-[#E5DAD0] text-[#5C4B44] text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Destino da Rota</th>
                  <th className="py-3 px-4">Identificador da Rota</th>
                  <th className="py-3 px-4 text-center">Cliques Totais</th>
                  <th className="py-3 px-4 text-center">Visitantes Únicos</th>
                  <th className="py-3 px-4 text-right">Percentual de Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DAD0]/70 text-[#1F1916]">
                {routes.map((r, i) => (
                  <tr key={r.name} className="hover:bg-[#FAF6F0]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold">
                      <span className="text-sm">{r.label}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#8C7359]">
                      {r.name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#44342E]">
                      {r.clicks}
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#66534B]">
                      {r.uniqueVisitors || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#8C7359]">
                      {r.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Tratamentos Mais Vistos */}
      {activeSubTab === 'tratamentos' && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#8C7359]">
              Demanda & Desejo de Compra
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#1F1916]">
              Ranking de Tratamentos Mais Vistos
            </h3>
            <p className="text-xs text-[#66534B] mt-1">
              Quais procedimentos geram maior interesse e retenção de leitura no site, além do volume de leads que cada um converteu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {treatments.map((t, idx) => (
              <div key={t.name} className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#E5DAD0] space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFE6DC] text-[#44342E]">
                    #{idx + 1} {t.category}
                  </span>
                  <span className="text-xs font-bold text-[#8C7359]">{t.percentage}% interesse</span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#1F1916] leading-tight">
                  {t.name}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-[#E5DAD0]/80">
                  <div>
                    <span className="text-[#8C7359] text-[10px] block">Visualizações</span>
                    <span className="font-bold text-base text-[#1F1916]">{t.views}</span>
                  </div>
                  <div>
                    <span className="text-[#8C7359] text-[10px] block">Tempo Médio</span>
                    <span className="font-bold text-base text-[#1F1916]">{t.avgTimeSpent}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#66534B]">Leads Gerados:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                    {t.leadsGenerated} pacientes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: CTAs & Ações de Conversão */}
      {activeSubTab === 'ctas' && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#8C7359]">
              Engajamento & Botões
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#1F1916]">
              Cliques em Botões de Ação (CTAs)
            </h3>
            <p className="text-xs text-[#66534B] mt-1">
              Desempenho de cada ponto de contato do site: WhatsApp flutuante, formulários e agendamentos.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF6F0] border-b border-[#E5DAD0] text-[#5C4B44] text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Botão / CTA</th>
                  <th className="py-3 px-4">Localização no Site</th>
                  <th className="py-3 px-4 text-center">Cliques Registrados</th>
                  <th className="py-3 px-4 text-right">Taxa de Conversão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DAD0]/70 text-[#1F1916]">
                {ctaClicks.map((cta) => (
                  <tr key={cta.label} className="hover:bg-[#FAF6F0]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1F1916]">
                      {cta.label}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#66534B]">
                      {cta.location}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-[#44342E]">
                      {cta.clicks}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-800">
                      {cta.conversionRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Localização dos Visitantes */}
      {activeSubTab === 'locais' && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#8C7359]">
              Origem Geográfica
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#1F1916]">
              Cidades e Bairros que Mais Visitam a Nidô
            </h3>
            <p className="text-xs text-[#66534B] mt-1">
              Distribuição por bairro e cidade dos pacientes que acessam e navegam pelo site.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topLocations.map((loc) => (
              <div key={loc.neighborhood} className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#E5DAD0] space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#8C7359]" />
                  <span className="font-bold text-sm text-[#1F1916]">{loc.neighborhood}</span>
                </div>
                <div className="text-xs text-[#66534B]">
                  {loc.city} - {loc.state}
                </div>
                <div className="pt-2 border-t border-[#E5DAD0]/80 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#44342E]">{loc.sessions} sessões</span>
                  <span className="font-semibold text-[#8C7359]">{loc.percentage}% do total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Live Events Feed */}
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-serif text-lg font-bold text-[#1F1916]">
              Feed de Ações no Site (Tempo Real)
            </h3>
          </div>
          <span className="text-xs text-[#66534B]">Últimas interações gravadas</span>
        </div>

        <div className="space-y-2">
          {recentLiveEvents.map((evt, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E5DAD0]/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-[#EFE6DC] text-[#44342E]">
                  {evt.type === 'route_click' ? <Navigation className="w-3.5 h-3.5" /> :
                   evt.type === 'treatment_view' ? <Eye className="w-3.5 h-3.5" /> :
                   <MousePointerClick className="w-3.5 h-3.5" />}
                </span>
                <div>
                  <span className="font-bold text-[#1F1916] block">{evt.label}</span>
                  <span className="text-[11px] text-[#66534B]">{evt.city} ({evt.neighborhood}) • {evt.pagePath}</span>
                </div>
              </div>
              <span className="text-[10px] text-[#8C7359] font-mono whitespace-nowrap">
                {new Date(evt.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
