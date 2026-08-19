import React, { useState, useEffect } from 'react';
import { FlightPlanWaypoint, AeronauticalFix, AiracCycleInfo } from '../../types';
import { fetchAiracCycle, searchAeronauticalFixes } from '../../utils/airacService';
import { OFFLINE_AERONAUTICAL_FIXES } from '../../data/airacOfflineDatabase';
import { FlightPlannerMap } from './FlightPlannerMap';
import { FlightPlanRoutePanel } from './FlightPlanRoutePanel';
import { FlightPlanBriefingPanel } from './FlightPlanBriefingPanel';
import { MetarBriefingPanel } from './MetarBriefingPanel';
import { ExportFlightPlanModal } from './ExportFlightPlanModal';
import { DeclareTechnicalStopModal } from '../Flight/operations/DeclareTechnicalStopModal';
import {
  Compass,
  Radio,
  Share2,
  Trash2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Plane
} from 'lucide-react';

export const FlightPlannerView: React.FC = () => {
  const [airacCycle, setAiracCycle] = useState<AiracCycleInfo | null>(null);
  const [originFix, setOriginFix] = useState<AeronauticalFix | null>(OFFLINE_AERONAUTICAL_FIXES[0]); // SBGR
  const [destFix, setDestFix] = useState<AeronauticalFix | null>(OFFLINE_AERONAUTICAL_FIXES[1]); // SBSP
  const [declaringStopFix, setDeclaringStopFix] = useState<AeronauticalFix | null>(null);

  const [waypoints, setWaypoints] = useState<FlightPlanWaypoint[]>([
    {
      id: 'wp-sbgr-init',
      identifier: 'SBGR',
      name: 'Guarulhos Intl',
      type: 'airport',
      lat: -23.4356,
      lng: -46.4731,
      elevationFt: 2459,
      legDistanceNm: 0,
      legHeadingDeg: 0,
      cumulativeDistanceNm: 0,
    },
    {
      id: 'wp-bgc-init',
      identifier: 'BGC',
      name: 'Bonsucesso VOR',
      type: 'vor',
      lat: -23.4392,
      lng: -46.4717,
      elevationFt: 2460,
      legDistanceNm: 2.1,
      legHeadingDeg: 195,
      cumulativeDistanceNm: 2.1,
    },
    {
      id: 'wp-sbsp-init',
      identifier: 'SBSP',
      name: 'Congonhas',
      type: 'airport',
      lat: -23.6261,
      lng: -46.6564,
      elevationFt: 2631,
      legDistanceNm: 15.4,
      legHeadingDeg: 215,
      cumulativeDistanceNm: 17.5,
    },
  ]);

  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Fetch AIRAC cycle status on mount
  useEffect(() => {
    fetchAiracCycle().then((cycle) => setAiracCycle(cycle));
  }, []);

  // Handle fix selection from map popup clicks
  const handleMapSelectFix = (fix: AeronauticalFix, action: 'origin' | 'destination' | 'add') => {
    const newWp: FlightPlanWaypoint = {
      id: `wp-map-${fix.identifier}-${Date.now()}`,
      identifier: fix.identifier,
      name: fix.name,
      type: fix.type,
      lat: fix.lat,
      lng: fix.lng,
      elevationFt: fix.elevationFt,
      freq: fix.freq,
      viaAirway: 'DCT',
    };

    if (action === 'origin') {
      setOriginFix(fix);
      setWaypoints((prev) => [newWp, ...prev.slice(1)]);
    } else if (action === 'destination') {
      setDestFix(fix);
      setWaypoints((prev) => [...prev.slice(0, -1), newWp]);
    } else {
      // Add as intermediate waypoint before destination
      setWaypoints((prev) => {
        if (prev.length <= 1) return [...prev, newWp];
        const copy = [...prev];
        copy.splice(copy.length - 1, 0, newWp);
        return copy;
      });
    }
  };

  const handleClearRoute = () => {
    setWaypoints([]);
    setOriginFix(null);
    setDestFix(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-5 md:p-6 text-white shadow-lg border border-slate-700/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Compass className="w-64 h-64 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Navegação Aeronáutica em Tempo Real</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Planejador de Voo MSFS
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-normal">
              Crie rotas IFR/VFR interativas, consulte fixos e aerovias AIRAC, analise METAR em tempo real e exporte o plano direto para o simulador.
            </p>
          </div>

          {/* Action Buttons & AIRAC Cycle Badge */}
          <div className="flex flex-wrap items-center gap-2">
            {/* AIRAC Status Badge */}
            <div className="bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono flex items-center gap-2 shadow-inner">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Base AIRAC</span>
                <span className="font-extrabold text-amber-300">Ciclo {airacCycle?.cycle || '2607'}</span>
              </div>
            </div>

            {/* Clear Route */}
            <button
              onClick={handleClearRoute}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Limpar todos os pontos da rota"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Limpar Rota</span>
            </button>

            {/* Export Modal trigger */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Exportar Plano</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600" />
            <span>Carta Aeronáutica Interativa (Leaflet)</span>
          </h2>
          <span className="text-xs font-medium text-slate-500">Clique em qualquer aeroporto ou VOR para adicionar à rota</span>
        </div>

        <FlightPlannerMap
          waypoints={waypoints}
          onSelectFix={handleMapSelectFix}
          onDeclareStop={(fix) => setDeclaringStopFix(fix)}
        />
      </div>

      {/* Flight Plan Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Route Setup */}
        <FlightPlanRoutePanel
          waypoints={waypoints}
          setWaypoints={setWaypoints}
          originFix={originFix}
          setOriginFix={setOriginFix}
          destFix={destFix}
          setDestFix={setDestFix}
        />

        {/* Right Column: Performance & METAR */}
        <div className="space-y-6">
          <FlightPlanBriefingPanel waypoints={waypoints} />
          <MetarBriefingPanel
            originIcao={originFix?.identifier || 'SBGR'}
            destIcao={destFix?.identifier || 'SBSP'}
          />
        </div>
      </div>

      {/* Declare Technical Stop Modal */}
      <DeclareTechnicalStopModal
        isOpen={Boolean(declaringStopFix)}
        airportFix={declaringStopFix}
        onClose={() => setDeclaringStopFix(null)}
        onAddToFlightPlan={(fix) => {
          handleMapSelectFix(fix, 'add');
        }}
      />

      {/* Export Modal */}
      <ExportFlightPlanModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        waypoints={waypoints}
      />
    </div>
  );
};
