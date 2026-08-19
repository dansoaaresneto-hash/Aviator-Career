import React from 'react';
import { Contract } from '../../types';
import { usePilot } from '../../context/PilotContext';
import { useTelemetry } from '../../context/TelemetryContext';
import { MissionBadge } from '../UI/Badge';
import { getCountryName } from '../../utils/countryUtils';
import {
  MapPin,
  Navigation,
  Plane,
  Radio,
  Coins,
  Building2,
  Zap,
} from 'lucide-react';

interface FlightTelemetryHeaderProps {
  contract: Contract;
}

export const FlightTelemetryHeader: React.FC<FlightTelemetryHeaderProps> = ({ contract }) => {
  const { flightPhase, flightProgress, currentLocationIcao } = usePilot();
  const { telemetry, connectionStatus } = useTelemetry();

  const depCountry = getCountryName(
    contract.route.departureIcao,
    contract.route.departureCity,
    contract.route.departureCountry
  );

  const arrCountry = getCountryName(
    contract.route.arrivalIcao,
    contract.route.arrivalCity,
    contract.route.arrivalCountry
  );

  const phases = [
    { id: 'briefing', label: '1. Briefing', pct: 10 },
    { id: 'taxi', label: '2. Táxi', pct: 35 },
    { id: 'cruise', label: '3. Em Voo', pct: 70 },
    { id: 'intermediate_landing', label: '4. Escala', pct: 85 },
    { id: 'landed', label: '5. Destino', pct: 100 },
  ];

  const isInternational = Boolean(
    contract.ferryDossier ||
    contract.aircraftCategory?.toLowerCase().includes('internacional') ||
    contract.title?.toLowerCase().includes('internacional') ||
    (depCountry && arrCountry && depCountry !== arrCountry)
  );

  return (
    <div className="bg-[#0F172B] rounded-2xl p-5 sm:p-6 text-white border border-slate-800 shadow-md">
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 px-2.5 py-0.5 rounded border border-sky-400/30">
            Voo em Andamento
          </span>
          <MissionBadge type={contract.type} isInternational={isInternational} showIcon={false} />
          {contract.ferryDossier && (
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
              {contract.ferryDossier.originalRegistration} ➔ {contract.ferryDossier.newRegistration}
            </span>
          )}
          <span className="text-xs text-slate-400">
            Operadora: <strong className="text-slate-200">{contract.company.name}</strong> • Aeronave: <strong className="text-amber-400">{contract.requiredAircraft}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700/80 shrink-0 self-start sm:self-auto">
          <Coins className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Recompensa</span>
            <p className="text-sm font-black text-amber-400 font-mono">
              {contract.rewardCredits.toLocaleString('pt-BR')} CR
            </p>
          </div>
        </div>
      </div>

      {/* Hero Route Display - Mission Card Style (Country above, ICAO middle, City below) */}
      <div className="bg-slate-900/90 rounded-xl p-4 sm:p-5 border border-slate-800 mb-5 shadow-inner">
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          {/* Departure */}
          <div className="w-32 sm:w-44 text-center flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 block truncate w-full mb-0.5" title={depCountry}>
              {depCountry}
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight block leading-tight">
              {contract.route.departureIcao}
            </span>
            <span className="text-xs font-medium text-slate-400 block truncate mt-0.5 w-full" title={contract.route.departureCity}>
              {contract.route.departureCity}
            </span>
          </div>

          {/* Connecting Line with Plane & Distance */}
          <div className="flex-1 flex flex-col items-center justify-center px-1 sm:px-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-1.5 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700">
              <Navigation className="w-3 h-3 text-sky-400 rotate-45" />
              <span>{contract.route.distanceNm} NM</span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">~{contract.route.estimatedMinutes} min</span>
            </div>
            <div className="w-full flex items-center gap-2">
              <div className="h-[1.5px] bg-slate-700 flex-1" />
              <Plane className="w-4 h-4 text-sky-400 rotate-90 shrink-0" />
              <div className="h-[1.5px] bg-slate-700 flex-1" />
            </div>
          </div>

          {/* Arrival */}
          <div className="w-32 sm:w-44 text-center flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 block truncate w-full mb-0.5" title={arrCountry}>
              {arrCountry}
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight block leading-tight">
              {contract.route.arrivalIcao}
            </span>
            <span className="text-xs font-medium text-slate-400 block truncate mt-0.5 w-full" title={contract.route.arrivalCity}>
              {contract.route.arrivalCity}
            </span>
          </div>
        </div>
      </div>

      {/* Operation Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-slate-300">Progresso da Operação</span>
          <span className="text-sky-400 font-mono font-black">{flightProgress}%</span>
        </div>

        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className="bg-sky-500 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${flightProgress}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 text-[11px]">
          {phases.map((p) => {
            const isCurrent = flightPhase === p.id;
            return (
              <div
                key={p.id}
                className={`py-1.5 px-2 rounded-lg border text-center font-bold transition-all ${
                  isCurrent
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700/70'
                }`}
              >
                {p.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Telemetry Info Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/70 text-center">
          <MapPin className="w-3.5 h-3.5 text-sky-400 mx-auto mb-0.5" />
          <span className="text-[9px] font-bold text-slate-400 uppercase">Posição Atual</span>
          <p className="text-sm font-black font-mono text-white mt-0.5">
            {currentLocationIcao || contract.route.departureIcao}
          </p>
        </div>

        <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/70 text-center">
          <Navigation className="w-3.5 h-3.5 text-indigo-400 mx-auto mb-0.5" />
          <span className="text-[9px] font-bold text-slate-400 uppercase">Destino Final</span>
          <p className="text-sm font-black font-mono text-white mt-0.5">
            {contract.route.arrivalIcao}
          </p>
        </div>

        <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/70 text-center">
          <Plane className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
          <span className="text-[9px] font-bold text-slate-400 uppercase">Distância Total</span>
          <p className="text-sm font-black font-mono text-amber-400 mt-0.5">
            {contract.route.distanceNm} NM
          </p>
        </div>

        <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/70 text-center">
          <Radio className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-0.5" />
          <span className="text-[9px] font-bold text-slate-400 uppercase">MSFS Conector</span>
          <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
            {telemetry.connected || connectionStatus === 'connected' || connectionStatus === 'simulated'
              ? 'Sincronizado'
              : 'Aguardando'}
          </p>
        </div>
      </div>
    </div>
  );
};
