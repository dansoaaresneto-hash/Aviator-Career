import React from 'react';
import { FerryDossier } from '../../types';
import { FileText, Shield, Plane, Building2, Scale, Tag } from 'lucide-react';
import { getAviationAuthority } from '../../utils/aviationAuthority';

interface FerryDossierCardProps {
  dossier: FerryDossier;
  assignedRegistration?: string;
  currentStep: number;
}

export const FerryDossierCard: React.FC<FerryDossierCardProps> = ({
  dossier,
  assignedRegistration,
  currentStep,
}) => {
  const originAuth = getAviationAuthority(dossier.originCountryCode, dossier.originCountryName);
  const destAuth = getAviationAuthority(dossier.destinationCountryCode, dossier.destinationCountryName);

  const activeRegistration = currentStep >= 3 && assignedRegistration
    ? assignedRegistration
    : dossier.originalRegistration;

  return (
    <div className="bg-slate-900 rounded-xl p-5 text-white border border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Dossiê Técnico da Aeronave</h4>
            <p className="text-[10px] text-slate-400">Informações e Especificações fornecidas pela Contratante</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          DOC # {dossier.msn}
        </span>
      </div>

      {/* Main Grid Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Model & Manufacturer */}
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5 flex items-center gap-1">
            <Plane className="w-3 h-3 text-sky-400" /> Modelo & Fabr.
          </span>
          <p className="font-extrabold text-white truncate">{dossier.aircraftModel}</p>
          <span className="text-[10px] text-slate-400 truncate block">{dossier.manufacturer}</span>
        </div>

        {/* MSN Serial */}
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5 flex items-center gap-1">
            <Tag className="w-3 h-3 text-indigo-400" /> MSN / Serial
          </span>
          <p className="font-extrabold text-white font-mono">{dossier.msn}</p>
          <span className="text-[10px] text-slate-400">Número de Série</span>
        </div>

        {/* Active Registration */}
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> Matrícula
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="font-black text-amber-300 font-mono text-sm">{activeRegistration}</p>
            {currentStep >= 3 && assignedRegistration && (
              <span className="text-[9px] font-extrabold bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-400/30">
                Nacionalizada
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">
            {currentStep >= 3 ? `Origem: ${dossier.originalRegistration}` : 'Registro de Origem'}
          </span>
        </div>

        {/* MTOW Weight */}
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5 flex items-center gap-1">
            <Scale className="w-3 h-3 text-amber-400" /> MTOW (Peso Máx)
          </span>
          <p className="font-extrabold text-white font-mono">{dossier.mtowKg.toLocaleString('pt-BR')} kg</p>
          <span className="text-[10px] text-slate-400">Decolagem Máxima</span>
        </div>
      </div>

      {/* Owner & Authority Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
        <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 block">Proprietário / Operador</span>
            <p className="text-xs font-bold text-slate-200 truncate">{dossier.currentOwner}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60 flex items-center justify-between text-[11px]">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">Jurisdição Regulatória</span>
            <p className="font-bold text-slate-200">{originAuth.flagEmoji} {originAuth.countryCode} ➔ {destAuth.flagEmoji} {destAuth.countryCode}</p>
          </div>
          <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-2 py-1 rounded border border-sky-400/30">
            Port of Entry: {dossier.portOfEntryIcao}
          </span>
        </div>
      </div>
    </div>
  );
};
