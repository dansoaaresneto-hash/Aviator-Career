import React, { useState } from 'react';
import { AeronauticalFix, TechnicalStopDeclaration } from '../../../types';
import { usePilot } from '../../../context/PilotContext';
import { Globe, Plus, Clock, Fuel, BedDouble, AlertCircle, CheckCircle2, X, Plane, Navigation } from 'lucide-react';

interface DeclareTechnicalStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  airportFix: AeronauticalFix | null;
  onSuccess?: () => void;
  onAddToFlightPlan?: (fix: AeronauticalFix) => void;
}

export const DeclareTechnicalStopModal: React.FC<DeclareTechnicalStopModalProps> = ({
  isOpen,
  onClose,
  airportFix,
  onSuccess,
  onAddToFlightPlan,
}) => {
  const {
    activeContract,
    getFerryRoutePlan,
    updateFerryTechnicalStops,
    airportPool,
    requiredDocuments,
    submittedDocuments,
    currentLocationIcao,
    flightPhase,
  } = usePilot();

  const [purpose, setPurpose] = useState<'refuel' | 'crew_rest' | 'both'>('refuel');
  const [stayDurationHours, setStayDurationHours] = useState<number>(2);
  const [etaUtc, setEtaUtc] = useState<string>('14:30Z');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !airportFix) return null;

  const plan = activeContract ? getFerryRoutePlan(activeContract.id) : null;
  const stops = plan?.technicalStops || [];
  const permits = plan?.permits || [];

  // Checagem de regras de negócio para POE e Staging caso haja contrato ativo
  const manifestDoc = requiredDocuments.find((d) => d.code === 'EAPIS_MANIFEST');
  const isStagingKnown = (manifestDoc && activeContract)
    ? submittedDocuments.some(
        (s) => s.contractId === activeContract.id && s.documentId === manifestDoc.id && s.status === 'approved'
      )
    : false;

  const isPoeKnown = Boolean(
    !activeContract ||
    (plan && (
      plan.isPoeRequested ||
      plan.isClearedForDeparture ||
      permits.length > 0 ||
      currentLocationIcao === plan.portOfEntryIcao ||
      currentLocationIcao === activeContract.route.arrivalIcao
    ))
  );

  const alreadyDeclared = stops.some(
    (s) => s.icao.toUpperCase() === airportFix.identifier.toUpperCase()
  );

  const airportSample = airportPool.find(
    (a) => a.icao.toUpperCase() === airportFix.identifier.toUpperCase()
  );

  const handleConfirm = () => {
    if (activeContract) {
      const newStop: TechnicalStopDeclaration = {
        id: `stop_${Date.now()}`,
        icao: airportFix.identifier.toUpperCase(),
        name: airportFix.name || airportSample?.name || airportFix.identifier,
        country: airportFix.country || airportSample?.country || 'INTL',
        purpose,
        etaUtc: etaUtc || '15:00Z',
        stayDurationHours: Number(stayDurationHours) || 2,
      };

      updateFerryTechnicalStops(activeContract.id, [...stops, newStop]);
    }

    if (onAddToFlightPlan) {
      onAddToFlightPlan(airportFix);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Declarar Escala Técnica</h3>
              <p className="text-[11px] text-slate-500">
                {activeContract
                  ? `Missão: ${activeContract.title} (${activeContract.route.departureIcao} ➔ ${activeContract.route.arrivalIcao})`
                  : 'Inserir parada intermediária no Plano de Voo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Airport Info Card */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                {airportFix.identifier}
              </span>
              <span className="text-xs font-bold text-slate-700">{airportFix.name}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {airportFix.city ? `${airportFix.city}, ` : ''}{airportFix.country || 'Internacional'}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-sky-100 text-sky-800 font-mono">
            {airportFix.type.toUpperCase()}
          </span>
        </div>

        {/* Validation / Block Warning for active ferry mission */}
        {activeContract && !isPoeKnown ? (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Homologação de POE Pendente</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              A declaração de escalas técnicas para a missão de translado é liberada após a chegada ao Port of Exit (
              {plan?.stagingAirportIcao || 'Staging Airport'}) e a solicitação do Port of Entry na aba "Escalas & Permits".
            </p>
          </div>
        ) : activeContract && alreadyDeclared ? (
          <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Este aeroporto já está declarado na lista de escalas técnicas do plano de voo.</span>
          </div>
        ) : null}

        {/* Form Fields */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Propósito da Escala
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPurpose('refuel')}
                className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  purpose === 'refuel'
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-1 ring-sky-500'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Fuel className="w-3.5 h-3.5 text-sky-600" />
                <span>Abastecimento</span>
              </button>
              <button
                type="button"
                onClick={() => setPurpose('crew_rest')}
                className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  purpose === 'crew_rest'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BedDouble className="w-3.5 h-3.5 text-indigo-600" />
                <span>Descanso</span>
              </button>
              <button
                type="button"
                onClick={() => setPurpose('both')}
                className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  purpose === 'both'
                    ? 'bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-500'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Ambos / Pernoite</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Tempo em Solo
              </label>
              <select
                value={stayDurationHours}
                onChange={(e) => setStayDurationHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value={1}>1 Hora (Rápido)</option>
                <option value={2}>2 Horas (Padrão)</option>
                <option value={6}>6 Horas (Descanso)</option>
                <option value={12}>12 Horas (Pernoite)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Previsão Chegada (ETA)
              </label>
              <input
                type="text"
                value={etaUtc}
                onChange={(e) => setEtaUtc(e.target.value)}
                placeholder="Ex: 14:30Z"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={(activeContract && !isPoeKnown) || (activeContract && alreadyDeclared) || isSuccess}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Escala Declarada!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{activeContract ? 'Declarar & Adicionar à Rota' : 'Inserir Escala no Plano de Voo'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
