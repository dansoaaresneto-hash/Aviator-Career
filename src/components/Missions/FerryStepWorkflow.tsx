import React, { useState } from 'react';
import { FerryDossier, PilotProfile, ContractCompany } from '../../types';
import { getAviationAuthority } from '../../utils/aviationAuthority';
import { CompanyAuthorizationDoc } from './CompanyAuthorizationDoc';
import { generateFerryAuthorizationPdf } from '../../utils/generateFerryAuthorizationPdf';
import {
  FileCheck2,
  PlaneTakeoff,
  Stamp,
  LandPlot,
  CheckCircle2,
  Coins,
  Building,
  Loader2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  Plane,
  FileText,
  UserCheck,
  Check,
  Zap,
  HelpCircle,
  Download
} from 'lucide-react';

interface FerryStepWorkflowProps {
  dossier: FerryDossier;
  company: ContractCompany;
  pilot: PilotProfile;
  currentStep: number;
  exportFeeStatus: 'pending' | 'paid_credits' | 'paid_advance';
  nationalizationFeeStatus: 'pending' | 'paid_credits' | 'paid_advance';
  assignedRegistration: string;
  playerCredits: number;
  onPayExportFee: (method: 'credits' | 'advance') => void;
  onConfirmPortOfEntryLanding: () => void;
  onPayNationalizationFee: (method: 'credits' | 'advance') => void;
  onCompleteDelivery: () => void;
}

