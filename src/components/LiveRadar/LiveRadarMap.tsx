import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OnlinePilotData } from '../../types/telemetry';

interface LiveRadarMapProps {
  pilots: OnlinePilotData[];
  selectedPilotToken: string | null;
  onSelectPilot: (pilot: OnlinePilotData | null) => void;
  userToken: string;
  mapStyle: 'carto-dark' | 'carto-light' | 'osm';
  onStyleChange: (style: 'carto-dark' | 'carto-light' | 'osm') => void;
}

export const LiveRadarMap: React.FC<LiveRadarMapProps> = ({
  pilots,
  selectedPilotToken,
  onSelectPilot,
  userToken,
  mapStyle,
  onStyleChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const tileConfigs = {
    'carto-dark': {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      options: {
        maxZoom: 19,
        maxNativeZoom: 18,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      },
    },
    'carto-light': {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      options: {
        maxZoom: 19,
        maxNativeZoom: 18,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      },
    },
    'osm': {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        maxZoom: 19,
        maxNativeZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap contributors',
      },
    },
  };

  const createTileLayer = (style: 'carto-dark' | 'carto-light' | 'osm') => {
    const config = tileConfigs[style] || tileConfigs['carto-dark'];
    return L.tileLayer(config.url, config.options);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center in Brazil (Guarulhos area or center of South America)
    const map = L.map(mapContainerRef.current, {
      center: [-15.7801, -47.9292],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileLayer = createTileLayer(mapStyle).addTo(map);
    tileLayerRef.current = tileLayer;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapRef.current = map;

    // Adjust container size
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map tile style
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    const newTile = createTileLayer(mapStyle).addTo(mapRef.current);
    tileLayerRef.current = newTile;
    mapRef.current.invalidateSize();
  }, [mapStyle]);

  // Render aircraft markers for online pilots
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    if (pilots.length === 0) return;

    const bounds = L.latLngBounds([]);

    pilots.forEach((pilot) => {
      const isUser = pilot.token === userToken;
      const isSelected = pilot.token === selectedPilotToken;
      const isAirborne = !pilot.onGround;

      bounds.extend([pilot.latitude, pilot.longitude]);

      // Aircraft Marker HTML
      const badgeColor = isAirborne ? 'bg-emerald-500' : 'bg-amber-500';
      const haloAnimation = isAirborne ? 'animate-ping' : '';
      const ringColor = isSelected
        ? 'ring-4 ring-sky-400 ring-offset-2 ring-offset-slate-900 scale-125 z-50'
        : isUser
        ? 'ring-2 ring-amber-400 scale-110'
        : '';

      const customIcon = L.divIcon({
        className: 'custom-radar-plane-icon',
        html: `
          <div class="relative flex items-center justify-center transition-all duration-300">
            <!-- Pulsing Halo if airborne -->
            <div class="absolute w-8 h-8 rounded-full ${badgeColor} opacity-30 ${haloAnimation}"></div>
            
            <!-- Aircraft Body Marker -->
            <div class="relative w-8 h-8 rounded-full ${
              isUser ? 'bg-amber-500' : isAirborne ? 'bg-emerald-600' : 'bg-slate-700'
            } text-white flex items-center justify-center shadow-lg border-2 border-white ${ringColor}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>

            <!-- Callsign Label Tag -->
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md border border-slate-700 pointer-events-none">
              ${pilot.callsign || pilot.pilotName || pilot.token}
              ${isUser ? ' <span class="text-amber-400 font-extrabold">(VOCÊ)</span>' : ''}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([pilot.latitude, pilot.longitude], { icon: customIcon });

      // Build Rich Popup
      const popupContent = `
        <div class="p-1 min-w-[220px] font-sans text-slate-800">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <div>
              <div class="text-xs font-black uppercase text-slate-900 flex items-center gap-1">
                ${pilot.pilotName || pilot.callsign || 'Piloto VFR'}
              </div>
              <div class="text-[10px] text-slate-500 font-mono">Token: ${pilot.token}</div>
            </div>
            <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded ${
              pilot.onGround ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }">
              ${pilot.onGround ? 'No Solo / Táxi' : 'Em Voo'}
            </span>
          </div>

          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Aeronave:</span>
              <span class="font-bold text-slate-900">${pilot.aircraftTitle || 'Aeronave'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Aeroporto:</span>
              <span class="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">${pilot.airportIcao || '---'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Altitude:</span>
              <span class="font-mono font-bold text-slate-800">${Math.round(pilot.altitudeFt)} ft</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Velocidade:</span>
              <span class="font-mono font-bold text-slate-800">${Math.round(pilot.groundSpeedKts)} kts</span>
            </div>
            <div class="flex justify-between text-[10px] pt-1.5 border-t border-slate-100 text-slate-400">
              <span>Coordenadas:</span>
              <span class="font-mono">${pilot.latitude.toFixed(4)}, ${pilot.longitude.toFixed(4)}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'custom-radar-popup',
      });

      marker.on('click', () => {
        onSelectPilot(pilot);
      });

      markersGroup.addLayer(marker);
    });

    // Auto-fit bounds if first load or requested
    if (bounds.isValid() && pilots.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [pilots, selectedPilotToken, userToken]);

  // Center on selected pilot if changed
  useEffect(() => {
    if (!mapRef.current || !selectedPilotToken) return;
    const target = pilots.find((p) => p.token === selectedPilotToken);
    if (target) {
      mapRef.current.flyTo([target.latitude, target.longitude], 10, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedPilotToken, pilots]);

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-xl overflow-hidden border border-slate-700/80 shadow-lg">
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px] z-0 bg-slate-900" />

      {/* Map Layer Switcher Floating Button */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700 shadow-lg flex items-center gap-1 text-xs">
        <button
          onClick={() => onStyleChange('carto-dark')}
          className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
            mapStyle === 'carto-dark'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Dark Radar
        </button>
        <button
          onClick={() => onStyleChange('carto-light')}
          className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
            mapStyle === 'carto-light'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Voyager
        </button>
        <button
          onClick={() => onStyleChange('osm')}
          className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
            mapStyle === 'osm'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          OSM
        </button>
      </div>
    </div>
  );
};
