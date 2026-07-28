import React, { useState, useEffect } from 'react';
import { FlightPlanWaypoint, AeronauticalFix, ProcedureOption } from '../../types';
import { searchAeronauticalFixes, fetchProceduresForAirport } from '../../utils/airacService';
import { calculateDistanceNm, calculateBearingDeg } from '../../utils/aviationNavMath';
import {
  Search,
  PlaneTakeoff,
  PlaneLanding,
  ArrowUpDown,
  Trash2,
  Plus,
  Compass,
  Layers,
  Sparkles,
  Route,
  ChevronDown,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface FlightPlanRoutePanelProps {
  waypoints: FlightPlanWaypoint[];
  setWaypoints: React.Dispatch<React.SetStateAction<FlightPlanWaypoint[]>>;
  originFix: AeronauticalFix | null;
  setOriginFix: (fix: AeronauticalFix | null) => void;
  destFix: AeronauticalFix | null;
  setDestFix: (fix: AeronauticalFix | null) => void;
}

export const FlightPlanRoutePanel: React.FC<FlightPlanRoutePanelProps> = ({
  waypoints,
  setWaypoints,
  originFix,
  setOriginFix,
  destFix,
  setDestFix,
}) => {
  // Input search states
  const [originInput, setOriginInput] = useState<string>('SBGR');
  const [destInput, setDestInput] = useState<string>('SBSP');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<AeronauticalFix[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  // Procedure Selection states
  const [sidOptions, setSidOptions] = useState<ProcedureOption[]>([]);
  const [starOptions, setStarOptions] = useState<ProcedureOption[]>([]);
  const [selectedSid, setSelectedSid] = useState<string>('');
  const [selectedStar, setSelectedStar] = useState<string>('');
  const [isLoadingProcedures, setIsLoadingLoadingProcedures] = useState<boolean>(false);

  // Route string parser input
  const [routeString, setRouteString] = useState<string>('DCT');
  const [isParsingRoute, setIsParsingRoute] = useState<boolean>(false);

  // Sync inputs with selected fixes
  useEffect(() => {
    if (originFix) setOriginInput(originFix.identifier);
  }, [originFix]);

  useEffect(() => {
    if (destFix) setDestInput(destFix.identifier);
  }, [destFix]);

  // Load procedures when origin/destination change
  useEffect(() => {
    if (originFix?.identifier) {
      loadProcedures(originFix.identifier, 'SID');
    }
    if (destFix?.identifier) {
      loadProcedures(destFix.identifier, 'STAR');
    }
  }, [originFix?.identifier, destFix?.identifier]);

  const loadProcedures = async (icao: string, type: 'SID' | 'STAR') => {
    setIsLoadingLoadingProcedures(true);
    try {
      const options = await fetchProceduresForAirport(icao, type);
      if (type === 'SID') setSidOptions(options);
      else setStarOptions(options);
    } catch (e) {
      console.warn('Procedure load error:', e);
    } finally {
      setIsLoadingLoadingProcedures(false);
    }
  };

  // Perform Autocomplete search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await searchAeronauticalFixes(query);
      setSearchResults(res);
    } finally {
      setIsSearching(false);
    }
  };

  // Build Flight Plan Waypoint Object
  const createWaypointFromFix = (fix: AeronauticalFix, viaAirway: string = 'DCT'): FlightPlanWaypoint => ({
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

  // Calculate legs & distances across waypoints array
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

  // Set Origin Airport
  const handleSetOrigin = async (icao: string) => {
    const searchRes = await searchAeronauticalFixes(icao);
    if (searchRes.length > 0) {
      const fix = searchRes[0];
      setOriginFix(fix);
      const newWp = createWaypointFromFix(fix, 'DEP');

      setWaypoints((prev) => {
        const remaining = prev.filter((wp, idx) => idx !== 0);
        return recalculateWaypoints([newWp, ...remaining]);
      });
    }
  };

  // Set Destination Airport
  const handleSetDestination = async (icao: string) => {
    const searchRes = await searchAeronauticalFixes(icao);
    if (searchRes.length > 0) {
      const fix = searchRes[0];
      setDestFix(fix);
      const newWp = createWaypointFromFix(fix, 'ARR');

      setWaypoints((prev) => {
        if (prev.length === 0) return [newWp];
        const newArr = [...prev];
        // replace last or add
        if (newArr.length === 1) newArr.push(newWp);
        else newArr[newArr.length - 1] = newWp;
        return recalculateWaypoints(newArr);
      });
    }
  };

  // Swap Origin and Destination
  const handleSwapRoute = () => {
    if (!originFix || !destFix) return;
    const temp = originFix;
    setOriginFix(destFix);
    setDestFix(temp);

    const reversed = [...waypoints].reverse();
    setWaypoints(recalculateWaypoints(reversed));
  };

  // Move Waypoint Up/Down
  const handleMoveWaypoint = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index <= 1) return; // Cannot move before origin
    if (direction === 'down' && index >= waypoints.length - 2) return; // Cannot move after dest

    const newArr = [...waypoints];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;

    setWaypoints(recalculateWaypoints(newArr));
  };

  // Remove Waypoint
  const handleRemoveWaypoint = (id: string) => {
    setWaypoints((prev) => recalculateWaypoints(prev.filter((wp) => wp.id !== id)));
  };

  // Parse AIRAC Route string (e.g. SBGR DCT BGC DCT SBSG)
  const handleParseRouteString = async () => {
    if (!originInput || !destInput) return;
    setIsParsingRoute(true);

    try {
      const res = await fetch(
        `/api/airac/routes/parse?origin=${encodeURIComponent(originInput)}&destination=${encodeURIComponent(
          destInput
        )}&route=${encodeURIComponent(routeString)}`
      );

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data?.waypoints)) {
          const parsedPts: FlightPlanWaypoint[] = json.data.waypoints.map((item: any) => ({
            id: `wp-parsed-${item.identifier}-${Math.random().toString(36).substring(2, 6)}`,
            identifier: item.identifier,
            name: item.name || item.identifier,
            type: item.type || 'fix',
            lat: item.lat || item.coordinates?.latitude || 0,
            lng: item.lng || item.coordinates?.longitude || 0,
            viaAirway: item.airway || 'DCT',
          }));

          setWaypoints(recalculateWaypoints(parsedPts));
        }
      }
    } catch (e) {
      console.warn('AIRAC route parse warning:', e);
    } finally {
      setIsParsingRoute(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Planejamento da Rota</h3>
            <p className="text-[11px] text-slate-500 font-medium">Origem, waypoints intermediários e procedimentos</p>
          </div>
        </div>

        <button
          onClick={handleSwapRoute}
          className="text-xs font-bold text-slate-600 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Inverter origem e destino"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-sky-600" />
          <span className="hidden sm:inline">Inverter</span>
        </button>
      </div>

      {/* Origin & Destination Quick Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Origin Airport Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <PlaneTakeoff className="w-3.5 h-3.5 text-amber-600" />
            <span>Aeroporto de Origem</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value.toUpperCase())}
              placeholder="Ex: SBGR"
              maxLength={5}
              className="flex-1 uppercase font-mono font-extrabold text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
            <button
              onClick={() => handleSetOrigin(originInput)}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Aplicar
            </button>
          </div>
          {originFix && (
            <p className="text-[10px] text-slate-500 font-medium truncate">
              {originFix.name} • {originFix.city}
            </p>
          )}
        </div>

        {/* Destination Airport Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <PlaneLanding className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aeroporto de Destino</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={destInput}
              onChange={(e) => setDestInput(e.target.value.toUpperCase())}
              placeholder="Ex: SBSP"
              maxLength={5}
              className="flex-1 uppercase font-mono font-extrabold text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            <button
              onClick={() => handleSetDestination(destInput)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Aplicar
            </button>
          </div>
          {destFix && (
            <p className="text-[10px] text-slate-500 font-medium truncate">
              {destFix.name} • {destFix.city}
            </p>
          )}
        </div>
      </div>

      {/* AIRAC Procedures Selector (SID & STAR) */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Procedimentos de Saída / Chegada AIRAC (SID & STAR)</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* SID Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Saída Instrumentos (SID)</label>
            <select
              value={selectedSid}
              onChange={(e) => setSelectedSid(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Selecione a SID ({originFix?.identifier || 'Origem'})...</option>
              {sidOptions.map((sid, idx) => (
                <option key={`sid-${sid.identifier}-${sid.runway || ''}-${idx}`} value={sid.identifier}>
                  {sid.name}
                </option>
              ))}
            </select>
          </div>

          {/* STAR Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Chegada Instrumentos (STAR / APP)</label>
            <select
              value={selectedStar}
              onChange={(e) => setSelectedStar(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Selecione a STAR ({destFix?.identifier || 'Destino'})...</option>
              {starOptions.map((star, idx) => (
                <option key={`star-${star.identifier}-${star.runway || ''}-${idx}`} value={star.identifier}>
                  {star.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search & Add Custom Waypoint Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowSearchModal(true)}
          className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Search className="w-4 h-4 text-sky-600" />
          <span>Buscar e Adicionar Fixos / VOR / Aeroportos à Rota</span>
        </button>
      </div>

      {/* Search Modal Backdrop */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Search className="w-5 h-5 text-sky-600" />
                <span>Buscar Ponto de Navegação AIRAC</span>
              </h4>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Digite ICAO, nome ou VOR (ex: BGC, CONGONHAS, LAX)..."
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
              {isSearching && (
                <RefreshCw className="w-4 h-4 text-sky-500 animate-spin absolute right-3 top-3" />
              )}
            </div>

            {/* Results list */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {searchResults.map((fix, idx) => (
                <div
                  key={`search-res-${fix.id || fix.identifier}-${idx}`}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50/80 border border-slate-200 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-slate-900 text-amber-300">
                        {fix.identifier}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{fix.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      {fix.type.toUpperCase()} • LAT: {fix.lat.toFixed(4)} LON: {fix.lng.toFixed(4)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const newWp = createWaypointFromFix(fix);
                      setWaypoints((prev) => recalculateWaypoints([...prev, newWp]));
                      setShowSearchModal(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              ))}

              {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <p className="text-center text-xs text-slate-400 py-4 font-medium">
                  Nenhum fixo ou aeroporto encontrado para "{searchQuery}".
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Waypoint Table List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Sequência de Waypoints ({waypoints.length})</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 font-bold">
            Total: {waypoints.length > 0 ? waypoints[waypoints.length - 1].cumulativeDistanceNm : 0} NM
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
          {waypoints.map((wp, index) => {
            const isOrigin = index === 0;
            const isDest = index === waypoints.length - 1;

            return (
              <div
                key={`wp-row-${wp.id || wp.identifier}-${index}`}
                className={`p-2.5 flex items-center justify-between gap-2 transition-colors ${
                  isOrigin
                    ? 'bg-amber-50/70 border-l-4 border-l-amber-500'
                    : isDest
                    ? 'bg-emerald-50/70 border-l-4 border-l-emerald-500'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 font-mono">
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded ${
                          isOrigin
                            ? 'bg-amber-600 text-white'
                            : isDest
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-sky-300'
                        }`}
                      >
                        {wp.identifier}
                      </span>
                      <span className="font-bold text-slate-800 text-xs truncate">{wp.name}</span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{wp.type.toUpperCase()}</span>
                      {!isOrigin && (
                        <>
                          <span>•</span>
                          <span className="text-amber-800 font-bold">Leg: {wp.legDistanceNm} NM</span>
                          <span>•</span>
                          <span className="text-indigo-800 font-bold">Rumo: {wp.legHeadingDeg}°M</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!isOrigin && !isDest && (
                    <>
                      <button
                        onClick={() => handleMoveWaypoint(index, 'up')}
                        disabled={index <= 1}
                        className="p-1 hover:bg-slate-200 text-slate-600 rounded disabled:opacity-30 cursor-pointer"
                        title="Mover para cima"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveWaypoint(index, 'down')}
                        disabled={index >= waypoints.length - 2}
                        className="p-1 hover:bg-slate-200 text-slate-600 rounded disabled:opacity-30 cursor-pointer"
                        title="Mover para baixo"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => handleRemoveWaypoint(wp.id)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded cursor-pointer"
                        title="Remover ponto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
