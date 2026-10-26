import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  ShieldCheck, 
  Phone, 
  ExternalLink, 
  Sparkles, 
  Filter, 
  Users, 
  CheckCircle2, 
  Clock, 
  X,
  Compass
} from 'lucide-react';
import { StoredLead } from '../../pages/AdminCRMPage';

interface LeadsGeoMapProps {
  leads: StoredLead[];
  onSelectLead: (lead: StoredLead) => void;
}

export const LeadsGeoMap: React.FC<LeadsGeoMapProps> = ({ leads, onSelectLead }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [statusFilter, setStatusFilter] = useState<'todos' | 'qualificados' | 'novo' | 'em_contato' | 'perdido'>('todos');
  const [selectedMapLead, setSelectedMapLead] = useState<StoredLead | null>(null);

  // Filter leads based on selection
  const filteredMapLeads = useMemo(() => {
    return leads.filter((l) => {
      // Must have valid coordinates
      if (!l.latitude || !l.longitude) return false;

      if (statusFilter === 'todos') return true;
      if (statusFilter === 'qualificados') {
        return l.status === 'agendado' || l.status === 'convertido';
      }
      return l.status === statusFilter;
    });
  }, [leads, statusFilter]);

  // Statistics for map
  const stats = useMemo(() => {
    const totalWithGeo = leads.filter((l) => l.latitude && l.longitude).length;
    const qualified = leads.filter((l) => (l.status === 'agendado' || l.status === 'convertido') && l.latitude).length;
    const lost = leads.filter((l) => l.status === 'perdido' && l.latitude).length;
    const inContact = leads.filter((l) => l.status === 'em_contato' && l.latitude).length;
    const newLeads = leads.filter((l) => l.status === 'novo' && l.latitude).length;
    
    // Unique cities
    const cities = new Set(leads.map((l) => l.city).filter(Boolean)).size;

    return { totalWithGeo, qualified, lost, inContact, newLeads, cities };
  }, [leads]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on São Paulo Metropolitan Area
    const map = L.map(mapContainerRef.current, {
      center: [-23.5750, -46.6650],
      zoom: 11,
      zoomControl: true,
      attributionControl: true
    });

    // Official free OpenStreetMap tile layer (Leaflet | © OpenStreetMap, no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers whenever filteredMapLeads changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    filteredMapLeads.forEach((lead) => {
      if (!lead.latitude || !lead.longitude) return;

      // Color coding per status
      let pinColor = '#3B82F6'; // blue for novo
      let label = 'Novo';
      let isQual = false;

      if (lead.status === 'agendado') {
        pinColor = '#8B5CF6'; // purple for agendado
        label = 'Agendado';
        isQual = true;
      } else if (lead.status === 'convertido') {
        pinColor = '#10B981'; // emerald for convertido
        label = 'Convertido';
        isQual = true;
      } else if (lead.status === 'em_contato') {
        pinColor = '#F59E0B'; // amber for em_contato
        label = 'Em Contato';
      } else if (lead.status === 'perdido') {
        pinColor = '#6B7280'; // gray for perdido
        label = 'Perdido';
      }

      // Custom HTML Marker Pin
      const iconHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: ${pinColor};
          color: white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          <div style="
            transform: rotate(45deg);
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${isQual ? '★' : '•'}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-lead-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([lead.latitude, lead.longitude], { icon: customIcon });

      // Click opens selected lead card and details
      marker.on('click', () => {
        setSelectedMapLead(lead);
      });

      marker.addTo(markersGroup);
    });

    // Fit bounds if we have pins
    if (filteredMapLeads.length > 0) {
      const bounds = L.latLngBounds(
        filteredMapLeads.map((l) => [l.latitude!, l.longitude!])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [filteredMapLeads]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Context */}
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DAD0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-[#8C7359]">
              Geolocalização de Leads
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              <Sparkles className="w-3 h-3 text-purple-700" />
              Mapa Ativo
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1916] mt-1">
            Mapa de Leads Qualificados, Agendados & Perdidos
          </h2>
          <p className="text-xs text-[#66534B] mt-0.5">
            Visualize a localização de todos os contatos que preencheram o formulário no site e filtre por status.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Convertido
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            Agendado
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Em Contato
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Novo
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
            Perdido
          </span>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5DAD0] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#8C7359] block">Total no Mapa</span>
          <span className="text-2xl font-serif font-bold text-[#1F1916]">{stats.totalWithGeo}</span>
          <span className="text-[11px] text-[#66534B] block mt-0.5">Contatos mapeados</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-purple-800 block">⭐ Qualificados</span>
          <span className="text-2xl font-serif font-bold text-purple-900">{stats.qualified}</span>
          <span className="text-[11px] text-purple-700 block mt-0.5">Agendados & Convertidos</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-amber-800 block">Em Atendimento</span>
          <span className="text-2xl font-serif font-bold text-amber-900">{stats.inContact}</span>
          <span className="text-[11px] text-amber-700 block mt-0.5">Conversando no WhatsApp</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-blue-800 block">Novos Leads</span>
          <span className="text-2xl font-serif font-bold text-blue-900">{stats.newLeads}</span>
          <span className="text-[11px] text-blue-700 block mt-0.5">Aguardando 1º contato</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-gray-200 bg-gray-50/20 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-gray-700 block">Perdidos</span>
          <span className="text-2xl font-serif font-bold text-gray-800">{stats.lost}</span>
          <span className="text-[11px] text-gray-600 block mt-0.5">Sem continuidade</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5DAD0] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#8C7359] block">Cidades Mapeadas</span>
          <span className="text-2xl font-serif font-bold text-[#1F1916]">{stats.cities}</span>
          <span className="text-[11px] text-[#66534B] block mt-0.5">SP, Barueri, Santos...</span>
        </div>
      </div>

      {/* Filter Tabs for Map */}
      <div className="bg-[#FFFFFF] p-3 rounded-2xl border border-[#E5DAD0] shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'todos'
                ? 'bg-[#44342E] text-white shadow-xs'
                : 'bg-[#FAF6F0] text-[#66534B] hover:bg-[#EFE6DC]'
            }`}
          >
            Todos os Leads ({stats.totalWithGeo})
          </button>

          <button
            onClick={() => setStatusFilter('qualificados')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === 'qualificados'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <span>⭐ Apenas Qualificados ({stats.qualified})</span>
          </button>

          <button
            onClick={() => setStatusFilter('em_contato')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === 'em_contato'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Em Contato ({stats.inContact})</span>
          </button>

          <button
            onClick={() => setStatusFilter('novo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === 'novo'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Novos ({stats.newLeads})</span>
          </button>

          <button
            onClick={() => setStatusFilter('perdido')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === 'perdido'
                ? 'bg-gray-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-gray-500" />
            <span>Perdidos ({stats.lost})</span>
          </button>
        </div>

        <span className="text-xs text-[#8C7359] font-medium hidden sm:inline">
          Dica: Clique em qualquer pin para abrir os detalhes e conversar no WhatsApp.
        </span>
      </div>

      {/* Map Container + Lead Detail Drawer */}
      <div className="relative bg-[#FFFFFF] rounded-3xl border border-[#E5DAD0] shadow-xs overflow-hidden h-[540px] sm:h-[620px]">
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Selected Lead Card Overlay (Bottom / Right) */}
        {selectedMapLead && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-[#FFFFFF] rounded-2xl p-5 shadow-2xl border border-[#E5DAD0] z-10 animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7359]">
                  Detalhes do Lead no Mapa
                </span>
                <h4 className="font-serif text-lg font-bold text-[#1F1916]">
                  {selectedMapLead.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedMapLead(null)}
                className="w-7 h-7 rounded-full bg-[#FAF6F0] hover:bg-[#EFE6DC] text-[#66534B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8C7359]">Status:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${
                  selectedMapLead.status === 'agendado' ? 'bg-purple-100 text-purple-800' :
                  selectedMapLead.status === 'convertido' ? 'bg-emerald-100 text-emerald-800' :
                  selectedMapLead.status === 'em_contato' ? 'bg-amber-100 text-amber-800' :
                  selectedMapLead.status === 'perdido' ? 'bg-gray-100 text-gray-700' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {selectedMapLead.status === 'agendado' ? 'Avaliação Agendada (Qualificado)' :
                   selectedMapLead.status === 'convertido' ? 'Convertido (Qualificado)' :
                   selectedMapLead.status === 'em_contato' ? 'Em Contato' :
                   selectedMapLead.status === 'perdido' ? 'Perdido' : 'Novo'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8C7359]">Interesse:</span>
                <span className="font-semibold text-[#1F1916] text-right truncate max-w-[200px]">
                  {selectedMapLead.serviceInterest}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8C7359]">Origem:</span>
                <span className="font-bold text-[#44342E]">
                  {selectedMapLead.trafficChannel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8C7359]">Localização:</span>
                <span className="font-medium text-[#1F1916]">
                  {selectedMapLead.neighborhood || selectedMapLead.city}, {selectedMapLead.state}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-[#E5DAD0] flex items-center gap-2">
              <a
                href={`https://wa.me/55${selectedMapLead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${selectedMapLead.name}, tudo bem? Aqui é da Clínica Nidô. Recebemos seu contato no site com interesse em ${selectedMapLead.serviceInterest}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Conversar WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  onSelectLead(selectedMapLead);
                  setSelectedMapLead(null);
                }}
                className="px-3 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE6DC] text-[#44342E] text-xs font-bold transition-colors cursor-pointer border border-[#E5DAD0]"
                title="Abrir ficha completa no CRM"
              >
                Ver Ficha
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
