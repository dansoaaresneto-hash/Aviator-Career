import React from 'react';
import { PilotLicenseId, PilotLicenseTier } from '../../types/license';
import { PILOT_LICENSES } from '../../data/licenses';
import {
  Award,
  CheckCircle2,
  Lock,
  Plane,
  ShieldCheck,
  Globe2,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

interface LicenseRoadmapListProps {
  currentLicenseId: PilotLicenseId;
}

export const LicenseRoadmapList: React.FC<LicenseRoadmapListProps> = ({ currentLicenseId }) => {
  const currentTier = PILOT_LICENSES.find((l) => l.id === currentLicenseId) || PILOT_LICENSES[0];

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-500" />
          Estrutura Completa de Carreira & Licenças
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Visão geral das 4 categorias de habilitação da aviação civil, aeronaves autorizadas, missões liberadas e regras de translado
        </p>
      </div>

      <div className="space-y-4">
        {PILOT_LICENSES.map((tier) => {
          const isAchieved = tier.order <= currentTier.order;
          const isCurrent = tier.id === currentTier.id;
          const isLocked = tier.order > currentTier.order;

          return (
            <div
              key={tier.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isCurrent
                  ? 'border-sky-500 shadow-md bg-white ring-2 ring-sky-500/10'
                  : isAchieved
                  ? 'border-emerald-200/90 bg-emerald-50/20'
                  : 'border-slate-200 bg-slate-50/60 opacity-80'
              }`}
            >
              {/* Tier Header Bar */}
              <div
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
                  isCurrent
                    ? 'bg-sky-50/60 border-sky-100'
                    : isAchieved
                    ? 'bg-emerald-50/40 border-emerald-100'
                    : 'bg-slate-100/60 border-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                      isCurrent
                        ? 'bg-sky-500 text-white border-sky-400 shadow-sm shadow-sky-500/30'
                        : isAchieved
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : 'bg-slate-200 text-slate-500 border-slate-300'
                    }`}
                  >
                    {tier.code}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">
                        {tier.name}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-black uppercase tracking-wider">
                          Habilitação Atual
                        </span>
                      )}
                      {isAchieved && !isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Conquistada
                        </span>
                      )}
                      {isLocked && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-extrabold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-500" />
                          Bloqueada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {tier.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-500">
                  {tier.order === 1 && 'Nível Inicial'}
                  {tier.order === 2 && 'Nível Intermediário'}
                  {tier.order === 3 && 'Nível Avançado'}
                  {tier.order === 4 && 'Nível Master / Elite'}
                </div>
              </div>

              {/* Tier Details Content */}
              <div className="p-5 sm:p-6 space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  {tier.description}
                </p>

                {/* Categorias e Aeronaves */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-sky-600" />
                    Categorias Homologadas & Aeronaves Típicas:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tier.allowedCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-white text-slate-800 border border-slate-200 font-bold text-[11px]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Privilégios & Restrições */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Privilégios */}
                  <div className="space-y-1.5">
                    <div className="font-extrabold text-emerald-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Privilégios & Missões Desbloqueadas:
                    </div>
                    <ul className="space-y-1 text-slate-600">
                      {tier.privileges.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Restrições / Bloqueios */}
                  <div className="space-y-1.5">
                    <div className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      Limitações da Categoria:
                    </div>
                    <ul className="space-y-1 text-slate-600">
                      {tier.restrictions.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
