import React from 'react';
import { Contract, FerryDossier } from '../../../types';
import { usePilot } from '../../../context/PilotContext';
import {
  FileText,
  Globe,
  Stamp,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plane,
  AlertCircle,
} from 'lucide-react';

interface FlightWorkflowSectionProps {
  contract: Contract;
  dossier?: FerryDossier;
  onNavigateTab: (tabId: string) => void;
}

export const FlightWorkflowSection: React.FC<FlightWorkflowSectionProps> = ({
  contract,
  dossier,
  onNavigateTab,
}) => {
  const { submittedDocuments, getFerryRoutePlan } = usePilot();
  const plan = getFerryRoutePlan(contract.id);

  const eapisSubmitted = submittedDocuments.some(
    (s) => s.contractId === contract.id && s.documentId === 'doc_eapis_manifest' && s.status === 'approved'
  );
  const diSubmitted = submittedDocuments.some(
    (s) => s.contractId === contract.id && s.documentId === 'doc_di_import_br' && s.status === 'approved'
  );
  const permitsApproved = plan.permits && plan.permits.length > 0;

  const steps = [
    {
      step: 1,
      tabId: 'manifest',
      title: 'Despacho & Saída (Órgão Regulador de Origem)',
      description:
        'Envio do manifesto eAPIS à autoridade de fronteira (CBP/FAA). O órgão aprova a saída e designa o Staging Airport de encerramento aduaneiro e o Port of Entry de destino.',
      status: eapisSubmitted ? 'completed' : 'in_progress',
      badge: eapisSubmitted ? 'eAPIS Aprovado' : 'Aguardando Manifesto',
      icon: FileText,
    },
    {
      step: 2,
      tabId: 'stops',
      title: 'Staging Airport, Escalas Técnicas & Permits',
      description:
        'Pouso no Staging Airport de saída, declaração das escalas técnicas de reabastecimento e descanso, e emissão das Autorizações de Sobrevoo (Overflight Permits).',
      status: permitsApproved ? 'completed' : eapisSubmitted ? 'in_progress' : 'pending',
      badge: permitsApproved ? `${plan.permits.length} Permits Ativos` : 'Aguardando Escalas',
      icon: Globe,
    },
    {
      step: 3,
      tabId: 'customs',
      title: 'Port of Entry & Despacho Aduaneiro (DI / RAB)',
      description:
        'Pouso obrigatório no Port of Entry brasileiro, transmissão da Declaração de Importação (DI) junto à Receita Federal e homologação da matrícula no Registro Aeronáutico Brasileiro (RAB).',
      status: diSubmitted ? 'completed' : permitsApproved ? 'in_progress' : 'pending',
      badge: diSubmitted ? 'Matrícula Homologada' : 'Aguardando POE & DI',
      icon: Stamp,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Route & Operational Context Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Roteiro Regulatório do Translado Internacional
              </h3>
              <p className="text-xs text-slate-500">
                {contract.route.departureIcao} ({contract.route.departureCity}) ➔ {contract.route.arrivalIcao} ({contract.route.arrivalCity})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-slate-100 text-slate-700 font-mono font-bold px-2.5 py-1 rounded border border-slate-200">
              {contract.route.distanceNm} NM Total
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Para garantir a conformidade internacional do voo, complete os procedimentos de cada etapa abaixo.
          Você pode clicar em cada cartão para acessar diretamente a aba correspondente.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="space-y-4">
        {steps.map((st) => {
          const isDone = st.status === 'completed';
          const isInProgress = st.status === 'in_progress';
          const Icon = st.icon;

          return (
            <div
              key={st.step}
              onClick={() => onNavigateTab(st.tabId)}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isDone
                  ? 'bg-white hover:bg-slate-50 border-emerald-300 shadow-xs'
                  : isInProgress
                  ? 'bg-white hover:bg-slate-50 border-sky-400 shadow-sm ring-1 ring-sky-300'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 opacity-90'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isInProgress
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                      Etapa {st.step}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900">{st.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {st.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : isInProgress
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {isInProgress && <Clock className="w-3.5 h-3.5 text-sky-600" />}
                  {st.badge}
                </span>

                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400 group-hover:text-slate-700">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
