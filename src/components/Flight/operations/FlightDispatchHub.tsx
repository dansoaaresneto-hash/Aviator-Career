import React, { useState } from 'react';
import { Contract, FerryDossier } from '../../../types';
import { usePilot } from '../../../context/PilotContext';
import {
  FileText,
  FastForward,
  Layers,
  Plane,
  Stamp,
  Globe,
  Radio,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { FlightWorkflowSection } from './FlightWorkflowSection';
import { FlightManifestSection } from './FlightManifestSection';
import { TechnicalStopsSection } from './TechnicalStopsSection';
import { CustomsRegistrationSection } from './CustomsRegistrationSection';
import { AcarsCommsSection } from './AcarsCommsSection';
import { AircraftDossierSection } from './AircraftDossierSection';

export type DispatchTabType =
  | 'workflow'
  | 'manifest'
  | 'stops'
  | 'customs'
  | 'comms'
  | 'dossier';

interface FlightDispatchHubProps {
  contract: Contract;
}

export const FlightDispatchHub: React.FC<FlightDispatchHubProps> = ({ contract }) => {
  const {
    profile,
    requiredDocuments,
    regulatoryBodies,
    submittedDocuments,
    commsMessages,
    adminAdvanceFlightLeg,
  } = usePilot();

  const dossier: FerryDossier | undefined = contract.ferryDossier;
  const [activeTab, setActiveTab] = useState<DispatchTabType>('workflow');

  const originIso = dossier?.originCountryCode || 'US';
  const destIso = dossier?.destinationCountryCode || 'BR';

  const relevantDocs = requiredDocuments.filter((doc) => {
    const body = regulatoryBodies.find((b) => b.id === doc.regulatoryBodyId);
    if (!body) return false;
    return body.countryIso === originIso || body.countryIso === destIso || doc.phase === 'enroute';
  });

  const contractSubmissions = submittedDocuments.filter((s) => s.contractId === contract.id);
  const contractMessages = commsMessages.filter((m) => m.contractId === contract.id);
  const unreadCount = contractMessages.filter((m) => !m.isRead).length;

  const tabs: {
    id: DispatchTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeColor?: string;
  }[] = [
    { id: 'workflow', label: 'Roteiro das Etapas', icon: Plane },
    {
      id: 'manifest',
      label: 'Despacho & eAPIS',
      icon: FileText,
      count: relevantDocs.length,
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    { id: 'stops', label: 'Escalas & Permits', icon: Globe },
    { id: 'customs', label: 'Port of Entry & RAB', icon: Stamp },
    {
      id: 'comms',
      label: 'ACARS Datalink',
      icon: Radio,
      count: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'dossier', label: 'Dossiê & Fatura', icon: Layers },
  ];

  return (
    <div className="space-y-5">
      {/* Navigation Tabs Bar */}
      <div className="bg-white rounded-xl p-2 border border-slate-200/90 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>

              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-sky-500 text-white' : tab.badgeColor || 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'workflow' && (
          <FlightWorkflowSection
            contract={contract}
            dossier={dossier}
            onNavigateTab={(tabId) => setActiveTab(tabId as DispatchTabType)}
          />
        )}

        {activeTab === 'manifest' && (
          <FlightManifestSection contract={contract} dossier={dossier} />
        )}

        {activeTab === 'stops' && (
          <TechnicalStopsSection contract={contract} dossier={dossier} />
        )}

        {activeTab === 'customs' && (
          <CustomsRegistrationSection contract={contract} dossier={dossier} />
        )}

        {activeTab === 'comms' && <AcarsCommsSection contract={contract} />}

        {activeTab === 'dossier' && (
          <AircraftDossierSection
            contract={contract}
            dossier={dossier}
            profile={profile}
          />
        )}
      </div>
    </div>
  );
};
