import React from 'react';
import { Contract } from '../../types';
import { MissionBadge } from '../UI/Badge';
import {
  Coins,
  Navigation,
  Building2,
  Box,
  Zap,
  ArrowRight,
  Plane
} from 'lucide-react';

interface MissionCardProps {
  contract: Contract;
  onSelect: (contract: Contract) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({ contract, onSelect }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 p-5 flex flex-col justify-between group relative overflow-hidden">
      <div>
        {/* Top Bar: Contracting Company & Badge */}
        <div className="flex items-center justify-between gap-3 mb-3.5 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${contract.company.logoColor} text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}>
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800 leading-tight truncate">{contract.company.name}</h4>
              <p className="text-[10px] text-slate-400 font-medium truncate">{contract.company.tagline}</p>
            </div>
          </div>

          <div className="shrink-0">
            <MissionBadge type={contract.type} />
          </div>
        </div>

        {/* Contract Title */}
        <h3 className="text-sm font-bold text-slate-900 leading-snug mb-3.5 group-hover:text-sky-600 transition-colors line-clamp-2">
          {contract.title}
        </h3>

        {/* Route Segment Box */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/70 mb-3.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            {/* Departure */}
            <div className="min-w-[70px]">
              <span className="inline-block px-1.5 py-0.5 bg-slate-900 text-white rounded text-[11px] font-extrabold tracking-wider mb-1">
                {contract.route.departureIcao}
              </span>
              <p className="text-[10px] font-medium text-slate-500 truncate max-w-[110px]" title={contract.route.departureCity}>
                {contract.route.departureCity}
              </p>
            </div>

            {/* Flight Path Graphic */}
            <div className="flex flex-col items-center flex-1 px-1">
              <div className="flex items-center gap-1 text-[10px] font-bold text-sky-600">
                <Navigation className="w-3 h-3 rotate-45 text-sky-500" />
                <span>{contract.route.distanceNm} NM</span>
              </div>
              
              <div className="w-full bg-slate-200 h-1 rounded-full my-1.5 relative overflow-hidden">
                <div className="bg-sky-500 h-full w-2/3 rounded-full"></div>
              </div>

              <span className="text-[10px] font-semibold text-slate-400">
                ~{contract.route.estimatedMinutes} min
              </span>
            </div>

            {/* Arrival */}
            <div className="text-right min-w-[70px]">
              <span className="inline-block px-1.5 py-0.5 bg-sky-600 text-white rounded text-[11px] font-extrabold tracking-wider mb-1">
                {contract.route.arrivalIcao}
              </span>
              <p className="text-[10px] font-medium text-slate-500 truncate max-w-[110px]" title={contract.route.arrivalCity}>
                {contract.route.arrivalCity}
              </p>
            </div>
          </div>
        </div>

        {/* Briefing Text */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3.5 font-normal">
          {contract.description}
        </p>

        {/* Requirements Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60 flex items-center gap-2 min-w-0">
            <Plane className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-400 text-[9px] uppercase font-bold block leading-none mb-0.5">Aeronave</span>
              <span className="font-bold text-slate-700 truncate block text-[11px] leading-tight">
                {contract.requiredAircraft}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60 flex items-center gap-2 min-w-0">
            <Box className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-400 text-[9px] uppercase font-bold block leading-none mb-0.5">Carga</span>
              <span className="font-bold text-slate-700 truncate block text-[11px] leading-tight">
                {contract.payloadInfo}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Payout & Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider block leading-none mb-1">
            Recompensa
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold text-amber-600 flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-500" />
              {contract.rewardCredits.toLocaleString('pt-BR')} CR
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 text-sky-500" />
              +{contract.rewardXp} XP
            </span>
          </div>
        </div>

        <button
          onClick={() => onSelect(contract)}
          className="bg-slate-900 hover:bg-sky-600 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Ver Contrato</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
