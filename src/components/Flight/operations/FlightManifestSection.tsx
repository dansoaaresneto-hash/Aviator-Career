import React, { useState } from 'react';
import {
  Contract,
  FerryDossier,
  RequiredDocument,
  SubmittedDocumentRecord,
  RegulatoryBody,
  AirportSample,
} from '../../../types';
import { usePilot } from '../../../context/PilotContext';
import {
  FileText,
  CheckCircle2,
  Clock,
  Send,
  FastForward,
  Stamp,
  Building2,
  AlertCircle,
  Check,
  Plane,
} from 'lucide-react';

interface FlightManifestSectionProps {
  contract: Contract;
  dossier?: FerryDossier;
}

export const FlightManifestSection: React.FC<FlightManifestSectionProps> = ({
  contract,
  dossier,
}) => {
  const {
    profile,
    requiredDocuments,
    regulatoryBodies,
    submittedDocuments,
    airportPool,
    submitMissionDocument,
    approveDocumentInstant,
  } = usePilot();

  const originIso = dossier?.originCountryCode || 'US';
  const destIso = dossier?.destinationCountryCode || 'BR';

  const relevantDocs = requiredDocuments.filter((doc) => {
    const body = regulatoryBodies.find((b) => b.id === doc.regulatoryBodyId);
    if (!body) return false;
    return body.countryIso === originIso || body.countryIso === destIso || doc.phase === 'departure';
  });

  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    relevantDocs[0]?.id || 'doc_eapis_manifest'
  );
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const activeDoc = relevantDocs.find((d) => d.id === selectedDocId) || relevantDocs[0];
  const activeSubmission = submittedDocuments.find(
    (s) => s.contractId === contract.id && s.documentId === activeDoc?.id
  );
  const isApproved = activeSubmission?.status === 'approved';
  const isUnderReview = activeSubmission?.status === 'under_review';

  // Helper de inicialização ao selecionar documento
  const handleSelectDoc = (doc: RequiredDocument) => {
    setSelectedDocId(doc.id);
    const initial: Record<string, any> = {};

    doc.formSchema?.fields?.forEach((f) => {
      if (f.prefillFrom === 'mission.aircraft.registration') {
        initial[f.key] = dossier?.originalRegistration || 'N172FT';
      } else if (f.prefillFrom === 'pilot.name') {
        initial[f.key] = profile.name;
      } else if (f.prefillFrom === 'pilot.callsign') {
        initial[f.key] = profile.preferredCallsign || 'PT-PLT';
      } else if (f.prefillFrom === 'mission.poe.icao') {
        initial[f.key] = dossier?.portOfEntryIcao || 'SBSG';
      } else if (f.prefillFrom === 'mission.departure.icao') {
        initial[f.key] = contract.route.departureIcao;
      } else if (f.prefillFrom === 'mission.arrival.icao') {
        initial[f.key] = contract.route.arrivalIcao;
      } else if (f.key === 'new_registration') {
        initial[f.key] = dossier?.newRegistration || 'PS-GFA';
      } else if (f.key === 'msn_serial') {
        initial[f.key] = dossier?.msn || 'MSN-84920';
      } else if (f.key === 'owner_cnpj_cpf') {
        initial[f.key] = dossier?.ownerTaxId || '12.345.678/0001-90';
      } else if (f.type === 'datetime') {
        initial[f.key] = new Date().toISOString().slice(0, 16);
      } else if (f.type === 'checkbox') {
        initial[f.key] = false;
      }
    });

    setFormValues(initial);
  };

  const handleInputChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc) return;
    submitMissionDocument(contract.id, activeDoc.id, formValues);
  };

  const activeBody = regulatoryBodies.find((b) => b.id === activeDoc?.regulatoryBodyId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* LEFT COLUMN: List of Required Departure Manifests */}
      <div className="lg:col-span-4 bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Manifestos & Despacho</h3>
              <p className="text-[11px] text-slate-500">Documentos de saída internacional</p>
            </div>
          </div>
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
            {relevantDocs.length}
          </span>
        </div>

        <div className="space-y-2">
          {relevantDocs.map((doc) => {
            const body = regulatoryBodies.find((b) => b.id === doc.regulatoryBodyId);
            const sub = submittedDocuments.find(
              (s) => s.contractId === contract.id && s.documentId === doc.id
            );
            const isSelected = activeDoc?.id === doc.id;
            const docApproved = sub?.status === 'approved';
            const docUnderReview = sub?.status === 'under_review';

            return (
              <div
                key={doc.id}
                onClick={() => handleSelectDoc(doc)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/70 border-sky-400 shadow-xs ring-1 ring-sky-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                      {body?.shortName || 'ÓRGÃO'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">{doc.name}</h4>
                  </div>

                  <span className="shrink-0">
                    {docApproved ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> OK
                      </span>
                    ) : docUnderReview ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3 animate-spin" /> Análise
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">Pendente</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Form & Transmission Terminal */}
      <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-5">
        {activeDoc && (
          <>
            {/* Header of the Active Document */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded font-mono">
                    {activeBody?.shortName || 'ÓRGÃO REGULADOR'}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">{activeDoc.code}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{activeDoc.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{activeDoc.description}</p>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {isApproved ? (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Protocolo Autorizado
                  </span>
                ) : isUnderReview ? (
                  <span className="px-3 py-1.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    Processando Autorização...
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold">
                    Pendente de Transmissão
                  </span>
                )}
              </div>
            </div>

            {/* Approval Stamp banner if approved */}
            {isApproved && activeSubmission?.clearanceStamp && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <Stamp className="w-4 h-4 text-emerald-600" />
                    Selo Oficial de Liberação de Saída
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {activeSubmission.clearanceStamp.sealCode}
                  </span>
                </div>
                <p className="text-emerald-800 text-[11px]">
                  Emitido por <strong>{activeSubmission.clearanceStamp.issuedBy}</strong> em{' '}
                  {new Date(activeSubmission.clearanceStamp.issuedAt).toLocaleString('pt-BR')}.
                </p>
              </div>
            )}

            {/* Document Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeDoc.formSchema?.fields?.map((f) => {
                  if (f.type === 'checkbox') {
                    return (
                      <div
                        key={f.key}
                        className="sm:col-span-2 flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200"
                      >
                        <input
                          type="checkbox"
                          id={f.key}
                          checked={!!formValues[f.key]}
                          onChange={(e) => handleInputChange(f.key, e.target.checked)}
                          disabled={isApproved || isUnderReview}
                          className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 mt-0.5 cursor-pointer"
                        />
                        <label htmlFor={f.key} className="text-xs text-slate-700 cursor-pointer">
                          <strong>{f.label}</strong>
                          {f.required && <span className="text-red-500 ml-0.5">*</span>}
                        </label>
                      </div>
                    );
                  }

                  return (
                    <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        {f.label}
                        {f.required && <span className="text-red-500 ml-0.5">*</span>}
                      </label>
                      <input
                        type={f.type === 'number' ? 'number' : f.type === 'datetime' ? 'datetime-local' : 'text'}
                        value={formValues[f.key] || ''}
                        onChange={(e) => handleInputChange(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        disabled={isApproved || isUnderReview}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                        required={f.required}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500">
                  {isApproved
                    ? 'Manifesto protocolado com sucesso.'
                    : 'Transmita o manifesto para liberar a autorização aduaneira.'}
                </div>

                <div className="flex items-center gap-2">
                  {!isApproved && (
                    <button
                      type="button"
                      onClick={() => approveDocumentInstant(contract.id, activeDoc.id)}
                      className="px-3 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Aprovar instantaneamente para testes"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>Aprovar Instantâneo [Admin]</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isApproved || isUnderReview}
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isApproved
                        ? 'Manifesto Transmitido & Liberado'
                        : isUnderReview
                        ? 'Processando Protocolo...'
                        : 'Transmitir Manifesto Oficial'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
