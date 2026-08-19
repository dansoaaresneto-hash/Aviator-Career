import React, { useEffect, useRef, useState } from 'react';
import { Contract } from '../../../types';
import { usePilot } from '../../../context/PilotContext';
import { useTelemetry } from '../../../context/TelemetryContext';
import { RouteWaypointsBar, RouteWaypoint, getRouteWaypoints } from './RouteWaypointsBar';
import {
  Navigation,
  Compass,
  Gauge,
  MapPin,
  Plane,
  Radio,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface FlightMapLiveViewProps {
  contract: Contract;
}

export const FlightMapLiveView: React.FC<FlightMapLiveViewProps> = ({ contract }) => {
  const { airportPool, flightProgress, flightPhase, currentLocationIcao } = usePilot();
  const { telemetry } = useTelemetry();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  const [selectedWp, setSelectedWp] = useState<RouteWaypoint | null>(null);

  // Busca coordenadas dos aeroportos
  const depAp = airportPool.find((a) => a.icao === contract.route.departureIcao);
  const arrAp = airportPool.find((a) => a.icao === contract.route.arrivalIcao);
  const poeAp = contract.ferryDossier
    ? airportPool.find((a) => a.icao === contract.ferryDossier?.portOfEntryIcao)
    : null;

  // Fallback de coordenadas caso não estejam no pool
  const depLat = depAp?.lat || 25.7959;
  const depLng = depAp?.lng || -80.2870;
  const arrLat = arrAp?.lat || -5.7689;
  const arrLng = arrAp?.lng || -35.3664;
  const poeLat = poeAp?.lat || -5.7689;
  const poeLng = poeAp?.lng || -35.3664;

  // Interpolação para a posição do avião
  const planeProgressRatio = Math.max(0, Math.min(100, flightProgress)) / 100;
  const currentPlaneLat =
    telemetry.latitude !== 0
      ? telemetry.latitude
      : depLat + (arrLat - depLat) * planeProgressRatio;
  const currentPlaneLng =
    telemetry.longitude !== 0
      ? telemetry.longitude
      : depLng + (arrLng - depLng) * planeProgressRatio;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let L: any = (window as any).L;
    if (!L) return;

    try {
      if (!leafletMapRef.current) {
        // Inicializa o mapa com estilo escuro Alidade Smooth Dark / CartoDB Dark Matter
        const map = L.map(mapContainerRef.current, {
          center: [(depLat + arrLat) / 2, (depLng + arrLng) / 2],
          zoom: 4,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          {
            maxZoom: 18,
            subdomains: 'abcd',
          }
        ).addTo(map);

        leafletMapRef.current = map;
      }

      const map = leafletMapRef.current;

      // Limpa camadas anteriores se houver
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Polyline || layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      // Linha de rota traçada com brilho azul
      const routePoints: [number, number][] = [
        [depLat, depLng],
        [arrLat, arrLng],
      ];

      if (poeAp && contract.type === 'ferry') {
        routePoints.splice(1, 0, [poeLat, poeLng]);
      }

      // Linha de fundo escura
      L.polyline(routePoints, {
        color: '#0284c7',
        weight: 3,
        opacity: 0.8,
        dashArray: '6, 6',
      }).addTo(map);

      // Marcador de Partida
      const depMarker = L.circleMarker([depLat, depLng], {
        radius: 6,
        fillColor: '#38bdf8',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);
      depMarker.bindPopup(`<b>${contract.route.departureIcao}</b><br>Origem`);

      // Marcador de Destino
      const arrMarker = L.circleMarker([arrLat, arrLng], {
        radius: 6,
        fillColor: '#10b981',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);
      arrMarker.bindPopup(`<b>${contract.route.arrivalIcao}</b><br>Destino Final`);

      // Marcador de POE se houver
      if (poeAp && contract.type === 'ferry') {
        const poeMarker = L.circleMarker([poeLat, poeLng], {
          radius: 5,
          fillColor: '#fbbf24',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1,
        }).addTo(map);
        poeMarker.bindPopup(`<b>${poeAp.icao}</b><br>Port of Entry`);
      }

      // Ícone do avião em voo
      const planeIcon = L.divIcon({
        className: 'plane-marker',
        html: `<div style="transform: rotate(${telemetry.heading || 45}deg); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: rgba(14, 165, 233, 0.25); border: 2px solid #38bdf8; border-radius: 50%; box-shadow: 0 0 12px rgba(56, 189, 248, 0.8);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
          </svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([currentPlaneLat, currentPlaneLng], { icon: planeIcon }).addTo(map);

      // Ajusta zoom
      const bounds = L.latLngBounds(routePoints);
      map.fitBounds(bounds, { padding: [40, 40] });
    } catch (err) {
      console.warn('Leaflet error:', err);
    }
  }, [depLat, depLng, arrLat, arrLng, currentPlaneLat, currentPlaneLng, telemetry.heading]);

  const handleZoomIn = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomOut();
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[480px] bg-slate-950 rounded-xl overflow-hidden flex flex-col justify-between border border-slate-800 shadow-inner">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-950" />

      {/* Top Floating Telemetry Overlay on Map */}
      <div className="relative z-10 p-3 sm:p-4 flex items-start justify-between gap-3 pointer-events-none">
        {/* Left Status Pills */}
        <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-white text-xs font-mono flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-sky-400">{contract.route.departureIcao}</span>
            <span className="text-slate-500">➔</span>
            <span className="font-bold text-emerald-400">{contract.route.arrivalIcao}</span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/80 text-slate-300 text-xs font-mono flex items-center gap-1.5 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>HDG {Math.round(telemetry.heading || 120)}°</span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/80 text-slate-300 text-xs font-mono flex items-center gap-1.5 shadow-sm">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>{Math.round(telemetry.groundSpeed || 0)} KT</span>
          </div>
        </div>

        {/* Right Zoom Controls */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 bg-slate-900/90 hover:bg-slate-800 text-white rounded-lg border border-slate-700 flex items-center justify-center cursor-pointer transition-all shadow-xs"
            title="Aproximar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 bg-slate-900/90 hover:bg-slate-800 text-white rounded-lg border border-slate-700 flex items-center justify-center cursor-pointer transition-all shadow-xs"
            title="Afastar Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Waypoint Info Floating Card */}
      {selectedWp && (
        <div className="relative z-10 mx-4 mb-2 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-lg text-white text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-sky-400" />
            <div>
              <span className="font-mono font-black text-white text-sm">{selectedWp.name}</span>
              <span className="text-[10px] text-slate-400 ml-2">
                {selectedWp.type === 'airport' ? 'Aeródromo' : selectedWp.type === 'poe' ? 'Port of Entry' : 'Fixo de Rota (RNAV)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right font-mono text-[11px]">
            <div>
              <span className="text-slate-400 block text-[9px]">Distância da Partida</span>
              <strong className="text-sky-400">{selectedWp.distanceFromDepNm} NM</strong>
            </div>
            {selectedWp.freq && (
              <div>
                <span className="text-slate-400 block text-[9px]">Freq VOR</span>
                <strong className="text-amber-400">{selectedWp.freq} MHz</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Waypoints Bar */}
      <div className="relative z-10 w-full">
        <RouteWaypointsBar
          contract={contract}
          selectedWaypoint={selectedWp?.name}
          onSelectWaypoint={(wp) => setSelectedWp(wp)}
        />
      </div>
    </div>
  );
};
