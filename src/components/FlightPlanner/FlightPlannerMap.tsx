import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AeronauticalFix, FlightPlanWaypoint } from '../../types';
import { fetchNearbyFixes, maxTierVisible, airportTier, navaidTier, waypointTier, isHelipadFix } from '../../utils/airacService';
import { OFFLINE_AERONAUTICAL_FIXES } from '../../data/airacOfflineDatabase';
import { interpolateGreatCircle } from '../../utils/aviationNavMath';
import { MapPin, Sliders, Layers, RefreshCw, ZoomIn, Navigation, Eye, EyeOff } from 'lucide-react';

interface FlightPlannerMapProps {
  waypoints: FlightPlanWaypoint[];
  onSelectFix: (fix: AeronauticalFix, action: 'origin' | 'destination' | 'add') => void;
  selectedFixId?: string;
}

export const FlightPlannerMap: React.FC<FlightPlannerMapProps> = ({
  waypoints,
  onSelectFix,
  selectedFixId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapZoom, setMapZoom] = useState<number>(6);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-15.78, -47.92]); // Brazil center default
  const [manualLodBias, setManualLodBias] = useState<number>(0); // -2 (Mais Limpo) to +2 (Mais Detalhado)
  const [mapTileStyle, setMapTileStyle] = useState<'carto-light' | 'carto-dark' | 'osm'>('carto-light');
  const [allFixes, setAllFixes] = useState<AeronauticalFix[]>(OFFLINE_AERONAUTICAL_FIXES);
  const [isLoadingFixes, setIsLoadingFixes] = useState<boolean>(false);
  
  // Layer visibility toggles
  const [showAirports, setShowAirports] = useState<boolean>(true);
  const [showHelipads, setShowHelipads] = useState<boolean>(false);
  const [showVors, setShowVors] = useState<boolean>(true);
  const [showWaypoints, setShowWaypoints] = useState<boolean>(true);
  const [showRouteLine, setShowRouteLine] = useState<boolean>(true);
  const [showFixLabels, setShowFixLabels] = useState<boolean>(false);

  // Map Tile Source URLs (Using CARTO & OpenStreetMap as requested)
  const tileUrls = {
    'carto-light': 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    'carto-dark': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    'osm': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center map around origin waypoint if available, or default
    const initialLat = waypoints.length > 0 ? waypoints[0].lat : -15.78;
    const initialLng = waypoints.length > 0 ? waypoints[0].lng : -47.92;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: mapZoom,
      zoomControl: false,
      attributionControl: false,
    });

    const tileLayer = L.tileLayer(tileUrls[mapTileStyle], {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Track move/zoom events
    const handleMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      setMapZoom(zoom);
      setMapCenter([center.lat, center.lng]);
    };

    map.on('moveend', handleMoveEnd);

    // Initial load
    fetchFixesForMapArea(initialLat, initialLng, 350);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer when style changes
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    const newTile = L.tileLayer(tileUrls[mapTileStyle], {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(mapRef.current);
    tileLayerRef.current = newTile;
  }, [mapTileStyle]);

  // Fetch fixes when center changes with debounce
  const fetchFixesForMapArea = async (lat: number, lng: number, radiusNm: number) => {
    setIsLoadingFixes(true);
    try {
      const fixes = await fetchNearbyFixes(lat, lng, radiusNm);
      setAllFixes((prev) => {
        const fixMap = new Map<string, AeronauticalFix>();
        prev.forEach((f) => fixMap.set(f.identifier, f));
        fixes.forEach((f) => fixMap.set(f.identifier, f));
        return Array.from(fixMap.values());
      });
    } catch (e) {
      console.warn('Map fixes fetch error:', e);
    } finally {
      setIsLoadingFixes(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        fetchFixesForMapArea(mapCenter[0], mapCenter[1], mapZoom < 6 ? 600 : mapZoom < 10 ? 300 : 150);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [mapCenter, mapZoom]);

  // Calculate Level of Detail (LOD) tier cutoff
  const maxTier = useMemo(() => {
    return maxTierVisible(mapZoom, manualLodBias);
  }, [mapZoom, manualLodBias]);

  // Filter visible aeronautical fixes based on LOD & layer toggles
  const visibleFixes = useMemo(() => {
    return allFixes.filter((fix) => {
      const isRouteFix = waypoints.some((wp) => wp.identifier === fix.identifier);

      if (fix.type === 'airport') {
        const isHeli = isHelipadFix(fix);

        // Helipads toggle check
        if (isHeli && !showHelipads && !isRouteFix) return false;

        // General airports toggle check
        if (!isHeli && !showAirports && !isRouteFix) return false;

        // LOD Tier filter
        const tier = airportTier(fix);
        return isRouteFix || tier <= maxTier;
      }

      if (fix.type === 'vor') {
        if (!showVors && !isRouteFix) return false;
        const tier = navaidTier(fix);
        return isRouteFix || tier <= maxTier;
      }

      if (fix.type === 'fix') {
        if (!showWaypoints && !isRouteFix) return false;
        const tier = waypointTier(fix);
        return isRouteFix || tier <= maxTier;
      }

      return true;
    });
  }, [allFixes, maxTier, waypoints, showAirports, showHelipads, showVors, showWaypoints]);

  // Render Markers and Route Polyline
  useEffect(() => {
    if (!mapRef.current || !markersLayerGroupRef.current || !routeLayerGroupRef.current) return;

    markersLayerGroupRef.current.clearLayers();
    routeLayerGroupRef.current.clearLayers();

    const isZoomedIn = mapZoom >= 7;
    const isDarkMap = mapTileStyle === 'carto-dark';
    
    // Text outline / halo style for high contrast on any map tile
    const textHaloStyle = isDarkMap
      ? 'text-shadow: 0px 0px 3px #020617, 0px 0px 3px #020617, 0px 1px 2px #000000;'
      : 'text-shadow: 0px 0px 3px #ffffff, 0px 0px 3px #ffffff, 0px 0px 4px #ffffff, 0px 1px 2px rgba(0,0,0,0.6);';

    // 1. Render Aeronautical Markers
    visibleFixes.forEach((fix) => {
      const isOrigin = waypoints.length > 0 && waypoints[0].identifier === fix.identifier;
      const isDest = waypoints.length > 1 && waypoints[waypoints.length - 1].identifier === fix.identifier;
      const isWaypt = waypoints.some((wp) => wp.identifier === fix.identifier);
      const isRouteEndpoint = isOrigin || isDest;

      let customHtml = '';

      if (fix.type === 'airport') {
        const isHeli = isHelipadFix(fix);

        let iconGraphic = '';
        if (isHeli) {
          iconGraphic = `
            <div class="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm shadow-rose-950/30 flex items-center justify-center transition-transform duration-200 group-hover:scale-140">
              <span class="text-[8px] font-black text-white leading-none select-none">H</span>
            </div>
          `;
        } else {
          const dotStyle = isOrigin
            ? 'bg-amber-500 border-2 border-amber-200 shadow-md shadow-amber-500/40 scale-125'
            : isDest
            ? 'bg-emerald-500 border-2 border-emerald-200 shadow-md shadow-emerald-500/40 scale-125'
            : fix.iata
            ? 'bg-sky-500 shadow-sm shadow-sky-900/30'
            : 'bg-slate-400 shadow-sm shadow-slate-900/30';

          iconGraphic = `
            <div class="relative flex items-center justify-center">
              ${isOrigin ? `<div class="absolute w-5 h-5 rounded-full bg-amber-400/40 animate-ping pointer-events-none"></div>` : ''}
              ${isDest ? `<div class="absolute w-5 h-5 rounded-full bg-emerald-400/40 animate-ping pointer-events-none"></div>` : ''}
              <div class="w-3.5 h-3.5 rounded-full ${dotStyle} flex items-center justify-center transition-transform duration-200 group-hover:scale-140">
                <div class="w-1 h-1 bg-white/90 rounded-full shadow-xs"></div>
              </div>
            </div>
          `;
        }

        const textColor = isOrigin
          ? 'text-amber-600 font-black'
          : isDest
          ? 'text-emerald-600 font-black'
          : isHeli
          ? 'text-rose-400 font-black'
          : isDarkMap
          ? 'text-sky-300 font-extrabold'
          : 'text-slate-950 font-black';

        customHtml = `
          <div class="relative group flex items-center justify-center cursor-pointer">
            ${iconGraphic}

            <!-- Plain High-Contrast Text (NO BADGE / NO BACKGROUND BOX) -->
            <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-0.5 flex flex-col items-center pointer-events-none transition-all duration-200 ${
              isZoomedIn || isRouteEndpoint || showFixLabels
                ? 'opacity-100 translate-y-0 scale-100 z-20'
                : 'opacity-0 translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 z-30'
            }">
              <span class="font-mono text-[11px] tracking-tight whitespace-nowrap select-none ${textColor}" style="${textHaloStyle}">
                ${fix.identifier}
              </span>
            </div>
          </div>
        `;
      } else if (fix.type === 'vor') {
        const textColor = isWaypt
          ? 'text-amber-600 font-black'
          : isDarkMap
          ? 'text-indigo-300 font-extrabold'
          : 'text-indigo-950 font-black';

        customHtml = `
          <div class="relative group flex items-center justify-center cursor-pointer">
            <div class="w-3 h-3 bg-indigo-500 rounded-xs rotate-45 shadow-sm shadow-indigo-950/40 flex items-center justify-center transition-transform duration-200 group-hover:scale-140 group-hover:bg-amber-400">
              <div class="w-1 h-1 bg-amber-300 rounded-full"></div>
            </div>

            <!-- Plain High-Contrast Text (NO BADGE / NO BACKGROUND BOX) -->
            <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-0.5 flex flex-col items-center pointer-events-none transition-all duration-200 ${
              isZoomedIn || isWaypt || showFixLabels
                ? 'opacity-100 translate-y-0 scale-100 z-20'
                : 'opacity-0 translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 z-30'
            }">
              <span class="font-mono text-[10px] tracking-tight whitespace-nowrap select-none ${textColor}" style="${textHaloStyle}">
                ${fix.identifier}
              </span>
            </div>
          </div>
        `;
      } else {
        // Waypoint / RNAV Fix
        const textColor = isWaypt
          ? 'text-amber-600 font-black'
          : isDarkMap
          ? 'text-teal-300 font-extrabold'
          : 'text-teal-950 font-black';

        customHtml = `
          <div class="relative group flex items-center justify-center cursor-pointer">
            <div class="w-2.5 h-2.5 rotate-45 ${
              isWaypt ? 'bg-amber-400 scale-125 shadow-md shadow-amber-500/40' : 'bg-teal-400 shadow-sm shadow-teal-950/40'
            } transition-transform duration-200 group-hover:scale-140 group-hover:bg-amber-300">
            </div>

            <!-- Plain High-Contrast Text (NO BADGE / NO BACKGROUND BOX) -->
            <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-0.5 flex flex-col items-center pointer-events-none transition-all duration-200 ${
              isZoomedIn || isWaypt || showFixLabels
                ? 'opacity-100 translate-y-0 scale-100 z-20'
                : 'opacity-0 translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 z-30'
            }">
              <span class="font-mono text-[10px] tracking-tight whitespace-nowrap select-none ${textColor}" style="${textHaloStyle}">
                ${fix.identifier}
              </span>
            </div>
          </div>
        `;
      }

      const divIcon = L.divIcon({
        html: customHtml,
        className: 'custom-fix-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([fix.lat, fix.lng], { icon: divIcon });

      // Interactive Popup Content
      const popupHtml = `
        <div class="p-1 space-y-2 font-sans text-xs min-w-[180px]">
          <div class="border-b border-slate-200 pb-1">
            <span class="text-[9px] font-bold uppercase text-slate-400 block">${fix.type.toUpperCase()} • ${fix.country || 'AERONÁUTICO'}</span>
            <h5 class="font-extrabold text-slate-900 text-sm leading-tight">${fix.identifier} ${fix.iata ? `(${fix.iata})` : ''}</h5>
            <p class="text-[10px] text-slate-600 font-medium">${fix.name}</p>
          </div>

          <div class="grid grid-cols-2 gap-1 text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200 font-mono">
            <div><span className="text-slate-400">LAT:</span> ${fix.lat.toFixed(4)}</div>
            <div><span className="text-slate-400">LON:</span> ${fix.lng.toFixed(4)}</div>
            ${fix.freq ? `<div class="col-span-2 text-indigo-700 font-bold"><span class="text-slate-400">FREQ:</span> ${fix.freq}</div>` : ''}
            ${fix.elevationFt ? `<div class="col-span-2 text-slate-700"><span class="text-slate-400">ALT:</span> ${fix.elevationFt} ft</div>` : ''}
          </div>

          <div class="space-y-1 pt-1">
            <button id="btn-orig-${fix.identifier}" class="w-full text-left py-1 px-2 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-200 flex items-center justify-between cursor-pointer">
              <span>🛫 Definir como Origem</span>
              <span>➔</span>
            </button>
            <button id="btn-dest-${fix.identifier}" class="w-full text-left py-1 px-2 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-200 flex items-center justify-between cursor-pointer">
              <span>🛬 Definir como Destino</span>
              <span>➔</span>
            </button>
            <button id="btn-add-${fix.identifier}" class="w-full text-left py-1 px-2 rounded bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-[11px] border border-sky-200 flex items-center justify-between cursor-pointer">
              <span>➕ Adicionar à Rota</span>
              <span>+</span>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        setTimeout(() => {
          document.getElementById(`btn-orig-${fix.identifier}`)?.addEventListener('click', () => {
            onSelectFix(fix, 'origin');
            marker.closePopup();
          });
          document.getElementById(`btn-dest-${fix.identifier}`)?.addEventListener('click', () => {
            onSelectFix(fix, 'destination');
            marker.closePopup();
          });
          document.getElementById(`btn-add-${fix.identifier}`)?.addEventListener('click', () => {
            onSelectFix(fix, 'add');
            marker.closePopup();
          });
        }, 50);
      });

      markersLayerGroupRef.current.addLayer(marker);
    });

    // 2. Render Flight Route Polyline with Great Circle curvature
    if (showRouteLine && waypoints.length >= 2) {
      const latLngs: [number, number][] = [];

      for (let i = 0; i < waypoints.length - 1; i++) {
        const wp1 = waypoints[i];
        const wp2 = waypoints[i + 1];

        const gcPoints = interpolateGreatCircle(wp1.lat, wp1.lng, wp2.lat, wp2.lng, 10);
        latLngs.push(...gcPoints);
      }

      const polyline = L.polyline(latLngs, {
        color: '#f59e0b', // Amber line
        weight: 3.5,
        opacity: 0.9,
        dashArray: '8, 6',
      });

      routeLayerGroupRef.current.addLayer(polyline);
    }
  }, [visibleFixes, waypoints, showFixLabels, showRouteLine, mapZoom]);

  // Fit bounds when route points change significantly
  const handleFitRouteBounds = () => {
    if (!mapRef.current || waypoints.length === 0) return;
    const bounds = L.latLngBounds(waypoints.map((wp) => [wp.lat, wp.lng]));
    mapRef.current.fitBounds(bounds, { padding: [60, 60] });
  };

  return (
    <div className="relative w-full h-[450px] md:h-[550px] lg:h-[620px] rounded-xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-900">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0"></div>

      {/* Map Control Top Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Side: AIRAC LOD Slider (Level of Detail Control) */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-2 rounded-xl text-white shadow-lg pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Nível de Detalhe (LOD):</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">Limpo</span>
            <input
              type="range"
              min={-2}
              max={2}
              step={1}
              value={manualLodBias}
              onChange={(e) => setManualLodBias(parseInt(e.target.value))}
              className="w-20 sm:w-28 accent-amber-500 cursor-pointer"
              title="Ajuste manual de densidade de waypoints/aeroportos no mapa"
            />
            <span className="text-[10px] text-slate-400 font-mono">Detalhado</span>
          </div>

          <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
            Tier ≤ {maxTier}
          </span>
        </div>

        {/* Right Side: Map Controls */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl text-white shadow-lg pointer-events-auto flex items-center gap-1.5">
          {/* Tile Selector */}
          <button
            onClick={() =>
              setMapTileStyle((prev) =>
                prev === 'carto-light' ? 'carto-dark' : prev === 'carto-dark' ? 'osm' : 'carto-light'
              )
            }
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Alternar estilo de mapa (Claro / Escuro / OSM)"
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline uppercase text-[10px]">{mapTileStyle.replace('carto-', '')}</span>
          </button>

          {/* Fit Route Bounds */}
          {waypoints.length > 0 && (
            <button
              onClick={handleFitRouteBounds}
              className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 border border-amber-400/40"
              title="Centralizar rota inteira no mapa"
            >
              <Navigation className="w-4 h-4" />
              <span className="hidden sm:inline text-[10px]">Enquadrar Rota</span>
            </button>
          )}
        </div>
      </div>

      {/* Layer Toggles Bar (Aeroportos, VORs, Waypoints, Rota, Etiquetas) */}
      <div className="absolute top-16 left-3 z-10 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl text-white shadow-xl pointer-events-auto flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1 hidden sm:inline flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Camadas:</span>
          </span>

          {/* Toggle Airports */}
          <button
            onClick={() => setShowAirports(!showAirports)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              showAirports
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 shadow-xs'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Exibir/Ocultar Aeroportos no Mapa"
          >
            <span>✈️</span>
            <span>Aeroportos</span>
          </button>

          {/* Toggle Helipads */}
          <button
            onClick={() => setShowHelipads(!showHelipads)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              showHelipads
                ? 'bg-rose-500/20 text-rose-300 border-rose-400/50 shadow-xs'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Exibir/Ocultar Helipontos e Helidecks no Mapa"
          >
            <span>🚁</span>
            <span>Helipontos</span>
          </button>

          {/* Toggle VORs */}
          <button
            onClick={() => setShowVors(!showVors)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              showVors
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50 shadow-xs'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Exibir/Ocultar Radioauxílios VOR"
          >
            <span>📡</span>
            <span>VORs</span>
          </button>

          {/* Toggle Waypoints */}
          <button
            onClick={() => setShowWaypoints(!showWaypoints)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              showWaypoints
                ? 'bg-teal-500/20 text-teal-300 border-teal-400/50 shadow-xs'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Exibir/Ocultar Waypoints e Fixos RNAV"
          >
            <span>🔷</span>
            <span>Waypoints</span>
          </button>

          {/* Toggle Active Route Line */}
          <button
            onClick={() => setShowRouteLine(!showRouteLine)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              showRouteLine
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-xs'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Exibir/Ocultar Linha da Rota de Voo"
          >
            <span>🛣️</span>
            <span>Linha Rota</span>
          </button>

          {/* Toggle Force Labels */}
          <button
            onClick={() => setShowFixLabels(!showFixLabels)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              showFixLabels
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-xs'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Forçar exibição de Etiquetas/Códigos ICAO de todos os pontos"
          >
            <Eye className="w-3 h-3 text-emerald-400" />
            <span>Sempre Exibir Etiquetas</span>
          </button>
        </div>
      </div>

      {/* Loading Indicator on Map */}
      {isLoadingFixes && (
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 text-sky-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-md flex items-center gap-2 pointer-events-none">
          <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
          <span>Carregando dados AIRAC da região...</span>
        </div>
      )}

      {/* Map Footer Info */}
      <div className="absolute bottom-3 right-3 z-10 bg-slate-900/80 text-slate-400 text-[9px] font-mono px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
        Leaflet | © CARTO © OpenStreetMap • AIRAC.NET
      </div>
    </div>
  );
};
