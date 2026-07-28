import React, { useState } from 'react';
import { Contract, FerryDossier } from '../../types';
import { usePilot } from '../../context/PilotContext';
import { FerryDossierCard } from './FerryDossierCard';
import { FerryFinancialSummary } from './FerryFinancialSummary';
import { FerryStepWorkflow } from './FerryStepWorkflow';
import { X, Building2, Plane, CheckCircle2, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

interface FerryMissionModalProps {
  contract: Contract;
  onClose: () => void;
}

export const FerryMissionModal: React.FC<FerryMissionModalProps> = ({ contract, onClose }) => {
  const { profile, acceptContract, completeFlight } = usePilot();

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

  // Internal state tracking for the multi-step ferry workflow
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [exportFeeStatus, setExportFeeStatus] = useState<'pending' | 'paid_credits' | 'paid_advance'>('pending');
  const [nationalizationFeeStatus, setNationalizationFeeStatus] = useState<'pending' | 'paid_credits' | 'paid_advance'>('pending');
  const [assignedRegistration, setAssignedRegistration] = useState<string>(dossier.originalRegistration);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Local state copy of credits to handle live UI feedback before final context save
  const [currentCredits, setCurrentCredits] = useState<number>(profile.credits);

  // Handle Export Fee Payment (Step 1)
  const handlePayExportFee = (method: 'credits' | 'advance') => {
    if (method === 'credits') {
      if (currentCredits >= dossier.exportFeeCr) {
        setCurrentCredits((prev) => prev - dossier.exportFeeCr);
        setExportFeeStatus('paid_credits');
      } else {
        return;
      }
    } else {
      setExportFeeStatus('paid_advance');
    }
    setCurrentStep(2);
  };

  // Handle Landing at Port of Entry (Step 2)
  const handleConfirmPortOfEntryLanding = () => {
    setCurrentStep(3);
  };

  // Handle Nationalization Fee Payment (Step 3)
  const handlePayNationalizationFee = (method: 'credits' | 'advance') => {
    if (method === 'credits') {
      if (currentCredits >= dossier.nationalizationFeeCr) {
        setCurrentCredits((prev) => prev - dossier.nationalizationFeeCr);
        setNationalizationFeeStatus('paid_credits');
      } else {
        return;
      }
    } else {
      setNationalizationFeeStatus('paid_advance');
    }
    setAssignedRegistration(dossier.newRegistration);
    setCurrentStep(4);
  };

  // Handle Delivery Completion (Step 4)
  const handleCompleteDelivery = () => {
    // Calculate total advances
    const totalAdvances =
      (exportFeeStatus === 'paid_advance' ? dossier.exportFeeCr : 0) +
      (nationalizationFeeStatus === 'paid_advance' ? dossier.nationalizationFeeCr : 0);

    const netPayout = Math.max(0, contract.rewardCredits - totalAdvances);

    // Accept contract & trigger context completion with custom net payout logic
    acceptContract({
      ...contract,
      rewardCredits: netPayout, // Pass net payout as earned credits
    });

    setTimeout(() => {
      completeFlight(98); // Completed with 98% landing smoothness
      setIsCompleted(true);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${contract.company.logoColor} text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0`}>
              <Plane className="w-5 h-5" />
            </div>
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
          {/* Mission Briefing Banner */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" /> Briefing do Operador de Translado:
            </span>
            {contract.description}
          </div>

          {/* Dossiê Técnico da Aeronave */}
          <FerryDossierCard
            dossier={dossier}
            assignedRegistration={assignedRegistration}
            currentStep={currentStep}
          />

          {/* Stepper Workflow & Action Control */}
          <FerryStepWorkflow
            dossier={dossier}
            company={contract.company}
            pilot={profile}
            currentStep={currentStep}
            exportFeeStatus={exportFeeStatus}
            nationalizationFeeStatus={nationalizationFeeStatus}
            assignedRegistration={assignedRegistration}
            playerCredits={currentCredits}
            onPayExportFee={handlePayExportFee}
            onConfirmPortOfEntryLanding={handleConfirmPortOfEntryLanding}
            onPayNationalizationFee={handlePayNationalizationFee}
            onCompleteDelivery={handleCompleteDelivery}
          />

          {/* Resumo Financeiro & Cálculo de Adiantamentos */}
          <FerryFinancialSummary
            grossRewardCr={contract.rewardCredits}
            rewardXp={contract.rewardXp}
            exportFeeCr={dossier.exportFeeCr}
            nationalizationFeeCr={dossier.nationalizationFeeCr}
            exportFeeStatus={exportFeeStatus}
            nationalizationFeeStatus={nationalizationFeeStatus}
            playerCredits={currentCredits}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Progresso salvo automaticamente na sessão do piloto.
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
