import React from 'react';
import { Contract } from '../../types';
import { usePilot } from '../../context/PilotContext';
import { getCountryName } from '../../utils/countryUtils';
import {
  Plane,
  FileText,
  Globe,
  Stamp,
  CheckCircle2,
  Clock,
  AlertCircle,
  FastForward,
  AlertTriangle,
  Building2,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Navigation,
} from 'lucide-react';

interface ContractSummaryCardProps {
  contract: Contract;
  activeView: 'planner' | 'manifest' | 'technical_stops' | 'customs_rab' | 'dossier';
  onSelectView: (view: 'planner' | 'manifest' | 'technical_stops' | 'customs_rab' | 'dossier') => void;
  onOpenDebrief?: () => void;
}

export const ContractSummaryCard: React.FC<ContractSummaryCardProps> = ({
  contract,
  activeView,
  onSelectView,
  onOpenDebrief,
}) => {
  const { flightPhase, adminAdvanceFlightLeg, abandonContract } = usePilot();

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

  const isIntFerry = contract.type === 'ferry' && Boolean(
    contract.ferryDossier ||
    (depCountry && arrCountry && depCountry !== arrCountry) ||
    contract.aircraftCategory?.toLowerCase().includes('internacional') ||
    contract.title?.toLowerCase().includes('internacional')
  );

  const steps = [
    {
      id: 'manifest' as const,
      label: isIntFerry ? '1. Despacho & eAPIS' : '1. Despacho & Manifesto',
      desc: isIntFerry ? 'Manifesto oficial transmitido' : 'Briefing e plano operacional',
      isCompleted: flightPhase !== 'briefing',
      isCurrent: flightPhase === 'briefing',
      icon: FileText,
    },
    {
      id: 'technical_stops' as const,
      label: isIntFerry ? '2. Escalas & Permits' : '2. Escalas & Navegação',
      desc: isIntFerry ? 'Permits de sobrevoo e abastecimento' : 'Planejamento de rota e autonomia',
      isCompleted: flightPhase === 'cruise' || flightPhase === 'intermediate_landing' || flightPhase === 'landed',
      isCurrent: flightPhase === 'taxi',
      icon: Globe,
    },
    {
      id: 'customs_rab' as const,
      label: isIntFerry ? '3. Port of Entry & RAB' : '3. Vistoria & Solo',
      desc: isIntFerry ? 'Desembaraço DI e CNAV ANAC' : 'Inspeção de chegada e solo',
      isCompleted: flightPhase === 'landed',
      isCurrent: flightPhase === 'intermediate_landing' || flightPhase === 'approach',
      icon: Stamp,
    },
    {
      id: 'dossier' as const,
      label: '4. Destino & Conclusão',
      desc: `Pouso final em ${contract.route.arrivalIcao}`,
      isCompleted: flightPhase === 'landed',
      isCurrent: flightPhase === 'landed',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between h-full space-y-5">
      {/* Top Section */}
      <div className="space-y-4">
        {/* Custom Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
          isIntFerry
            ? 'bg-sky-50 text-sky-700 border border-sky-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          <Plane className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>
            {contract.type === 'ferry'
              ? (isIntFerry ? 'Translado Internacional' : 'Translado Nacional')
              : contract.type === 'cargo'
              ? 'Transporte de Carga'
              : 'Transporte de Passageiros'}
          </span>
        </div>

        {/* Hero Route Display - Mission Card Style (Country above, ICAO middle, City below) */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
          <div className="flex items-center justify-between gap-1.5">
            {/* Departure */}
            <div className="w-24 text-center flex flex-col items-center">
              <span className="text-[10px] font-medium text-slate-500 block truncate w-full mb-0.5" title={depCountry}>
                {depCountry}
              </span>
              <span className="font-mono text-xl font-black text-slate-900 tracking-tight block leading-tight">
                {contract.route.departureIcao}
              </span>
              <span className="text-[10px] font-medium text-slate-500 block truncate mt-0.5 w-full" title={contract.route.departureCity}>
                {contract.route.departureCity}
              </span>
            </div>

            {/* Connecting Line with Plane */}
            <div className="flex-1 flex flex-col items-center justify-center px-1">
              <div className="w-full flex items-center gap-1">
                <div className="h-[1.5px] bg-slate-300 flex-1" />
                <Plane className="w-3.5 h-3.5 text-sky-600 rotate-90 shrink-0" />
                <div className="h-[1.5px] bg-slate-300 flex-1" />
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-1">
                {contract.route.distanceNm} NM
              </span>
            </div>

            {/* Arrival */}
            <div className="w-24 text-center flex flex-col items-center">
              <span className="text-[10px] font-medium text-slate-500 block truncate w-full mb-0.5" title={arrCountry}>
                {arrCountry}
              </span>
              <span className="font-mono text-xl font-black text-slate-900 tracking-tight block leading-tight">
                {contract.route.arrivalIcao}
              </span>
              <span className="text-[10px] font-medium text-slate-500 block truncate mt-0.5 w-full" title={contract.route.arrivalCity}>
                {contract.route.arrivalCity}
              </span>
            </div>
          </div>
        </div>

        {/* Mission Briefing text */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {contract.description}
        </p>

        {/* Key Contract Specs Box */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Contratante:
            </span>
            <span className="font-bold text-slate-800">{contract.company.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-slate-400" />
              Aeronave:
            </span>
            <span className="font-bold text-slate-900">{contract.requiredAircraft}</span>
          </div>

          {contract.ferryDossier && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono">
              <span className="text-slate-500">Matrícula:</span>
              <span className="font-bold text-amber-700">
                {contract.ferryDossier.originalRegistration} ➔ {contract.ferryDossier.newRegistration}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Rota:
            </span>
            <span className="font-bold text-slate-900 font-mono">
              {contract.route.departureIcao} ➔ {contract.route.arrivalIcao}
            </span>
          </div>
        </div>

        {/* Mission Steps Checklist */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Checklist das Etapas
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              {steps.filter((s) => s.isCompleted).length}/{steps.length} concluídas
            </span>
          </div>

          <div className="space-y-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isSelectedTab = activeView === step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectView(step.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelectedTab
                      ? 'bg-sky-50 border-sky-300 ring-1 ring-sky-300 shadow-2xs'
                      : step.isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200/70 hover:bg-emerald-50'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        step.isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : step.isCurrent
                          ? 'bg-sky-100 text-sky-700 animate-pulse'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          step.isCompleted
                            ? 'text-emerald-950'
                            : isSelectedTab
                            ? 'text-sky-950'
                            : 'text-slate-800'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight">{step.desc}</p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelectedTab ? 'text-sky-600 translate-x-0.5' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        {/* Admin Quick Step Advance Button */}
        <button
          onClick={adminAdvanceFlightLeg}
          className="w-full px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 active:scale-98 text-amber-900 border border-amber-300/60 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5 fill-current text-amber-700" />
          <span>Avançar Etapa [Admin]</span>
        </button>

        {/* Landing Report Button if completed */}
        {flightPhase === 'landed' && onOpenDebrief && (
          <button
            onClick={onOpenDebrief}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Abrir Relatório do Pouso</span>
          </button>
        )}

        {/* Abandon Flight Button */}
        <button
          onClick={abandonContract}
          className="w-full text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/80 py-2 px-3 rounded-xl border border-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Cancelar Missão</span>
        </button>
      </div>
    </div>
  );
};