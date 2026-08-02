import React, { createContext, useContext, useState, useEffect } from 'react';
import { Contract, FlightLog, PilotProfile, ActiveTab } from '../types';
import { INITIAL_CONTRACTS } from '../data/initialContracts';
import { useTelemetry } from './TelemetryContext';

interface PilotContextType {
  profile: PilotProfile;
  contracts: Contract[];
  activeContract: Contract | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  flightPhase: 'briefing' | 'taxi' | 'cruise' | 'approach' | 'intermediate_landing' | 'landed' | null;
  setFlightPhase: (phase: 'briefing' | 'taxi' | 'cruise' | 'approach' | 'intermediate_landing' | 'landed' | null) => void;
  flightProgress: number; // 0 to 100
  setFlightProgress: React.Dispatch<React.SetStateAction<number>>;
  currentLocationIcao: string | null;
  intermediateStops: Array<{ icao: string; timestamp: string }>;
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
  const { telemetry, connectionStatus } = useTelemetry();

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
  
  const [flightPhase, setFlightPhase] = useState<'briefing' | 'taxi' | 'cruise' | 'approach' | 'landed' | null>(() => {
    const savedContract = localStorage.getItem('aviator_active_contract');
    if (!savedContract) return null;
    const savedPhase = localStorage.getItem('aviator_flight_phase');
    return (savedPhase as any) || 'briefing';
  });

  const [flightProgress, setFlightProgress] = useState<number>(() => {
    const savedContract = localStorage.getItem('aviator_active_contract');
    if (!savedContract) return 0;
    const savedProgress = localStorage.getItem('aviator_flight_progress');
    return savedProgress ? Number(savedProgress) : 10;
  });

  const [currentLocationIcao, setCurrentLocationIcao] = useState<string | null>(() => {
    const savedContract = localStorage.getItem('aviator_active_contract');
    if (!savedContract) return null;
    return localStorage.getItem('aviator_current_location') || null;
  });

