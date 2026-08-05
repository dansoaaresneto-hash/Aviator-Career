import React, { useState, useEffect, useCallback } from 'react';
import { usePilot } from '../../context/PilotContext';
import { useTelemetry } from '../../context/TelemetryContext';
import { OnlinePilotData } from '../../types/telemetry';
import { LiveRadarMap } from './LiveRadarMap';
import {
  Radio,
  RefreshCw,
  Search,
  Plane,
  Navigation,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Compass,
  Laptop,
  Gauge,
  ArrowUpRight
} from 'lucide-react';

export const LiveRadarView: React.FC = () => {
  const { setActiveTab } = usePilot();
  const { telemetry, connectionStatus, userToken } = useTelemetry();

  const [pilots, setPilots] = useState<OnlinePilotData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPilotToken, setSelectedPilotToken] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'carto-dark' | 'carto-light' | 'osm'>('carto-dark');

  // Fetch real online telemetry from server
  const fetchLivePilots = useCallback(async () => {
    try {
      const res = await fetch('/api/telemetry/live');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.pilots)) {
          setPilots(json.pilots);
          setLastSyncTime(new Date());
        }
      }
    } catch (err) {
      console.error('Erro ao buscar pilotos ao vivo:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll live traffic every 5 seconds
  useEffect(() => {
    fetchLivePilots();
    const interval = setInterval(fetchLivePilots, 5000);
    return () => clearInterval(interval);
  }, [fetchLivePilots]);

  // Filter pilots based on search term
  const filteredPilots = pilots.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.pilotName && p.pilotName.toLowerCase().includes(term)) ||
      (p.callsign && p.callsign.toLowerCase().includes(term)) ||
      (p.aircraftTitle && p.aircraftTitle.toLowerCase().includes(term)) ||
      (p.airportIcao && p.airportIcao.toLowerCase().includes(term)) ||
      p.token.toLowerCase().includes(term)
    );
  });

  const airborneCount = pilots.filter((p) => !p.onGround).length;
  const onGroundCount = pilots.filter((p) => p.onGround).length;
  const activeAirports = Array.from(new Set(pilots.map((p) => p.airportIcao).filter(Boolean)));

  const isUserConnected = connectionStatus === 'connected' || connectionStatus === 'simulated';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-wider uppercase border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Sincronização ao Vivo MSFS
            </span>
            {lastSyncTime && (
              <span className="text-[11px] text-slate-400 font-mono">
                Atualizado: {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Radio className="w-7 h-7 text-emerald-400 animate-pulse" />
            Radar de Tráfego ao Vivo
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Acompanhe em tempo real todos os pilotos da comunidade conectados com o simulador MSFS.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchLivePilots}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>

          {!isUserConnected ? (
            <button
              onClick={() => setActiveTab('connector')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Laptop className="w-4 h-4" />
              Conectar Meu MSFS
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Você está Online
            </div>
          )}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pilotos Online
            </div>
            <div className="text-xl font-black text-slate-800 font-mono">{pilots.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Aeronaves em Voo
            </div>
            <div className="text-xl font-black text-emerald-600 font-mono">{airborneCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              No Solo / Táxi
            </div>
            <div className="text-xl font-black text-amber-600 font-mono">{onGroundCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Aeroportos Ativos
            </div>
            <div className="text-xl font-black text-indigo-600 font-mono">
              {activeAirports.length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por callsign, piloto, ICAO ou avião..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isUserConnected && (
            <button
              onClick={() => setSelectedPilotToken(userToken)}
              className="px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-600" />
              Centralizar na Minha Posição
            </button>
          )}

          {selectedPilotToken && (
            <button
              onClick={() => setSelectedPilotToken(null)}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Limpar Seleção
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid: Map + Traffic List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 h-[540px] rounded-xl overflow-hidden shadow-sm">
          <LiveRadarMap
            pilots={filteredPilots}
            selectedPilotToken={selectedPilotToken}
            onSelectPilot={(p) => setSelectedPilotToken(p ? p.token : null)}
            userToken={userToken}
            mapStyle={mapStyle}
            onStyleChange={setMapStyle}
          />
        </div>

        {/* Live Traffic Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 flex flex-col h-[540px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 shrink-0">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Plane className="w-4 h-4 text-sky-500" />
              Lista de Tráfego Conectado
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredPilots.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredPilots.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                  <Radio className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-700 text-xs mb-1">
                  Nenhum piloto encontrado
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4 max-w-xs">
                  Não há outros pilotos conectados com o simulador no momento. Ligue o MSFS e o conector para aparecer no radar!
                </p>
                <button
                  onClick={() => setActiveTab('connector')}
                  className="px-3.5 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Laptop className="w-4 h-4" />
                  Abrir Conector MSFS
                </button>
              </div>
            ) : (
              filteredPilots.map((pilot) => {
                const isUser = pilot.token === userToken;
                const isSelected = pilot.token === selectedPilotToken;

                return (
                  <div
                    key={pilot.token}
                    onClick={() => setSelectedPilotToken(pilot.token)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-400/20 shadow-sm'
                        : isUser
                        ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                        : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">
                          {pilot.pilotName || pilot.callsign || 'Piloto VFR'}
                        </span>
                        {isUser && (
                          <span className="text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.2 rounded">
                            VOCÊ
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          pilot.onGround
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {pilot.onGround ? 'No Solo' : 'Em Voo'}
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-600 mb-2 truncate">
                      {pilot.aircraftTitle || 'Aeronave Desconhecida'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-200/60 text-slate-600">
                      <div>
                        <span className="text-slate-400 font-bold uppercase mr-1.5">Aeroporto:</span>
                        <span className="font-bold text-sky-700 font-mono">{pilot.airportIcao || '---'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase mr-1.5">Aeronave:</span>
                        <span className="font-bold text-slate-700">{pilot.aircraftTitle || '---'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
