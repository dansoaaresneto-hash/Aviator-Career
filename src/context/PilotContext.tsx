import React, { createContext, useContext, useState, useEffect } from 'react';
import { Contract, FlightLog, PilotProfile, ActiveTab } from '../types';
import { INITIAL_CONTRACTS } from '../data/initialContracts';

interface PilotContextType {
  profile: PilotProfile;
  contracts: Contract[];
  activeContract: Contract | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  flightPhase: 'briefing' | 'taxi' | 'cruise' | 'approach' | 'landed' | null;
  flightProgress: number; // 0 to 100
  logbook: FlightLog[];
  acceptContract: (contract: Contract) => void;
  abandonContract: () => void;
  advanceFlightPhase: () => void;
  completeFlight: (landingScore?: number) => void;
  updateProfileName: (name: string, callsign: string) => void;
  resetCareerData: () => void;
  selectedContractForPreview: Contract | null;
  setSelectedContractForPreview: (contract: Contract | null) => void;
  filterType: 'all' | 'cargo' | 'passenger' | 'ferry';
  setFilterType: (type: 'all' | 'cargo' | 'passenger' | 'ferry') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedAircraftFilter: string;
  setSelectedAircraftFilter: (aircraft: string) => void;
}

const INITIAL_PROFILE: PilotProfile = {
  name: 'Gabriel Silva',
  title: 'Piloto Aluno',
  credits: 0, // Starts at 0 credits as requested
  xp: 0,
  level: 1,
  totalFlightHours: 0,
  completedFlights: 0,
  successfulLandings: 0,
  preferredCallsign: 'PR-AV1',
};

const PilotContext = createContext<PilotContextType | undefined>(undefined);

