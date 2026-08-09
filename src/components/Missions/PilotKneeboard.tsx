import React, { useState } from 'react';
import {
  Contract,
  FerryDossier,
  SubmittedDocumentRecord,
  CommsMessage,
  RequiredDocument,
} from '../../types';
import { usePilot } from '../../context/PilotContext';
import { generateFerryAuthorizationPdf } from '../../utils/generateFerryAuthorizationPdf';
import {
  FileText,
  MessageSquare,
  MapPin,
  Plane,
  Shield,
  CheckCircle2,
  Clock,
  Send,
  Download,
  FastForward,
  Stamp,
  Globe,
  Building2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Layers,
  Check,
  UserCheck,
} from 'lucide-react';

interface PilotKneeboardProps {
  contract: Contract;
  onAdvanceStage?: () => void;
}

export const PilotKneeboard: React.FC<PilotKneeboardProps> = ({ contract, onAdvanceStage }) => {
  const {
    profile,
    requiredDocuments,
    regulatoryBodies,
    countriesInfo,
    submittedDocuments,
    submitMissionDocument,
    approveDocumentInstant,
    commsMessages,
    markCommsMessageRead,
    adminAdvanceFlightLeg,
    airportPool,
  } = usePilot();

  const dossier: FerryDossier | undefined = contract.ferryDossier;

  const [activeKneeboardTab, setActiveKneeboardTab] = useState<
    'overview' | 'documents' | 'comms' | 'route' | 'aircraft'
  >('documents');

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // Filter documents required for this contract's origin and destination
  const originIso = dossier?.originCountryCode || 'US';
  const destIso = dossier?.destinationCountryCode || 'BR';

  const relevantDocs = requiredDocuments.filter((doc) => {
    const body = regulatoryBodies.find((b) => b.id === doc.regulatoryBodyId);
    if (!body) return false;
    // Relevant if body belongs to origin, destination, or is EASA/enroute
    return body.countryIso === originIso || body.countryIso === destIso || doc.phase === 'enroute';
  });

  const contractSubmissions = submittedDocuments.filter((s) => s.contractId === contract.id);
  const contractMessages = commsMessages.filter((m) => m.contractId === contract.id);
  const unreadCount = contractMessages.filter((m) => !m.isRead).length;

  const activeDoc = relevantDocs.find((d) => d.id === selectedDocId) || relevantDocs[0];
  const activeSubmission = contractSubmissions.find((s) => s.documentId === activeDoc?.id);

  // Auto pre-fill logic
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

  const stagesList = [
    { num: 1, name: 'Contrato Aceito & Dossiê', icon: Plane, phase: 'departure' },
    { num: 2, name: 'Despacho & eAPIS Saída', icon: FileText, phase: 'departure' },
    { num: 3, name: 'Staging Port of Entry', icon: MapPin, phase: 'departure' },
    { num: 4, name: 'Declaração de Rota & Escalas', icon: Globe, phase: 'enroute' },
    { num: 5, name: 'Autorização de Sobrevoo (EASA)', icon: Shield, phase: 'enroute' },
    { num: 6, name: 'Pouso no POE de Chegada', icon: MapPin, phase: 'arrival' },
    { num: 7, name: 'Desembaraço Alfandegário & DI', icon: Stamp, phase: 'arrival' },
    { num: 8, name: 'Liberação & Entrega Final', icon: CheckCircle2, phase: 'arrival' },
  ];

  return (
    <div className="bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden font-sans text-slate-100">
      {/* Top Leather / Metal Clip EFB Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <FileText className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                Prancheta Digital de Voo • EFB Kneeboard
              </span>
              {dossier && (
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {dossier.originalRegistration} ➔ {dossier.newRegistration}
                </span>
              )}
            </div>
            <h2 className="text-base font-black text-white tracking-tight mt-0.5">
              Ferry Flight Dossier — {contract.route.departureIcao} ➔ {contract.route.arrivalIcao}
            </h2>
          </div>
        </div>

        {/* Admin Fast Advance Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={adminAdvanceFlightLeg}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-amber-300"
            title="Avançar etapa/perna do voo internacional [Admin]"
          >
            <FastForward className="w-4 h-4 fill-current" />
            <span>Avançar Etapa [Admin]</span>
          </button>
        </div>
      </div>

      {/* Kneeboard Tabs Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveKneeboardTab('documents')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeKneeboardTab === 'documents'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Documentos e Formulários</span>
          <span className="text-[10px] font-black bg-slate-950/40 px-1.5 py-0.5 rounded-full">
            {relevantDocs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveKneeboardTab('comms')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer relative ${
            activeKneeboardTab === 'comms'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Caixa de Comunicação</span>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveKneeboardTab('route')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeKneeboardTab === 'route'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Rota & Escalas</span>
        </button>

        <button
          onClick={() => setActiveKneeboardTab('aircraft')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeKneeboardTab === 'aircraft'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Aeronave & Dossiê</span>
        </button>

        <button
          onClick={() => setActiveKneeboardTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeKneeboardTab === 'overview'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Máquina de Estados</span>
        </button>
      </div>

      {/* Main Kneeboard Content Area */}
      <div className="p-6">
        {/* TAB: DOCUMENTS (PAPER LOOK & DYNAMIC FORM) */}
        {activeKneeboardTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Documents Sidebar List */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Declarações Exigidas ({relevantDocs.length})</span>
              </h3>

              <div className="space-y-2">
                {relevantDocs.map((doc) => {
                  const body = regulatoryBodies.find((b) => b.id === doc.regulatoryBodyId);
                  const sub = contractSubmissions.find((s) => s.documentId === doc.id);
                  const isSelected = activeDoc?.id === doc.id;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectDoc(doc)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-slate-800 text-amber-400 px-2 py-0.5 rounded">
                            {doc.code}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">{body?.shortName}</span>
                        </div>
                        <h4 className="text-xs font-black line-clamp-1">{doc.name}</h4>
                      </div>

                      <div className="shrink-0">
                        {sub?.status === 'approved' ? (
                          <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </span>
                        ) : sub?.status === 'under_review' ? (
                          <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center animate-spin">
                            <Clock className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center">
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Authentic Paper Form View */}
            <div className="lg:col-span-8">
              {activeDoc ? (
                <div className="bg-slate-50 text-slate-950 rounded-2xl border border-slate-300 p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
                  {/* Paper Watermark / Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-slate-900 text-white px-2.5 py-1 rounded">
                          FORM {activeDoc.code}
                        </span>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          {activeDoc.systemName}
                        </span>
                      </div>
                      <h2 className="text-lg font-black text-slate-900 mt-1">{activeDoc.name}</h2>
                    </div>

                    {/* Status Stamp if Approved */}
                    {activeSubmission?.status === 'approved' ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 border-4 border-emerald-600 rounded-2xl bg-emerald-50 text-emerald-800 transform rotate-[-3deg] shadow-lg">
                        <Stamp className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="text-xs font-black tracking-widest uppercase">APROVADO / CLEARED</p>
                          <p className="text-[9px] font-mono font-bold text-emerald-700">
                            REG: {new Date(activeSubmission.reviewCompletedAt || '').toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ) : activeSubmission?.status === 'under_review' ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-xl text-amber-900 text-xs font-bold">
                        <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                        <span>Em Análise pelo Órgão...</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 italic">Pendente de Envio</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-100 p-3 rounded-xl border border-slate-200">
                    {activeDoc.description}
                  </p>

                  {/* Dynamic Form Controls */}
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeDoc.formSchema?.fields?.map((field) => (
                        <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                          <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                            {field.label} {field.required && <span className="text-red-600">*</span>}
                          </label>

                          {field.type === 'airport_select' ? (
                            <select
                              value={formValues[field.key] || ''}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              disabled={activeSubmission?.status === 'approved'}
                              className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 disabled:opacity-75"
                            >
                              <option value="">Selecione o Aeroporto (ICAO)...</option>
                              {airportPool.map((ap) => (
                                <option key={ap.icao} value={ap.icao}>
                                  {ap.icao} - {ap.name} ({ap.city}, {ap.country})
                                </option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              value={formValues[field.key] || ''}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              disabled={activeSubmission?.status === 'approved'}
                              placeholder={field.placeholder}
                              rows={3}
                              className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 disabled:opacity-75"
                            />
                          ) : field.type === 'datetime' ? (
                            <input
                              type="datetime-local"
                              value={formValues[field.key] || ''}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              disabled={activeSubmission?.status === 'approved'}
                              className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 disabled:opacity-75"
                            />
                          ) : (
                            <input
                              type="text"
                              value={formValues[field.key] || ''}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              disabled={activeSubmission?.status === 'approved'}
                              placeholder={field.placeholder}
                              required={field.required}
                              className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 disabled:opacity-75"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Action Bar inside Form */}
                    <div className="pt-4 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => approveDocumentInstant(contract.id, activeDoc.id)}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-amber-600"
                        title="Simular aprovação imediata do documento [Admin]"
                      >
                        <FastForward className="w-4 h-4 fill-current" />
                        <span>Aprovação Rápida [Admin]</span>
                      </button>

                      {activeSubmission?.status !== 'approved' && (
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>Transmitir ao Órgão Regulador</span>
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 font-bold">
                  Nenhum documento selecionado.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: COMMS HUB */}
        {activeKneeboardTab === 'comms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>Comunicações dos Órgãos Reguladores ({contractMessages.length})</span>
              </h3>
            </div>

            {contractMessages.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-10 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">Nenhuma mensagem recebida ainda.</p>
                <p className="text-xs text-slate-500 font-medium">
                  Submeta formulários na aba de Documentos para receber protocolos e aprovações formais dos órgãos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {contractMessages.map((msg) => {
                  const body = regulatoryBodies.find((b) => b.id === msg.regulatoryBodyId);

                  return (
                    <div
                      key={msg.id}
                      onClick={() => markCommsMessageRead(msg.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        !msg.isRead
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 bg-slate-800 text-amber-400 rounded">
                            {body?.shortName || 'ÓRGÃO'}
                          </span>
                          <h4 className="text-sm font-black text-white">{msg.title}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-medium leading-relaxed">{msg.content}</p>

                      {body?.contactFlavorText && (
                        <p className="text-[10px] text-slate-500 font-medium italic border-t border-slate-800 pt-1.5">
                          {body.contactFlavorText}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: ROUTE & STAGING */}
        {activeKneeboardTab === 'route' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Trajeto Internacional & Port of Entry (POE)</span>
              </h3>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-black text-sm">
                    {contract.route.departureIcao}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Saída Original</span>
                    <h4 className="text-xs font-black text-white">{contract.route.departureName}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                  <span>➔</span>
                  <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">
                    POE: {dossier?.portOfEntryIcao || 'SBSG'}
                  </span>
                  <span>➔</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-black text-sm">
                    {contract.route.arrivalIcao}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Destino Final</span>
                    <h4 className="text-xs font-black text-white">{contract.route.arrivalName}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: AIRCRAFT & DOSSIER */}
        {activeKneeboardTab === 'aircraft' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Plane className="w-4 h-4 text-amber-500" />
                    <span>Dossiê da Aeronave & Termo de Autorização</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Especificações técnicas e licença de exportação fornecidas pela contratante.
                  </p>
                </div>

                <button
                  onClick={() =>
                    generateFerryAuthorizationPdf(
                      dossier!,
                      contract.company,
                      profile
                    )
                  }
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Autorização PDF</span>
                </button>
              </div>

              {dossier && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Aeronave</span>
                    <p className="text-xs font-black text-white mt-0.5">{dossier.aircraftModel}</p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">MSN / Serial</span>
                    <p className="text-xs font-mono font-black text-amber-400 mt-0.5">{dossier.msn}</p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Matrícula Atual</span>
                    <p className="text-xs font-mono font-black text-white mt-0.5">{dossier.originalRegistration}</p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Nova Matrícula</span>
                    <p className="text-xs font-mono font-black text-emerald-400 mt-0.5">{dossier.newRegistration}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: OVERVIEW (STATE MACHINE TIMELINE) */}
        {activeKneeboardTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Etapas do Motor de Missão de Translado</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {stagesList.map((stg) => (
                <div
                  key={stg.num}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30">
                      {stg.num}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                      {stg.phase}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-white">{stg.name}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
