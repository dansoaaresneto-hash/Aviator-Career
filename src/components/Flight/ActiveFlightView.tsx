import React, { useState, useEffect } from 'react';
import { usePilot } from '../../context/PilotContext';
import { useTelemetry } from '../../context/TelemetryContext';
import { MissionBadge } from '../UI/Badge';
import { FlightDebriefModal } from './FlightDebriefModal';
import { MissionValidationBanner } from './MissionValidationBanner';
import { ConnectorDownloadModal } from './ConnectorDownloadModal';
import {
  Plane,
  Navigation,
  Compass,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Coins,
  Zap,
  MapPin,
  Clock,
  Volume2,
  Radio
} from 'lucide-react';

export const ActiveFlightView: React.FC = () => {
  const { activeContract, flightPhase, flightProgress, advanceFlightPhase, abandonContract } = usePilot();
  const { telemetry, connectionStatus, validateContract, setShowConnectorModal } = useTelemetry();
  const [showDebrief, setShowDebrief] = useState(false);
  const [simulatedSpeed, setSimulatedSpeed] = useState(0);
  const [simulatedAltitude, setSimulatedAltitude] = useState(0);

  if (!activeContract) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-slate-200/90 shadow-sm max-w-lg mx-auto">
        <Plane className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-800">Nenhum Voo Ativo</h3>
        <p className="text-xs text-slate-500 mt-1">
          Você não aceitou nenhum contrato no momento. Acesse a guia de Missões para selecionar um voo.
        </p>
      </div>
    );
  }

  // Use live MSFS telemetry if connected or simulated, otherwise fallback to phase defaults
  const currentSpeed = (connectionStatus === 'connected' || connectionStatus === 'simulated')
    ? telemetry.groundSpeedKts
    : simulatedSpeed;

  const currentAltitude = (connectionStatus === 'connected' || connectionStatus === 'simulated')
    ? telemetry.altitudeFt
    : simulatedAltitude;

  // Dynamic Telemetry updates based on current phase
  useEffect(() => {
    if (flightPhase === 'briefing') {
      setSimulatedSpeed(0);
      setSimulatedAltitude(0);
    } else if (flightPhase === 'taxi') {
      setSimulatedSpeed(15);
      setSimulatedAltitude(0);
    } else if (flightPhase === 'cruise') {
      setSimulatedSpeed(145);
      setSimulatedAltitude(8500);
    } else if (flightPhase === 'landed') {
      setSimulatedSpeed(0);
      setSimulatedAltitude(0);
      setShowDebrief(true);
    }
  }, [flightPhase]);

  const phases = [
    { id: 'briefing', label: '1. Briefing', pct: 10 },
    { id: 'taxi', label: '2. Táxi', pct: 35 },
    { id: 'cruise', label: '3. Em Voo', pct: 70 },
    { id: 'landed', label: '4. Pouso Concluído', pct: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Real-Time Pre-Flight Mission Validation Banner */}
      <MissionValidationBanner />

      {/* Top Banner: Flight Telemetry & Route */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 sm:p-8 text-white border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-700/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-400/30">
                <Plane className="w-3 h-3 animate-pulse" />
                Voo Ativo no MSFS
              </span>
              <MissionBadge type={activeContract.type} showIcon={false} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">{activeContract.title}</h2>
            <p className="text-xs text-slate-300 mt-1">
              Operadora: <strong className="text-white">{activeContract.company.name}</strong> • Aeronave:{' '}
              <span className="text-amber-400 font-bold">{activeContract.requiredAircraft}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <Coins className="w-6 h-6 text-amber-400" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Pagamento ao Pousar</span>
              <p className="text-lg font-black text-amber-400">
                {activeContract.rewardCredits.toLocaleString('pt-BR')} CR
              </p>
            </div>
          </div>
        </div>

        {/* Flight Progress Phase Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-300">Progresso do Voo</span>
            <span className="text-sky-400 font-mono">{flightProgress}% Concluído</span>
          </div>

          <div className="w-full bg-slate-800 h-3 rounded-md overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-md transition-all duration-500"
              style={{ width: `${flightProgress}%` }}
            ></div>
          </div>

          {/* Phase steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-[11px]">
            {phases.map((p) => {
              const isCurrent = flightPhase === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-lg border text-center font-bold transition-all ${
                    isCurrent
                      ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700'
                  }`}
                >
                  {p.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Telemetry Instrument Cluster */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 text-center">
            <Gauge className="w-5 h-5 text-sky-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Velocidade (IAS)</span>
            <p className="text-xl font-black font-mono text-white mt-0.5">{currentSpeed} <span className="text-xs font-bold text-slate-400">kts</span></p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 text-center">
            <Navigation className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Altitude</span>
            <p className="text-xl font-black font-mono text-white mt-0.5">{currentAltitude.toLocaleString()} <span className="text-xs font-bold text-slate-400">ft</span></p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 text-center">
            <Compass className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Distância Restante</span>
            <p className="text-xl font-black font-mono text-white mt-0.5">
              {Math.max(0, Math.round(activeContract.route.distanceNm * (1 - flightProgress / 100)))} <span className="text-xs font-bold text-slate-400">NM</span>
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 text-center">
            <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Destino (ICAO)</span>
            <p className="text-xl font-black font-mono text-white mt-0.5">{activeContract.route.arrivalIcao}</p>
          </div>
        </div>
      </div>

      {/* Control Actions & Checklist Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step Progression Control */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-sky-500" />
            Gerenciamento da Etapa de Voo
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Conforme avança seu voo no Microsoft Flight Simulator, atualize a etapa correspondente no Aviator para registrar sua navegação.
          </p>

          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200/70 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase text-slate-400">Etapa Atual</span>
                {(connectionStatus === 'connected' || connectionStatus === 'simulated' || telemetry.connected) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                    Sincronizado Automático MSFS
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-sky-700 uppercase bg-sky-100 border border-sky-200 px-3 py-1 rounded-md">
                {flightPhase === 'briefing' && '1. Briefing / Pátio'}
                {flightPhase === 'taxi' && '2. Táxi'}
                {flightPhase === 'cruise' && '3. Em Voo'}
                {flightPhase === 'landed' && '4. Pouso Concluído'}
              </span>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {flightPhase === 'briefing' && 'Configure seu plano de voo no MSFS, sintonize as frequências e prepare a aeronave no pátio de partida ou ponto de espera.'}
              {flightPhase === 'taxi' && 'Movimento detectado! Realize o táxi até a pista em uso, solicite autorização e inicie a corrida de decolagem.'}
              {flightPhase === 'cruise' && 'Aeronave em voo! Acompanhe os parâmetros de navegação até o aeroporto de destino.'}
              {flightPhase === 'landed' && 'Pouso efetuado com sucesso! Realize o táxi até o pátio e efetue o corte dos motores.'}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={abandonContract}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-lg border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Cancelar / Abandonar Voo</span>
            </button>

            {flightPhase !== 'landed' ? (
              <button
                onClick={advanceFlightPhase}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Avançar para Próxima Etapa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowDebrief(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Abrir Relatório do Pouso</span>
              </button>
            )}
          </div>
        </div>

        {/* Flight Requirements Reminder */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Resumo Operacional
          </h4>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Origem ➔ Destino</span>
              <p className="font-extrabold text-slate-800 mt-0.5">
                {activeContract.route.departureIcao} ({activeContract.route.departureCity}) ➔ {activeContract.route.arrivalIcao} ({activeContract.route.arrivalCity})
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Carga / Passageiros</span>
              <p className="font-bold text-slate-800 mt-0.5">{activeContract.payloadInfo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Debrief Modal upon landing */}
      {showDebrief && <FlightDebriefModal onClose={() => setShowDebrief(false)} />}

      {/* Connector Download & Help Modal */}
      <ConnectorDownloadModal />
    </div>
  );
};