export const PilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PilotProfile>(() => {
    const saved = localStorage.getItem('aviator_pilot_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PROFILE;
  });

  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [activeContract, setActiveContract] = useState<Contract | null>(() => {
    const saved = localStorage.getItem('aviator_active_contract');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [flightPhase, setFlightPhase] = useState<'briefing' | 'taxi' | 'cruise' | 'approach' | 'landed' | null>(null);
  const [flightProgress, setFlightProgress] = useState<number>(0);

  const [logbook, setLogbook] = useState<FlightLog[]>(() => {
    const saved = localStorage.getItem('aviator_logbook');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedContractForPreview, setSelectedContractForPreview] = useState<Contract | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'cargo' | 'passenger' | 'ferry'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAircraftFilter, setSelectedAircraftFilter] = useState<string>('all');

  // Save state changes
  useEffect(() => {
    localStorage.setItem('aviator_pilot_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (activeContract) {
      localStorage.setItem('aviator_active_contract', JSON.stringify(activeContract));
    } else {
      localStorage.removeItem('aviator_active_contract');
    }
  }, [activeContract]);

  useEffect(() => {
    localStorage.setItem('aviator_logbook', JSON.stringify(logbook));
  }, [logbook]);

  const acceptContract = (contract: Contract) => {
    setActiveContract(contract);
    setSelectedContractForPreview(null);
    setFlightPhase('briefing');
    setFlightProgress(10);
    setActiveTab('active-flight');
  };

  const abandonContract = () => {
    if (!activeContract) return;

    // Log abandoned flight
    const abandonedLog: FlightLog = {
      id: 'log-' + Date.now(),
      contractId: activeContract.id,
      title: activeContract.title,
      type: activeContract.type,
      companyName: activeContract.company.name,
      departureIcao: activeContract.route.departureIcao,
      arrivalIcao: activeContract.route.arrivalIcao,
      aircraft: activeContract.requiredAircraft,
      distanceNm: Math.round((activeContract.route.distanceNm * flightProgress) / 100),
      flightDurationMinutes: Math.round((activeContract.route.estimatedMinutes * flightProgress) / 100),
      earnedCredits: 0,
      earnedXp: 0,
      landingScore: 0,
      completedAt: new Date().toISOString(),
      status: 'abandoned',
    };

    setLogbook((prev) => [abandonedLog, ...prev]);
    setActiveContract(null);
    setFlightPhase(null);
    setFlightProgress(0);
    setActiveTab('missions');
  };

  const advanceFlightPhase = () => {
    if (flightPhase === 'briefing') {
      setFlightPhase('taxi');
      setFlightProgress(25);
    } else if (flightPhase === 'taxi') {
      setFlightPhase('cruise');
      setFlightProgress(60);
    } else if (flightPhase === 'cruise') {
      setFlightPhase('approach');
      setFlightProgress(88);
    } else if (flightPhase === 'approach') {
      setFlightPhase('landed');
      setFlightProgress(100);
    }
  };

  const completeFlight = (landingScore: number = 95) => {
    if (!activeContract) return;

    const durationHours = activeContract.route.estimatedMinutes / 60;
    const earnedCredits = activeContract.rewardCredits;
    const earnedXp = activeContract.rewardXp;

    // Update Pilot Profile
    setProfile((prev) => {
      const newXp = prev.xp + earnedXp;
      const nextLevelXp = prev.level * 500;
      let newLevel = prev.level;
      if (newXp >= nextLevelXp) {
        newLevel += 1;
      }

      let newTitle = prev.title;
      if (newLevel >= 5) newTitle = 'Comandante de Linha (ATPL)';
      else if (newLevel >= 3) newTitle = 'Piloto Comercial (CPL)';
      else if (newLevel >= 2) newTitle = 'Piloto Privado (PPL)';

      return {
        ...prev,
        credits: prev.credits + earnedCredits,
        xp: newXp,
        level: newLevel,
        title: newTitle,
        totalFlightHours: +(prev.totalFlightHours + durationHours).toFixed(1),
        completedFlights: prev.completedFlights + 1,
        successfulLandings: prev.successfulLandings + 1,
      };
    });

    // Create Logbook entry
    const newLog: FlightLog = {
      id: 'log-' + Date.now(),
      contractId: activeContract.id,
      title: activeContract.title,
      type: activeContract.type,
      companyName: activeContract.company.name,
      departureIcao: activeContract.route.departureIcao,
      arrivalIcao: activeContract.route.arrivalIcao,
      aircraft: activeContract.requiredAircraft,
      distanceNm: activeContract.route.distanceNm,
      flightDurationMinutes: activeContract.route.estimatedMinutes,
      earnedCredits,
      earnedXp,
      landingScore,
      completedAt: new Date().toISOString(),
      status: 'completed',
    };

    setLogbook((prev) => [newLog, ...prev]);

    // Remove completed contract from available list & regenerate or keep others
    setContracts((prev) => prev.filter((c) => c.id !== activeContract.id));

    // Clear active flight
    setActiveContract(null);
    setFlightPhase(null);
    setFlightProgress(0);
    setActiveTab('logbook');
  };

  const updateProfileName = (name: string, callsign: string) => {
    setProfile((prev) => ({
      ...prev,
      name,
      preferredCallsign: callsign,
    }));
  };

  const resetCareerData = () => {
    setProfile(INITIAL_PROFILE);
    setContracts(INITIAL_CONTRACTS);
    setActiveContract(null);
    setFlightPhase(null);
    setFlightProgress(0);
    setLogbook([]);
    localStorage.removeItem('aviator_pilot_profile');
    localStorage.removeItem('aviator_active_contract');
    localStorage.removeItem('aviator_logbook');
    setActiveTab('overview');
  };

  return (
    <PilotContext.Provider
      value={{
        profile,
        contracts,
        activeContract,
        activeTab,
        setActiveTab,
        flightPhase,
        flightProgress,
        logbook,
        acceptContract,
        abandonContract,
        advanceFlightPhase,
        completeFlight,
        updateProfileName,
        resetCareerData,
        selectedContractForPreview,
        setSelectedContractForPreview,
        filterType,
        setFilterType,
        searchQuery,
        setSearchQuery,
        selectedAircraftFilter,
        setSelectedAircraftFilter,
      }}
    >
      {children}
    </PilotContext.Provider>
  );
};

export const usePilot = () => {
  const context = useContext(PilotContext);
  if (!context) {
    throw new Error('usePilot must be used within a PilotProvider');
  }
  return context;
};
