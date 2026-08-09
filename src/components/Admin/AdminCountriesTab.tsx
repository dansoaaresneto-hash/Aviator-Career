import React, { useState } from 'react';
import { usePilot } from '../../context/PilotContext';
import { CountryRegulatoryInfo } from '../../types';
import { Globe, Shield, Edit2, Search, Check, AlertTriangle } from 'lucide-react';

export const AdminCountriesTab: React.FC = () => {
  const { countriesInfo, regulatoryZones, saveCountryInfo } = usePilot();
  const [search, setSearch] = useState('');
  const [editingCountry, setEditingCountry] = useState<CountryRegulatoryInfo | null>(null);

  const [requiresOverflight, setRequiresOverflight] = useState(false);
  const [zoneId, setZoneId] = useState('');
  const [customsNotes, setCustomsNotes] = useState('');

  const filtered = countriesInfo.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.isoCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (country: CountryRegulatoryInfo) => {
    setEditingCountry(country);
    setRequiresOverflight(country.requiresOverflightPermit);
    setZoneId(country.zoneId);
    setCustomsNotes(country.customsNotes || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCountry) return;

    const updated: CountryRegulatoryInfo = {
      ...editingCountry,
      zoneId,
      requiresOverflightPermit: requiresOverflight,
      customsNotes: customsNotes.trim(),
    };

    saveCountryInfo(updated);
    setEditingCountry(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-600" />
            <span>Países & Regras Aéreas Internacionais</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure permissões de sobrevoo e vincule países a zonas regulatórias.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar país ou ISO (ex: BR, US)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:border-sky-500"
          />
        </div>
      </div>

      {/* Grid of Countries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((country) => {
          const zone = regulatoryZones.find((z) => z.id === country.zoneId);

          return (
            <div
              key={country.isoCode}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                      {country.isoCode}
                    </span>
                    <h4 className="text-sm font-black text-slate-900">{country.name}</h4>
                  </div>

                  <button
                    onClick={() => handleEdit(country)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                    title="Editar País"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Zone Badge */}
                {zone ? (
                  <div className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: zone.colorHex }}
                    />
                    <span className="text-xs font-bold text-slate-700">{zone.name}</span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-amber-600">Sem zona vinculada</span>
                )}

                {/* Overflight permit status */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600">Autorização de Sobrevoo:</span>
                  {country.requiresOverflightPermit ? (
                    <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Exigido (Overflight)
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Isento / Direto
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-medium line-clamp-2">
                  {country.customsNotes || 'Sem notas alfandegárias registradas.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Country Modal */}
      {editingCountry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Regras Aéreas: {editingCountry.name} ({editingCountry.isoCode})
              </h3>
              <button
                onClick={() => setEditingCountry(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Zona Regulatória Pertencente
                </label>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-sky-500"
                >
                  <option value="">Nenhuma Zona</option>
                  {regulatoryZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.code} - {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresOverflight}
                    onChange={(e) => setRequiresOverflight(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <span className="text-xs font-black text-slate-900">
                    Exigir Autorização Especial de Sobrevoo (Overflight Permit)
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 leading-relaxed pl-6">
                  Se marcado, voos que cruzarem ou pousarem neste país durante uma missão internacional exigirão a etapa de aprovação de sobrevoo.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas & Instruções Alfandegárias (Customs Notes)
                </label>
                <textarea
                  value={customsNotes}
                  onChange={(e) => setCustomsNotes(e.target.value)}
                  placeholder="Instruções para o piloto sobre ritos alfandegários no país..."
                  rows={3}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCountry(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Salvar Regras do País
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
