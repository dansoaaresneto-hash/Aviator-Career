import React, { useState } from 'react';
import { usePilot } from '../../context/PilotContext';
import { Coins, Zap, Trophy, CheckCircle, ArrowRight, Star } from 'lucide-react';

interface FlightDebriefModalProps {
  onClose: () => void;
}

export const FlightDebriefModal: React.FC<FlightDebriefModalProps> = ({ onClose }) => {
  const { activeContract, completeFlight } = usePilot();
  const [landingScore] = useState(() => Math.floor(Math.random() * 8) + 92); // 92% to 99% smooth landing score

  if (!activeContract) return null;

  const handleFinish = () => {
    completeFlight(landingScore);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200/90 shadow-2xl p-6 sm:p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded border border-emerald-100">
            Voo Concluído com Sucesso!
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2">{activeContract.title}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeContract.route.departureIcao} ➔ {activeContract.route.arrivalIcao} ({activeContract.route.distanceNm} NM)
          </p>
        </div>

        {/* Landing Smoothness Score */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Qualidade do Pouso</span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-3xl font-black text-slate-800">{landingScore}%</span>
            <div className="flex text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Pouso Suave & Toque Perfeito</p>
        </div>

        {/* Rewards Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50/80 p-4 rounded-lg border border-amber-200/80 text-left">
            <span className="text-[10px] font-bold uppercase text-amber-700">Créditos Ganhos</span>
            <div className="text-xl font-black text-amber-900 flex items-center gap-1.5 mt-1">
              <Coins className="w-5 h-5 text-amber-500" />
              +{activeContract.rewardCredits.toLocaleString('pt-BR')} CR
            </div>
          </div>

          <div className="bg-sky-50/80 p-4 rounded-lg border border-sky-200/80 text-left">
            <span className="text-[10px] font-bold uppercase text-sky-700">XP de Carreira</span>
            <div className="text-xl font-black text-sky-900 flex items-center gap-1.5 mt-1">
              <Zap className="w-5 h-5 text-sky-500" />
              +{activeContract.rewardXp} XP
            </div>
          </div>
        </div>

        <button
          onClick={handleFinish}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Receber Recompensa & Salvar no Logbook</span>
        </button>
      </div>
    </div>
  );
};
