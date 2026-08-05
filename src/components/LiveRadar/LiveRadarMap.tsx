import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OnlinePilotData } from '../../types/telemetry';

export type AircraftCategory = 'light' | 'medium' | 'heavy' | 'helicopter';

export function getAircraftCategory(aircraftTitle?: string): AircraftCategory {
  if (!aircraftTitle) return 'medium';
  const title = aircraftTitle.toLowerCase();

  // Rotorcraft / Helicopters
  if (
    title.includes('helo') ||
    title.includes('copter') ||
    title.includes('h125') ||
    title.includes('h135') ||
    title.includes('h145') ||
    title.includes('r44') ||
    title.includes('r66') ||
    title.includes('bell') ||
    title.includes('sikorsky') ||
    title.includes('ec135') ||
    title.includes('eurocopter') ||
    title.includes('agusta') ||
    title.includes('cabri')
  ) {
    return 'helicopter';
  }

  // Heavy / Widebody Airliners & Cargo
  if (
    title.includes('747') ||
    title.includes('777') ||
    title.includes('787') ||
    title.includes('a330') ||
    title.includes('a340') ||
    title.includes('a350') ||
    title.includes('a380') ||
    title.includes('c-17') ||
    title.includes('an-124') ||
    title.includes('beluga') ||
    title.includes('heavy') ||
    title.includes('dreamliner')
  ) {
    return 'heavy';
  }

  // Light / General Aviation (Monomotor/Bimotor leve)
  if (
    title.includes('cessna') ||
    title.includes('c172') ||
    title.includes('c152') ||
    title.includes('c208') ||
    title.includes('piper') ||
    title.includes('pa28') ||
    title.includes('pa34') ||
    title.includes('seneca') ||
    title.includes('baron') ||
    title.includes('bonanza') ||
    title.includes('cirrus') ||
    title.includes('sr22') ||
    title.includes('sr20') ||
    title.includes('cub') ||
    title.includes('diamond') ||
    title.includes('da40') ||
    title.includes('da62') ||
    title.includes('mooney') ||
    title.includes('tbm') ||
    title.includes('beechcraft') ||
    title.includes('pitts') ||
    title.includes('extra') ||
    title.includes('ultralight') ||
    title.includes('savage') ||
    title.includes('vl3')
  ) {
    return 'light';
  }

  // Medium Airliners / Regional / Executive Jets
  return 'medium';
}

function renderAircraftSvg(category: AircraftCategory, colorHex: string, size: number) {
  if (category === 'helicopter') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${colorHex}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
        <path d="M12 2C11.45 2 11 2.45 11 3V10.1C9.84 10.54 9 11.67 9 13C9 14.66 10.34 16 12 16C13.66 16 15 14.66 15 13C15 11.67 14.16 10.54 13 10.1V3C13 2.45 12.55 2 12 2ZM3 12V14H21V12H3ZM12 16V20.5L9 22V23L12 22.5L15 23V22L12 20.5Z"/>
      </svg>
    `;
  }

  if (category === 'light') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${colorHex}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
        <path d="M12 2L10.5 9H4L3 11L10.5 13V18L8.5 19.5V21L12 20L15.5 21V19.5L13.5 18V13L21 11L20 9H13.5L12 2Z"/>
      </svg>
    `;
  }

  if (category === 'heavy') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${colorHex}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
        <path d="M12 1L10 8H2L1 10.5L10 13.5V18.5L7.5 20.5V22.5L12 21L16.5 22.5V20.5L14 18.5V13.5L23 10.5L22 8H14L12 1Z"/>
      </svg>
    `;
  }

  // Medium (Commercial airliner / Executive Jet)
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${colorHex}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>
  `;
}

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

    // Default center in Brazil
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

  // Render minimalist aircraft markers for online pilots
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    if (pilots.length === 0) return;

    const bounds = L.latLngBounds([]);

    const categoryLabelMap: Record<AircraftCategory, string> = {
      light: 'Pequeno Porte (GA)',
      medium: 'Médio Porte (Jato/Comercial)',
      heavy: 'Grande Porte (Widebody)',
      helicopter: 'Helicóptero / Rotor',
    };

    pilots.forEach((pilot) => {
      const isUser = pilot.token === userToken;
      const isSelected = pilot.token === selectedPilotToken;
      const isAirborne = !pilot.onGround;

      bounds.extend([pilot.latitude, pilot.longitude]);

      const category = getAircraftCategory(pilot.aircraftTitle);

      // Icon sizes per category
      const sizeMap: Record<AircraftCategory, number> = {
        light: 22,
        helicopter: 22,
        medium: 26,
        heavy: 32,
      };
      const iconSize = sizeMap[category];

      // Icon color selection
      let colorHex = '#34d399'; // Emerald-400 default airborne
      if (isUser) {
        colorHex = '#f59e0b'; // Amber-500
      } else if (isSelected) {
        colorHex = '#38bdf8'; // Sky-400
      } else if (!isAirborne) {
        colorHex = '#94a3b8'; // Slate-400 on ground
      }

      const svgContent = renderAircraftSvg(category, colorHex, iconSize);

      // Minimalist plane icon HTML (no borders, no circles, no default tags)
      const customIcon = L.divIcon({
        className: 'custom-radar-plane-icon',
        html: `
          <div class="relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-125'
          }">
            ${svgContent}
          </div>
        `,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
      });

      const marker = L.marker([pilot.latitude, pilot.longitude], { icon: customIcon });

      // Hover Tooltip
      const tooltipContent = `
        <div class="font-sans text-xs font-semibold text-slate-100 flex flex-col gap-0.5">
          <div class="flex items-center gap-1.5 font-extrabold text-sky-400">
            <span>${pilot.pilotName || pilot.callsign || 'Piloto VFR'}</span>
            ${isUser ? '<span class="text-[9px] bg-amber-500 text-slate-900 px-1 rounded font-black">VOCÊ</span>' : ''}
          </div>
          <div class="text-[10px] text-slate-300">
            ${pilot.aircraftTitle || 'Aeronave'} • <span class="text-slate-400">${categoryLabelMap[category]}</span>
          </div>
          <div class="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 pt-0.5">
            <span class="${pilot.onGround ? 'text-amber-400 font-bold' : 'text-emerald-400'}">${pilot.onGround ? 'No Solo' : 'Em Voo'}</span>
            ${pilot.airportIcao ? `<span>•</span> <span class="text-sky-300 font-bold">${pilot.airportIcao}</span>` : ''}
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -8],
        className: 'custom-radar-tooltip',
      });

      // Click Popup for deep flight details
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
              <span class="text-slate-500">Porte:</span>
              <span class="font-bold text-slate-700">${categoryLabelMap[category]}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Aeroporto:</span>
              <span class="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">${pilot.airportIcao || '---'}</span>
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

