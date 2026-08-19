import React, { useState } from 'react';
import { LicenseProgressionStatus } from '../../types/license';
import {
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Clock,
  Plane,
  ShieldCheck,
  Zap,
  Target,
  AlertCircle
} from 'lucide-react';

interface LicenseProgressPanelProps {
  progression: LicenseProgressionStatus;
  onPromote: () => void;
}

export const LicenseProgressPanel: React.FC<LicenseProgressPanelProps> = ({
  progression,
  onPromote,
}) => {
  const [promotedEffect, setPromotedEffect] = useState(false);

  if (progression.isMaxLicense || !progression.nextLicense) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-purple-200/90 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Nível Máximo de Habilitação
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {progression.currentLicense.name}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Parabéns, Comandante! Você atingiu a mais alta patente da aviação executiva e comercial, com autorização total para operações globais, jatos e translados transatlânticos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const nextTier = progression.nextLicense;

  const handlePromoteClick = () => {
    setPromotedEffect(true);
    onPromote();
    setTimeout(() => setPromotedEffect(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header with Next License Target */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              Próxima Habilitação
            </span>
            <span className="text-xs text-slate-400 font-bold">•</span>
            <span className="text-xs text-slate-500 font-semibold">{nextTier.subtitle}</span>
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {nextTier.name}
          </h3>
        </div>

        {/* Overall Progress Pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Progresso Geral</div>
            <div className="text-base font-black text-sky-600">{progression.progressPercentage}%</div>
          </div>
          <div className="w-16 bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progression.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Requirements List with Progress Bars */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-500" />
          Requisitos Oficiais da Homologação ({progression.requirements.filter((r) => r.isMet).length}/{progression.requirements.length} Concluídos)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progression.requirements.map((req) => {
            const pct = Math.min(100, Math.round((req.currentValue / req.targetValue) * 100));

            return (
              <div
                key={req.id}
                className={`p-4 rounded-xl border transition-all ${
                  req.isMet
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {req.isMet ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="text-xs font-extrabold text-slate-800">
                      {req.label}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded ${
                      req.isMet
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {req.currentValue} / {req.targetValue} {req.unit}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-snug mb-2.5">
                  {req.description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      req.isMet ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promotion Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          {progression.canPromote ? (
            <span className="text-emerald-600 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Todos os requisitos foram cumpridos! Solicite sua nova habilitação.
            </span>
          ) : (
            <span className="text-slate-500 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Continue realizando voos operacionais para atingir os requisitos restantes.
            </span>
          )}
        </div>

        <button
          onClick={handlePromoteClick}
          disabled={!progression.canPromote}
          className={`px-6 py-3 rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
            progression.canPromote
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 animate-bounce'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>
            {promotedEffect
              ? 'Habilitação Emitida com Sucesso!'
              : `Emitir Licença: ${nextTier.name}`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
