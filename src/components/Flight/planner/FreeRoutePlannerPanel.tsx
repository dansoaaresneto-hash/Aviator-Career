import React, { useEffect, useState } from 'react';
import { FlightPlanWaypoint, AeronauticalFix, AiracCycleInfo } from '../../../types';
import { fetchAiracCycle, searchAeronauticalFixes } from '../../../utils/airacService';
import { calculateDistanceNm, calculateBearingDeg } from '../../../utils/aviationNavMath';
import { OFFLINE_AERONAUTICAL_FIXES } from '../../../data/airacOfflineDatabase';
import { FlightPlannerMap } from '../../FlightPlanner/FlightPlannerMap';
import { ExportFlightPlanModal } from '../../FlightPlanner/ExportFlightPlanModal';
import { DeclareTechnicalStopModal } from '../operations/DeclareTechnicalStopModal';
import {
  Compass,
  Search,
  Plus,
  Trash2,
  X,
  Share2,
  RefreshCw,
  PlaneTakeoff,
  PlaneLanding,
  Route,
  Radio,
} from 'lucide-react';

interface FreeRoutePlannerPanelProps {
  onSwitchToStopsTab?: () => void;
}

/**
 * Planejador de Voo embutido no "tablet" da tela de Voo em Andamento.
 *
 * Este planejador é INDEPENDENTE da missão/contrato ativo: o piloto pode
 * traçar qualquer rota, em quantas etapas quiser, sem vínculo com o
 * despacho oficial (que continua vivendo nas abas de Manifesto/Escalas).
 */
