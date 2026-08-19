import React from 'react';
import { Contract } from '../../types';
import { usePilot } from '../../context/PilotContext';
import { FreeRoutePlannerPanel } from './planner/FreeRoutePlannerPanel';
import { FlightManifestSection } from './operations/FlightManifestSection';
import { TechnicalStopsSection } from './operations/TechnicalStopsSection';
import { CustomsRegistrationSection } from './operations/CustomsRegistrationSection';
import { AircraftDossierSection } from './operations/AircraftDossierSection';
import {
  Compass,
  FileText,
  Globe,
  Stamp,
  Layers,
} from 'lucide-react';

export type OperationTabId =
  | 'planner'
  | 'manifest'
  | 'technical_stops'
  | 'customs_rab'
  | 'dossier';

interface FlightOperationViewProps {
  contract: Contract;
  activeTab: OperationTabId;
  onSelectTab: (tab: OperationTabId) => void;
}

export const FlightOperationView: React.FC<FlightOperationViewProps> = ({
  contract,
  activeTab,
  onSelectTab,
}) => {
  const { profile } = usePilot();

  const tabs = [
    {
      id: 'planner' as const,
      label: 'Planejador de Voo & Mapa',
      shortLabel: 'Planejador',
      icon: Compass,
    },
    {
      id: 'manifest' as const,
      label: 'Despacho & eAPIS',
      shortLabel: 'Despacho',
      icon: FileText,
    },
    {
      id: 'technical_stops' as const,
      label: 'Escalas & Overflight Permits',
      shortLabel: 'Escalas & Permits',
      icon: Globe,
    },
    {
      id: 'customs_rab' as const,
      label: 'Port of Entry & RAB (DI / CNAV)',
      shortLabel: 'Alfândega & RAB',
      icon: Stamp,
    },
    {
      id: 'dossier' as const,
      label: 'Dossiê da Aeronave & Termo PDF',
      shortLabel: 'Dossiê',
      icon: Layers,
    },
  ];

  const isPlanner = activeTab === 'planner';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[560px] sm:h-[640px] lg:h-[700px]">
      {/* Top Tablet-like Navigation Bar with Dark Quick Icons */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
        {/* Navigation Quick Action Icon Group */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'bg-[#373737] hover:bg-slate-700 text-slate-300'
                }`}
                title={t.label}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">{t.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Current Active View Label Pill */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-[11px] text-slate-300">
            {tabs.find((t) => t.id === activeTab)?.label}
          </span>
        </div>
      </div>

      {/* Main Content View Area — o Planejador ocupa o shape inteiro (full-bleed);
          as demais abas mantêm o padding de formulário. */}
      <div className={isPlanner ? 'flex-1 relative overflow-hidden' : 'flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/50'}>
        {activeTab === 'planner' && (
          <FreeRoutePlannerPanel onSwitchToStopsTab={() => onSelectTab('technical_stops')} />
        )}

        {activeTab === 'manifest' && (
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
            <FlightManifestSection contract={contract} dossier={contract.ferryDossier} />
          </div>
        )}

        {activeTab === 'technical_stops' && (
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
            <TechnicalStopsSection contract={contract} dossier={contract.ferryDossier} />
          </div>
        )}

        {activeTab === 'customs_rab' && (
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
            <CustomsRegistrationSection contract={contract} dossier={contract.ferryDossier} />
          </div>
        )}

        {activeTab === 'dossier' && (
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
            <AircraftDossierSection contract={contract} dossier={contract.ferryDossier} profile={profile} />
          </div>
        )}
      </div>
    </div>
  );
};