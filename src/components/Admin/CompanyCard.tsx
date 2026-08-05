import React from 'react';
import { AdminCompany, MISSION_TYPE_LABELS } from '../../types';
import { CompanyLogoBadge } from '../Common/CompanyLogoBadge';
import { Building2, Edit3, Trash2, Award, Globe, ToggleLeft, ToggleRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
  company: AdminCompany;
  onEdit: (company: AdminCompany) => void;
  onDelete: (companyId: string) => void;
  onToggleActive: (companyId: string) => void;
}

export const CompanyCard: React.FC<Props> = ({ company, onEdit, onDelete, onToggleActive }) => {
  const activeMissionTypesCount = company.allowedMissionTypes.length;
  const originCountriesCount = company.routeRules?.originCountries?.length || 0;

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 shadow-sm flex flex-col justify-between overflow-hidden ${
        company.isActive
          ? 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
          : 'border-slate-200/60 bg-slate-50/50 opacity-75'
      }`}
    >
      <div>
        {/* Top Header Card */}
        <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Rectangular Logo Badge */}
            <CompanyLogoBadge
              logoUrl={company.logoUrl}
              logoColor={company.logoColor}
              icaoCode={company.icaoCode}
              companyName={company.name}
              size="md"
            />

            {/* Name & ICAO */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-slate-800 text-sm leading-tight truncate">
                  {company.name}
                </h3>
                <span className="font-mono text-[10px] font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded shrink-0">
                  {company.icaoCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                {company.description}
              </p>
            </div>
          </div>

          {/* Active Status Toggle */}
          <button
            onClick={() => onToggleActive(company.id)}
            title={company.isActive ? 'Desativar Empresa' : 'Ativar Empresa'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              company.isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            {company.isActive ? (
              <>
                <ToggleRight className="w-4 h-4 text-emerald-600" />
                <span>Ativa</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-slate-400" />
                <span>Inativa</span>
              </>
            )}
          </button>
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-3">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Nível Mínimo</span>
                <span className="font-extrabold text-slate-800 text-xs">Nível {company.minPilotLevel}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Escopo Rotas</span>
                <span className="font-extrabold text-slate-800 text-xs truncate capitalize">
                  {company.routeRules?.scope === 'national' ? 'Nacional' : 'Internacional'} ({originCountriesCount} países)
                </span>
              </div>
            </div>
          </div>

          {/* Mission Types Chips */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Tipos de Missão Habilitados ({activeMissionTypesCount})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {company.allowedMissionTypes.map((typeKey) => {
                const info = MISSION_TYPE_LABELS[typeKey];
                return (
                  <span
                    key={typeKey}
                    className="text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200/80 px-2 py-0.5 rounded-md"
                  >
                    {info ? info.label : typeKey}
                  </span>
                );
              })}

              {activeMissionTypesCount === 0 && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-600" /> Nenhum tipo ativo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400">
          ID: {company.id}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(company)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-sky-600" />
            <span>Editar</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`Tem certeza que deseja excluir a empresa "${company.name}"?`)) {
                onDelete(company.id);
              }
            }}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 shadow-2xs transition-all cursor-pointer"
            title="Excluir Empresa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
