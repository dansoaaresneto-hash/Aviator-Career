import React from 'react';
import { Contract } from '../../types';
import { MissionBadge } from '../UI/Badge';
import { CompanyLogoBadge } from '../Common/CompanyLogoBadge';
import { getCountryName } from '../../utils/countryUtils';
import {
  Coins,
  Navigation,
  Box,
  Zap,
  ArrowRight,
  Plane,
} from 'lucide-react';

interface MissionCardProps {
  contract: Contract;
  onSelect: (contract: Contract) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({ contract, onSelect }) => {
  const depCountry = getCountryName(
    contract.route.departureIcao,
    contract.route.departureCity,
    contract.route.departureCountry
  );

  const arrCountry = getCountryName(
    contract.route.arrivalIcao,
    contract.route.arrivalCity,
    contract.route.arrivalCountry
  );

  return (
    <div
      onClick={() => onSelect(contract)}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 p-5 flex flex-col justify-between group relative overflow-hidden cursor-pointer"
    >
      {/* Subtle top hover accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="space-y-4">
        {/* Top Header: Badge & Distance */}
        <div className="flex items-center justify-between gap-2">
          <MissionBadge type={contract.type} />
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/80">
            <Navigation className="w-3 h-3 text-sky-500 rotate-45" />
            <span>{contract.route.distanceNm} NM</span>
          </div>
        </div>

        {/* Hero Route Display - Clean layout with Country above ICAO and City below */}
        <div className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2">
            {/* Departure */}
            <div className="w-28 text-center flex flex-col items-center">
              <span className="text-[11px] font-medium text-slate-500 block truncate w-full mb-0.5" title={depCountry}>
                {depCountry}
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-tight block leading-tight">
                {contract.route.departureIcao}
              </span>
              <span className="text-[11px] font-medium text-slate-500 block truncate mt-0.5 w-full" title={contract.route.departureCity}>
                {contract.route.departureCity}
              </span>
            </div>

            {/* Connecting Line with Plane */}
            <div className="flex-1 flex flex-col items-center justify-center px-1">
              <div className="w-full flex items-center gap-1.5">
                <div className="h-[1.5px] bg-slate-300 flex-1" />
                <Plane className="w-3.5 h-3.5 text-sky-600 rotate-90 shrink-0" />
                <div className="h-[1.5px] bg-slate-300 flex-1" />
              </div>
            </div>

            {/* Arrival */}
            <div className="w-28 text-center flex flex-col items-center">
              <span className="text-[11px] font-medium text-slate-500 block truncate w-full mb-0.5" title={arrCountry}>
                {arrCountry}
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-tight block leading-tight">
                {contract.route.arrivalIcao}
              </span>
              <span className="text-[11px] font-medium text-slate-500 block truncate mt-0.5 w-full" title={contract.route.arrivalCity}>
                {contract.route.arrivalCity}
              </span>
            </div>
          </div>
        </div>

        {/* Mission Specs */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5 min-w-0">
            <Plane className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700 truncate">{contract.requiredAircraft}</span>
          </div>
          <div className="bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5 min-w-0">
            <Box className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700 truncate">{contract.payloadInfo}</span>
          </div>
        </div>

        {/* Mission Description */}
        <div className="bg-slate-50/60 rounded-lg border border-slate-100 px-3 py-2.5">
          <p className="text-[11px] leading-relaxed text-slate-500 line-clamp-3">
            {contract.description}
          </p>
        </div>
      </div>

      {/* Footer Section: Reward & Company Logo at the Bottom */}
      <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
        {/* Payout & Action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-sm font-black text-amber-600 tracking-tight">
              {contract.rewardCredits.toLocaleString('pt-BR')} <span className="text-[10px] font-extrabold text-amber-500">CR</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 text-sky-500" />
              +{contract.rewardXp} XP
            </span>
          </div>

          <div className="text-sky-600 group-hover:translate-x-1 transition-transform flex items-center gap-1 text-xs font-bold">
            <span>Ver Contrato</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Company Branding in Card Footer */}
        <div className="pt-3 border-t border-slate-100/80 flex flex-col items-center justify-center gap-1.5">
          <CompanyLogoBadge
            logoUrl={contract.company.logoUrl}
            logoColor={contract.company.logoColor}
            icaoCode={contract.company.icaoCode}
            companyName={contract.company.name}
            size="md"
          />
          <span className="text-[11px] font-semibold text-slate-500 text-center truncate max-w-[200px]">
            {contract.company.name}
          </span>
        </div>
      </div>
    </div>
  );
};