export const FreeRoutePlannerPanel: React.FC<FreeRoutePlannerPanelProps> = ({ onSwitchToStopsTab }) => {
  const [airacCycle, setAiracCycle] = useState<AiracCycleInfo | null>(null);
  const [waypoints, setWaypoints] = useState<FlightPlanWaypoint[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AeronauticalFix[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [declaringStopFix, setDeclaringStopFix] = useState<AeronauticalFix | null>(null);

  useEffect(() => {
    fetchAiracCycle().then((cycle) => setAiracCycle(cycle));
  }, []);

  const recalculateWaypoints = (pts: FlightPlanWaypoint[]): FlightPlanWaypoint[] => {
    let cumulative = 0;
    return pts.map((wp, index) => {
      if (index === 0) {
        return { ...wp, legDistanceNm: 0, legHeadingDeg: 0, cumulativeDistanceNm: 0 };
      }
      const prev = pts[index - 1];
      const dist = calculateDistanceNm(prev.lat, prev.lng, wp.lat, wp.lng);
      const brng = calculateBearingDeg(prev.lat, prev.lng, wp.lat, wp.lng);
      cumulative += dist;
      return {
        ...wp,
        legDistanceNm: dist,
        legHeadingDeg: brng,
        cumulativeDistanceNm: Math.round(cumulative * 10) / 10,
      };
    });
  };

  const createWaypointFromFix = (fix: AeronauticalFix, viaAirway = 'DCT'): FlightPlanWaypoint => ({
    id: `wp-${fix.identifier}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    identifier: fix.identifier,
    name: fix.name,
    type: fix.type,
    lat: fix.lat,
    lng: fix.lng,
    elevationFt: fix.elevationFt,
    freq: fix.freq,
    viaAirway,
  });

  // Clique no mapa: define Origem / Destino / Adiciona à rota (mesma UX da
  // página "Planejador de Voo MSFS", mas totalmente local a este painel)
  const handleMapSelectFix = (fix: AeronauticalFix, action: 'origin' | 'destination' | 'add') => {
    if (action === 'origin') {
      const newWp = createWaypointFromFix(fix, 'DEP');
      setWaypoints((prev) => recalculateWaypoints([newWp, ...prev.slice(1)]));
    } else if (action === 'destination') {
      const newWp = createWaypointFromFix(fix, 'ARR');
      setWaypoints((prev) => {
        if (prev.length === 0) return [newWp];
        const copy = [...prev];
        if (copy.length === 1) copy.push(newWp);
        else copy[copy.length - 1] = newWp;
        return recalculateWaypoints(copy);
      });
    } else {
      const newWp = createWaypointFromFix(fix);
      setWaypoints((prev) => {
        if (prev.length <= 1) return recalculateWaypoints([...prev, newWp]);
        const copy = [...prev];
        copy.splice(copy.length - 1, 0, newWp);
        return recalculateWaypoints(copy);
      });
    }
  };

  const handleDeclareStop = (fix: AeronauticalFix) => {
    setDeclaringStopFix(fix);
  };

  const handleRemoveWaypoint = (id: string) => {
    setWaypoints((prev) => recalculateWaypoints(prev.filter((wp) => wp.id !== id)));
  };

  const handleClearRoute = () => setWaypoints([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await searchAeronauticalFixes(query);
      setSearchResults(res.length > 0 ? res : OFFLINE_AERONAUTICAL_FIXES.filter((f) =>
        f.identifier.toLowerCase().includes(query.toLowerCase()) ||
        f.name.toLowerCase().includes(query.toLowerCase())
      ));
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFromSearch = (fix: AeronauticalFix) => {
    const action: 'origin' | 'destination' | 'add' = waypoints.length === 0 ? 'origin' : 'add';
    handleMapSelectFix(fix, action);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const totalDistance = waypoints.length > 0 ? waypoints[waypoints.length - 1].cumulativeDistanceNm || 0 : 0;
  const originWp = waypoints[0];
  const destWp = waypoints.length > 1 ? waypoints[waypoints.length - 1] : undefined;

  return (
    <div className="relative w-full h-full bg-slate-950">
      {/* Mapa full-bleed */}
      <FlightPlannerMap
        waypoints={waypoints}
        onSelectFix={handleMapSelectFix}
        onDeclareStop={handleDeclareStop}
        embedded
        bottomInsetPx={64}
      />

      {/* Overlay superior esquerdo: ciclo AIRAC + ações rápidas */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/80 text-[10px] font-mono text-slate-300 flex items-center gap-1.5 shadow-sm pointer-events-auto">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span>AIRAC {airacCycle?.cycle || '2607'}</span>
        </div>
      </div>

      {/* Barra de Waypoints (parte inferior, sob o mapa) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80">
        <div className="flex items-center justify-between gap-2 px-3 pt-2 pb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <Route className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate">
              {waypoints.length === 0
                ? 'Clique no mapa para traçar sua rota'
                : `${originWp?.identifier || '—'} ➔ ${destWp?.identifier || '···'} · ${waypoints.length} pontos`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              {totalDistance > 0 ? `${totalDistance} NM` : ''}
            </span>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 rounded-lg border border-sky-400/30 transition-colors cursor-pointer"
              title="Buscar e adicionar aeroporto / fixo / VOR"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            {waypoints.length > 0 && (
              <button
                type="button"
                onClick={handleClearRoute}
                className="p-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-lg border border-rose-400/30 transition-colors cursor-pointer"
                title="Limpar rota"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              disabled={waypoints.length < 2}
              className="p-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-lg border border-amber-400/30 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Exportar plano de voo"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pills de waypoints */}
        <div className="flex items-center gap-2 overflow-x-auto px-3 pb-2.5 scrollbar-none">
          {waypoints.length === 0 ? (
            <span className="text-[10px] text-slate-500 italic px-1">
              Toque em um aeroporto/VOR/fixo no mapa e escolha Origem, Destino ou Adicionar à rota.
            </span>
          ) : (
            waypoints.map((wp, index) => {
              const isDep = index === 0;
              const isArr = index === waypoints.length - 1 && waypoints.length > 1;

              return (
                <div
                  key={wp.id}
                  className={`min-w-fit px-2.5 py-1.5 rounded-full text-xs font-mono font-semibold shrink-0 flex items-center gap-1.5 shadow-xs border ${
                    isDep
                      ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                      : isArr
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                  title={`${wp.name}${index > 0 ? ` · Leg ${wp.legDistanceNm} NM` : ''}`}
                >
                  {isDep && <PlaneTakeoff className="w-3 h-3" />}
                  {isArr && <PlaneLanding className="w-3 h-3" />}
                  <span>{wp.identifier}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWaypoint(wp.id)}
                    className="text-current opacity-60 hover:opacity-100 cursor-pointer"
                    title="Remover ponto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de busca de fixos */}
      {isSearchOpen && (
        <div className="absolute inset-0 z-30 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 space-y-3 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-600" />
                <span>Buscar Ponto de Navegação</span>
              </h4>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="ICAO, nome ou VOR (ex: SBGR, CONGONHAS)..."
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {isSearching && (
                <RefreshCw className="w-4 h-4 text-sky-500 animate-spin absolute right-3 top-2.5" />
              )}
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {searchResults.map((fix, idx) => (
                <div
                  key={`res-${fix.id || fix.identifier}-${idx}`}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-sky-50 border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-extrabold text-[11px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-300">
                        {fix.identifier}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">{fix.name}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddFromSearch(fix)}
                    className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar</span>
                  </button>
                </div>
              ))}

              {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <p className="text-center text-xs text-slate-400 py-4">Nenhum resultado para "{searchQuery}".</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Declarar Escala Técnica Direto pelo Mapa */}
      <DeclareTechnicalStopModal
        isOpen={Boolean(declaringStopFix)}
        airportFix={declaringStopFix}
        onClose={() => setDeclaringStopFix(null)}
        onSuccess={() => {
          if (onSwitchToStopsTab) {
            onSwitchToStopsTab();
          }
        }}
      />

      {/* Export Modal */}
      <ExportFlightPlanModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        waypoints={waypoints}
      />
    </div>
  );
};