  const [intermediateStops, setIntermediateStops] = useState<Array<{ icao: string; timestamp: string }>>(() => {
    const savedContract = localStorage.getItem('aviator_active_contract');
    if (!savedContract) return [];
    const saved = localStorage.getItem('aviator_intermediate_stops');
    return saved ? JSON.parse(saved) : [];
  });

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
      localStorage.removeItem('aviator_current_location');
      localStorage.removeItem('aviator_intermediate_stops');
    }
  }, [activeContract]);

  useEffect(() => {
    if (currentLocationIcao) {
      localStorage.setItem('aviator_current_location', currentLocationIcao);
    } else {
      localStorage.removeItem('aviator_current_location');
    }
  }, [currentLocationIcao]);

  useEffect(() => {
    if (intermediateStops.length > 0) {
      localStorage.setItem('aviator_intermediate_stops', JSON.stringify(intermediateStops));
    } else {
      localStorage.removeItem('aviator_intermediate_stops');
    }
  }, [intermediateStops]);

  useEffect(() => {
    if (flightPhase) {
      localStorage.setItem('aviator_flight_phase', flightPhase);
    } else {
      localStorage.removeItem('aviator_flight_phase');
    }
  }, [flightPhase]);

  useEffect(() => {
    if (flightProgress > 0) {
      localStorage.setItem('aviator_flight_progress', String(flightProgress));
    } else {
      localStorage.removeItem('aviator_flight_progress');
    }
  }, [flightProgress]);

  useEffect(() => {
    localStorage.setItem('aviator_logbook', JSON.stringify(logbook));
  }, [logbook]);

  // Automatic Flight Phase State Machine driven by telemetry (MSFS or Virtual Test)
  useEffect(() => {
    if (!activeContract) return;

    const isConnected = connectionStatus === 'connected' || connectionStatus === 'simulated' || telemetry.connected;
    if (!isConnected) return;

    const speed = Number(telemetry.groundSpeedKts) || 0;
    const altitude = Number(telemetry.altitudeFt) || 0;
    const onGround = Boolean(telemetry.onGround);

    // If active contract exists but phase was null, default to briefing
    if (!flightPhase) {
      setFlightPhase('briefing');
      setFlightProgress(10);
      return;
    }

    // Phase 1: Briefing or Intermediate Landing -> Taxi (Triggers as soon as movement >= 1kt detected on ground)
    if (flightPhase === 'briefing' || flightPhase === 'intermediate_landing') {
      if (onGround && speed >= 1) {
        setFlightPhase('taxi');
        setFlightProgress((prev) => Math.max(prev, 25));
      } else if (!onGround) {
        // Connected or airborne
        setFlightPhase('cruise');
        setFlightProgress((prev) => Math.max(prev, 60));
      }
    }
    // Phase 2: Taxi -> Em Voo (cruise) (Triggers ONLY when the aircraft actually takes off)
    else if (flightPhase === 'taxi') {
      if (!onGround) {
        // Takeoff detected!
        setFlightPhase('cruise');
        setFlightProgress((prev) => Math.max(prev, 60));
      } else if (onGround) {
        if (speed >= 1) {
          const taxiBonus = Math.min(20, Math.round((speed / 50) * 20));
          setFlightProgress((prev) => Math.max(prev, 25 + taxiBonus));
        }
      }
    }
    // Phase 3: Em Voo (cruise) -> Touchdown Landing Check
    else if (flightPhase === 'cruise') {
      if (onGround) {
        // Aircraft touched down! Check if touchdown airport matches destination
        const currentLandedIcao = (telemetry.airportIcao || '').trim().toUpperCase();
        const targetArrivalIcao = (activeContract.route.arrivalIcao || '').trim().toUpperCase();

        if (currentLandedIcao && currentLandedIcao === targetArrivalIcao) {
          // TOUCHDOWN AT FINAL DESTINATION -> Complete Flight Phase
          setFlightPhase('landed');
          setFlightProgress(100);
          setCurrentLocationIcao(targetArrivalIcao);
        } else {
          // TOUCHDOWN AT INTERMEDIATE / ALTERNATE AIRPORT
          const stopIcao = currentLandedIcao || currentLocationIcao || 'INTERMEDIÁRIO';
          setFlightPhase('intermediate_landing');
          setCurrentLocationIcao(stopIcao);
          
          setIntermediateStops((prev) => {
            if (prev.length > 0 && prev[prev.length - 1].icao === stopIcao) {
              return prev;
            }
            return [
              ...prev,
              {
                icao: stopIcao,
                timestamp: new Date().toISOString(),
              },
            ];
          });

          // Keep progress active, set at 75% for intermediate stop
          setFlightProgress((prev) => Math.min(90, Math.max(prev, 75)));
        }
      } else if (!onGround) {
        // Cruise progress smoothly advances up to 95%
        const cruiseBonus = Math.min(35, Math.round((speed / 180) * 35));
        setFlightProgress((prev) => Math.max(prev, Math.min(95, 60 + cruiseBonus)));
      }
    }
  }, [telemetry, connectionStatus, activeContract, flightPhase, currentLocationIcao]);

  const acceptContract = (contract: Contract) => {
    setActiveContract(contract);
    setSelectedContractForPreview(null);
    setFlightPhase('briefing');
    setFlightProgress(10);
    setCurrentLocationIcao(contract.route.departureIcao);
    setIntermediateStops([]);
    localStorage.setItem('aviator_current_location', contract.route.departureIcao);
    localStorage.removeItem('aviator_intermediate_stops');
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
    setCurrentLocationIcao(null);
    setIntermediateStops([]);
    localStorage.removeItem('aviator_current_location');
    localStorage.removeItem('aviator_intermediate_stops');
    setActiveTab('missions');
  };

  const advanceFlightPhase = () => {
    if (flightPhase === 'briefing' || flightPhase === 'intermediate_landing') {
      setFlightPhase('taxi');
      setFlightProgress((prev) => Math.max(prev, 25));
    } else if (flightPhase === 'taxi') {
      setFlightPhase('cruise');
      setFlightProgress((prev) => Math.max(prev, 60));
    } else if (flightPhase === 'cruise') {
      const currentLandedIcao = (telemetry.airportIcao || '').trim().toUpperCase();
      const targetArrivalIcao = (activeContract?.route.arrivalIcao || '').trim().toUpperCase();

      if (currentLandedIcao && currentLandedIcao !== targetArrivalIcao) {
        setFlightPhase('intermediate_landing');
        setCurrentLocationIcao(currentLandedIcao);
      } else {
        setFlightPhase('landed');
        setFlightProgress(100);
      }
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
    setCurrentLocationIcao(null);
    setIntermediateStops([]);
    localStorage.removeItem('aviator_current_location');
    localStorage.removeItem('aviator_intermediate_stops');
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
    setCurrentLocationIcao(null);
    setIntermediateStops([]);
    setLogbook([]);
    localStorage.removeItem('aviator_pilot_profile');
    localStorage.removeItem('aviator_active_contract');
    localStorage.removeItem('aviator_flight_phase');
    localStorage.removeItem('aviator_flight_progress');
    localStorage.removeItem('aviator_current_location');
    localStorage.removeItem('aviator_intermediate_stops');
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
        setFlightPhase,
        flightProgress,
        setFlightProgress,
        currentLocationIcao,
        intermediateStops,
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
