import React from 'react';
import { Contract } from '../../types';
import { usePilot } from '../../context/PilotContext';
import { MissionBadge, UrgencyBadge } from '../UI/Badge';
import { CompanyLogoBadge } from '../Common/CompanyLogoBadge';
import { getCountryName } from '../../utils/countryUtils';
import { checkContractEligibility } from '../../utils/licenseEngine';
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
  Navigation,
  Lock,
  Award,
  ArrowRight
} from 'lucide-react';

interface MissionDetailModalProps {
  contract: Contract;
  onClose: () => void;
}

export const MissionDetailModal: React.FC<MissionDetailModalProps> = ({ contract, onClose }) => {
  const { profile, logbook, acceptContract, setActiveTab } = usePilot();

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

  const isInternational = Boolean(
    contract.ferryDossier ||
    contract.aircraftCategory?.toLowerCase().includes('internacional') ||
    contract.title?.toLowerCase().includes('internacional') ||
    (depCountry && arrCountry && depCountry !== arrCountry)
  );

  const eligibility = checkContractEligibility(contract, profile, logbook);

  const handleAccept = () => {
    if (!eligibility.isEligible) return;
    acceptContract(contract);
    onClose();
  };

  const handleGoToCareer = () => {
    onClose();
    setActiveTab('career');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <CompanyLogoBadge
              logoUrl={contract.company.logoUrl}
              logoColor={contract.company.logoColor}
              icaoCode={contract.company.icaoCode}
              companyName={contract.company.name}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-500">{contract.company.name}</span>
                <MissionBadge type={contract.type} isInternational={isInternational} showIcon={false} />
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
          {/* Route Graphical Display - Country above, ICAO middle, City below */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-md">
            <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-3">
              Plano de Rota de Voo
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="w-32 text-center flex flex-col items-center">
                <span className="text-[11px] font-medium text-slate-400 block truncate w-full mb-0.5" title={depCountry}>
                  {depCountry}
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black tracking-tight text-white">{contract.route.departureIcao}</span>
                <span className="text-[11px] text-slate-400 block truncate mt-0.5 w-full" title={contract.route.departureCity}>
                  {contract.route.departureCity}
                </span>
              </div>

              <div className="flex flex-col items-center px-2 flex-1">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1 mb-1">
                  <Navigation className="w-3.5 h-3.5 rotate-45 text-sky-400" />
                  {contract.route.distanceNm} NM
                </span>
                <div className="w-full flex items-center gap-1 my-1">
                  <div className="h-[1.5px] bg-slate-700 flex-1" />
                  <Plane className="w-3.5 h-3.5 text-sky-400 rotate-90 shrink-0" />
                  <div className="h-[1.5px] bg-slate-700 flex-1" />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">~{contract.route.estimatedMinutes} min de voo</span>
              </div>

              <div className="w-32 text-center flex flex-col items-center">
                <span className="text-[11px] font-medium text-slate-400 block truncate w-full mb-0.5" title={arrCountry}>
                  {arrCountry}
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black tracking-tight text-white">{contract.route.arrivalIcao}</span>
                <span className="text-[11px] text-slate-400 block truncate mt-0.5 w-full" title={contract.route.arrivalCity}>
                  {contract.route.arrivalCity}
                </span>
              </div>
            </div>
          </div>

          {/* Locked Contract Banner if not eligible */}
          {!eligibility.isEligible && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5 shadow-sm">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Contrato Bloqueado pela Licença do Piloto ({eligibility.requiredLicense?.name || 'Licença Superior'})</span>
              </div>
              <p className="leading-relaxed text-amber-800">
                {eligibility.reason}
              </p>
              {eligibility.unlockRequirementHint && (
                <p className="text-[11px] text-amber-700 font-medium pt-1 border-t border-amber-200/80">
                  💡 <strong>Como desbloquear:</strong> {eligibility.unlockRequirementHint}
                </p>
              )}
            </div>
          )}

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
                {contract.minPilotRankLevel > 1 ? `Nível ${contract.minPilotRankLevel}+` : 'Básico'}
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
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer w-full sm:w-auto"
          >
            Voltar
          </button>

          {eligibility.isEligible ? (
            <button
              onClick={handleAccept}
              className="bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aceitar Contrato & Iniciar Voo</span>
            </button>
          ) : (
            <button
              onClick={handleGoToCareer}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <Award className="w-4 h-4" />
              <span>Ver Requisitos de Licença ({eligibility.requiredLicense?.code || 'Ver Carreira'})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
