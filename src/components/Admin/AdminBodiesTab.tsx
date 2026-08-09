import React, { useState } from 'react';
import { usePilot } from '../../context/PilotContext';
import { RegulatoryBody, RegulatoryRole } from '../../types';
import { Building2, Plus, Edit2, Trash2, ShieldCheck, FileText } from 'lucide-react';

export const AdminBodiesTab: React.FC = () => {
  const { regulatoryBodies, saveRegulatoryBody, deleteRegulatoryBody, countriesInfo } = usePilot();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBody, setEditingBody] = useState<RegulatoryBody | null>(null);

  const [countryIso, setCountryIso] = useState('BR');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [role, setRole] = useState<RegulatoryRole>('aviação civil');
  const [contactFlavorText, setContactFlavorText] = useState('');

  const handleOpenModal = (body?: RegulatoryBody) => {
    if (body) {
      setEditingBody(body);
      setCountryIso(body.countryIso);
      setName(body.name);
      setShortName(body.shortName);
      setRole(body.role);
      setContactFlavorText(body.contactFlavorText || '');
    } else {
      setEditingBody(null);
      setCountryIso('BR');
      setName('');
      setShortName('');
      setRole('aviação civil');
      setContactFlavorText('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortName.trim()) return;

    const newBody: RegulatoryBody = {
      id: editingBody ? editingBody.id : `body_${Date.now()}`,
      countryIso,
      name: name.trim(),
      shortName: shortName.trim(),
      role,
      contactFlavorText: contactFlavorText.trim(),
    };

    saveRegulatoryBody(newBody);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-5 rounded-2xl border border-emerald-800/40 shadow-md text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight">Órgãos Reguladores e Autoridades Aéreas</h3>
            <p className="text-xs text-emerald-200/80 font-medium mt-0.5">
              Cadastre autoridades alfandegárias (CBP, Receita Federal) e de aviação civil (ANAC, FAA, EASA).
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Órgão Regulador</span>
        </button>
      </div>

      {/* Grid of Regulatory Bodies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regulatoryBodies.map((body) => {
          const country = countriesInfo.find((c) => c.isoCode === body.countryIso);

          return (
            <div
              key={body.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-200">
                      {body.shortName}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {country?.name || body.countryIso}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(body)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Editar Órgão"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteRegulatoryBody(body.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Órgão"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900">{body.name}</h4>
                  <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mt-0.5">
                    Papel: {body.role}
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 font-medium italic">
                  "{body.contactFlavorText || 'Sem texto de ambientação.'}"
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Emissor oficial de atos regulatórios</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Body */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                {editingBody ? 'Editar Órgão Regulador' : 'Novo Órgão Regulador'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  País de Atuação *
                </label>
                <select
                  value={countryIso}
                  onChange={(e) => setCountryIso(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                >
                  {countriesInfo.map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>
                      {c.name} ({c.isoCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sigla / Acrônimo (ex: CBP, ANAC, RFB) *
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="Ex: CBP"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-bold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo do Órgão *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: U.S. Customs and Border Protection"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Função Principal (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RegulatoryRole)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="aduana">Aduana / Alfândega</option>
                  <option value="aviação civil">Aviação Civil / Regulação</option>
                  <option value="imigração">Imigração / Fronteira</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Texto de Ambientação (Tom de Voz dos E-mails)
                </label>
                <textarea
                  value={contactFlavorText}
                  onChange={(e) => setContactFlavorText(e.target.value)}
                  placeholder="Ex: Divisão de Despacho de Fronteira e Aviação Geral..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:border-emerald-500"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Salvar Órgão Regulador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
