import React from 'react';
import { Contract } from '../../types';
import { usePilot } from '../../context/PilotContext';
import { MissionBadge, UrgencyBadge } from '../UI/Badge';
import {
  X,
  Plane,
  Coins,
  Zap,
  Building2,
  MapPin,
  Clock,
  Compass,
  Box,
  ShieldCheck,
  CheckCircle2,
  Navigation
} from 'lucide-react';

interface MissionDetailModalProps {
  contract: Contract;
  onClose: () => void;
}

export const MissionDetailModal: React.FC<MissionDetailModalProps> = ({ contract, onClose }) => {
  const { acceptContract } = usePilot();

  const handleAccept = () => {
    acceptContract(contract);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${contract.company.logoColor} text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-500">{contract.company.name}</span>
                <MissionBadge type={contract.type} showIcon={false} />
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">{contract.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Route Graphical Display */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-md">
            <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-2">
              Plano de Rota de Voo
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-black tracking-widest text-white">{contract.route.departureIcao}</span>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">{contract.route.departureName}</p>
                <p className="text-[11px] text-slate-400">{contract.route.departureCity}</p>
              </div>

              <div className="flex flex-col items-center px-4 flex-1">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1 mb-1">
                  <Navigation className="w-3.5 h-3.5 rotate-45 text-sky-400" />
                  {contract.route.distanceNm} NM
                </span>
                <div className="w-full bg-slate-700 h-1 rounded-full relative my-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400 absolute -top-0.75 left-1/2 -translate-x-1/2 ring-4 ring-sky-400/20"></div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">~{contract.route.estimatedMinutes} min de voo</span>
              </div>

              <div className="text-right">
                <span className="text-xl font-black tracking-widest text-white">{contract.route.arrivalIcao}</span>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">{contract.route.arrivalName}</p>
                <p className="text-[11px] text-slate-400">{contract.route.arrivalCity}</p>
              </div>
            </div>
          </div>

          {/* Description narrative */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Briefing da Missão</h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              {contract.description}
            </p>
          </div>

          {/* Operational Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Aeronave Requerida</span>
              <p className="font-bold text-slate-800">{contract.requiredAircraft}</p>
              <span className="text-[10px] text-slate-500">{contract.aircraftCategory}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Carga / Passageiros</span>
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <Box className="w-3.5 h-3.5 text-slate-500" />
                {contract.payloadInfo}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Nível de Licença</span>
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                Nível {contract.minPilotRankLevel}+
              </p>
            </div>
          </div>

          {/* Payment & XP reward box */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-800/80">Recompensa Total do Contrato</span>
              <div className="text-xl font-extrabold text-amber-900 flex items-center gap-2 mt-0.5">
                <Coins className="w-5 h-5 text-amber-500" />
                <span>{contract.rewardCredits.toLocaleString('pt-BR')} CR</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-md border border-sky-200 inline-flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-sky-600" />
                +{contract.rewardXp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer"
          >
            Voltar
          </button>

          <button
            onClick={handleAccept}
            className="bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aceitar Contrato & Iniciar Voo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
