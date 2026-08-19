import React from 'react';
import { usePilot } from '../../context/PilotContext';
import { Award, Compass, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

interface CareerModeBannerProps {
  onOpenModeSelector: () => void;
}

export const CareerModeBanner: React.FC<CareerModeBannerProps> = ({ onOpenModeSelector }) => {
  const { profile } = usePilot();
  const isFullCareer = profile.careerMode !== 'free_career';

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isFullCareer
          ? 'bg-gradient-to-r from-sky-500/10 via-slate-50 to-indigo-500/10 border-sky-200 shadow-sm'
          : 'bg-gradient-to-r from-purple-500/10 via-slate-50 to-pink-500/10 border-purple-200 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${
            isFullCareer
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
          }`}
        >
          {isFullCareer ? <Award className="w-6 h-6" /> : <Compass className="w-6 h-6" />}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isFullCareer
                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                  : 'bg-purple-100 text-purple-800 border-purple-300'
              }`}
            >
              {isFullCareer ? 'Modo Ativo: Carreira Completa' : 'Modo Ativo: Carreira Livre (Sandbox)'}
            </span>
          </div>

          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            {isFullCareer
              ? 'Você está jogando com progressão realista de licenças ANAC/FAA. Aeronaves e contratos de translado internacional são desbloqueados conforme suas conquistas.'
              : 'Você está no modo livre. Todas as aeronaves, jatos e missões de translado nacional e internacional estão disponíveis sem restrições de licenças.'}
          </p>
        </div>
      </div>

      <button
        onClick={onOpenModeSelector}
        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
        <span>Alternar Modo de Jogo</span>
      </button>
    </div>
  );
};
