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
  const {
    activeContract,
    flightPhase,
    flightProgress,
    advanceFlightPhase,
    abandonContract,
    currentLocationIcao,
    intermediateStops,
  } = usePilot();
  const { telemetry, connectionStatus, validateContract, setShowConnectorModal } = useTelemetry();
  const [showDebrief, setShowDebrief] = useState(false);

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

  // Open debrief modal on landed phase
  useEffect(() => {
    if (flightPhase === 'landed') {
      setShowDebrief(true);
    }
  }, [flightPhase]);

  const phases = [
    { id: 'briefing', label: '1. Briefing', pct: 10 },
    { id: 'taxi', label: '2. Táxi', pct: 35 },
    { id: 'cruise', label: '3. Em Voo', pct: 70 },
    { id: 'intermediate_landing', label: '4. Escala / Pouso', pct: 85 },
    { id: 'landed', label: '5. Destino Final', pct: 100 },
  ];

  const hasIntermediateStop = currentLocationIcao && currentLocationIcao !== activeContract.route.departureIcao;

  return (
    <div className="space-y-6">
      {/* Real-Time Pre-Flight Mission Validation Banner */}
      <MissionValidationBanner />

      {/* Intermediate Landing / Alternate Airport Alert Banner */}
      {hasIntermediateStop && flightPhase !== 'landed' && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 text-amber-900 shadow-sm space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 px-2.5 py-0.5 rounded border border-amber-500/30">
                  {activeContract.type === 'ferry' ? 'Escala de Vistoria / Port of Entry Detectada' : 'Pouso Intermediário Registrado'}
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Contrato Ativo
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">
                Aeronave Pousada em {currentLocationIcao} {activeContract.type === 'ferry' ? '(Port of Entry)' : '(Escala Técnica)'}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeContract.type === 'ferry' ? (
                  <>
                    Pouso em Port of Entry (<strong>{currentLocationIcao}</strong>) identificado via telemetria! Vistoria alfandegária e liberação dos órgãos reguladores efetuados. A posição da aeronave está salva.
                  </>
                ) : (
                  <>
                    Detectamos um pouso em escala técnica (<strong>{currentLocationIcao}</strong>). O contrato de voo com a <strong>{activeContract.company.name}</strong> continua <strong>ativo</strong> e sua posição atual está salva.
                  </>
                )}
              </p>

              {/* Procedures Completed Box */}
              <div className="bg-white/80 p-3 rounded-lg border border-amber-200 text-xs space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                  Procedimentos Realizados no Local ({currentLocationIcao}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Despacho fiscal & Vistoria alfandegária</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Reabastecimento & Inspeção de rampa</span>
                  </div>
                  {activeContract.ferryDossier && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Matrícula atualizada para {activeContract.ferryDossier.newRegistration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Posição e plano de voo salvos</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Próxima Perna:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-900 shadow-xs">{currentLocationIcao}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-slate-500">Destino Final:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-sky-300 text-sky-900 shadow-xs">{activeContract.route.arrivalIcao}</span>
                </div>

                <div className="text-[11px] font-extrabold text-sky-800 bg-sky-100 px-2.5 py-1 rounded border border-sky-200">
                  💡 Para prosseguir: decole de {currentLocationIcao} no MSFS
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 text-[11px]">
            {phases.map((p) => {
              const isCurrent = flightPhase === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-2 rounded-lg border text-center font-bold transition-all ${
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

        {/* Flight Operational Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 text-center">
            <MapPin className="w-5 h-5 text-sky-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Origem / Posição</span>
            <p className="text-xl font-black font-mono text-white mt-0.5">{currentLocationIcao || activeContract.route.departureIcao}</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 text-center">
            <Navigation className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Destino Final</span>
            <p className="text-xl font-black font-mono text-white mt-0.5">{activeContract.route.arrivalIcao}</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 text-center">
            <Plane className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Aeronave</span>
            <p className="text-sm font-bold font-mono text-white mt-1 truncate" title={activeContract.requiredAircraft}>
              {activeContract.requiredAircraft}
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 text-center">
            <Radio className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Telemetria MSFS</span>
            <p className="text-sm font-bold text-emerald-400 mt-1">
              {(telemetry.connected || connectionStatus === 'connected' || connectionStatus === 'simulated') ? 'Sincronizado' : 'Aguardando'}
            </p>
          </div>
        </div>
      </div>

      {/* Control Actions & Operational Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Automatic MSFS Telemetry Status Card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Radio className="w-5 h-5 text-sky-500 animate-pulse" />
                Monitoramento do Voo em Tempo Real
              </h3>
              <span className="text-xs font-black text-sky-700 uppercase bg-sky-100 border border-sky-200 px-3 py-1 rounded-md">
                {flightPhase === 'briefing' && '1. Briefing / Pátio'}
                {flightPhase === 'taxi' && '2. Táxi'}
                {flightPhase === 'cruise' && '3. Em Voo'}
                {flightPhase === 'intermediate_landing' && `4. Escala em ${currentLocationIcao || 'Aeroporto Intermediário'}`}
                {flightPhase === 'landed' && '5. Pouso Final Concluído'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Sua navegação está sendo rastreada automaticamente via conector MSFS. Conforme você decola, navega e pousa no Microsoft Flight Simulator, os dados de posição e status do voo são atualizados sem necessidade de intervenção manual.
            </p>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/70 text-xs text-slate-700 space-y-1.5">
              <span className="font-extrabold text-slate-900 block mb-1">Status da Etapa do Simulador:</span>
              <p>
                {flightPhase === 'briefing' && 'Aeronave no pátio de partida. Conecte no MSFS e inicie o procedimento de acionamento e táxi.'}
                {flightPhase === 'taxi' && 'Táxi detectado. Siga para a cabeceira e inicie a decolagem.'}
                {flightPhase === 'cruise' && 'Voo em andamento. Mantenha o curso rumo ao destino final.'}
                {flightPhase === 'intermediate_landing' && `Pouso em aeroporto intermediário (${currentLocationIcao}) registrado. Para dar continuidade à missão, basta decolar novamente do simulador.`}
                {flightPhase === 'landed' && 'Pouso final confirmado! Seu relatório de voo está pronto para encerramento.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100">
            <button
              onClick={abandonContract}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-lg border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Cancelar / Abandonar Voo</span>
            </button>

            {flightPhase === 'landed' && (
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
