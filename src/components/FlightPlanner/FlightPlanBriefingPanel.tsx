import React, { useState } from 'react';
import { FlightPlanWaypoint } from '../../types';
import { calculateFuelBurn, formatEteTime, calculateEteMinutes } from '../../utils/aviationNavMath';
import { Plane, Fuel, Gauge, Mountain, Wind, Clock, ShieldCheck, TrendingUp } from 'lucide-react';

interface FlightPlanBriefingPanelProps {
  waypoints: FlightPlanWaypoint[];
}

interface AircraftOption {
  id: string;
  name: string;
  cruiseKts: number;
  fuelRateKgHr: number;
  ceilingFt: number;
}

const AIRCRAFT_PRESETS: AircraftOption[] = [
  { id: 'tbm930', name: 'Daher TBM 930 (Turboélice)', cruiseKts: 310, fuelRateKgHr: 160, ceilingFt: 31000 },
  { id: 'c208', name: 'Cessna 208B Grand Caravan', cruiseKts: 175, fuelRateKgHr: 190, ceilingFt: 25000 },
  { id: 'b738', name: 'Boeing 737-800 / MAX (Jato)', cruiseKts: 450, fuelRateKgHr: 2400, ceilingFt: 41000 },
  { id: 'a320', name: 'Airbus A320neo (Jato)', cruiseKts: 445, fuelRateKgHr: 2200, ceilingFt: 39000 },
  { id: 'c172', name: 'Cessna 172 Skyhawk (Monomotor)', cruiseKts: 120, fuelRateKgHr: 35, ceilingFt: 14000 },
  { id: 'b58', name: 'Beechcraft Baron 58 (Bimotor)', cruiseKts: 190, fuelRateKgHr: 95, ceilingFt: 20000 },
];

