import React from 'react';
import { Contract } from '../../../types';

export interface RouteWaypoint {
  name: string;
  type: 'airport' | 'fix' | 'vor' | 'poe';
  lat?: number;
  lng?: number;
  freq?: string;
  distanceFromDepNm?: number;
}

interface RouteWaypointsBarProps {
  contract: Contract;
  selectedWaypoint?: string | null;
  onSelectWaypoint?: (wp: RouteWaypoint) => void;
}

// Gera fixos e waypoints realistas baseados na rota
export const getRouteWaypoints = (contract: Contract): RouteWaypoint[] => {
  const dep = contract.route.departureIcao;
  const arr = contract.route.arrivalIcao;
  const dist = contract.route.distanceNm || 1200;
  const poe = contract.ferryDossier?.portOfEntryIcao || 'SBSG';

  // Fixos padrão ou gerados
  const standardFixes: Record<string, string[]> = {
    'KMIA-SBSG': ['DIKAT', 'BORDO', 'ANADA', 'TNP', 'SOCA', 'SBSG'],
    'KMIA-SBGR': ['DIKAT', 'FOWEE', 'BQN', 'TTPP', 'SBEG', 'BSB', 'SBGR'],
    'LPPT-SBSG': ['PORTO', 'LANTU', 'GVAC', 'RAKSO', 'EDUMO', 'SBSG'],
    'KJFK-SBGL': ['MERIT', 'DIKAT', 'BQN', 'SOCA', 'SBRF', 'SBGL'],
  };

  const routeKey = `${dep}-${arr}`;
  const customFixNames = standardFixes[routeKey] || [
    'DIKAT',
    'FOWEE',
    'BORDO',
    'ANADA',
    'SOCA',
    'KOLOS',
    'DIKAT',
  ];

  const waypoints: RouteWaypoint[] = [
    {
      name: dep,
      type: 'airport',
      distanceFromDepNm: 0,
    },
  ];

  const totalSegments = customFixNames.length + (contract.type === 'ferry' ? 2 : 1);
  const stepDist = Math.round(dist / totalSegments);

  customFixNames.forEach((fix, idx) => {
    waypoints.push({
      name: fix,
      type: idx % 3 === 0 ? 'vor' : 'fix',
      distanceFromDepNm: Math.round((idx + 1) * stepDist),
      freq: idx % 3 === 0 ? `11${4 + (idx % 5)}.${idx * 2}0` : undefined,
    });
  });

  if (contract.type === 'ferry' && poe !== arr && !waypoints.some((w) => w.name === poe)) {
    waypoints.push({
      name: poe,
      type: 'poe',
      distanceFromDepNm: Math.round(dist * 0.85),
    });
  }

  waypoints.push({
    name: arr,
    type: 'airport',
    distanceFromDepNm: dist,
  });

  return waypoints;
};

export const RouteWaypointsBar: React.FC<RouteWaypointsBarProps> = ({
  contract,
  selectedWaypoint,
  onSelectWaypoint,
}) => {
  const waypoints = getRouteWaypoints(contract);

  return (
    <div className="w-full bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 p-3 rounded-b-xl">
      <div className="flex items-center justify-between gap-2 mb-1.5 px-1">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          Waypoints & Fixos da Rota
        </span>
        <span className="text-[10px] font-mono text-slate-500">
          {waypoints.length} pontos de navegação
        </span>
      </div>

      {/* Waypoint Pills Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {waypoints.map((wp, index) => {
          const isSelected = selectedWaypoint === wp.name;
          const isDep = index === 0;
          const isArr = index === waypoints.length - 1;
          const isPoe = wp.type === 'poe';

          return (
            <button
              key={`${wp.name}-${index}`}
              type="button"
              onClick={() => onSelectWaypoint && onSelectWaypoint(wp)}
              className={`min-w-[64px] px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1 shadow-xs border ${
                isSelected
                  ? 'bg-sky-500 text-white border-sky-400 ring-2 ring-sky-400/40 shadow-sm'
                  : isDep || isArr
                  ? 'bg-slate-200 hover:bg-slate-100 text-slate-900 border-slate-300 font-bold'
                  : isPoe
                  ? 'bg-emerald-200 hover:bg-emerald-100 text-emerald-950 border-emerald-300 font-bold'
                  : 'bg-[#D9D9D9] hover:bg-white text-slate-900 border-slate-300'
              }`}
              title={`${wp.name} - ${wp.distanceFromDepNm} NM de ${contract.route.departureIcao}`}
            >
              <span>{wp.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
