import React from 'react';
import { PilotProvider, usePilot } from './context/PilotContext';
import { TelemetryProvider } from './context/TelemetryContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Overview } from './components/Dashboard/Overview';
import { MissionsView } from './components/Missions/MissionsView';
import { ActiveFlightView } from './components/Flight/ActiveFlightView';
import { FlightPlannerView } from './components/FlightPlanner/FlightPlannerView';
import { FleetView } from './components/Garagem/FleetView';
import { LogbookView } from './components/Logbook/LogbookView';
import { ProfileView } from './components/Profile/ProfileView';
import { SettingsView } from './components/Settings/SettingsView';
import { ConnectorView } from './components/Connector/ConnectorView';
import { LiveRadarView } from './components/LiveRadar/LiveRadarView';
import { AdminCompaniesView } from './components/Admin/AdminCompaniesView';
import { CareerLicensesView } from './components/Career/CareerLicensesView';
import { CareerModeSelectModal } from './components/Career/CareerModeSelectModal';
import { AuthScreen } from './components/Auth/AuthScreen';
import { Plane } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, isCareerModeModalOpen, setIsCareerModeModalOpen } = usePilot();

  return (
    <main className="flex-1 min-w-0">
      <Header />

      <div className="min-h-[600px]">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'missions' && <MissionsView />}
        {activeTab === 'career' && <CareerLicensesView />}
        {activeTab === 'admin-companies' && <AdminCompaniesView />}
        {activeTab === 'flight-planner' && <FlightPlannerView />}
        {activeTab === 'live-map' && <LiveRadarView />}
        {activeTab === 'active-flight' && <ActiveFlightView />}
        {activeTab === 'connector' && <ConnectorView />}
        {activeTab === 'fleet' && <FleetView />}
        {activeTab === 'logbook' && <LogbookView />}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'settings' && <SettingsView />}
      </div>

      {/* First-access Career Mode Selection Modal */}
      <CareerModeSelectModal
        isOpen={isCareerModeModalOpen}
        onClose={() => setIsCareerModeModalOpen(false)}
        isInitialSetup={true}
      />
    </main>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 mb-4 animate-bounce">
          <Plane className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
          Iniciando Sistemas de Voo...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <TelemetryProvider>
      <PilotProvider>
        <div className="min-h-screen bg-[#edf1f7] font-sans text-slate-800 p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6 selection:bg-sky-500 selection:text-white">
          <Sidebar />
          <MainContent />
        </div>
      </PilotProvider>
    </TelemetryProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