export const FlightPlanBriefingPanel: React.FC<FlightPlanBriefingPanelProps> = ({ waypoints }) => {
  const [selectedAircraftId, setSelectedAircraftId] = useState<string>('tbm930');
  const [cruiseAltFt, setCruiseAltFt] = useState<number>(24000);
  const [headwindKts, setHeadwindKts] = useState<number>(10);

  const selectedAircraft = AIRCRAFT_PRESETS.find((a) => a.id === selectedAircraftId) || AIRCRAFT_PRESETS[0];

  const totalDistanceNm = waypoints.length > 0 ? waypoints[waypoints.length - 1].cumulativeDistanceNm || 0 : 0;
  const netGroundSpeedKts = Math.max(50, selectedAircraft.cruiseKts - headwindKts);

  const eteMinutes = calculateEteMinutes(totalDistanceNm, netGroundSpeedKts);
  const fuelCalc = calculateFuelBurn(totalDistanceNm, netGroundSpeedKts, selectedAircraft.fuelRateKgHr);

  const originElevFt = waypoints.length > 0 ? waypoints[0].elevationFt || 500 : 500;
  const destElevFt = waypoints.length > 1 ? waypoints[waypoints.length - 1].elevationFt || 500 : 500;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Performance & Briefing de Voo</h3>
            <p className="text-[11px] text-slate-500 font-medium">Aeronave, combustível, tempo de voo e perfil vertical</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-300">
          FL{Math.round(cruiseAltFt / 100)}
        </span>
      </div>

      {/* Aircraft & Cruise Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Aircraft Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
            Modelo de Aeronave
          </label>
          <select
            value={selectedAircraftId}
            onChange={(e) => setSelectedAircraftId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          >
            {AIRCRAFT_PRESETS.map((ac) => (
              <option key={ac.id} value={ac.id}>
                {ac.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cruise Altitude */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
            Altitude de Cruzeiro (FT)
          </label>
          <input
            type="number"
            step={1000}
            min={2000}
            max={selectedAircraft.ceilingFt}
            value={cruiseAltFt}
            onChange={(e) => setCruiseAltFt(parseInt(e.target.value) || 10000)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        {/* Headwind Component */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
            <Wind className="w-3 h-3 text-sky-500" />
            <span>Vento de Proa/Cauda (KTS)</span>
          </label>
          <input
            type="number"
            value={headwindKts}
            onChange={(e) => setHeadwindKts(parseInt(e.target.value) || 0)}
            placeholder="+ Proa / - Cauda"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Computed Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900 rounded-xl p-3 text-white border border-slate-800">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Distância Total</span>
          <span className="text-base font-black font-mono text-amber-300 mt-0.5 block">{totalDistanceNm} NM</span>
          <span className="text-[9px] text-slate-400 mt-1 block">Ortodrômica Rota</span>
        </div>

        <div className="bg-slate-900 rounded-xl p-3 text-white border border-slate-800">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tempo Estimado (ETE)</span>
          <span className="text-base font-black font-mono text-sky-300 mt-0.5 block">{formatEteTime(eteMinutes)}</span>
          <span className="text-[9px] text-slate-400 mt-1 block">GS ~ {netGroundSpeedKts} kts</span>
        </div>

        <div className="bg-slate-900 rounded-xl p-3 text-white border border-slate-800">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Combustível Voo</span>
          <span className="text-base font-black font-mono text-emerald-400 mt-0.5 block">{fuelCalc.tripFuelKg} kg</span>
          <span className="text-[9px] text-slate-400 mt-1 block">Taxa {selectedAircraft.fuelRateKgHr} kg/h</span>
        </div>

        <div className="bg-slate-900 rounded-xl p-3 text-white border border-slate-800">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Com Reserva IFR</span>
          <span className="text-base font-black font-mono text-indigo-300 mt-0.5 block">{fuelCalc.totalWithReserveKg} kg</span>
          <span className="text-[9px] text-slate-400 mt-1 block">+45m de reserva</span>
        </div>
      </div>

      {/* SVG Vertical Profile Elevation Chart */}
      <div className="bg-slate-900 rounded-xl p-3.5 text-white space-y-2 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1.5 text-amber-400">
            <Mountain className="w-4 h-4" />
            <span>Perfil Vertical do Voo</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">T.O.D (Top of Descent) Calculado</span>
        </div>

        {/* SVG Drawing */}
        <div className="w-full h-28 relative">
          <svg className="w-full h-full text-amber-400 overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
            {/* Background Grid */}
            <line x1="0" y1="20" x2="500" y2="20" stroke="#334155" strokeDasharray="4" />
            <line x1="0" y1="50" x2="500" y2="50" stroke="#334155" strokeDasharray="4" />
            <line x1="0" y1="80" x2="500" y2="80" stroke="#334155" strokeDasharray="4" />

            {/* Flight Path Polyline */}
            {/* Point 0: Origin airport elev, Point 1: Top of Climb (30%), Point 2: Top of Descent (75%), Point 3: Dest elev */}
            <path
              d="M 10 85 L 120 20 L 370 20 L 490 85"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Shaded Area underneath */}
            <path
              d="M 10 85 L 120 20 L 370 20 L 490 85 L 490 95 L 10 95 Z"
              fill="url(#flightGradient)"
              opacity="0.3"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="flightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Key Point Markers */}
            <circle cx="10" cy="85" r="4" fill="#38bdf8" />
            <circle cx="120" cy="20" r="3.5" fill="#f59e0b" />
            <circle cx="370" cy="20" r="3.5" fill="#f59e0b" />
            <circle cx="490" cy="85" r="4" fill="#10b981" />

            {/* Altitude Label */}
            <text x="220" y="15" fill="#fef08a" fontSize="9" fontWeight="bold" fontFamily="monospace">
              CRUZEIRO FL{Math.round(cruiseAltFt / 100)} ({cruiseAltFt} FT)
            </text>
            <text x="355" y="15" fill="#f87171" fontSize="8" fontWeight="bold" fontFamily="monospace">
              T.O.D.
            </text>
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
          <span>DEP: {waypoints.length > 0 ? waypoints[0].identifier : 'ORIG'} ({originElevFt} ft)</span>
          <span>T.O.C: 120 NM</span>
          <span>T.O.D: {Math.max(10, totalDistanceNm - 60)} NM</span>
          <span>ARR: {waypoints.length > 1 ? waypoints[waypoints.length - 1].identifier : 'DEST'} ({destElevFt} ft)</span>
        </div>
      </div>
    </div>
  );
};
