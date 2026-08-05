import React from 'react';
import { usePilot } from '../../context/PilotContext';
import { useTelemetry } from '../../context/TelemetryContext';
import { ValidationItem } from '../../types/telemetry';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Radio,
  Download,
  Plane,
  Scale,
  MapPin,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const MissionValidationBanner: React.FC = () => {
  const { activeContract, currentLocationIcao, flightPhase } = usePilot();
  const {
    telemetry,
    connectionStatus,
    validateContract,
    setShowConnectorModal
  } = useTelemetry();

  if (!activeContract) return null;

  const validation = validateContract(activeContract, currentLocationIcao || undefined, flightPhase || undefined);

  const renderStatusBadge = (status: ValidationItem['status']) => {
    if (status === 'valid') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-md">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>CONFIRMADO</span>
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>TOLERADO</span>
        </span>
      );
    }
    if (status === 'invalid') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-red-700 bg-red-100 border border-red-300 px-2.5 py-0.5 rounded-md">
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          <span>DIVERGENTE</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-md">
        <Radio className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
        <span>AGUARDANDO</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Top Validation Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded border border-sky-200 flex items-center gap-1">
              <Radio className="w-3 h-3 text-sky-600 animate-pulse" />
              Validação Pré-Voo com Simulador
            </span>
            {connectionStatus === 'connected' && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                MSFS Conectado
              </span>
            )}
            {connectionStatus === 'disconnected' && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                MSFS Desconectado
              </span>
            )}
          </div>
          <h3 className="text-base font-black text-slate-800">
            Checagem de Conformidade da Missão
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            O Aviator analisa se você está posicionado no aeroporto correto, com a aeronave contratada e o peso exigido no MSFS.
          </p>
        </div>

        {/* Quick Connection Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowConnectorModal(true)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Conectar Simulador</span>
          </button>
        </div>
      </div>

      {/* Summary Message Alert */}
      <div
        className={`p-3.5 rounded-lg border text-xs font-medium flex items-center justify-between gap-3 ${
          validation.overallStatus === 'approved'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : validation.overallStatus === 'warning'
            ? 'bg-amber-50 text-amber-900 border-amber-200'
            : validation.overallStatus === 'rejected'
            ? 'bg-red-50 text-red-900 border-red-200'
            : 'bg-slate-50 text-slate-700 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {validation.overallStatus === 'approved' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {validation.overallStatus === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
          {validation.overallStatus === 'rejected' && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
          {validation.overallStatus === 'pending' && <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />}

          <span>{validation.summaryText}</span>
        </div>

        {validation.canDepart && (
          <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-3 py-1 rounded shadow-sm shrink-0">
            DECOLAGEM AUTORIZADA
          </span>
        )}
      </div>

      {/* The 3 Validation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Airport Validation Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-500" />
              1. Aeroporto de Origem
            </span>
            {renderStatusBadge(validation.airportCheck.status)}
          </div>

          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between text-slate-500">
              <span>Aeroporto no MSFS:</span>
              <strong className="text-slate-800 font-mono">{validation.airportCheck.currentValue}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Exigido pelo Contrato:</span>
              <strong className="text-sky-700 font-mono">{validation.airportCheck.requiredValue}</strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-200/60 leading-relaxed font-normal">
            {validation.airportCheck.message}
          </p>
        </div>

        {/* 2. Aircraft Model Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <Plane className="w-4 h-4 text-indigo-500" />
              2. Modelo de Aeronave
            </span>
            {renderStatusBadge(validation.aircraftCheck.status)}
          </div>

          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between text-slate-500 truncate">
              <span>Detectado no MSFS:</span>
              <strong className="text-slate-800 font-mono truncate max-w-[140px]" title={validation.aircraftCheck.currentValue}>
                {validation.aircraftCheck.currentValue}
              </strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Exigido no Contrato:</span>
              <strong className="text-indigo-700 font-mono">{validation.aircraftCheck.requiredValue}</strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-200/60 leading-relaxed font-normal">
            {validation.aircraftCheck.message}
          </p>
        </div>

        {/* 3. Weight & Payload Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-500" />
              3. Peso e Carga Útil
            </span>
            {renderStatusBadge(validation.weightCheck.status)}
          </div>

          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between text-slate-500">
              <span>Carga no MSFS:</span>
              <strong className="text-slate-800 font-mono">{validation.weightCheck.currentValue}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Exigência do Voo:</span>
              <strong className="text-amber-700 font-mono">{validation.weightCheck.requiredValue}</strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-200/60 leading-relaxed font-normal">
            {validation.weightCheck.message}
          </p>
        </div>
      </div>
    </div>
  );
};
