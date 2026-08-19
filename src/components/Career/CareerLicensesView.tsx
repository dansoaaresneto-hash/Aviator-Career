import React, { useState } from 'react';
import { usePilot } from '../../context/PilotContext';
import { calculateLicenseProgression, getLicenseById } from '../../utils/licenseEngine';
import { PilotLicenseCard } from './PilotLicenseCard';
import { LicenseProgressPanel } from './LicenseProgressPanel';
import { LicenseRoadmapList } from './LicenseRoadmapList';
import { CareerModeBanner } from './CareerModeBanner';
import { CareerModeSelectModal } from './CareerModeSelectModal';
import { Award, ShieldCheck, Sparkles, BookOpen, PlaneTakeoff, Info } from 'lucide-react';

export const CareerLicensesView: React.FC = () => {
  const { profile, logbook, promotePilotLicense, setActiveTab } = usePilot();
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);

  const progression = calculateLicenseProgression(profile, logbook);
  const currentLicense = getLicenseById(profile.licenseId || 'student_pilot');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Award className="w-6 h-6 text-sky-500" />
              Carreira & Licenças de Pilotagem
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
              {currentLicense.shortName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhe suas habilitações aeronáuticas, horas de voo, requisitos de promoção e frotas autorizadas
          </p>
        </div>

        <button
          onClick={() => setActiveTab('missions')}
          className="bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <PlaneTakeoff className="w-4 h-4" />
          <span>Ver Missões Disponíveis</span>
        </button>
      </div>

      {/* Mode Banner (Full Career vs Free Career) */}
      <CareerModeBanner onOpenModeSelector={() => setIsModeSelectorOpen(true)} />

      {/* Official Pilot License Card (Brevê) */}
      <PilotLicenseCard profile={profile} license={currentLicense} />

      {/* License Progress & Next Tier Requirements (Shown in Full Career Mode or as Information) */}
      <LicenseProgressPanel
        progression={progression}
        onPromote={promotePilotLicense}
      />

      {/* Complete Career Roadmap & Licenses Hierarchy */}
      <LicenseRoadmapList currentLicenseId={currentLicense.id} />

      {/* Mode Selector Modal */}
      <CareerModeSelectModal
        isOpen={isModeSelectorOpen}
        onClose={() => setIsModeSelectorOpen(false)}
        isInitialSetup={false}
      />
    </div>
  );
};
