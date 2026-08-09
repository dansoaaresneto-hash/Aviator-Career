import React, { useState } from 'react';
import { usePilot } from '../../context/PilotContext';
import { AirportSample } from '../../types';
import { Anchor, Search, Check, ShieldCheck, Clock, MapPin, Edit3 } from 'lucide-react';

export const AdminPortOfEntryTab: React.FC = () => {
  const { airportPool, toggleAirportPortOfEntry, updateAirportPoeInfo } = usePilot();
  const [search, setSearch] = useState('');
  const [filterPoeOnly, setFilterPoeOnly] = useState(true);

  const [editingIcao, setEditingIcao] = useState<string | null>(null);
  const [editHours, setEditHours] = useState('H24');
  const [editNotes, setEditNotes] = useState('');

  const filteredAirports = airportPool.filter((ap) => {
    const matchesSearch =
      ap.icao.toLowerCase().includes(search.toLowerCase()) ||
      ap.name.toLowerCase().includes(search.toLowerCase()) ||
      ap.city.toLowerCase().includes(search.toLowerCase()) ||
      ap.country.toLowerCase().includes(search.toLowerCase());

    if (filterPoeOnly) {
      return matchesSearch && ap.isPortOfEntry;
    }
    return matchesSearch;
  });

  const handleOpenEdit = (ap: AirportSample) => {
    setEditingIcao(ap.icao);
    setEditHours(ap.poeCustomsHours || 'H24');
    setEditNotes(ap.poeNotes || '');
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIcao) return;

    updateAirportPoeInfo(editingIcao, editHours, editNotes);
    setEditingIcao(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-900 p-5 rounded-2xl border border-emerald-800/40 shadow-md text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight">Aeroportos Port of Entry (POE)</h3>
            <p className="text-xs text-emerald-200/80 font-medium mt-0.5">
              Defina aeroportos habilitados para alfândega e imigração internacional (Staging e POE de Entrada).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setFilterPoeOnly(!filterPoeOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
              filterPoeOnly
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {filterPoeOnly ? 'Mostrando Somente POEs Ativos' : 'Mostrando Todos Aeroportos'}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar aeroporto por ICAO, cidade, país (ex: SBGR, KMIA)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <p className="text-xs font-bold text-slate-500">
          Exibindo <span className="text-slate-900">{filteredAirports.length}</span> aeroporto(s)
        </p>
      </div>

      {/* List of Airports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAirports.slice(0, 48).map((ap) => (
          <div
            key={ap.icao}
            className={`rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 ${
              ap.isPortOfEntry
                ? 'bg-emerald-50/30 border-emerald-300/80 shadow-xs'
                : 'bg-white border-slate-200/80'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black px-2.5 py-1 bg-slate-900 text-white rounded-lg">
                    {ap.icao}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    {ap.country}
                  </span>
                </div>

                <button
                  onClick={() => toggleAirportPortOfEntry(ap.icao)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    ap.isPortOfEntry
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ap.isPortOfEntry ? '✓ Port of Entry' : '+ Ativar POE'}
                </button>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900 line-clamp-1">{ap.name}</h4>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {ap.city}, {ap.country}
                </p>
              </div>

              {ap.isPortOfEntry && (
                <div className="p-3 bg-white rounded-xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      Horário Alfândega: {ap.poeCustomsHours || 'H24'}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(ap)}
                      className="text-[10px] font-bold text-sky-600 hover:underline flex items-center gap-0.5"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                  </div>

                  {ap.poeNotes && (
                    <p className="text-[11px] text-slate-600 font-medium italic border-t border-slate-100 pt-1.5">
                      "{ap.poeNotes}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingIcao && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Informações de Alfândega Port of Entry ({editingIcao})
              </h3>
              <button
                onClick={() => setEditingIcao(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Horários de Operação da Alfândega / CBP / Receita Federal
                </label>
                <input
                  type="text"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  placeholder="Ex: H24, 06:00-22:00 local, Sob Agendamento"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observações e Restrições do Port of Entry
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ex: Ponto de entrada H24. Combustível AVGAS e Jet-A1 disponíveis..."
                  rows={3}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingIcao(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Salvar Informações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
