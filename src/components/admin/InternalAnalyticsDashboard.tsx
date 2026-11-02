import React, { useState, useEffect, useMemo } from 'react';
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
  Globe2,
  Flame,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Laptop,
  Car,
  Phone
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
  leadsGenerated: number | string;
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
  leads: number | string;
}

interface LiveEvent {
  type: string;
  label: string;
  pagePath: string;
  city: string;
  neighborhood: string;
  timestamp: string;
}

export interface DirectionAppStat {
  app: 'Google Maps' | 'Waze' | 'Uber' | string;
  clicks: number;
  uniqueVisitors?: number;
  percentage: number;
}

export interface DirectionsData {
  totalClicks: number;
  apps: DirectionAppStat[];
}

export interface VisitorSessionStep {
  path: string;
  title: string;
  durationSeconds: number;
  time?: string;
}

export interface VisitorSessionAction {
  type: string;
  label: string;
  path: string;
  time?: string;
}

export interface VisitorSessionItem {
  sessionId: string;
  visitorId: string;
  city: string;
  neighborhood: string;
  state: string;
  trafficChannel: string;
  trafficSource: string;
  totalDurationSeconds: number;
  totalPageViews: number;
  steps: VisitorSessionStep[];
  actions: VisitorSessionAction[];
  hotScore: number;
  isHotLead: boolean;
  isLead?: boolean;
  leadId?: string;
  leadName?: string;
  leadPhone?: string;
  leadEmail?: string;
  leadStatus?: string;
  leadServiceInterest?: string;
  lastSeen: string;
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
  campaigns?: Array<{channel:string;campaign:string;campaignId:string;adSet:string;adSetId:string;adName:string;adId:string;placement:string;visitors:number;sessions:number;pageViews:number;clicks:number}>;
  pages?: Array<{path:string;views:number;visitors:number;avgSeconds:number}>;
  routes: RouteStat[];
  treatments: TreatmentStat[];
  ctaClicks: CTAClickStat[];
  topLocations: LocationStat[];
  trafficSources: TrafficStat[];
  recentLiveEvents: LiveEvent[];
  directions?: DirectionsData;
  visitorSessions?: VisitorSessionItem[];
}

