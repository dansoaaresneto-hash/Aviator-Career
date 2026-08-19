import React, { useState, useEffect } from 'react';
import {
  Contract,
  FerryDossier,
} from '../../../types';
import { usePilot } from '../../../context/PilotContext';
import {
  Stamp,
  CheckCircle2,
  FileText,
  Clock,
  Send,
  Award,
  Lock,
} from 'lucide-react';

interface CustomsRegistrationSectionProps {
  contract: Contract;
  dossier?: FerryDossier;
}

export const CustomsRegistrationSection: React.FC<CustomsRegistrationSectionProps> = ({
  contract,
  dossier,
}) => {
  const {
    requiredDocuments,
    submittedDocuments,
    submitMissionDocument,
    getFerryRoutePlan,
  } = usePilot();

  // Documento de Importação / DI e RAB
  const diDoc = requiredDocuments.find((d) => d.code === 'DI_IMPORT' || d.phase === 'arrival');

  const diSubmission = submittedDocuments.find(
    (s) => s.contractId === contract.id && s.documentId === diDoc?.id
  );

  const isApproved = diSubmission?.status === 'approved';
  const isUnderReview = diSubmission?.status === 'under_review';

  // O Port of Entry só é conhecido depois que o piloto obtém a Autorização de
  // Saída do País no Staging Airport (ver aba "Escalas & Permits").
  const plan = getFerryRoutePlan(contract.id);
  const isPoeKnown = plan.isClearedForDeparture && (plan.permits || []).length > 0;
  const poeLabel = isPoeKnown ? plan.portOfEntryIcao : '——';

  // Form local
  const [newReg, setNewReg] = useState(dossier?.newRegistration || 'PS-GFA');
  const [cnpjCpf, setCnpjCpf] = useState(dossier?.ownerTaxId || '12.345.678/0001-90');
  const [msnSerial, setMsnSerial] = useState(dossier?.msn || 'MSN-172-84920');
  const [poeIcao, setPoeIcao] = useState('');

  // Preenche o campo do POE somente quando ele já tiver sido revelado ao piloto.
  useEffect(() => {
    if (isPoeKnown && !poeIcao) {
      setPoeIcao(plan.portOfEntryIcao);
    }
  }, [isPoeKnown, plan.portOfEntryIcao]);

  const handleSubmitCustoms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diDoc) return;

    submitMissionDocument(contract.id, diDoc.id, {
      new_registration: newReg,
      port_of_entry_arrival: poeIcao,
      owner_cnpj_cpf: cnpjCpf,
      msn_serial: msnSerial,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                  Etapa 3 · Port of Entry & Despacho Aduaneiro
                </span>
                <span className={`text-xs font-bold font-mono flex items-center gap-1 ${isPoeKnown ? 'text-slate-500' : 'text-slate-400'}`}>
                  {!isPoeKnown && <Lock className="w-3 h-3" />}
                  POE: {poeLabel}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                Desembaraço de Importação & Homologação RAB
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isApproved ? (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Aeronave Nacionalizada (RAB OK)
              </span>
            ) : isUnderReview ? (
              <span className="px-3 py-1.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                Despacho Fiscal em Análise
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold">
                Pendente de Envio
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {isPoeKnown ? (
            <>
              Ao ingressar no espaço aéreo de destino, a aeronave obrigatoriamente pousa no <strong>Port of Entry</strong> ({poeLabel}) para abertura da <strong>Declaração de Importação (DI)</strong> junto à Receita Federal e registro definitivo das novas marcas no <strong>Registro Aeronáutico Brasileiro (RAB)</strong>.
            </>
          ) : (
            <>
              O <strong>Port of Entry</strong> de destino ainda não foi definido. Ele será revelado assim que a Autorização de Saída do País for obtida no Staging Airport (aba "Escalas & Permits").
            </>
          )}
        </p>
      </div>

      {/* Main Grid: Form & Official Registration Certificate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Form Column */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <FileText className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-bold text-slate-900">
              Formulário de Despacho de Importação (DI / SISCOMEX)
            </h4>
          </div>

          <form onSubmit={handleSubmitCustoms} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Port of Entry de Desembaraço (ICAO)
              </label>
              <input
                type="text"
                value={poeIcao}
                onChange={(e) => setPoeIcao(e.target.value)}
                disabled={!isPoeKnown}
                placeholder={isPoeKnown ? undefined : 'Obtenha a Autorização de Saída do País primeiro'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Nova Matrícula Brasileira Atribuída (RAB)
              </label>
              <input
                type="text"
                value={newReg}
                onChange={(e) => setNewReg(e.target.value)}
                placeholder="Ex: PS-GFA, PR-ZVA, PT-FMS"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  MSN / Número de Série
                </label>
                <input
                  type="text"
                  value={msnSerial}
                  onChange={(e) => setMsnSerial(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  CNPJ / CPF do Comprador
                </label>
                <input
                  type="text"
                  value={cnpjCpf}
                  onChange={(e) => setCnpjCpf(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isApproved || isUnderReview || !isPoeKnown}
                title={!isPoeKnown ? 'Obtenha a Autorização de Saída do País para liberar este formulário' : undefined}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPoeKnown ? <Send className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>
                  {isApproved
                    ? 'Declaração e Homologação Deferidas'
                    : isUnderReview
                    ? 'Aguardando Despacho Fiscal...'
                    : !isPoeKnown
                    ? 'Aguardando Definição do Port of Entry'
                    : 'Transmitir Declaração de Importação (DI)'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Certificate / RAB Plate Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-sm font-black text-white">Certificado de Verificação (CNAV)</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Registro Aeronáutico Brasileiro · ANAC
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                SISCOMEX OK
              </span>
            </div>

            {/* Visual Registration Plate */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">
                Matrícula Nacional Oficial
              </span>
              <div className="inline-block bg-gradient-to-r from-emerald-500/20 to-sky-500/20 border-2 border-emerald-400/50 rounded-lg px-6 py-2">
                <span className="text-3xl font-black font-mono tracking-wider text-emerald-400">
                  {isApproved ? (dossier?.newRegistration || newReg) : 'EM REGISTRO'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Cancelamento FAA: {dossier?.originalRegistration || 'N172FT'} ➔ Inscrição RAB: {dossier?.newRegistration || newReg}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-800">
                <span className="text-slate-400">Modelo / Célula:</span>
                <strong className="text-white font-mono">{dossier?.aircraftModel || contract.requiredAircraft}</strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-800">
                <span className="text-slate-400">Número de Série (MSN):</span>
                <strong className="text-white font-mono">{dossier?.msn || msnSerial}</strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-800">
                <span className="text-slate-400">Proprietário Contratante:</span>
                <strong className="text-white">{dossier?.currentOwner || contract.company.name}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};