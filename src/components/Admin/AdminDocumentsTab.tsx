import React, { useState } from 'react';
import { usePilot } from '../../context/PilotContext';
import { RequiredDocument, DocumentPhase, FormFieldSchema } from '../../types';
import { FileText, Plus, Edit2, Trash2, Clock, Code, ChevronRight, Sparkles } from 'lucide-react';

export const AdminDocumentsTab: React.FC = () => {
  const { requiredDocuments, saveRequiredDocument, deleteRequiredDocument, regulatoryBodies } = usePilot();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<RequiredDocument | null>(null);

  const [regulatoryBodyId, setRegulatoryBodyId] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [systemName, setSystemName] = useState('');
  const [phase, setPhase] = useState<DocumentPhase>('departure');
  const [description, setDescription] = useState('');
  const [requiresReviewDelayMinutes, setRequiresReviewDelayMinutes] = useState(1);
  const [formSchemaJson, setFormSchemaJson] = useState('');

  const handleOpenModal = (doc?: RequiredDocument) => {
    if (doc) {
      setEditingDoc(doc);
      setRegulatoryBodyId(doc.regulatoryBodyId);
      setCode(doc.code);
      setName(doc.name);
      setSystemName(doc.systemName);
      setPhase(doc.phase);
      setDescription(doc.description);
      setRequiresReviewDelayMinutes(doc.requiresReviewDelayMinutes);
      setFormSchemaJson(JSON.stringify(doc.formSchema, null, 2));
    } else {
      setEditingDoc(null);
      setRegulatoryBodyId(regulatoryBodies[0]?.id || '');
      setCode('');
      setName('');
      setSystemName('');
      setPhase('departure');
      setDescription('');
      setRequiresReviewDelayMinutes(1);
      setFormSchemaJson(
        JSON.stringify(
          {
            fields: [
              {
                key: 'aircraft_reg',
                label: 'Matrícula da Aeronave',
                type: 'text',
                prefillFrom: 'mission.aircraft.registration',
                required: true,
              },
            ],
          },
          null,
          2
        )
      );
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !regulatoryBodyId) return;

    let parsedSchema = { fields: [] };
    try {
      parsedSchema = JSON.parse(formSchemaJson);
    } catch (err) {
      alert('JSON do Form Schema inválido. Por favor, verifique a sintaxe.');
      return;
    }

    const newDoc: RequiredDocument = {
      id: editingDoc ? editingDoc.id : `doc_${Date.now()}`,
      regulatoryBodyId,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      systemName: systemName.trim(),
      phase,
      description: description.trim(),
      requiresReviewDelayMinutes: Number(requiresReviewDelayMinutes) || 0,
      formSchema: parsedSchema,
    };

    saveRequiredDocument(newDoc);
    setIsModalOpen(false);
  };

  const phaseBadges: Record<DocumentPhase, { label: string; color: string }> = {
    departure: { label: '1. Saída (Departure)', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    enroute: { label: '2. Em Rota / Sobrevoo', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
    arrival: { label: '3. Chegada & DI (Arrival)', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-indigo-900 p-5 rounded-2xl border border-amber-800/40 shadow-md text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight">Formulários & Documentos Exigidos</h3>
            <p className="text-xs text-amber-200/80 font-medium mt-0.5">
              Crie declarações oficiais com esquema de campos dinâmicos (`form_schema`) e tempos de análise simulados.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Documento</span>
        </button>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requiredDocuments.map((doc) => {
          const body = regulatoryBodies.find((b) => b.id === doc.regulatoryBodyId);
          const badge = phaseBadges[doc.phase];

          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-black px-2.5 py-1 bg-slate-900 text-white rounded-lg">
                    {doc.code}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(doc)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Editar Documento"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteRequiredDocument(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Documento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900">{doc.name}</h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                    Órgão: <span className="text-slate-800">{body?.name || 'Órgão Desconhecido'}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Análise: {doc.requiresReviewDelayMinutes} min
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium line-clamp-2">
                  {doc.description || 'Sem descrição cadastrada.'}
                </p>

                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] font-mono text-slate-600 flex items-center justify-between">
                  <span>Campos do formulário:</span>
                  <span className="font-bold text-slate-900">
                    {doc.formSchema?.fields?.length || 0} campos
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                {editingDoc ? 'Editar Documento Regulatório' : 'Novo Documento Regulatório'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Órgão Regulador Emissor *
                  </label>
                  <select
                    value={regulatoryBodyId}
                    onChange={(e) => setRegulatoryBodyId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
                    required
                  >
                    {regulatoryBodies.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.shortName} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fase da Missão *
                  </label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value as DocumentPhase)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="departure">1. Saída (Departure)</option>
                    <option value="enroute">2. Em Rota / Sobrevoo</option>
                    <option value="arrival">3. Chegada & DI (Arrival)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código do Documento (ex: EAPIS_MANIFEST) *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: EAPIS_MANIFEST"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-bold focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempo de Análise Simulado (Minutos)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={requiresReviewDelayMinutes}
                    onChange={(e) => setRequiresReviewDelayMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Documento (Visual para o Piloto) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Manifesto eAPIS (CBP)"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Sistema Governamental
                </label>
                <input
                  type="text"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  placeholder="Ex: CBP Form APIS-301 Private Manifest"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição & Orientações de Preenchimento
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Orientação detalhada para o piloto preencher o formulário..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-amber-600" />
                    <span>Esquema dos Campos do Formulário (`formSchema` JSON)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Suporta prefillFrom e tipos</span>
                </div>
                <textarea
                  value={formSchemaJson}
                  onChange={(e) => setFormSchemaJson(e.target.value)}
                  rows={8}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 font-medium focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