export const FerryStepWorkflow: React.FC<FerryStepWorkflowProps> = ({
  dossier,
  company,
  pilot,
  currentStep,
  exportFeeStatus,
  nationalizationFeeStatus,
  assignedRegistration,
  playerCredits,
  onPayExportFee,
  onConfirmPortOfEntryLanding,
  onPayNationalizationFee,
  onCompleteDelivery,
}) => {
  const originAuth = getAviationAuthority(dossier.originCountryCode, dossier.originCountryName);
  const destAuth = getAviationAuthority(dossier.destinationCountryCode, dossier.destinationCountryName);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingText, setProcessingText] = useState<string>('');
  const [showCompanyDoc, setShowCompanyDoc] = useState<boolean>(false);

  // --- Step 1 Form State ---
  const [step1PilotName, setStep1PilotName] = useState<string>('');
  const [step1Callsign, setStep1Callsign] = useState<string>('');
  const [step1OwnerName, setStep1OwnerName] = useState<string>('');
  const [step1OriginalReg, setStep1OriginalReg] = useState<string>('');
  const [step1Msn, setStep1Msn] = useState<string>('');
  const [step1FormValidated, setStep1FormValidated] = useState<boolean>(false);

  // --- Step 3 Form State ---
  const [step3PortOfEntry, setStep3PortOfEntry] = useState<string>('');
  const [step3OldReg, setStep3OldReg] = useState<string>('');
  const [step3NewReg, setStep3NewReg] = useState<string>('');
  const [step3PilotName, setStep3PilotName] = useState<string>('');
  const [step3FormValidated, setStep3FormValidated] = useState<boolean>(false);

  // Auto-fill helpers
  const handleAutoFillStep1 = () => {
    setStep1PilotName(pilot.name);
    setStep1Callsign(pilot.preferredCallsign || 'PT-PLT');
    setStep1OwnerName(dossier.currentOwner);
    setStep1OriginalReg(dossier.originalRegistration);
    setStep1Msn(dossier.msn);
    setStep1FormValidated(true);
  };

  const handleValidateStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      step1PilotName.trim() &&
      step1Callsign.trim() &&
      step1OwnerName.trim() &&
      step1OriginalReg.trim() &&
      step1Msn.trim()
    ) {
      setStep1FormValidated(true);
    }
  };

  const handleAutoFillStep3 = () => {
    setStep3PortOfEntry(dossier.portOfEntryIcao);
    setStep3OldReg(dossier.originalRegistration);
    setStep3NewReg(dossier.newRegistration);
    setStep3PilotName(pilot.name);
    setStep3FormValidated(true);
  };

  const handleValidateStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      step3PortOfEntry.trim() &&
      step3OldReg.trim() &&
      step3NewReg.trim() &&
      step3PilotName.trim()
    ) {
      setStep3FormValidated(true);
    }
  };

  const handleExportAction = (method: 'credits' | 'advance') => {
    setIsProcessing(true);
    setProcessingText(`Submetendo protocolo junto à ${originAuth.civilAuthority}...`);
    setTimeout(() => {
      onPayExportFee(method);
      setIsProcessing(false);
    }, 1200);
  };

  const handleNationalizationAction = (method: 'credits' | 'advance') => {
    setIsProcessing(true);
    setProcessingText(`Registrando vistoria alfandegária e marcas na ${destAuth.civilAuthority}...`);
    setTimeout(() => {
      onPayNationalizationFee(method);
      setIsProcessing(false);
    }, 1200);
  };

  const steps = [
    { num: 1, title: 'Exportação & Form', subtitle: dossier.originCountryName },
    { num: 2, title: 'Transatlântico', subtitle: `Até ${dossier.portOfEntryIcao}` },
    { num: 3, title: 'Nacionalização & Form', subtitle: dossier.destinationCountryName },
    { num: 4, title: 'Entrega Final', subtitle: dossier.portOfEntryCity.split('(')[0] },
  ];

  return (
    <div className="space-y-5">
      {/* Top Bar: PDF Download & Document Reference */}
      <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-300/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-black text-slate-900">
              Documento Oficial de Autorização da Contratante (PDF)
            </h5>
            <p className="text-[10px] text-slate-600 font-medium">
              Baixe a ficha técnica oficial com seus dados de piloto e da aeronave para usar ao preencher os formulários.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => generateFerryAuthorizationPdf(dossier, company, pilot)}
            className="text-xs font-black text-white bg-amber-600 hover:bg-amber-500 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar PDF Oficial</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCompanyDoc(!showCompanyDoc)}
            className="text-xs font-extrabold text-amber-950 bg-amber-200/80 hover:bg-amber-200 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            title="Visualizar no navegador"
          >
            {showCompanyDoc ? 'Ocultar' : '👁️ Visualizar'}
          </button>
        </div>
      </div>

      {/* Render Official Company Authorization Document when expanded */}
      {showCompanyDoc && (
        <CompanyAuthorizationDoc
          dossier={dossier}
          company={company}
          pilot={pilot}
        />
      )}

      {/* Visual Stepper */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0"></div>

          {steps.map((step) => {
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div key={step.num} className="relative z-10 flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-sky-600 text-white ring-4 ring-sky-100 shadow-md'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                </div>
                <span
                  className={`text-[11px] font-bold mt-1.5 ${
                    isCurrent ? 'text-sky-900' : isDone ? 'text-emerald-800' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">{step.subtitle}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading Overlay State during processing */}
      {isProcessing && (
        <div className="bg-sky-50 border border-sky-200 p-6 rounded-xl text-center space-y-3 animate-fadeIn">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-sky-900">{processingText}</p>
          <p className="text-[10px] text-sky-700">Aguardando protocolo e carimbo digital dos órgãos de aviação...</p>
        </div>
      )}

      {!isProcessing && (
        <div className="space-y-4">
          {/* STEP 1: EXPORT DOCUMENTS & FORM FILLING (ORIGIN) */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      Etapa 1 de 4 • Requerimento de Exportação & Seguro
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      Preenchimento de Documentos: {originAuth.countryName} {originAuth.flagEmoji}
                    </h4>
                  </div>
                </div>

                <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Aeronave: {dossier.originalRegistration}
                </span>
              </div>

              {/* Resolved Aviation Authorities Info */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" /> Órgão emissor:
                  </span>
                  <span className="font-extrabold text-slate-800">{originAuth.civilAuthority}</span>
                </div>
              </div>

              {/* FORM SECTION */}
              <div className="bg-slate-50 p-4 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Formulário de Solicitação de Licença de Exportação
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoFillStep1}
                    className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded border border-indigo-200 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-amber-500" /> Preencher do Dossiê Oficial
                  </button>
                </div>

                <form onSubmit={handleValidateStep1} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Comandante / Piloto Responsável:
                      </label>
                      <input
                        type="text"
                        value={step1PilotName}
                        onChange={(e) => {
                          setStep1PilotName(e.target.value);
                          setStep1FormValidated(false);
                        }}
                        placeholder={`Ex: ${pilot.name}`}
                        className="w-full p-2 bg-white rounded border border-slate-300 focus:border-indigo-500 font-medium text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Callsign / Licença do Piloto:
                      </label>
                      <input
                        type="text"
                        value={step1Callsign}
                        onChange={(e) => {
                          setStep1Callsign(e.target.value);
                          setStep1FormValidated(false);
                        }}
                        placeholder={`Ex: ${pilot.preferredCallsign || 'PT-PLT'}`}
                        className="w-full p-2 bg-white rounded border border-slate-300 focus:border-indigo-500 font-medium text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Empresa Proprietária:
                      </label>
                      <input
                        type="text"
                        value={step1OwnerName}
                        onChange={(e) => {
                          setStep1OwnerName(e.target.value);
                          setStep1FormValidated(false);
                        }}
                        placeholder={`Ex: ${dossier.currentOwner}`}
                        className="w-full p-2 bg-white rounded border border-slate-300 focus:border-indigo-500 font-medium text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Matrícula de Origem:
                      </label>
                      <input
                        type="text"
                        value={step1OriginalReg}
                        onChange={(e) => {
                          setStep1OriginalReg(e.target.value);
                          setStep1FormValidated(false);
                        }}
                        placeholder={`Ex: ${dossier.originalRegistration}`}
                        className="w-full p-2 bg-white rounded border border-slate-300 focus:border-indigo-500 font-mono font-bold text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Número de Série (MSN):
                      </label>
                      <input
                        type="text"
                        value={step1Msn}
                        onChange={(e) => {
                          setStep1Msn(e.target.value);
                          setStep1FormValidated(false);
                        }}
                        placeholder={`Ex: ${dossier.msn}`}
                        className="w-full p-2 bg-white rounded border border-slate-300 focus:border-indigo-500 font-mono font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  {!step1FormValidated ? (
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Validar e Assinar Formulário de Exportação</span>
                    </button>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-emerald-900">
                      <span className="font-bold flex items-center gap-2 text-xs">
                        <Check className="w-4 h-4 text-emerald-600" /> Formulario Assinado e Validado pelo Piloto
                      </span>
                      <span className="text-[10px] font-mono font-black uppercase text-emerald-800">
                        PROTOCOLO OK
                      </span>
                    </div>
                  )}
                </form>
              </div>

              {/* Payment Actions unlocked once form is validated */}
              {step1FormValidated && (
                <div className="pt-2 space-y-3 animate-fadeIn">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold block">Taxa de Despacho Regulatória & Apólice: {dossier.exportFeeCr.toLocaleString('pt-BR')} CR</span>
                    <p className="text-[11px] text-amber-800">
                      Escolha pagar com seus créditos ou solicitar que a contratante adiente o valor (abatendo no recebimento final).
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => handleExportAction('credits')}
                      disabled={playerCredits < dossier.exportFeeCr}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        playerCredits >= dossier.exportFeeCr
                          ? 'bg-slate-900 hover:bg-sky-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>Pagar Taxa em CR ({dossier.exportFeeCr.toLocaleString('pt-BR')} CR)</span>
                    </button>

                    <button
                      onClick={() => handleExportAction('advance')}
                      className="flex-1 py-2.5 px-4 rounded-lg font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Solicitar Adiantamento à Contratante</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: TRANSATLANTIC LEG TO PORT OF ENTRY */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <PlaneTakeoff className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                      Etapa 2 de 4 • Perna de Voo Transatlântico
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      Decolagem da Origem ➔ Port of Entry ({dossier.portOfEntryIcao})
                    </h4>
                  </div>
                </div>

                {/* Digital Stamp Display */}
                <div className="bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-2 text-emerald-800">
                  <Stamp className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Exportação Deferida</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" /> Posição Atual:
                  </span>
                  <span className="font-bold text-sky-300">Em Solo no Aeroporto de Origem ({dossier.originCountryName})</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5 text-amber-400" /> Matrícula em Operação:
                  </span>
                  <span className="font-mono font-bold text-amber-300">{dossier.originalRegistration}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700">
                  <span className="text-slate-300 font-medium">Destino da Perna (Port of Entry):</span>
                  <span className="font-bold text-white">{dossier.portOfEntryName} ({dossier.portOfEntryIcao})</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Aeronave liberada para o trecho oceânico. Execute a navegação no Microsoft Flight Simulator até o aeroporto internacional designado como <strong>Port of Entry ({dossier.portOfEntryIcao})</strong> para dar início aos trâmites de entrada no país.
              </p>

              <button
                onClick={onConfirmPortOfEntryLanding}
                className="w-full py-3 px-4 rounded-lg font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LandPlot className="w-4 h-4" />
                <span>Confirmar Pouso em Port of Entry ({dossier.portOfEntryIcao} - {dossier.portOfEntryCity.split('(')[0]})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: CUSTOMS & NATIONALIZATION FORM */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Stamp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                      Etapa 3 de 4 • Declaração de Importação & Nacionalização
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      Formulário de Entrada: {destAuth.countryName} {destAuth.flagEmoji}
                    </h4>
                  </div>
                </div>

                <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-sky-100 text-sky-800 border border-sky-200">
                  Em Solo: {dossier.portOfEntryIcao}
                </span>
              </div>

              {/* FORM SECTION */}
              <div className="bg-slate-50 p-4 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Requerimento de Vistoria Alfandegária e Reserva de Marcas
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoFillStep3}
                    className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-amber-500" /> Preencher do Dossiê Oficial
                  </button>
                </div>

                <form onSubmit={handleValidateStep3} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Aeroporto de Entrada (Port of Entry ICAO):
                      </label>
                      <input
                        type="text"
                        value={step3PortOfEntry}
                        onChange={(e) => {
                          setStep3PortOfEntry(e.target.value);
                          setStep3FormValidated(false);
                        }}
                        placeholder={`Ex: ${dossier.portOfEntryIcao}`}
                        className="w-full p-2 bg-white rounded border border-slate-300 focus:border-emerald-500 font-mono font-bold text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Piloto Requerente:
                      </label>
                      <input
                        type="text"
                        value={step3PilotName}
                        onChange={(e) => {
                          setStep3PilotName(e.target.value);
                          setStep3FormValidated(false);
                        }}
                        placeholder={`Ex: ${pilot.name}`}
                        className="w-full p-2 bg-white rounded border border-slate-300 focus:border-emerald-500 font-medium text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Matrícula de Origem a Ceder:
                      </label>
                      <input
                        type="text"
                        value={step3OldReg}
                        onChange={(e) => {
                          setStep3OldReg(e.target.value);
                          setStep3FormValidated(false);
                        }}
                        placeholder={`Ex: ${dossier.originalRegistration}`}
                        className="w-full p-2 bg-white rounded border border-slate-300 focus:border-emerald-500 font-mono font-bold text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Nova Matrícula Requerida (Reserva de Marcas):
                      </label>
                      <input
                        type="text"
                        value={step3NewReg}
                        onChange={(e) => {
                          setStep3NewReg(e.target.value);
                          setStep3FormValidated(false);
                        }}
                        placeholder={`Ex: ${dossier.newRegistration}`}
                        className="w-full p-2 bg-white rounded border border-slate-300 focus:border-emerald-500 font-mono font-bold text-emerald-700 outline-none"
                      />
                    </div>
                  </div>

                  {!step3FormValidated ? (
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Validar e Protocolar Declaração de Importação</span>
                    </button>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-emerald-900">
                      <span className="font-bold flex items-center gap-2 text-xs">
                        <Check className="w-4 h-4 text-emerald-600" /> Declaração de Importação Vistoriada e Deferida
                      </span>
                      <span className="text-[10px] font-mono font-black uppercase text-emerald-800">
                        ANAC / ALFÂNDEGA OK
                      </span>
                    </div>
                  )}
                </form>
              </div>

              {/* Payment Actions unlocked once form is validated */}
              {step3FormValidated && (
                <div className="pt-2 space-y-3 animate-fadeIn">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold block">Taxa de Vistoria Alfandegária e Homologação: {dossier.nationalizationFeeCr.toLocaleString('pt-BR')} CR</span>
                    <p className="text-[11px] text-amber-800">
                      Ao quitar ou solicitar o adiantamento, a nova matrícula <strong>{dossier.newRegistration}</strong> será atribuída oficialmente à aeronave.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => handleNationalizationAction('credits')}
                      disabled={playerCredits < dossier.nationalizationFeeCr}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        playerCredits >= dossier.nationalizationFeeCr
                          ? 'bg-slate-900 hover:bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>Pagar Taxa em CR ({dossier.nationalizationFeeCr.toLocaleString('pt-BR')} CR)</span>
                    </button>

                    <button
                      onClick={() => handleNationalizationAction('advance')}
                      className="flex-1 py-2.5 px-4 rounded-lg font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Solicitar Adiantamento à Contratante</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: FINAL LEG & DELIVERY */}
          {currentStep === 4 && (
            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                      Etapa 4 de 4 • Perna Final & Entrega da Aeronave
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      Nacionalização Aprovada & Voo de Entrega Final
                    </h4>
                  </div>
                </div>

                {/* Digital Stamp Display */}
                <div className="bg-emerald-100 border border-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-2 text-emerald-900 shadow-sm">
                  <Stamp className="w-4 h-4 text-emerald-700" />
                  <div className="text-left">
                    <span className="text-[9px] font-black uppercase tracking-wider block leading-none">Aeronave Nacionalizada</span>
                    <span className="text-xs font-mono font-black text-emerald-800">{assignedRegistration}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Localização em Solo:</span>
                  <span className="font-bold text-emerald-300">{dossier.portOfEntryName} ({dossier.portOfEntryIcao})</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Nova Matrícula Oficial:</span>
                  <span className="font-mono font-black text-amber-300 text-sm">{assignedRegistration}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700">
                  <span className="text-slate-300 font-medium">Destino Final de Entrega:</span>
                  <span className="font-bold text-white">Hangar da Contratante (SBSP - São Paulo)</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Toda a documentação internacional foi deferida e carimbada com sucesso. Ao confirmar a entrega, os créditos líquidos calculados e os pontos de experiência (XP) serão transferidos diretamente para a sua conta de piloto.
              </p>

              <button
                onClick={onCompleteDelivery}
                className="w-full py-3.5 px-4 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Finalizar Voo e Entregar Aeronave à Contratante</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