export const InternalAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'direcoes' | 'sessoes' | 'rotas' | 'tratamentos' | 'ctas' | 'locais' | 'origens'>('geral');
  const [sessionFilter, setSessionFilter] = useState<'todos' | 'leads' | 'hot' | 'direcoes' | 'whatsapp'>('todos');
  const [sessionSearch, setSessionSearch] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/analytics/stats');
      const json = await res.json();
      if (res.ok && json.success && json.stats) {
        setData(json.stats);
      } else {
        setErrorMessage(json.error || 'Banco de dados de analytics indisponível');
      }
    } catch (err) {
      console.error('Error fetching internal analytics:', err);
      setErrorMessage('Erro de conexão ao carregar dados de analytics');
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

  const filteredSessions = useMemo(() => {
    const list = data?.visitorSessions || [];
    return list.filter((s) => {
      if (sessionFilter === 'leads' && !s.isLead) return false;
      if (sessionFilter === 'hot' && !s.isHotLead) return false;
      if (sessionFilter === 'direcoes' && !s.actions.some(a => (a.label || '').toLowerCase().match(/maps|waze|uber/))) return false;
      if (sessionFilter === 'whatsapp' && !s.actions.some(a => (a.label || '').toLowerCase().match(/whatsapp|wa\.me/))) return false;
      if (sessionSearch.trim()) {
        const query = sessionSearch.toLowerCase().trim();
        const matchLead = (s.leadName || '').toLowerCase().includes(query) || (s.leadPhone || '').replace(/\D/g, '').includes(query.replace(/\D/g, ''));
        const matchCity = (s.city || '').toLowerCase().includes(query) || (s.neighborhood || '').toLowerCase().includes(query);
        const matchChannel = (s.trafficChannel || '').toLowerCase().includes(query) || (s.trafficSource || '').toLowerCase().includes(query);
        const matchId = (s.visitorId || '').toLowerCase().includes(query) || (s.sessionId || '').toLowerCase().includes(query);
        const matchActions = s.actions.some(a => (a.label || '').toLowerCase().includes(query));
        const matchSteps = s.steps.some(st => (st.title || st.path || '').toLowerCase().includes(query));
        if (!matchLead && !matchCity && !matchChannel && !matchId && !matchActions && !matchSteps) return false;
      }
      return true;
    });
  }, [data?.visitorSessions, sessionFilter, sessionSearch]);

  if (isLoading && !data) {
    return (
      <div className="bg-[#FFFFFF] p-12 rounded-3xl border border-[#E5DAD0] text-center">
        <RefreshCw className="w-8 h-8 text-[#8C7359] animate-spin mx-auto mb-3" />
        <p className="font-serif text-lg font-bold text-[#1F1916]">Carregando métricas de navegação...</p>
        <p className="text-xs text-[#66534B] mt-1">Lendo cliques para rotas, visualizações de tratamentos e eventos do site.</p>
      </div>
    );
  }

  if (errorMessage && !data) {
    return (
      <div className="bg-[#FFFFFF] p-8 sm:p-12 rounded-3xl border border-red-200 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-[#1F1916]">Monitoramento de Analytics Indisponível</h3>
          <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">{errorMessage}</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 bg-[#44342E] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#5A453D] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tentar Novamente</span>
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, routes, treatments, ctaClicks, topLocations, trafficSources, recentLiveEvents, directions, visitorSessions } = data;

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

      <div className="bg-white border border-[#E5DAD0] rounded-2xl p-5 space-y-3">
        <button onClick={()=>setActiveSubTab(activeSubTab==='origens'?'geral':'origens')} className="text-sm font-bold text-[#44342E] cursor-pointer">Campanhas, conjuntos e anúncios: {activeSubTab==='origens'?'ocultar':'ver detalhes'}</button>
        <p className="text-xs text-[#66534B]">Dados coletados com consentimento. Localização sem GPS válido: Não informada. Campanha ausente no link: Não informada. Os IDs identificam anúncios, não cada variação automática de criativo.</p>
        {activeSubTab==='origens' && <>
          <div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead><tr>{['Canal','Campanha / ID','Conjunto ou grupo / ID','Anúncio / ID','Posicionamento','Visitantes','Sessões','Páginas','Cliques'].map(label=><th className="p-2 border-b" key={label}>{label}</th>)}</tr></thead><tbody>
            {(data.campaigns||[]).map((row,i)=><tr key={i} className="border-b">
              <td className="p-2">{row.channel}</td>
              <td className="p-2">{row.campaign||'Não informada'}<small className="block font-mono">{row.campaignId||'Sem ID'}</small></td>
              <td className="p-2">{row.adSet||'Não informado'}<small className="block font-mono">{row.adSetId||'Sem ID'}</small></td>
              <td className="p-2">{row.adName||'Não informado'}<small className="block font-mono">{row.adId||'Sem ID'}</small></td>
              <td className="p-2">{row.placement||'Não informado'}</td><td className="p-2">{row.visitors}</td><td className="p-2">{row.sessions}</td><td className="p-2">{row.pageViews}</td><td className="p-2">{row.clicks}</td>
            </tr>)}
          </tbody></table>{!(data.campaigns||[]).length&&<p className="py-4">Nenhum acesso registrado.</p>}</div>
          <p className="text-xs text-[#66534B]">Atribuição: última origem identificada conservada por até 30 dias. Uma pessoa pode visitar por mais de uma campanha. Dados antigos sem parâmetros não permitem recuperar campanha, conjunto ou anúncio.</p>
        </>}
      </div>
      {activeSubTab==='origens' && <div className="bg-white border border-[#E5DAD0] rounded-2xl p-5 overflow-x-auto">
        <h3 className="font-bold mb-3">Páginas e tempo de atenção</h3>
        <table className="w-full text-xs text-left"><thead><tr>{['Página','Visualizações','Visitantes','Tempo médio ativo'].map(label=><th key={label} className="p-2 border-b">{label}</th>)}</tr></thead><tbody>{(data.pages||[]).map(page=><tr key={page.path}><td className="p-2">{page.path}</td><td className="p-2">{page.views}</td><td className="p-2">{page.visitors}</td><td className="p-2">{page.avgSeconds}s</td></tr>)}</tbody></table>
        <p className="text-xs mt-3 text-[#66534B]">Tempo com a página visível, atualizado a cada 30 segundos ou ao sair. Não é gravação de tela nem comprovação de leitura.</p>
      </div>}
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

        {/* Route Clicks (Como Chegar: Maps, Waze, Uber) */}
        <div 
          onClick={() => setActiveSubTab('direcoes')}
          className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5DAD0] hover:border-[#8C7359] shadow-xs cursor-pointer transition-all"
          title="Clique para ver o relatório detalhado de Como Chegar (Maps, Waze e Uber)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#8C7359]">Rotas p/ Clínica</span>
            <Navigation className="w-4 h-4 text-[#8C7359]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#1F1916] mt-2">
            {directions?.totalClicks || 0}
          </p>
          <span className="text-[11px] text-[#66534B]">Maps, Waze & Uber</span>
        </div>

        {/* Leads Qualificados */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-purple-800">Qualificados</span>
            <Sparkles className="w-4 h-4 text-purple-700" />
          </div>
          <p className="text-2xl font-serif font-bold text-purple-900 mt-2">
            {summary.qualifiedLeads !== undefined ? summary.qualifiedLeads : 'N/D'}
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
          onClick={() => setActiveSubTab('direcoes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'direcoes'
              ? 'bg-[#44342E] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#66534B] hover:bg-[#FAF6F0] border border-[#E5DAD0]'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span>Rotas p/ Clínica (Maps / Waze / Uber) ({directions?.totalClicks || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sessoes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'sessoes'
              ? 'bg-[#44342E] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#66534B] hover:bg-[#FAF6F0] border border-[#E5DAD0]'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>Navegação por Visitante & Tempo ({visitorSessions?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rotas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'rotas'
              ? 'bg-[#44342E] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#66534B] hover:bg-[#FAF6F0] border border-[#E5DAD0]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Páginas do Site (URLs) ({routes.length})</span>
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
                      {typeof t.leadsGenerated === 'number' ? `${t.leadsGenerated} leads gerados` : `Leads: ${t.leadsGenerated}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rotas até a Clínica (Como Chegar: Maps, Waze, Uber) Preview */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-blue-700">Como Chegar à Clínica</span>
                <h3 className="font-serif text-xl font-bold text-[#1F1916]">Rotas GPS & Corridas</h3>
              </div>
              <button 
                onClick={() => setActiveSubTab('direcoes')}
                className="text-xs text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
              >
                Ver detalhes
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Maps */}
              {(() => {
                const mapsApp = directions?.apps?.find(a => a.app === 'Google Maps') || { clicks: 0, percentage: 0 };
                return (
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center space-y-1">
                    <span className="text-[11px] font-bold text-emerald-900 block truncate">Google Maps</span>
                    <span className="text-xl font-serif font-bold text-[#1F1916] block">{mapsApp.clicks}</span>
                    <span className="text-[10px] text-emerald-700 font-mono block">{mapsApp.percentage}%</span>
                  </div>
                );
              })()}

              {/* Waze */}
              {(() => {
                const wazeApp = directions?.apps?.find(a => a.app === 'Waze') || { clicks: 0, percentage: 0 };
                return (
                  <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200/80 text-center space-y-1">
                    <span className="text-[11px] font-bold text-sky-900 block truncate">Waze</span>
                    <span className="text-xl font-serif font-bold text-[#1F1916] block">{wazeApp.clicks}</span>
                    <span className="text-[10px] text-sky-700 font-mono block">{wazeApp.percentage}%</span>
                  </div>
                );
              })()}

              {/* Uber */}
              {(() => {
                const uberApp = directions?.apps?.find(a => a.app === 'Uber') || { clicks: 0, percentage: 0 };
                return (
                  <div className="p-3 rounded-2xl bg-slate-100/70 border border-slate-300/80 text-center space-y-1">
                    <span className="text-[11px] font-bold text-slate-800 block truncate">Uber</span>
                    <span className="text-xl font-serif font-bold text-[#1F1916] block">{uberApp.clicks}</span>
                    <span className="text-[10px] text-slate-600 font-mono block">{uberApp.percentage}%</span>
                  </div>
                );
              })()}
            </div>

            <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E5DAD0]/80 flex items-center justify-between text-xs">
              <span className="text-[#66534B]">Total de trajetos solicitados:</span>
              <span className="font-bold text-[#1F1916]">{directions?.totalClicks || 0} cliques</span>
            </div>
          </div>

          {/* Páginas do Site Mais Acessadas (Preview) */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#8C7359]">Navegação Interna</span>
                <h3 className="font-serif text-xl font-bold text-[#1F1916]">Páginas do Site (URLs)</h3>
              </div>
              <button 
                onClick={() => setActiveSubTab('rotas')}
                className="text-xs text-[#8C7359] hover:text-[#44342E] font-bold underline cursor-pointer"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-2.5">
              {routes.slice(0, 4).map((r, index) => (
                <div key={r.name} className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E5DAD0]/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EFE6DC] text-[#44342E] flex items-center justify-center text-[10px] font-mono">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-bold text-[#1F1916] block">{r.label}</span>
                      <span className="font-mono text-[10px] text-[#8C7359]">{r.name}</span>
                    </div>
                  </div>
                  <span className="text-[#44342E] font-mono font-bold">{r.clicks} cliques</span>
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
              {topLocations.length > 0 ? (
                topLocations.map((loc) => (
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
                ))
              ) : (
                <div className="py-4 text-xs text-[#66534B] text-center font-medium">
                  Nenhuma cidade com geolocalização capturada ainda (Rótulo: Não informada).
                </div>
              )}
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
                      {typeof source.leads === 'number' ? `${source.leads} leads` : `Leads: ${source.leads}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab: Rotas até a Clínica (Google Maps, Waze, Uber) */}
      {activeSubTab === 'direcoes' && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DAD0]/80 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Deslocamento Físico & Como Chegar
                </span>
                <span className="text-xs text-[#8C7359] font-medium">• Presença na Clínica</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F1916] mt-1.5">
                Rotas até a Clínica (Google Maps, Waze e Uber)
              </h3>
              <p className="text-xs text-[#66534B] mt-1 max-w-2xl">
                Contagem em tempo real de pacientes que abriram aplicativos de navegação GPS ou corrida para se deslocar até a Clínica Nidô (Rua Dona Germaine Burchard, 499 - Água Branca, SP).
              </p>
            </div>
            <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E5DAD0] text-center shrink-0">
              <span className="text-[11px] font-bold text-[#8C7359] uppercase block">Total de Trajetos</span>
              <span className="font-serif text-3xl font-bold text-[#1F1916]">{directions?.totalClicks || 0}</span>
              <span className="text-[10px] text-emerald-800 font-semibold block">Intenção de comparecimento</span>
            </div>
          </div>

          {/* 3 App Cards: Google Maps, Waze, Uber */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Google Maps Card */}
            {(() => {
              const mapsApp = directions?.apps?.find(a => a.app === 'Google Maps') || { app: 'Google Maps', clicks: 0, percentage: 0 };
              return (
                <div className="bg-linear-to-b from-emerald-50/50 to-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-[#1F1916]">Google Maps</h4>
                        <span className="text-[10px] text-emerald-800 font-medium">Rotas & Transporte</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {mapsApp.percentage}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-3xl font-serif font-bold text-[#1F1916] block">{mapsApp.clicks}</span>
                    <span className="text-xs text-[#66534B] block">cliques para traçar rota</span>
                  </div>
                  <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, mapsApp.percentage * 1.5)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#5C4B44] pt-1">
                    Rotas a pé, de carro ou transporte público com visualização de mapa interativo.
                  </p>
                </div>
              );
            })()}

            {/* Waze Card */}
            {(() => {
              const wazeApp = directions?.apps?.find(a => a.app === 'Waze') || { app: 'Waze', clicks: 0, percentage: 0 };
              return (
                <div className="bg-linear-to-b from-sky-50/50 to-white p-5 rounded-2xl border border-sky-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#33CCFF] text-[#0B3B4E] flex items-center justify-center font-bold text-xs shadow-xs">
                        <Navigation className="w-4 h-4 fill-current" />
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-[#1F1916]">Waze</h4>
                        <span className="text-[10px] text-sky-800 font-medium">GPS em Tempo Real</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                      {wazeApp.percentage}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-3xl font-serif font-bold text-[#1F1916] block">{wazeApp.clicks}</span>
                    <span className="text-xs text-[#66534B] block">cliques para navegação GPS</span>
                  </div>
                  <div className="w-full bg-sky-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#33CCFF] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, wazeApp.percentage * 1.5)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#5C4B44] pt-1">
                    Navegação direta no app do Waze com rotas otimizadas e trânsito da cidade.
                  </p>
                </div>
              );
            })()}

            {/* Uber Card */}
            {(() => {
              const uberApp = directions?.apps?.find(a => a.app === 'Uber') || { app: 'Uber', clicks: 0, percentage: 0 };
              return (
                <div className="bg-linear-to-b from-slate-100/60 to-white p-5 rounded-2xl border border-slate-300/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <Car className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-[#1F1916]">Uber</h4>
                        <span className="text-[10px] text-slate-700 font-medium">Corrida Particular</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-800 bg-slate-200 px-2 py-0.5 rounded-md">
                      {uberApp.percentage}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-3xl font-serif font-bold text-[#1F1916] block">{uberApp.clicks}</span>
                    <span className="text-xs text-[#66534B] block">cliques para pedir viagem</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-slate-900 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, uberApp.percentage * 1.5)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#5C4B44] pt-1">
                    Chamada automática de corrida com destino fixado na porta da clínica em São Paulo.
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Dica de Hot Lead & Qualificação */}
          <div className="bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-200/90 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div className="text-xs space-y-1">
              <span className="font-bold text-amber-950 block text-sm">
                Ação de Altíssimo Valor: Classificação Automática de Hot Lead
              </span>
              <p className="text-amber-900 leading-relaxed">
                Pacientes que clicam para traçar rota no Waze, Maps ou pedir Uber já decidiram comparecer presencialmente. 
                O sistema pontua essas pessoas com <strong>+35 pontos</strong> no cálculo de Hot Lead e notifica a equipe do CRM quando o contato é gerado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Navegação por Visitante & Tempo */}
      {activeSubTab === 'sessoes' && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5DAD0]/80 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Comportamento Individual
                </span>
                <span className="text-xs text-[#8C7359] font-medium">• Rastreamento de Sessões</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F1916] mt-1.5">
                Navegação por Visitante, Tempo & Cliques
              </h3>
              <p className="text-xs text-[#66534B] mt-1 max-w-2xl">
                Veja detalhadamente o que cada visitante fez no site: por qual canal entrou, quais páginas navegou, quanto tempo ficou em cada tela e onde clicou.
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSessionFilter('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sessionFilter === 'todos'
                    ? 'bg-[#44342E] text-white shadow-xs'
                    : 'bg-[#FAF6F0] text-[#66534B] hover:bg-[#EFE6DC] border border-[#E5DAD0]'
                }`}
              >
                Todos ({data?.visitorSessions?.length || 0})
              </button>
              <button
                onClick={() => setSessionFilter('leads')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sessionFilter === 'leads'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Leads Identificados ({data?.visitorSessions?.filter(s => s.isLead).length || 0})</span>
              </button>
              <button
                onClick={() => setSessionFilter('hot')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sessionFilter === 'hot'
                    ? 'bg-linear-to-r from-amber-500 to-orange-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Hot Leads ({data?.visitorSessions?.filter(s => s.isHotLead).length || 0})</span>
              </button>
              <button
                onClick={() => setSessionFilter('direcoes')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sessionFilter === 'direcoes'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                <Navigation className="w-3 h-3" />
                <span>Traçou Rota ({data?.visitorSessions?.filter(s => s.actions.some(a => (a.label || '').toLowerCase().match(/maps|waze|uber/))).length || 0})</span>
              </button>
              <button
                onClick={() => setSessionFilter('whatsapp')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sessionFilter === 'whatsapp'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span>WhatsApp ({data?.visitorSessions?.filter(s => s.actions.some(a => (a.label || '').toLowerCase().match(/whatsapp|wa\.me/))).length || 0})</span>
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C7359] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar visitante por nome do lead, telefone, cidade, bairro, canal ou ação..."
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF6F0] border border-[#E5DAD0] rounded-xl text-[#1F1916] placeholder-[#8C7359] focus:outline-hidden focus:border-[#44342E]"
            />
          </div>

          {/* Visitor Sessions List */}
          <div className="space-y-3">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session, sIdx) => {
                const isExpanded = expandedSessionId === session.sessionId;
                return (
                  <div 
                    key={session.sessionId || sIdx}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      session.isLead
                        ? 'bg-linear-to-r from-emerald-50/50 via-white to-emerald-50/20 border-emerald-300 shadow-xs ring-1 ring-emerald-200'
                        : session.isHotLead 
                        ? 'bg-linear-to-r from-amber-50/40 via-white to-amber-50/20 border-amber-300 shadow-xs' 
                        : 'bg-[#FAF6F0]/60 border-[#E5DAD0] hover:border-[#8C7359]/60'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          session.isLead 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : session.isHotLead 
                            ? 'bg-amber-500 text-white shadow-xs' 
                            : 'bg-[#EFE6DC] text-[#44342E]'
                        }`}>
                          {session.isLead ? <CheckCircle2 className="w-5 h-5" /> : session.isHotLead ? <Flame className="w-5 h-5 fill-current animate-pulse" /> : <Users className="w-4 h-4" />}
                        </div>
                        <div>
                          {session.leadName ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-serif text-sm sm:text-base font-bold text-[#1F1916]">
                                  {session.leadName}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Lead Cadastrado ({session.leadStatus === 'agendado' ? 'Agendado' : session.leadStatus === 'convertido' ? 'Convertido' : session.leadStatus === 'em_contato' ? 'Em Contato' : 'Novo'})
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E5DAD0] text-[#5C4B44]">
                                  {session.trafficChannel}
                                </span>
                                {session.city && session.city !== 'Não informada' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-[#8C7359] bg-white px-2 py-0.5 rounded-md border border-[#E5DAD0]">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {session.neighborhood && session.neighborhood !== 'Não informada' ? `${session.neighborhood}, ` : ''}{session.city}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
                                {session.leadPhone && (
                                  <a
                                    href={`https://wa.me/55${session.leadPhone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                                    title="Conversar no WhatsApp"
                                  >
                                    <Phone className="w-3 h-3 text-emerald-600" />
                                    <span>{session.leadPhone}</span>
                                  </a>
                                )}
                                {session.leadServiceInterest && (
                                  <span className="text-[10px] font-medium text-[#66534B] bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#E5DAD0]">
                                    Interesse: {session.leadServiceInterest}
                                  </span>
                                )}
                                <span className="text-[10px] text-[#8C7359] font-mono">
                                  Visitante: #{session.visitorId?.slice(-6)} • Sessão: {session.sessionId?.slice(-8)} • {new Date(session.lastSeen).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-[#1F1916]">
                                  Visitante #{session.visitorId?.slice(-6) || String(sIdx + 1)}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E5DAD0] text-[#5C4B44]">
                                  {session.trafficChannel}
                                </span>
                                {session.city && session.city !== 'Não informada' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-[#8C7359] bg-white px-2 py-0.5 rounded-md border border-[#E5DAD0]">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {session.neighborhood && session.neighborhood !== 'Não informada' ? `${session.neighborhood}, ` : ''}{session.city}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#8C7359] block mt-0.5 font-mono">
                                Sessão: {session.sessionId?.slice(-8)} • {new Date(session.lastSeen).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Score & Expand Button */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {session.isHotLead ? (
                          <span className="inline-flex items-center gap-1 bg-linear-to-r from-amber-500 to-orange-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            <span>🔥 Hot Lead ({session.hotScore} pts)</span>
                          </span>
                        ) : session.hotScore >= 25 ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            <span>Interesse Ativo ({session.hotScore} pts)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#8C7359] bg-white px-2 py-0.5 rounded-full border border-[#E5DAD0]">
                            Score: {session.hotScore} pts
                          </span>
                        )}

                        <button
                          onClick={() => setExpandedSessionId(isExpanded ? null : session.sessionId)}
                          className="p-1.5 rounded-xl bg-white hover:bg-[#EFE6DC] border border-[#E5DAD0] text-[#5C4B44] transition-colors cursor-pointer"
                          title={isExpanded ? 'Recolher detalhes' : 'Ver jornada detalhada'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Summary row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-[#E5DAD0]/60 text-xs">
                      <div>
                        <span className="text-[#8C7359] text-[10px] block">Tempo no Site</span>
                        <span className="font-bold text-[#1F1916]">
                          {session.totalDurationSeconds >= 60 
                            ? `${Math.floor(session.totalDurationSeconds / 60)}m ${session.totalDurationSeconds % 60}s`
                            : `${session.totalDurationSeconds || 0}s`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8C7359] text-[10px] block">Páginas Navegadas</span>
                        <span className="font-bold text-[#1F1916]">{session.totalPageViews} telas</span>
                      </div>
                      <div>
                        <span className="text-[#8C7359] text-[10px] block">Ações Efetuadas</span>
                        <span className="font-bold text-[#1F1916]">{session.actions.length} cliques</span>
                      </div>
                      <div>
                        <span className="text-[#8C7359] text-[10px] block">Origem / Canal</span>
                        <span className="font-bold text-[#1F1916] truncate block">{session.trafficSource || session.trafficChannel}</span>
                      </div>
                    </div>

                    {/* Expanded Journey Timeline */}
                    {isExpanded && (
                      <div className="pt-4 mt-3 border-t border-[#E5DAD0] space-y-3 animate-in fade-in duration-150">
                        {/* Steps Timeline */}
                        {session.steps && session.steps.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#44342E] block">
                              Trilha de Navegação (Páginas & Tempo de Atenção):
                            </span>
                            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-[#E5DAD0]">
                              {session.steps.map((st, stIdx) => (
                                <div key={stIdx} className="flex items-center justify-between text-xs py-1 border-b border-[#FAF6F0] last:border-0">
                                  <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-[#FAF6F0] text-[#8C7359] font-bold text-[9px] flex items-center justify-center border border-[#E5DAD0]">
                                      {stIdx + 1}
                                    </span>
                                    <span className="font-semibold text-[#1F1916]">{st.title || st.path}</span>
                                    <span className="font-mono text-[10px] text-[#8C7359]">({st.path})</span>
                                  </div>
                                  <span className="font-bold font-mono text-[11px] text-[#44342E] bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#E5DAD0]">
                                    {st.durationSeconds >= 60 
                                      ? `${Math.floor(st.durationSeconds / 60)}m ${st.durationSeconds % 60}s`
                                      : `${st.durationSeconds || 1}s`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions clicked */}
                        {session.actions && session.actions.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#44342E] block">
                              Cliques e Ações Realizadas:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {session.actions.map((act, actIdx) => {
                                const isDir = (act.label || '').toLowerCase().match(/maps|waze|uber/);
                                const isWpp = (act.label || '').toLowerCase().match(/whatsapp|wa\.me/);
                                return (
                                  <span 
                                    key={actIdx}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                      isDir 
                                        ? 'bg-blue-50 text-blue-900 border-blue-200' 
                                        : isWpp 
                                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                                        : 'bg-white text-[#44342E] border-[#E5DAD0]'
                                    }`}
                                  >
                                    {isDir && <Navigation className="w-3 h-3 text-blue-600" />}
                                    {isWpp && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                    <span>{act.label}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#66534B] bg-[#FAF6F0] rounded-2xl border border-[#E5DAD0]">
                Nenhuma sessão encontrada para os filtros selecionados.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Rotas Detalhadas (Páginas do Site: URLs) */}
      {activeSubTab === 'rotas' && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DAD0] shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#8C7359]">
                Navegação no Site (URLs)
              </span>
              <button
                onClick={() => setActiveSubTab('direcoes')}
                className="text-xs font-bold text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Ver rotas físicas (Maps/Waze/Uber) →</span>
              </button>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1F1916] mt-1">
              Páginas do Site & Fluxo de Telas (URLs Navegadas)
            </h3>
            <p className="text-xs text-[#66534B] mt-1">
              Relatório de navegação pelas páginas do site (Home, Tratamentos, Tecnologias, Contato). Para aplicativos de deslocamento até a clínica física, consulte a aba <strong>Rotas p/ Clínica</strong>.
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
                    {typeof t.leadsGenerated === 'number' ? `${t.leadsGenerated} pacientes` : t.leadsGenerated}
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
            {topLocations.length > 0 ? (
              topLocations.map((loc) => (
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
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-[#66534B] bg-[#FAF6F0] rounded-2xl border border-[#E5DAD0]">
                Sem dados de geolocalização capturados (Rótulo: Não informada).
              </div>
            )}
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
