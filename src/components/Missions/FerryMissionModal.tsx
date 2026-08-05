import React from 'react';
import { Contract, FerryDossier } from '../../types';
import { usePilot } from '../../context/PilotContext';
import { FerryDossierCard } from './FerryDossierCard';
import { FerryFinancialSummary } from './FerryFinancialSummary';
import { generateFerryAuthorizationPdf } from '../../utils/generateFerryAuthorizationPdf';
import { CompanyLogoBadge } from '../Common/CompanyLogoBadge';
import {
  X,
  Plane,
  CheckCircle2,
  Sparkles,
  Navigation,
  FileText,
  Download,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Coins,
  Zap
} from 'lucide-react';

interface FerryMissionModalProps {
  contract: Contract;
  onClose: () => void;
}

export const FerryMissionModal: React.FC<FerryMissionModalProps> = ({ contract, onClose }) => {
  const { profile, acceptContract } = usePilot();

  // Extract dossier or provide fallback for ferry contracts
  const dossier: FerryDossier = contract.ferryDossier || {
    aircraftModel: contract.requiredAircraft || 'TBM 930',
    manufacturer: 'Daher Aerospace',
    msn: 'MSN 1284',
    originalRegistration: 'CS-DEX',
    newRegistration: 'PR-SGA',
    mtowKg: 3354,
    currentOwner: `${contract.company.name} / Internacional`,
    originCountryCode: 'PT',
    originCountryName: 'Portugal',
    destinationCountryCode: 'BR',
    destinationCountryName: 'Brasil',
    portOfEntryIcao: 'SBSG',
    portOfEntryName: 'Aeroporto Internacional de Natal',
    portOfEntryCity: 'Natal - RN (Brasil)',
    exportFeeCr: 1500,
    nationalizationFeeCr: 3500,
  };

  const handleAccept = () => {
    acceptContract(contract);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <CompanyLogoBadge
              logoUrl={contract.company.logoUrl}
              logoColor={contract.company.logoColor}
              icaoCode={contract.company.icaoCode}
              companyName={contract.company.name}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Translado Internacional de Aeronave
                </span>
                <span className="text-xs text-slate-500 font-medium">{contract.company.name}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">{contract.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Multi-Leg Route Display */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-md">
            <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-sky-400" />
              Rota do Translado Transatlântico & Escalas
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center md:text-left">
              {/* Departure */}
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Origem / Exportação</span>
                <div className="text-lg font-black text-white font-mono mt-0.5">{contract.route.departureIcao}</div>
                <div className="text-xs text-slate-300 font-semibold truncate">{contract.route.departureCity}</div>
                <div className="text-[10px] text-slate-400">{dossier.originCountryName} ({dossier.originalRegistration})</div>
              </div>

              {/* Port of Entry */}
              <div className="bg-slate-800/80 p-3 rounded-lg border border-amber-500/40 relative">
                <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center justify-center md:justify-start gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> Port of Entry / Escala
                </span>
                <div className="text-lg font-black text-amber-300 font-mono mt-0.5">{dossier.portOfEntryIcao}</div>
                <div className="text-xs text-slate-300 font-semibold truncate">{dossier.portOfEntryCity}</div>
                <div className="text-[10px] text-amber-300/80 font-medium">Vistoria & Nacionalização ({dossier.newRegistration})</div>
              </div>

              {/* Final Destination */}
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Destino Final / Entrega</span>
                <div className="text-lg font-black text-sky-400 font-mono mt-0.5">{contract.route.arrivalIcao}</div>
                <div className="text-xs text-slate-300 font-semibold truncate">{contract.route.arrivalCity}</div>
                <div className="text-[10px] text-slate-400">{dossier.destinationCountryName}</div>
              </div>
            </div>
          </div>

          {/* Mission Briefing Banner */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" /> Briefing do Operador de Translado:
            </span>
            {contract.description}
          </div>

          {/* Technical Aircraft Dossier */}
          <FerryDossierCard
            dossier={dossier}
            assignedRegistration={dossier.newRegistration}
            currentStep={1}
          />

          {/* PDF Download Option */}
          <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-300/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900">
                  Documento Oficial de Autorização de Translado (PDF)
                </h5>
                <p className="text-[10px] text-slate-600 font-medium">
                  Baixe a autorização oficial com dados de exportação e do piloto.
                </p>
              </div>
            </div>

            <button
              onClick={() => generateFerryAuthorizationPdf(dossier, contract.company, profile)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>
          </div>

          {/* Financial Breakdown */}
          <FerryFinancialSummary
            grossRewardCr={contract.rewardCredits}
            rewardXp={contract.rewardXp}
            exportFeeCr={dossier.exportFeeCr}
            nationalizationFeeCr={dossier.nationalizationFeeCr}
            exportFeeStatus="paid_advance"
            nationalizationFeeStatus="paid_advance"
            playerCredits={profile.credits}
          />

          {/* Automated Telemetry Tracking Guidance */}
          <div className="p-3 bg-sky-50 rounded-xl border border-sky-200/80 text-xs text-sky-900 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 mb-0.5">Rastreamento Automático via Simulador (MSFS):</strong>
              Ao aceitar esta missão, inicie seu voo normalmente em <strong>{contract.route.departureIcao}</strong>. O sistema detectará automaticamente quando você pousar na escala de vistoria em <strong>{dossier.portOfEntryIcao}</strong> para os trâmites do registro brasileiro, e posteriormente no pouso final em <strong>{contract.route.arrivalIcao}</strong>.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer"
          >
            Voltar
          </button>

          <button
            onClick={handleAccept}
            className="bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Aceitar Contrato & Iniciar Voo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

