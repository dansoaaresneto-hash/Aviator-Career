import React, { useState } from 'react';
import { usePilot } from '../../context/PilotContext';
import { RegulatoryZone } from '../../types';
import { Shield, Plus, Edit2, Trash2, CheckCircle2, Globe, Sparkles } from 'lucide-react';

export const AdminZonesTab: React.FC = () => {
  const { regulatoryZones, saveRegulatoryZone, deleteRegulatoryZone } = usePilot();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<RegulatoryZone | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorHex, setColorHex] = useState('#0284c7');

  const handleOpenModal = (zone?: RegulatoryZone) => {
    if (zone) {
      setEditingZone(zone);
      setCode(zone.code);
      setName(zone.name);
      setDescription(zone.description);
      setColorHex(zone.colorHex);
    } else {
      setEditingZone(null);
      setCode('');
      setName('');
      setDescription('');
      setColorHex('#0284c7');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const newZone: RegulatoryZone = {
      id: editingZone ? editingZone.id : `zone_${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      colorHex,
    };

    saveRegulatoryZone(newZone);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-900 p-5 rounded-2xl border border-sky-800/50 shadow-md text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight">Zonas Regulatórias da Aviação</h3>
            <p className="text-xs text-sky-200/80 font-medium mt-0.5">
              Gerencie blocos aéreos globais (FAA, ANAC, EASA) para aplicação automática de regramentos alfandegários.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Zona Regulatória</span>
        </button>
      </div>

      {/* Grid of Zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {regulatoryZones.map((zone) => (
          <div
            key={zone.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider text-white shadow-xs"
                  style={{ backgroundColor: zone.colorHex }}
                >
                  {zone.code}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(zone)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Editar Zona"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteRegulatoryZone(zone.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Excluir Zona"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900">{zone.name}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                  {zone.description || 'Sem descrição cadastrada.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              <span>Regras de espaço aéreo unificadas</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edit / Add Zone */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                {editingZone ? 'Editar Zona Regulatória' : 'Nova Zona Regulatória'}
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
                  Código da Zona (ex: FAA, EASA, ANAC_LATAM) *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ex: FAA"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-bold focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Extenso da Zona *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: FAA Zone (EUA e Territórios)"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição & Alcance
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva a jurisdição aérea ou órgãos agrupados..."
                  rows={3}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cor de Identificação Visual (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-bold"
                  />
                </div>
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
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Salvar Zona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
