import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  RefreshCw, 
  LogOut, 
  Phone, 
  Mail, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Filter, 
  Calendar, 
  Lock, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  MapPin,
  BarChart3,
  Navigation,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { trackMetaEvent } from '../utils/metaConversions';
import { InternalAnalyticsDashboard } from '../components/admin/InternalAnalyticsDashboard';
import { LeadsGeoMap } from '../components/admin/LeadsGeoMap';

export interface StoredLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceInterest: string;
  ctaLocation: string;
  message: string;
  trafficChannel: string;
  trafficSource: string;
  trafficMedium: string;
  trafficCampaign: string;
  trafficTerm?: string;
  trafficContent?: string;
  fbclid?: string;
  gclid?: string;
  referrer?: string;
  pagePath: string;
  clientIp?: string;
  status: 'novo' | 'em_contato' | 'agendado' | 'compareceu' | 'convertido' | 'perdido' | string;
  notes?: string;
  metaLeadSent?: boolean;
  metaLeadSentAt?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  viewedTreatments?: string[];
  createdAt: string;
  updatedAt: string;
}

export const AdminCRMPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedLead, setSelectedLead] = useState<StoredLead | null>(null);
  const [metaNotification, setMetaNotification] = useState<{
    show: boolean;
    leadName: string;
    statusLabel: string;
    eventId?: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'crm' | 'analytics' | 'mapa'>('crm');
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importSyncAds, setImportSyncAds] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  // Check saved session on mount
  useEffect(() => {
    const token = localStorage.getItem('nido_admin_token') || sessionStorage.getItem('nido_admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch leads when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('nido_admin_token', data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'Senha incorreta.');
      }
    } catch {
      // Offline / dev fallback
      if (password === 'nidoadmin2026') {
        const fallbackToken = 'nido_admin_local_session';
        localStorage.setItem('nido_admin_token', fallbackToken);
        setIsAuthenticated(true);
      } else {
        setLoginError('Senha incorreta.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nido_admin_token');
    sessionStorage.removeItem('nido_admin_token');
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    const isQualifyingLead = newStatus === 'agendado' || newStatus === 'compareceu' || newStatus === 'convertido';
    let metaEventId = '';

    // Disparar evento para o Meta de LEAD quando for marcado como Avaliação Agendada, Compareceu ou Convertido
    if (targetLead && isQualifyingLead) {
      const statusLabel = 
        newStatus === 'agendado' ? 'Avaliação Agendada' : 
        newStatus === 'compareceu' ? 'Compareceu à Avaliação' : 'Convertido';
      try {
        const nameParts = (targetLead.name || '').trim().split(/\s+/);
        const firstName = nameParts[0] || targetLead.name;
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

        metaEventId = await trackMetaEvent('Lead', {
          userData: {
            em: targetLead.email,
            ph: targetLead.phone,
            fn: firstName,
            ...(lastName ? { ln: lastName } : {}),
            ct: targetLead.city || 'sao paulo',
            st: targetLead.state || 'sp',
            country: 'br'
          },
          customData: {
            content_name: targetLead.serviceInterest || 'Avaliação Estética',
            content_category: 'Lead Qualificado CRM',
            lead_status: newStatus,
            lead_status_label: statusLabel,
            traffic_channel: targetLead.trafficChannel || 'Direto',
            currency: 'BRL',
            value: newStatus === 'convertido' ? 500 : 0
          }
        });

        setMetaNotification({
          show: true,
          leadName: targetLead.name,
          statusLabel,
          eventId: metaEventId
        });

        setTimeout(() => {
          setMetaNotification(null);
        }, 7000);
      } catch (err) {
        console.error('[Meta Lead Trigger Error]', err);
      }
    }

    try {
      const updatePayload: { status: string; metaLeadSent?: boolean; metaLeadSentAt?: string } = {
        status: newStatus
      };

      if (isQualifyingLead) {
        updatePayload.metaLeadSent = true;
        updatePayload.metaLeadSentAt = new Date().toISOString();
      }

      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? data.lead : l))
        );
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(data.lead);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleSimulateLead = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/leads/simulate', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads((prev) => [data.lead, ...prev]);
        setSelectedLead(data.lead);
      }
    } catch (err) {
      console.error('Error simulating lead:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDeleteLead = (leadId: string) => {
    setLeadToDelete(leadId);
  };

  const confirmDeleteLead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(null);
        }
        setActionFeedback('Lead excluído com sucesso.');
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    } finally {
      setLeadToDelete(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      setActionFeedback('Não há contatos para exportar.');
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }

    const headers = [
      'Data e Hora',
      'Nome',
      'WhatsApp',
      'E-mail',
      'Interesse / Procedimento',
      'Local do Clique (CTA)',
      'Canal de Tráfego',
      'Origem (utm_source)',
      'Mídia (utm_medium)',
      'Campanha (utm_campaign)',
      'Termo',
      'Conteúdo',
      'Meta Click ID (fbclid)',
      'Google Click ID (gclid)',
      'Referrer',
      'Página do Lead',
      'Status',
      'Mensagem'
    ];

    const rows = leads.map((l) => [
      `"${new Date(l.createdAt).toLocaleString('pt-BR')}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${(l.serviceInterest || '').replace(/"/g, '""')}"`,
      `"${(l.ctaLocation || '').replace(/"/g, '""')}"`,
      `"${l.trafficChannel || 'Direto'}"`,
      `"${l.trafficSource || ''}"`,
      `"${l.trafficMedium || ''}"`,
      `"${l.trafficCampaign || ''}"`,
      `"${l.trafficTerm || ''}"`,
      `"${l.trafficContent || ''}"`,
      `"${l.fbclid || ''}"`,
      `"${l.gclid || ''}"`,
      `"${(l.referrer || '').replace(/"/g, '""')}"`,
      `"${l.pagePath || ''}"`,
      `"${l.status || 'novo'}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_nido_crm_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process and parse CSV / pasted text from Kommo
  const handleBatchImport = async () => {
    if (!importCsvText.trim()) {
      setActionFeedback('Cole o conteúdo CSV ou texto dos leads do Kommo.');
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }

    setIsImporting(true);
    try {
      const lines = importCsvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) {
        setIsImporting(false);
        return;
      }

      // Detect separator (comma, semicolon or tab)
      const firstLine = lines[0];
      const sep = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';
      
      const parsedLeads: Array<{
        name: string;
        phone: string;
        email: string;
        status: string;
        serviceInterest?: string;
      }> = [];

      // Check if line 0 is a header
      const lowerFirst = firstLine.toLowerCase();
      const hasHeader = lowerFirst.includes('nome') || lowerFirst.includes('name') || lowerFirst.includes('telefone') || lowerFirst.includes('phone') || lowerFirst.includes('contato');
      const startIdx = hasHeader ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const row = lines[i].split(sep).map((col) => col.trim().replace(/^["']|["']$/g, ''));
        if (row.length === 0 || !row[0]) continue;

        // Smart field detection or standard format (Nome, Telefone, Email, Status, Procedimento)
        const name = row[0] || '';
        const phone = row[1] || '';
        const email = row[2] || '';
        const status = row[3] || 'agendado';
        const serviceInterest = row[4] || 'Avaliação Estética Individualizada';

        if (name || phone || email) {
          parsedLeads.push({
            name,
            phone,
            email,
            status,
            serviceInterest
          });
        }
      }

      if (parsedLeads.length === 0) {
        setActionFeedback('Nenhum contato legível foi identificado.');
        setTimeout(() => setActionFeedback(null), 3000);
        setIsImporting(false);
        return;
      }

      // Dispatch to batch import backend
      const res = await fetch('/api/leads/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: parsedLeads,
          syncToAds: importSyncAds
        })
      });

      const data = await res.json();
      if (data.success) {
        setActionFeedback(data.message || 'Importação realizada com sucesso!');
        setTimeout(() => setActionFeedback(null), 4000);
        setShowImportModal(false);
        setImportCsvText('');
        await fetchLeads();
      } else {
        setActionFeedback(data.error || 'Erro na importação.');
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch (err) {
      console.error('Import error:', err);
      setActionFeedback('Falha ao processar arquivo.');
      setTimeout(() => setActionFeedback(null), 3000);
    } finally {
      setIsImporting(false);
    }
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        !searchTerm ||
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone?.includes(searchTerm) ||
        l.serviceInterest?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesChannel =
        channelFilter === 'todos' ||
        l.trafficChannel?.toLowerCase() === channelFilter.toLowerCase() ||
        (channelFilter === 'Instagram' && l.trafficChannel?.toLowerCase().includes('instagram')) ||
        (channelFilter === 'Facebook' && l.trafficChannel?.toLowerCase().includes('facebook')) ||
        (channelFilter === 'ChatGPT / IA' && (l.trafficChannel === 'ChatGPT / IA' || l.trafficChannel?.toLowerCase().includes('chatgpt')));

      const matchesStatus =
        statusFilter === 'todos' ||
        l.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [leads, searchTerm, channelFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = leads.length;
    const today = new Date().toDateString();
    const leadsToday = leads.filter(
      (l) => new Date(l.createdAt).toDateString() === today
    ).length;
    const googleAdsLeads = leads.filter((l) => l.trafficChannel === 'Google Ads').length;
    const googleOrganicLeads = leads.filter((l) => l.trafficChannel === 'Google Orgânico').length;
    const metaAdsLeads = leads.filter((l) => l.trafficChannel === 'Meta Ads').length;
    const instagramLeads = leads.filter((l) => l.trafficChannel === 'Instagram' || l.trafficChannel === 'Instagram Orgânico').length;
    const facebookLeads = leads.filter((l) => l.trafficChannel === 'Facebook' || l.trafficChannel === 'Facebook Orgânico').length;
    const chatgptLeads = leads.filter((l) => l.trafficChannel === 'ChatGPT / IA').length;
    const directLeads = leads.filter((l) => l.trafficChannel === 'Direto').length;
    const newLeads = leads.filter((l) => l.status === 'novo').length;

    return { 
      total, 
      leadsToday, 
      googleAdsLeads, 
      googleOrganicLeads, 
      metaAdsLeads, 
      instagramLeads,
      facebookLeads,
      chatgptLeads,
      directLeads,
      newLeads 
    };
  }, [leads]);

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5EFE7] flex items-center justify-center p-4">
        <SEOHead
          title="Acesso Administrativo CRM | Clínica Nidô"
          description="Acesso restrito ao painel de controle e CRM de contatos da Clínica Nidô."
          canonicalPath="/#admin"
          noIndex={true}
        />
        <div className="w-full max-w-md bg-[#FFFFFF] rounded-3xl p-8 shadow-xl border border-[#E5DAD0] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#44342E] text-[#F5EFE7] mx-auto flex items-center justify-center shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#1F1916]">
              Clínica Nidô • CRM
            </h1>
            <p className="text-xs text-[#5C4B44]">
              Painel de Controle e Gestão de Contatos da Recepção
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1916] mb-1.5">
                Senha de Acesso
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Digite a senha administrativa"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E5DAD0] text-sm text-[#1F1916] focus:outline-none focus:border-[#44342E] transition-colors font-medium shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#44342E] hover:bg-[#5A453D] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoggingIn ? 'Verificando...' : 'Entrar no CRM'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Helper for origin badge styling
  const renderChannelBadge = (channel: string) => {
    switch (channel) {
      case 'Google Ads':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B06000]" />
            Google Ads
          </span>
        );
      case 'Google Orgânico':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#137333]" />
            Google Orgânico
          </span>
        );
      case 'Meta Ads':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F0FE] text-[#1967D2] border border-[#C2D7FA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1967D2]" />
            Meta Ads
          </span>
        );
      case 'Instagram':
      case 'Instagram Orgânico':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E1306C]" />
            Instagram
          </span>
        );
      case 'Facebook':
      case 'Facebook Orgânico':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E8EAF6] text-[#283593] border border-[#C5CAE9]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2]" />
            Facebook
          </span>
        );
      case 'ChatGPT / IA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E0F2F1] text-[#00695C] border border-[#B2DFDB]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10A37F]" />
            ChatGPT / IA
          </span>
        );
      case 'TikTok':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F5F5F5] text-[#212121] border border-[#E0E0E0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#000000]" />
            TikTok
          </span>
        );
      case 'WhatsApp':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E8F8F0] text-[#0F6F44] border border-[#C3ECD6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
            WhatsApp
          </span>
        );
      case 'Direto':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EFE6DC] text-[#44342E] border border-[#E5DAD0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C7359]" />
            Direto
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F1F3F4] text-[#5F6368] border border-[#DADCE0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5F6368]" />
            {channel || 'Outro'}
          </span>
        );
    }
  };

  // Helper for status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'novo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'em_contato':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'agendado':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'compareceu':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'convertido':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'perdido':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 bg-[#F5EFE7] min-h-screen">
      <SEOHead
        title="CRM & Gestão de Contatos | Painel Administrativo Nidô"
        description="Painel de controle interno e CRM de contatos da Clínica Nidô."
        canonicalPath="/#admin"
        noIndex={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DAD0] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#8C7359]">
                Painel Administrativo
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-800">
                Online
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#1F1916]">
              CRM de Contatos & Leads
            </h1>
            <p className="text-xs text-[#66534B] mt-0.5">
              Gestão de contatos, monitoramento de navegação no site e geolocalização dos pacientes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">

            <button
              onClick={fetchLeads}
              disabled={isLoading}
              title="Recarregar lista"
              className="inline-flex items-center gap-1.5 bg-[#FAF6F0] hover:bg-[#EFE6DC] text-[#44342E] px-3.5 py-2.5 rounded-xl border border-[#E5DAD0] text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#8C7359] hover:bg-[#735D46] text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar do Kommo</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 bg-[#44342E] hover:bg-[#5A453D] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>

            <button
              onClick={handleLogout}
              title="Sair do painel"
              className="inline-flex items-center gap-1.5 bg-[#F7F2EB] hover:bg-red-50 hover:text-red-700 text-[#66534B] p-2.5 rounded-xl border border-[#E5DAD0] transition-colors cursor-pointer ml-auto sm:ml-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Main Admin Navigation Tabs (CRM, Analytics Interno, Mapa de Leads) */}
        <div className="bg-[#FFFFFF] p-2 rounded-2xl border border-[#E5DAD0] shadow-xs flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveAdminTab('crm')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'crm'
                ? 'bg-[#44342E] text-white shadow-xs'
                : 'text-[#66534B] hover:bg-[#FAF6F0]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>CRM de Leads ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('analytics')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'analytics'
                ? 'bg-[#44342E] text-white shadow-xs'
                : 'text-[#66534B] hover:bg-[#FAF6F0]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Monitoramento & Analytics Interno</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">Novo</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('mapa')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'mapa'
                ? 'bg-[#44342E] text-white shadow-xs'
                : 'text-[#66534B] hover:bg-[#FAF6F0]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Mapa Geográfico de Leads</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-extrabold">Qualificados & Perdidos</span>
          </button>
        </div>

        {/* Meta Ads Lead Conversion Event Toast Banner */}
        {metaNotification && (
          <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white p-4 sm:p-5 rounded-2xl border border-blue-400/40 shadow-lg flex items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-blue-300">
                    Meta Ads • Evento "Lead" Disparado com Sucesso!
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Pixel + CAPI Ativos
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-blue-100 mt-0.5">
                  O lead <strong className="text-white font-bold">{metaNotification.leadName}</strong> foi marcado como <strong className="text-white font-bold">{metaNotification.statusLabel}</strong>. O evento de conversão foi enviado para o Meta Pixel e para a API de Conversões da Meta (Pixel ID: 1002877629496230).
                </p>
                {metaNotification.eventId && (
                  <p className="text-[11px] font-mono text-blue-300 mt-0.5">
                    Deduplication Event ID: {metaNotification.eventId}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setMetaNotification(null)}
              className="text-blue-300 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* View Switcher based on activeAdminTab */}
        {activeAdminTab === 'analytics' && <InternalAnalyticsDashboard />}
        {activeAdminTab === 'mapa' && <LeadsGeoMap leads={leads} onSelectLead={(lead) => setSelectedLead(lead)} />}

        {activeAdminTab === 'crm' && (
          <>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5DAD0] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#8C7359]">Total Leads</span>
              <Users className="w-4 h-4 text-[#8C7359]" />
            </div>
            <p className="text-2xl font-serif font-bold text-[#1F1916] mt-2">
              {stats.total}
            </p>
            <span className="text-[11px] text-[#66534B]">Acumulado</span>
          </div>

          <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5DAD0] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#8C7359]">Hoje</span>
              <Calendar className="w-4 h-4 text-[#8C7359]" />
            </div>
            <p className="text-2xl font-serif font-bold text-[#1F1916] mt-2">
              {stats.leadsToday}
            </p>
            <span className="text-[11px] text-green-700 font-medium">Contatos no dia</span>
          </div>

          {/* Google ADS - Separado */}
          <div 
            onClick={() => setChannelFilter(channelFilter === 'Google Ads' ? 'todos' : 'Google Ads')}
            className={`bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              channelFilter === 'Google Ads' ? 'border-[#B06000] ring-2 ring-[#B06000]/20 shadow-sm' : 'border-[#E5DAD0] hover:border-[#B06000]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#B06000]">Google ADS</span>
              <TrendingUp className="w-4 h-4 text-[#B06000]" />
            </div>
            <p className="text-2xl font-serif font-bold text-[#B06000] mt-2">
              {stats.googleAdsLeads}
            </p>
            <span className="text-[11px] text-[#66534B]">Tráfego Pago</span>
          </div>

          {/* Google Orgânico - Separado */}
          <div 
            onClick={() => setChannelFilter(channelFilter === 'Google Orgânico' ? 'todos' : 'Google Orgânico')}
            className={`bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              channelFilter === 'Google Orgânico' ? 'border-[#137333] ring-2 ring-[#137333]/20 shadow-sm' : 'border-[#E5DAD0] hover:border-[#137333]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#137333]">Google Orgânico</span>
              <Search className="w-4 h-4 text-[#137333]" />
            </div>
            <p className="text-2xl font-serif font-bold text-[#137333] mt-2">
              {stats.googleOrganicLeads}
            </p>
            <span className="text-[11px] text-[#66534B]">Busca Natural</span>
          </div>

          {/* Meta Ads */}
          <div 
            onClick={() => setChannelFilter(channelFilter === 'Meta Ads' ? 'todos' : 'Meta Ads')}
            className={`bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              channelFilter === 'Meta Ads' ? 'border-[#1967D2] ring-2 ring-[#1967D2]/20 shadow-sm' : 'border-[#E5DAD0] hover:border-[#1967D2]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#1967D2]">Meta Ads</span>
              <ArrowUpRight className="w-4 h-4 text-[#1967D2]" />
            </div>
            <p className="text-2xl font-serif font-bold text-[#1967D2] mt-2">
              {stats.metaAdsLeads}
            </p>
            <span className="text-[11px] text-[#66534B]">Face & Insta Ads</span>
          </div>

          {/* Novos Leads */}
          <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5DAD0] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-blue-700">Novos</span>
              <Clock className="w-4 h-4 text-blue-700" />
            </div>
            <p className="text-2xl font-serif font-bold text-blue-700 mt-2">
              {stats.newLeads}
            </p>
            <span className="text-[11px] text-[#66534B]">Aguardando retorno</span>
          </div>
        </div>

        {/* Quick Channels Strip (Instagram, Facebook, ChatGPT, TikTok, WhatsApp, Direto) */}
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5DAD0] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#44342E] uppercase tracking-wider text-[11px]">
              Origens de Tráfego Rastreadas
            </span>
            <span className="text-[11px] text-[#8C7359]">
              Clique para filtrar rapidamente
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setChannelFilter('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                channelFilter === 'todos'
                  ? 'bg-[#44342E] text-white shadow-xs'
                  : 'bg-[#FAF6F0] text-[#66534B] hover:bg-[#EFE6DC] border border-[#E5DAD0]'
              }`}
            >
              Todos ({stats.total})
            </button>

            <button
              onClick={() => setChannelFilter('Google Ads')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                channelFilter === 'Google Ads'
                  ? 'bg-[#FEF7E0] text-[#B06000] border-2 border-[#B06000] font-bold'
                  : 'bg-[#FAF6F0] text-[#B06000] hover:bg-[#FEF7E0] border border-[#FEEFC3]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#B06000]" />
              Google ADS ({stats.googleAdsLeads})
            </button>

            <button
              onClick={() => setChannelFilter('Google Orgânico')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                channelFilter === 'Google Orgânico'
                  ? 'bg-[#E6F4EA] text-[#137333] border-2 border-[#137333] font-bold'
                  : 'bg-[#FAF6F0] text-[#137333] hover:bg-[#E6F4EA] border border-[#CEEAD6]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#137333]" />
              Google Orgânico ({stats.googleOrganicLeads})
            </button>

            <button
              onClick={() => setChannelFilter('Meta Ads')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                channelFilter === 'Meta Ads'
                  ? 'bg-[#E8F0FE] text-[#1967D2] border-2 border-[#1967D2] font-bold'
                  : 'bg-[#FAF6F0] text-[#1967D2] hover:bg-[#E8F0FE] border border-[#C2D7FA]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#1967D2]" />
              Meta Ads ({stats.metaAdsLeads})
            </button>

            <button
              onClick={() => setChannelFilter('Instagram')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                channelFilter === 'Instagram'
                  ? 'bg-[#FCE8E6] text-[#C5221F] border-2 border-[#C5221F] font-bold'
                  : 'bg-[#FAF6F0] text-[#C5221F] hover:bg-[#FCE8E6] border border-[#FAD2CF]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#E1306C]" />
              Instagram ({stats.instagramLeads})
            </button>

            <button
              onClick={() => setChannelFilter('Facebook')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                channelFilter === 'Facebook'
                  ? 'bg-[#E8EAF6] text-[#283593] border-2 border-[#283593] font-bold'
                  : 'bg-[#FAF6F0] text-[#283593] hover:bg-[#E8EAF6] border border-[#C5CAE9]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
              Facebook ({stats.facebookLeads})
            </button>

            <button
              onClick={() => setChannelFilter('ChatGPT / IA')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                channelFilter === 'ChatGPT / IA'
                  ? 'bg-[#E0F2F1] text-[#00695C] border-2 border-[#00695C] font-bold'
                  : 'bg-[#FAF6F0] text-[#00695C] hover:bg-[#E0F2F1] border border-[#B2DFDB]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10A37F]" />
              ChatGPT / IAs ({stats.chatgptLeads})
            </button>

            <button
              onClick={() => setChannelFilter('Direto')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                channelFilter === 'Direto'
                  ? 'bg-[#EFE6DC] text-[#44342E] border-2 border-[#44342E] font-bold'
                  : 'bg-[#FAF6F0] text-[#44342E] hover:bg-[#EFE6DC] border border-[#E5DAD0]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#8C7359]" />
              Direto ({stats.directLeads})
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5DAD0] shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C7359] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone, e-mail ou tratamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E5DAD0] text-xs sm:text-sm text-[#1F1916] focus:outline-none focus:border-[#44342E]"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-3 py-2 rounded-xl border border-[#E5DAD0] text-xs">
              <Filter className="w-3.5 h-3.5 text-[#8C7359]" />
              <span className="text-[#66534B] font-medium">Origem:</span>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-transparent font-bold text-[#1F1916] focus:outline-none cursor-pointer"
              >
                <option value="todos">Todas as Origens ({stats.total})</option>
                <option value="Google Ads">Google ADS ({stats.googleAdsLeads})</option>
                <option value="Google Orgânico">Google Orgânico ({stats.googleOrganicLeads})</option>
                <option value="Meta Ads">Meta Ads ({stats.metaAdsLeads})</option>
                <option value="Instagram">Instagram ({stats.instagramLeads})</option>
                <option value="Facebook">Facebook ({stats.facebookLeads})</option>
                <option value="ChatGPT / IA">ChatGPT / IA ({stats.chatgptLeads})</option>
                <option value="Direto">Direto ({stats.directLeads})</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-3 py-2 rounded-xl border border-[#E5DAD0] text-xs">
              <span className="text-[#66534B] font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-bold text-[#1F1916] focus:outline-none cursor-pointer"
              >
                <option value="todos">Todos os Status</option>
                <option value="novo">Novo</option>
                <option value="em_contato">Em Contato</option>
                <option value="agendado">Avaliação Agendada</option>
                <option value="compareceu">Compareceu à Avaliação</option>
                <option value="convertido">Convertido</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#E5DAD0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF6F0] border-b border-[#E5DAD0] text-[#5C4B44] text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-4 px-4 sm:px-6">Data / Hora</th>
                  <th className="py-4 px-4 sm:px-6">Paciente / Lead</th>
                  <th className="py-4 px-4 sm:px-6">WhatsApp</th>
                  <th className="py-4 px-4 sm:px-6">Interesse / Origem Botão</th>
                  <th className="py-4 px-4 sm:px-6">Origem Tráfego</th>
                  <th className="py-4 px-4 sm:px-6">Status</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DAD0]/70 text-[#1F1916]">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#66534B]">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#8C7359]" />
                          <span>Carregando contatos...</span>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-sm">Nenhum lead encontrado com os filtros atuais.</p>
                          <p className="text-xs mt-1 text-[#8C7359]">Os novos contatos que clicarem nos botões de atendimento aparecerão aqui automaticamente.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const phoneDigits = (lead.phone || '').replace(/\D/g, '');
                    const cleanPhone = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;
                    const whatsappDirectUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Olá ${lead.name}, tudo bem? Aqui é da Clínica Nidô. Recebemos seu contato com interesse em ${lead.serviceInterest}.`)}`;

                    return (
                      <tr key={lead.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                        {/* Data / Hora */}
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-xs text-[#66534B]">
                          <div>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</div>
                          <div className="font-mono text-[11px] text-[#8C7359]">
                            {new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* Nome & Email */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-[#1F1916]">{lead.name}</div>
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1 text-[11px] text-[#66534B] hover:text-[#44342E] transition-colors mt-0.5"
                          >
                            <Mail className="w-3 h-3 text-[#8C7359]" />
                            <span>{lead.email}</span>
                          </a>
                        </td>

                        {/* WhatsApp + Quick Action */}
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                          <div className="font-medium text-xs text-[#44342E]">{lead.phone}</div>
                          <a
                            href={whatsappDirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-[11px] mt-1 transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Conversar</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        </td>

                        {/* Interesse / CTA Location */}
                        <td className="py-4 px-4 sm:px-6">
                          <span className="font-semibold block text-xs text-[#1F1916]">
                            {lead.serviceInterest || 'Geral'}
                          </span>
                          <span className="text-[11px] text-[#8C7359] block mt-0.5 max-w-xs truncate" title={lead.ctaLocation}>
                            {lead.ctaLocation || 'Site'}
                          </span>
                        </td>

                        {/* Origem Tráfego */}
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                          <div>{renderChannelBadge(lead.trafficChannel)}</div>
                          {lead.trafficCampaign && lead.trafficCampaign !== 'padrao' && lead.trafficCampaign !== 'direto' && (
                            <div className="text-[10px] text-[#66534B] mt-1 font-mono truncate max-w-[140px]" title={`Campanha: ${lead.trafficCampaign}`}>
                              {lead.trafficCampaign}
                            </div>
                          )}
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                          <select
                            value={lead.status || 'novo'}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusBadgeClass(lead.status)}`}
                          >
                            <option value="novo">Novo</option>
                            <option value="em_contato">Em Contato</option>
                            <option value="agendado">Avaliação Agendada</option>
                            <option value="compareceu">Compareceu à Avaliação</option>
                            <option value="convertido">Convertido</option>
                            <option value="perdido">Perdido</option>
                          </select>
                        </td>

                        {/* Ações */}
                        <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              title="Ver detalhes completos do lead"
                              className="p-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#EFE6DC] text-[#44342E] transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              title="Excluir este lead"
                              className="p-1.5 rounded-lg bg-[#FAF6F0] hover:bg-red-50 hover:text-red-700 text-[#8C7359] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedLead(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E5DAD0] max-h-[90vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF6F0] hover:bg-[#E5DAD0] text-[#5C4B44] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-bold text-[#8C7359]">
                Ficha Detalhada do Contato & Localização
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1F1916]">
                {selectedLead.name}
              </h2>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {renderChannelBadge(selectedLead.trafficChannel)}
                <span className="text-xs text-[#66534B]">
                  Cadastrado em {new Date(selectedLead.createdAt).toLocaleString('pt-BR')}
                </span>
                {selectedLead.city && (
                  <span className="inline-flex items-center gap-1 text-xs text-[#8C7359] font-medium bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#E5DAD0]">
                    <MapPin className="w-3 h-3 text-[#8C7359]" />
                    {selectedLead.neighborhood || selectedLead.city}, {selectedLead.state || 'SP'}
                  </span>
                )}
              </div>
            </div>

            {/* Meta Ads CAPI Status Card */}
            {(selectedLead.metaLeadSent || selectedLead.status === 'agendado' || selectedLead.status === 'compareceu' || selectedLead.status === 'convertido') ? (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-blue-900 block">
                    Evento "Lead" Disparado com Sucesso para o Meta Ads
                  </span>
                  <p className="text-blue-800 mt-0.5">
                    Este contato foi qualificado no CRM. O evento Lead foi sincronizado com o Meta Pixel e com a API de Conversões da Meta (Pixel ID: 1002877629496230).
                  </p>
                  {selectedLead.metaLeadSentAt && (
                    <span className="text-[10px] font-mono text-blue-700 block mt-1">
                      Data de disparo: {new Date(selectedLead.metaLeadSentAt).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E5DAD0] text-xs text-[#66534B] flex items-center justify-between">
                <span>O evento de Lead será enviado à Meta assim que for marcado como <strong>Avaliação Agendada</strong> ou <strong>Convertido</strong>.</span>
              </div>
            )}

            {/* Contact details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF6F0] p-4 rounded-2xl border border-[#E5DAD0]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7359] block">WhatsApp</span>
                <span className="text-sm font-semibold text-[#1F1916]">{selectedLead.phone}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7359] block">E-mail</span>
                <span className="text-sm font-semibold text-[#1F1916]">{selectedLead.email}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7359] block">Interesse</span>
                <span className="text-sm font-semibold text-[#1F1916]">{selectedLead.serviceInterest}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7359] block">Botão de Origem (CTA)</span>
                <span className="text-sm font-semibold text-[#1F1916]">{selectedLead.ctaLocation}</span>
              </div>
            </div>

            {/* Localização Geográfica Atribuída */}
            {selectedLead.city && (
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E5DAD0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F1916] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#8C7359]" />
                    Localização Geográfica do Paciente:
                  </span>
                  <button
                    onClick={() => {
                      setActiveAdminTab('mapa');
                      setSelectedLead(null);
                    }}
                    className="text-xs font-bold text-[#8C7359] hover:text-[#44342E] underline cursor-pointer"
                  >
                    Ver no Mapa de Leads →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[#8C7359] block">Bairro:</span>
                    <span className="font-bold text-[#1F1916]">{selectedLead.neighborhood || 'Jardins'}</span>
                  </div>
                  <div>
                    <span className="text-[#8C7359] block">Cidade / UF:</span>
                    <span className="font-bold text-[#1F1916]">{selectedLead.city} - {selectedLead.state || 'SP'}</span>
                  </div>
                  <div>
                    <span className="text-[#8C7359] block">Coordenadas:</span>
                    <span className="font-mono text-[11px] text-[#66534B]">
                      {selectedLead.latitude?.toFixed(4)}, {selectedLead.longitude?.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tratamentos que o paciente navegou no site */}
            {selectedLead.viewedTreatments && selectedLead.viewedTreatments.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F1916] block">
                  Tratamentos que o Paciente Navegou no Site:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLead.viewedTreatments.map((tr) => (
                    <span key={tr} className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#E5DAD0] text-xs font-semibold text-[#44342E]">
                      {tr}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem enviada para o WhatsApp */}
            {selectedLead.message && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F1916] block">
                  Mensagem Personalizada Gerada:
                </span>
                <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E5DAD0] text-xs text-[#44342E] font-medium leading-relaxed">
                  "{selectedLead.message}"
                </div>
              </div>
            )}

            {/* Detalhes de Tráfego & Atribuição (Meta, Google, UTMs) */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F1916] block">
                Rastreamento & Parâmetros de Tráfego:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FAF6F0] p-4 rounded-2xl border border-[#E5DAD0]">
                <div>
                  <span className="text-[#8C7359] font-medium block">Canal:</span>
                  <span className="font-bold text-[#1F1916]">{selectedLead.trafficChannel}</span>
                </div>
                <div>
                  <span className="text-[#8C7359] font-medium block">Origem (utm_source):</span>
                  <span className="font-mono text-[#1F1916]">{selectedLead.trafficSource || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#8C7359] font-medium block">Mídia (utm_medium):</span>
                  <span className="font-mono text-[#1F1916]">{selectedLead.trafficMedium || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#8C7359] font-medium block">Campanha (utm_campaign):</span>
                  <span className="font-mono text-[#1F1916]">{selectedLead.trafficCampaign || 'N/A'}</span>
                </div>
                {selectedLead.fbclid && (
                  <div className="sm:col-span-2">
                    <span className="text-[#1967D2] font-medium block">Meta Click ID (fbclid):</span>
                    <span className="font-mono text-[11px] text-[#1967D2] break-all">{selectedLead.fbclid}</span>
                  </div>
                )}
                {selectedLead.gclid && (
                  <div className="sm:col-span-2">
                    <span className="text-[#B06000] font-medium block">Google Click ID (gclid):</span>
                    <span className="font-mono text-[11px] text-[#B06000] break-all">{selectedLead.gclid}</span>
                  </div>
                )}
                {selectedLead.referrer && (
                  <div className="sm:col-span-2">
                    <span className="text-[#8C7359] font-medium block">Referenciador (Referrer):</span>
                    <span className="font-mono text-[11px] text-[#44342E] break-all">{selectedLead.referrer}</span>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <span className="text-[#8C7359] font-medium block">Página onde converteu:</span>
                  <span className="font-mono text-[11px] text-[#44342E]">{selectedLead.pagePath}</span>
                </div>
              </div>
            </div>

            {/* Status change in modal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#E5DAD0]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-[#1F1916]">Status atual:</span>
                <select
                  value={selectedLead.status || 'novo'}
                  onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none ${getStatusBadgeClass(selectedLead.status)}`}
                >
                  <option value="novo">Novo</option>
                  <option value="em_contato">Em Contato</option>
                  <option value="agendado">Avaliação Agendada (Qualificado)</option>
                  <option value="compareceu">Compareceu à Avaliação (Qualificado)</option>
                  <option value="convertido">Convertido (Qualificado)</option>
                  <option value="perdido">Perdido</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE6DC] text-xs font-bold text-[#44342E] transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Importar Leads do Kommo / CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full space-y-5 shadow-2xl border border-[#E5DAD0] animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] border border-[#E5DAD0] flex items-center justify-center text-[#8C7359]">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1F1916]">Importar Leads do Kommo</h3>
                  <p className="text-xs text-[#5C4B44]">Sincronize contatos qualificados para calibrar Meta Ads e Google Ads</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF6F0] text-[#66534B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1F1916] block">
                Cole abaixo o CSV ou as linhas exportadas do Kommo:
              </label>
              <p className="text-[11px] text-[#66534B]">
                Formato aceito: <code className="bg-[#FAF6F0] px-1.5 py-0.5 rounded text-[#44342E] font-mono">Nome ; WhatsApp ; Email ; Status ; Procedimento</code>
              </p>
              <textarea
                value={importCsvText}
                onChange={(e) => setImportCsvText(e.target.value)}
                placeholder={`Exemplo:\nJuliana Souza; (11) 98765-4321; juliana@email.com; Agendamento; Endoslim\nCarla Mendes; (11) 99123-5566; carla@email.com; Compareceu; Profhilo`}
                rows={7}
                className="w-full p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E5DAD0] text-xs font-mono text-[#1F1916] focus:outline-none focus:border-[#8C7359] transition-colors resize-none"
              />
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 cursor-pointer">
              <input
                type="checkbox"
                checked={importSyncAds}
                onChange={(e) => setImportSyncAds(e.target.checked)}
                className="mt-0.5 rounded text-[#1967D2] focus:ring-blue-500 cursor-pointer"
              />
              <div className="text-xs text-blue-900">
                <span className="font-bold block">Calibrar Inteligência da Meta e Google Ads</span>
                <span className="text-[11px] text-blue-800">
                  Registra automaticamente esses contatos como <strong>Leads Qualificados</strong> (com SHA-256 de telefone/e-mail) para treinar os algoritmos de tráfego pago.
                </span>
              </div>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FAF6F0] hover:bg-[#EFE6DC] text-[#44342E] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isImporting || !importCsvText.trim()}
                onClick={handleBatchImport}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8C7359] hover:bg-[#735D46] text-white transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isImporting ? 'Importando e Calibrando...' : 'Importar e Qualificar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#E5DAD0]">
            <h3 className="font-serif text-lg font-bold text-[#1F1916]">Excluir Lead</h3>
            <p className="text-sm text-[#5C4B44]">Tem certeza que deseja excluir este registro do CRM?</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FAF6F0] hover:bg-[#EFE6DC] text-[#44342E] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteLead(leadToDelete)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Feedback Toast */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#241E1B] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-medium animate-in fade-in">
          {actionFeedback}
        </div>
      )}
    </div>
  );
};
