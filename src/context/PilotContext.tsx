import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Contract,
  FlightLog,
  PilotProfile,
  ActiveTab,
  AdminCompany,
  AircraftModel,
  AirportSample,
  RegulatoryZone,
  CountryRegulatoryInfo,
  RegulatoryBody,
  RequiredDocument,
  SubmittedDocumentRecord,
  CommsMessage,
  TechnicalStopDeclaration,
  OverflightPermitRecord,
  FerryRoutePlan,
  CareerMode,
  PilotLicenseId,
} from '../types';
import { INITIAL_ADMIN_COMPANIES } from '../data/initialCompanies';
import { AIRCRAFT_CATALOG } from '../data/initialFleet';
import {
  INITIAL_REGULATORY_ZONES,
  INITIAL_COUNTRIES_INFO,
  INITIAL_REGULATORY_BODIES,
  INITIAL_REQUIRED_DOCUMENTS,
  INITIAL_POE_AIRPORT_ICAOS,
} from '../data/initialRegulatoryData';
import { generateContractsFromCompanies } from '../utils/missionGenerator';
import { fetchMissionAirportPool, updateAirportInCache } from '../services/airportsService';
import {
  findOptimalStagingAirport,
  findOptimalPortOfEntry,
  generateRouteOverflightPermits,
} from '../utils/regulatoryEngine';
import { calculateLicenseProgression, getLicenseById } from '../utils/licenseEngine';
import { useTelemetry } from './TelemetryContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

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
  adminAdvanceFlightLeg: () => void;
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
  // Career Mode & Licenses
  careerMode: CareerMode;
  setCareerMode: (mode: CareerMode) => void;
  promotePilotLicense: () => void;
  isCareerModeModalOpen: boolean;
  setIsCareerModeModalOpen: (open: boolean) => void;
  // Admin Company Management
  adminCompanies: AdminCompany[];
  saveCompany: (company: AdminCompany) => void;
  deleteCompany: (companyId: string) => void;
  toggleCompanyActive: (companyId: string) => void;
  regenerateMissions: () => void;
  airportsLoading: boolean;
  airportsCount: number;
  refreshAirportsDatabase: () => Promise<void>;
  // Admin Aircraft Management
  adminAircrafts: AircraftModel[];
  saveAircraft: (aircraft: AircraftModel) => void;
  deleteAircraft: (aircraftId: string) => void;
  toggleAircraftActive: (aircraftId: string) => void;
  // Admin Regulatory & Customs Management
  regulatoryZones: RegulatoryZone[];
  saveRegulatoryZone: (zone: RegulatoryZone) => void;
  deleteRegulatoryZone: (zoneId: string) => void;
  countriesInfo: CountryRegulatoryInfo[];
  saveCountryInfo: (country: CountryRegulatoryInfo) => void;
  regulatoryBodies: RegulatoryBody[];
  saveRegulatoryBody: (body: RegulatoryBody) => void;
  deleteRegulatoryBody: (bodyId: string) => void;
  requiredDocuments: RequiredDocument[];
  saveRequiredDocument: (doc: RequiredDocument) => void;
  deleteRequiredDocument: (docId: string) => void;
  airportPool: AirportSample[];
  toggleAirportPortOfEntry: (icao: string) => void;
  updateAirportPoeInfo: (icao: string, poeCustomsHours?: string, poeNotes?: string) => void;
  // Mission Submissions & Comms
  submittedDocuments: SubmittedDocumentRecord[];
  submitMissionDocument: (contractId: string, documentId: string, formData: Record<string, any>) => void;
  approveDocumentInstant: (contractId: string, documentId: string) => void;
  commsMessages: CommsMessage[];
  markCommsMessageRead: (messageId: string) => void;
  // Ferry Staging, Technical Stops & Overflight Permits
  ferryRoutePlans: Record<string, FerryRoutePlan>;
  updateFerryTechnicalStops: (contractId: string, stops: TechnicalStopDeclaration[]) => void;
  requestPortOfEntry: (contractId: string) => Promise<void>;
  requestOverflightPermits: (contractId: string) => Promise<void>;
  getFerryRoutePlan: (contractId: string) => FerryRoutePlan;
}

const INITIAL_PROFILE: PilotProfile = {
  name: 'Gabriel Silva',
  title: 'Licença de Aluno Piloto',
  credits: 0, // Starts at 0 credits as requested
  xp: 0,
  level: 1,
  totalFlightHours: 0,
  completedFlights: 0,
  successfulLandings: 0,
  preferredCallsign: 'PR-AV1',
  careerMode: 'full_career',
  licenseId: 'student_pilot',
  licenseIssuedAt: new Date().toISOString(),
};

const PilotContext = createContext<PilotContextType | undefined>(undefined);

export const PilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { telemetry, connectionStatus } = useTelemetry();
  const { user } = useAuth();

  const [profile, setProfile] = useState<PilotProfile>(() => {
    const saved = localStorage.getItem('aviator_pilot_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_PROFILE,
          ...parsed,
          careerMode: parsed.careerMode || 'full_career',
          licenseId: parsed.licenseId || 'student_pilot',
        };
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PROFILE;
  });

  const [isCareerModeModalOpen, setIsCareerModeModalOpen] = useState<boolean>(() => {
    const hasChosenMode = localStorage.getItem('aviator_career_mode_selected');
    return !hasChosenMode;
  });

  const setCareerMode = (mode: CareerMode) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        careerMode: mode,
      };
      localStorage.setItem('aviator_pilot_profile', JSON.stringify(updated));
      return updated;
    });
    localStorage.setItem('aviator_career_mode_selected', 'true');
    setIsCareerModeModalOpen(false);
  };

  const promotePilotLicense = () => {
    const progression = calculateLicenseProgression(profile, logbook);
    if (progression.canPromote && progression.nextLicense) {
      const nextTier = progression.nextLicense;
      setProfile((prev) => {
        const updated: PilotProfile = {
          ...prev,
          licenseId: nextTier.id,
          title: nextTier.name,
          level: Math.max(prev.level, nextTier.order),
          licenseIssuedAt: new Date().toISOString(),
        };
        localStorage.setItem('aviator_pilot_profile', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const [adminCompanies, setAdminCompanies] = useState<AdminCompany[]>(() => {
    const saved = localStorage.getItem('aviator_admin_companies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ADMIN_COMPANIES;
  });

  const [regulatoryZones, setRegulatoryZones] = useState<RegulatoryZone[]>([]);
  const [countriesInfo, setCountriesInfo] = useState<CountryRegulatoryInfo[]>([]);
  const [regulatoryBodies, setRegulatoryBodies] = useState<RegulatoryBody[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
  const [submittedDocuments, setSubmittedDocuments] = useState<SubmittedDocumentRecord[]>([]);
  const [commsMessages, setCommsMessages] = useState<CommsMessage[]>([]);
  const [ferryRoutePlans, setFerryRoutePlans] = useState<Record<string, FerryRoutePlan>>(() => {
    const saved = localStorage.getItem('aviator_ferry_route_plans');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('aviator_ferry_route_plans', JSON.stringify(ferryRoutePlans));
  }, [ferryRoutePlans]);

  // Carrega tabelas regulatórias do Supabase ao iniciar
  useEffect(() => {
    let cancelled = false;

    async function fetchRegulatoryData() {
      try {
        // 1. Zonas Regulatórias
        const { data: zones } = await supabase.from('regulatory_zones').select('*');
        if (!cancelled) {
          if (zones && zones.length > 0) {
            setRegulatoryZones(
              zones.map((row: any) => ({
                id: row.id,
                code: row.code,
                name: row.name,
                description: row.description || '',
                colorHex: row.color_hex || row.colorHex || '#0284c7',
              }))
            );
          } else {
            setRegulatoryZones(INITIAL_REGULATORY_ZONES);
          }
        }

        // 2. Países e Regras
        const { data: countries } = await supabase.from('countries_info').select('*');
        if (!cancelled) {
          if (countries && countries.length > 0) {
            setCountriesInfo(
              countries.map((row: any) => ({
                isoCode: row.iso_code || row.isoCode,
                name: row.name,
                zoneId: row.zone_id || row.zoneId || '',
                requiresOverflightPermit: Boolean(row.requires_overflight_permit ?? row.requiresOverflightPermit),
                customsNotes: row.customs_notes || row.customsNotes || '',
              }))
            );
          } else {
            setCountriesInfo(INITIAL_COUNTRIES_INFO);
          }
        }

        // 3. Órgãos Reguladores
        const { data: bodies } = await supabase.from('regulatory_bodies').select('*');
        if (!cancelled) {
          if (bodies && bodies.length > 0) {
            setRegulatoryBodies(
              bodies.map((row: any) => ({
                id: row.id,
                countryIso: row.country_iso || row.countryIso,
                name: row.name,
                shortName: row.short_name || row.shortName,
                role: row.role,
                contactFlavorText: row.contact_flavor_text || row.contactFlavorText || '',
              }))
            );
          } else {
            setRegulatoryBodies(INITIAL_REGULATORY_BODIES);
          }
        }

        // 4. Documentos Exigidos
        const { data: docs } = await supabase.from('required_documents').select('*');
        if (!cancelled) {
          if (docs && docs.length > 0) {
            setRequiredDocuments(
              docs.map((row: any) => ({
                id: row.id,
                regulatoryBodyId: row.regulatory_body_id || row.regulatoryBodyId,
                code: row.code,
                name: row.name,
                systemName: row.system_name || row.systemName || '',
                phase: row.phase,
                description: row.description || '',
                formSchema: typeof row.form_schema === 'string' ? JSON.parse(row.form_schema) : (row.form_schema || row.formSchema || { fields: [] }),
                requiresReviewDelayMinutes: Number(row.requires_review_delay_minutes ?? row.requiresReviewDelayMinutes ?? 0),
              }))
            );
          } else {
            setRequiredDocuments(INITIAL_REQUIRED_DOCUMENTS);
          }
        }

        // 5. Documentos Submetidos (filtrados por pilot_id)
        if (user?.id) {
          const { data: subData } = await supabase
            .from('submitted_documents')
            .select('*')
            .eq('pilot_id', user.id);
          if (!cancelled && subData) {
            setSubmittedDocuments(
              subData.map((row: any) => ({
                id: row.id,
                contractId: row.contract_id || row.contractId,
                documentId: row.document_id || row.documentId,
                submittedAt: row.submitted_at || row.submittedAt,
                reviewCompletedAt: row.review_completed_at || row.reviewCompletedAt,
                status: row.status,
                rejectionReason: row.rejection_reason || row.rejectionReason,
                formData: typeof row.form_data === 'string' ? JSON.parse(row.form_data) : (row.form_data || row.formData || {}),
              }))
            );
          }
        }

        // 6. Mensagens de Comunicação (filtradas por pilot_id)
        if (user?.id) {
          const { data: commsData } = await supabase
            .from('comms_messages')
            .select('*')
            .eq('pilot_id', user.id);
          if (!cancelled && commsData) {
            setCommsMessages(
              commsData.map((row: any) => ({
                id: row.id,
                contractId: row.contract_id || row.contractId,
                regulatoryBodyId: row.regulatory_body_id || row.regulatoryBodyId,
                title: row.title,
                content: row.content,
                timestamp: row.timestamp,
                isRead: Boolean(row.is_read ?? row.isRead),
                attachedDocumentId: row.attached_document_id || row.attachedDocumentId,
                type: row.type,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados regulatórios do Supabase:', err);
      }
    }

    fetchRegulatoryData();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [rawAirportPool, setRawAirportPool] = useState<AirportSample[]>([]);
  const [airportsLoading, setAirportsLoading] = useState<boolean>(true);

  const airportPool = rawAirportPool;

  // Busca a base real de aeroportos (Supabase, alimentada pelo OurAirports)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAirportsLoading(true);
      const pool = await fetchMissionAirportPool();
      if (cancelled) return;
      setRawAirportPool(pool);
      setAirportsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Regenera as missões sempre que a lista de empresas, a base de aeroportos,
  // ou a estrutura regulatória (países, zonas, órgãos, POEs) mudar.
  useEffect(() => {
    localStorage.setItem('aviator_admin_companies', JSON.stringify(adminCompanies));
    if (airportPool.length > 0) {
      setContracts(
        generateContractsFromCompanies(adminCompanies, airportPool, {
          countriesInfo,
          regulatoryBodies,
          regulatoryZones,
          airportPool,
        })
      );
    }
  }, [adminCompanies, airportPool, countriesInfo, regulatoryBodies, regulatoryZones]);

  const refreshAirportsDatabase = async () => {
    setAirportsLoading(true);
    const pool = await fetchMissionAirportPool({ forceRefresh: true });
    setRawAirportPool(pool);
    setAirportsLoading(false);
  };

  const saveCompany = (company: AdminCompany) => {
    setAdminCompanies((prev) => {
      const existingIdx = prev.findIndex((c) => c.id === company.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = company;
        return copy;
      }
      return [company, ...prev];
    });
  };

  const deleteCompany = (companyId: string) => {
    setAdminCompanies((prev) => prev.filter((c) => c.id !== companyId));
  };

  const toggleCompanyActive = (companyId: string) => {
    setAdminCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const regenerateMissions = () => {
    if (airportPool.length === 0) return; // base ainda carregando — o efeito acima cuida disso assim que chegar
    setContracts(
      generateContractsFromCompanies(adminCompanies, airportPool, {
        countriesInfo,
        regulatoryBodies,
        regulatoryZones,
        airportPool,
      })
    );
  };

  const [adminAircrafts, setAdminAircrafts] = useState<AircraftModel[]>(() => {
    const saved = localStorage.getItem('aviator_admin_aircrafts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return AIRCRAFT_CATALOG;
  });

  useEffect(() => {
    localStorage.setItem('aviator_admin_aircrafts', JSON.stringify(adminAircrafts));
  }, [adminAircrafts]);

  const saveAircraft = (aircraft: AircraftModel) => {
    setAdminAircrafts((prev) => {
      const existingIdx = prev.findIndex((a) => a.id === aircraft.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = aircraft;
        return copy;
      }
      return [aircraft, ...prev];
    });
  };

  const deleteAircraft = (aircraftId: string) => {
    setAdminAircrafts((prev) => prev.filter((a) => a.id !== aircraftId));
  };

  const toggleAircraftActive = (aircraftId: string) => {
    setAdminAircrafts((prev) =>
      prev.map((a) => (a.id === aircraftId ? { ...a, isActive: a.isActive === false ? true : false } : a))
    );
  };
  const [activeContract, setActiveContract] = useState<Contract | null>(() => {
    const saved = localStorage.getItem('aviator_active_contract');
    if (saved) {
      try {
        const parsed: Contract = JSON.parse(saved);
        if (parsed && parsed.route) {
          if (parsed.type === 'ferry' && parsed.title && parsed.title.includes('(Exit)')) {
            parsed.title = `Translado Internacional (${parsed.company?.icaoCode || 'FERRY'}): ${parsed.route.departureIcao} ➔ ${parsed.route.arrivalIcao}`;
          }
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return null;
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
        const rawIcao = (telemetry.airportIcao || '').trim().toUpperCase();
        const currentLandedIcao = (rawIcao && rawIcao !== '---') ? rawIcao : '';
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
    } else if (flightPhase === 'intermediate_landing' && onGround) {
      // While on ground at intermediate landing, capture and persist exact landed airport ICAO if detected
      const rawIcao = (telemetry.airportIcao || '').trim().toUpperCase();
      if (rawIcao && rawIcao !== '---' && rawIcao !== currentLocationIcao) {
        setCurrentLocationIcao(rawIcao);
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

  const adminAdvanceFlightLeg = () => {
    if (!activeContract) return;

    if (!flightPhase || flightPhase === 'briefing') {
      if (activeContract.type === 'ferry') {
        const manifestDoc = requiredDocuments.find((d) => d.code === 'EAPIS_MANIFEST');
        if (manifestDoc) {
          approveDocumentInstant(activeContract.id, manifestDoc.id);
        }
      }
      setFlightPhase('taxi');
      setFlightProgress((prev) => Math.max(prev, 25));
      return;
    }

    if (flightPhase === 'taxi') {
      setFlightPhase('cruise');
      setFlightProgress((prev) => Math.max(prev, 60));
      return;
    }

    if (flightPhase === 'cruise') {
      if (activeContract.type === 'ferry') {
        const plan = getFerryRoutePlan(activeContract.id);
        const stagingIcao = plan.stagingAirportIcao;
        const portOfEntryIcao = plan.portOfEntryIcao || activeContract.ferryDossier?.portOfEntryIcao;
        const targetArrivalIcao = activeContract.route.arrivalIcao;

        // Step 1: Has aircraft visited Staging Airport (Port of Exit)?
        if (
          stagingIcao &&
          stagingIcao !== activeContract.route.departureIcao &&
          currentLocationIcao !== stagingIcao &&
          !intermediateStops.some((s) => s.icao === stagingIcao)
        ) {
          const manifestDoc = requiredDocuments.find((d) => d.code === 'EAPIS_MANIFEST');
          if (manifestDoc) {
            approveDocumentInstant(activeContract.id, manifestDoc.id);
          }
          setFlightPhase('intermediate_landing');
          setCurrentLocationIcao(stagingIcao);
          setIntermediateStops((prev) => {
            if (prev.some((s) => s.icao === stagingIcao)) return prev;
            return [...prev, { icao: stagingIcao, timestamp: new Date().toISOString() }];
          });
          setFlightProgress(50);
          return;
        }

        // Step 2: Has aircraft visited Port of Entry?
        if (
          portOfEntryIcao &&
          currentLocationIcao !== portOfEntryIcao &&
          !intermediateStops.some((s) => s.icao === portOfEntryIcao) &&
          portOfEntryIcao !== targetArrivalIcao
        ) {
          // Unlocks POE and permits automatically on Admin advance so POE is never "Desconhecido"
          setFerryRoutePlans((prev) => {
            const current = prev[activeContract.id] || plan;
            const permits =
              current.permits && current.permits.length > 0
                ? current.permits
                : generateRouteOverflightPermits(
                    activeContract.id,
                    plan.originIcao,
                    plan.destinationIcao,
                    plan.stagingAirportIcao,
                    plan.portOfEntryIcao,
                    countriesInfo,
                    regulatoryBodies,
                    regulatoryZones,
                    airportPool
                  );
            return {
              ...prev,
              [activeContract.id]: {
                ...current,
                isPoeRequested: true,
                isClearedForDeparture: true,
                permits,
                updatedAt: new Date().toISOString(),
              },
            };
          });

          setFlightPhase('intermediate_landing');
          setCurrentLocationIcao(portOfEntryIcao);
          setIntermediateStops((prev) => {
            if (prev.some((s) => s.icao === portOfEntryIcao)) return prev;
            return [...prev, { icao: portOfEntryIcao, timestamp: new Date().toISOString() }];
          });
          setFlightProgress(75);
          return;
        }

        // Step 3: Final destination
        setFerryRoutePlans((prev) => {
          const current = prev[activeContract.id] || plan;
          return {
            ...prev,
            [activeContract.id]: {
              ...current,
              isPoeRequested: true,
              isClearedForDeparture: true,
              updatedAt: new Date().toISOString(),
            },
          };
        });
        setFlightPhase('landed');
        setCurrentLocationIcao(targetArrivalIcao);
        setFlightProgress(100);
        return;
      }

      // Standard non-ferry flight
      const targetArrivalIcao = activeContract.route.arrivalIcao;
      setFlightPhase('landed');
      setCurrentLocationIcao(targetArrivalIcao);
      setFlightProgress(100);
      return;
    }

    if (flightPhase === 'intermediate_landing') {
      if (activeContract.type === 'ferry') {
        const plan = getFerryRoutePlan(activeContract.id);
        if (currentLocationIcao === plan.stagingAirportIcao) {
          // Leaving Staging Airport: automatically ensure POE is requested and permits are active
          setFerryRoutePlans((prev) => {
            const current = prev[activeContract.id] || plan;
            const permits =
              current.permits && current.permits.length > 0
                ? current.permits
                : generateRouteOverflightPermits(
                    activeContract.id,
                    plan.originIcao,
                    plan.destinationIcao,
                    plan.stagingAirportIcao,
                    plan.portOfEntryIcao,
                    countriesInfo,
                    regulatoryBodies,
                    regulatoryZones,
                    airportPool
                  );
            return {
              ...prev,
              [activeContract.id]: {
                ...current,
                isPoeRequested: true,
                isClearedForDeparture: true,
                permits,
                updatedAt: new Date().toISOString(),
              },
            };
          });
          setFlightPhase('taxi');
          setFlightProgress((prev) => Math.max(prev, 60));
          return;
        }
        if (currentLocationIcao === plan.portOfEntryIcao) {
          setFlightPhase('taxi');
          setFlightProgress((prev) => Math.max(prev, 85));
          return;
        }
      }
      setFlightPhase('taxi');
      setFlightProgress((prev) => Math.max(prev, 80));
      return;
    }

    if (flightPhase === 'landed') {
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
    setAdminCompanies(INITIAL_ADMIN_COMPANIES);
    setContracts(airportPool.length > 0 ? generateContractsFromCompanies(INITIAL_ADMIN_COMPANIES, airportPool) : []);
    setActiveContract(null);
    setFlightPhase(null);
    setFlightProgress(0);
    setCurrentLocationIcao(null);
    setIntermediateStops([]);
    setLogbook([]);
    localStorage.removeItem('aviator_pilot_profile');
    localStorage.removeItem('aviator_career_mode_selected');
    localStorage.removeItem('aviator_admin_companies');
    localStorage.removeItem('aviator_active_contract');
    localStorage.removeItem('aviator_flight_phase');
    localStorage.removeItem('aviator_flight_progress');
    localStorage.removeItem('aviator_current_location');
    localStorage.removeItem('aviator_intermediate_stops');
    localStorage.removeItem('aviator_logbook');
    setIsCareerModeModalOpen(true);
    setActiveTab('overview');
  };

  const saveRegulatoryZone = async (zone: RegulatoryZone) => {
    setRegulatoryZones((prev) => {
      const idx = prev.findIndex((z) => z.id === zone.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = zone;
        return copy;
      }
      return [...prev, zone];
    });
    try {
      await supabase.from('regulatory_zones').upsert({
        id: zone.id,
        code: zone.code,
        name: zone.name,
        description: zone.description,
        color_hex: zone.colorHex,
      });
    } catch (err) {
      console.error('Erro no Supabase saveRegulatoryZone:', err);
    }
  };

  const deleteRegulatoryZone = async (zoneId: string) => {
    setRegulatoryZones((prev) => prev.filter((z) => z.id !== zoneId));
    try {
      await supabase.from('regulatory_zones').delete().eq('id', zoneId);
    } catch (err) {
      console.error('Erro no Supabase deleteRegulatoryZone:', err);
    }
  };

  const saveCountryInfo = async (country: CountryRegulatoryInfo) => {
    setCountriesInfo((prev) => {
      const idx = prev.findIndex((c) => c.isoCode === country.isoCode);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = country;
        return copy;
      }
      return [...prev, country];
    });
    try {
      await supabase.from('countries_info').upsert({
        iso_code: country.isoCode,
        name: country.name,
        zone_id: country.zoneId,
        requires_overflight_permit: country.requiresOverflightPermit,
        customs_notes: country.customsNotes,
      });
    } catch (err) {
      console.error('Erro no Supabase saveCountryInfo:', err);
    }
  };

  const saveRegulatoryBody = async (body: RegulatoryBody) => {
    setRegulatoryBodies((prev) => {
      const idx = prev.findIndex((b) => b.id === body.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = body;
        return copy;
      }
      return [...prev, body];
    });
    try {
      await supabase.from('regulatory_bodies').upsert({
        id: body.id,
        country_iso: body.countryIso,
        name: body.name,
        short_name: body.shortName,
        role: body.role,
        contact_flavor_text: body.contactFlavorText,
      });
    } catch (err) {
      console.error('Erro no Supabase saveRegulatoryBody:', err);
    }
  };

  const deleteRegulatoryBody = async (bodyId: string) => {
    setRegulatoryBodies((prev) => prev.filter((b) => b.id !== bodyId));
    try {
      await supabase.from('regulatory_bodies').delete().eq('id', bodyId);
    } catch (err) {
      console.error('Erro no Supabase deleteRegulatoryBody:', err);
    }
  };

  const saveRequiredDocument = async (doc: RequiredDocument) => {
    setRequiredDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === doc.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = doc;
        return copy;
      }
      return [...prev, doc];
    });
    try {
      await supabase.from('required_documents').upsert({
        id: doc.id,
        regulatory_body_id: doc.regulatoryBodyId,
        code: doc.code,
        name: doc.name,
        system_name: doc.systemName,
        phase: doc.phase,
        description: doc.description,
        form_schema: doc.formSchema,
        requires_review_delay_minutes: doc.requiresReviewDelayMinutes,
      });
    } catch (err) {
      console.error('Erro no Supabase saveRequiredDocument:', err);
    }
  };

  const deleteRequiredDocument = async (docId: string) => {
    setRequiredDocuments((prev) => prev.filter((d) => d.id !== docId));
    try {
      await supabase.from('required_documents').delete().eq('id', docId);
    } catch (err) {
      console.error('Erro no Supabase deleteRequiredDocument:', err);
    }
  };

  const toggleAirportPortOfEntry = async (icao: string) => {
    let updatedIsPoe = true;
    setRawAirportPool((prev) =>
      prev.map((ap) => {
        if (ap.icao === icao) {
          updatedIsPoe = !ap.isPortOfEntry;
          return { ...ap, isPortOfEntry: updatedIsPoe };
        }
        return ap;
      })
    );

    try {
      await Promise.allSettled([
        supabase.from('mission_airports').update({ is_port_of_entry: updatedIsPoe }).eq('icao', icao),
        supabase.from('airports').update({ is_port_of_entry: updatedIsPoe }).eq('icao', icao),
      ]);
    } catch (err) {
      console.error('Erro no Supabase toggleAirportPortOfEntry:', err);
    }
  };

  const updateAirportPoeInfo = async (icao: string, poeCustomsHours?: string, poeNotes?: string) => {
    setRawAirportPool((prev) =>
      prev.map((ap) => {
        if (ap.icao === icao) {
          return {
            ...ap,
            isPortOfEntry: true,
            poeCustomsHours: poeCustomsHours || ap.poeCustomsHours,
            poeNotes: poeNotes || ap.poeNotes,
          };
        }
        return ap;
      })
    );

    try {
      await Promise.allSettled([
        supabase.from('mission_airports').update({
          is_port_of_entry: true,
          poe_customs_hours: poeCustomsHours,
          poe_notes: poeNotes,
        }).eq('icao', icao),
        supabase.from('airports').update({
          is_port_of_entry: true,
          poe_customs_hours: poeCustomsHours,
          poe_notes: poeNotes,
        }).eq('icao', icao),
      ]);
    } catch (err) {
      console.error('Erro no Supabase updateAirportPoeInfo:', err);
    }
  };


  // Submissão de documentos do voo
  const submitMissionDocument = async (contractId: string, documentId: string, formData: Record<string, any>) => {
    const doc = requiredDocuments.find((d) => d.id === documentId);
    const delayMinutes = doc?.requiresReviewDelayMinutes || 1;

    const newRecord: SubmittedDocumentRecord = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contractId,
      documentId,
      submittedAt: new Date().toISOString(),
      status: delayMinutes > 0 ? 'under_review' : 'approved',
      formData,
    };

    setSubmittedDocuments((prev) => [newRecord, ...prev]);

    if (user?.id) {
      try {
        await supabase.from('submitted_documents').insert({
          id: newRecord.id,
          pilot_id: user.id,
          contract_id: newRecord.contractId,
          document_id: newRecord.documentId,
          submitted_at: newRecord.submittedAt,
          status: newRecord.status,
          form_data: newRecord.formData,
        });
      } catch (err) {
        console.error('Erro ao enviar documento para o Supabase:', err);
      }
    }

    // Envia mensagem na caixa de comunicação
    const body = regulatoryBodies.find((b) => b.id === doc?.regulatoryBodyId);
    if (body) {
      const newMsg: CommsMessage = {
        id: `msg_${Date.now()}`,
        contractId,
        regulatoryBodyId: body.id,
        title: `Protocolo Recebido: ${doc?.name || 'Documento de Voo'}`,
        content: `Confirmamos o recebimento do formulário submetido. Seu protocolo está sob análise formal da ${body.shortName} (${body.name}). Tempo estimado de análise: ${delayMinutes} minuto(s).`,
        timestamp: new Date().toISOString(),
        isRead: false,
        attachedDocumentId: documentId,
        type: 'request',
      };
      setCommsMessages((prev) => [newMsg, ...prev]);

      if (user?.id) {
        try {
          await supabase.from('comms_messages').insert({
            id: newMsg.id,
            pilot_id: user.id,
            contract_id: newMsg.contractId,
            regulatory_body_id: newMsg.regulatoryBodyId,
            title: newMsg.title,
            content: newMsg.content,
            timestamp: newMsg.timestamp,
            is_read: newMsg.isRead,
            attached_document_id: newMsg.attachedDocumentId,
            type: newMsg.type,
          });
        } catch (err) {
          console.error('Erro ao salvar mensagem no Supabase:', err);
        }
      }
    }

    // Se tiver delay, agenda a aprovação após o tempo
    if (delayMinutes > 0) {
      setTimeout(async () => {
        const approvedAt = new Date().toISOString();
        setSubmittedDocuments((prev) =>
          prev.map((r) =>
            r.contractId === contractId && r.documentId === documentId
              ? { ...r, status: 'approved', reviewCompletedAt: approvedAt }
              : r
          )
        );

        if (user?.id) {
          try {
            await supabase
              .from('submitted_documents')
              .update({ status: 'approved', review_completed_at: approvedAt })
              .eq('id', newRecord.id);
          } catch (err) {
            console.error(err);
          }
        }

        if (body) {
          const isEapis = doc?.code === 'EAPIS_MANIFEST';
          const isDI = doc?.code === 'DI_IMPORT';
          const dossier = activeContract?.ferryDossier;

          let approvalContent = `A autorização foi emitida com sucesso pela ${body.shortName}. O selo de liberação e o carimbo de trânsito foram vinculados ao seu dossiê de voo.`;
          
          if (isEapis) {
            const plan = getFerryRoutePlan(contractId);
            approvalContent = `[CBP eAPIS APPROVED 14:22Z] Protocolo Oficial de Saída: CBP-${Math.floor(10000 + Math.random() * 90000)}-US.
Staging Airport Designado (Port of Exit): ${plan.stagingAirportIcao} (${plan.stagingAirportName}).
INSTRUÇÃO OBRIGATÓRIA: O piloto deverá realizar pouso técnico no Staging Airport ${plan.stagingAirportIcao} para encerramento formal dos trâmites aduaneiros de exportação antes de ingressar no espaço aéreo internacional.
O Port of Entry de destino somente será revelado após a obtenção da Autorização de Saída do País neste aeroporto.`;
          } else if (isDI) {
            approvalContent = `[RECEITA FEDERAL & RAB HOMOLOGADO] Processo de Importação DI deferido!
O Certificado de Verificação de Navegabilidade (CNAV) foi emitido e a aeronave foi inscrita no Registro Aeronáutico Brasileiro sob as marcas definitivas: ${dossier?.newRegistration || 'PS-GFA'}.
Aeronave liberada para voo de entrega final até a base do operador.`;
          }

          const approvalMsg: CommsMessage = {
            id: `msg_app_${Date.now()}`,
            contractId,
            regulatoryBodyId: body.id,
            title: isEapis
              ? `✓ eAPIS APROVADO: Staging Airport Designado`
              : isDI
              ? `✓ DI APROVADA: Matrícula ${dossier?.newRegistration || 'BR'} Registrada no RAB`
              : `✓ APROVADO: ${doc?.name || 'Documento Oficial'}`,
            content: approvalContent,
            timestamp: approvedAt,
            isRead: false,
            attachedDocumentId: documentId,
            type: 'approval',
          };
          setCommsMessages((prev) => [approvalMsg, ...prev]);

          if (user?.id) {
            try {
              await supabase.from('comms_messages').insert({
                id: approvalMsg.id,
                pilot_id: user.id,
                contract_id: approvalMsg.contractId,
                regulatory_body_id: approvalMsg.regulatoryBodyId,
                title: approvalMsg.title,
                content: approvalMsg.content,
                timestamp: approvalMsg.timestamp,
                is_read: approvalMsg.isRead,
                attached_document_id: approvalMsg.attachedDocumentId,
                type: approvalMsg.type,
              });
            } catch (err) {
              console.error(err);
            }
          }
        }
      }, delayMinutes * 60 * 1000);
    }
  };

  // Helper de Plano de Rota e Escalas de Translado
  const getFerryRoutePlan = (contractId: string): FerryRoutePlan => {
    if (ferryRoutePlans[contractId]) {
      return ferryRoutePlans[contractId];
    }
    const contract = contracts.find((c) => c.id === contractId) || activeContract;
    const dossier = contract?.ferryDossier;

    const depIcao = contract?.route.departureIcao || 'KFXE';
    const arrIcao = contract?.route.arrivalIcao || 'SBGR';

    const depAirport = airportPool.find((a) => a.icao === depIcao) || {
      icao: depIcao,
      name: contract?.route.departureName || depIcao,
      city: contract?.route.departureCity || '',
      country: dossier?.originCountryCode || 'US',
      lat: 26.197,
      lng: -80.17,
      elevationFt: 13,
      hasPavedRunway: true,
      isPortOfEntry: true,
    };

    const arrAirport = airportPool.find((a) => a.icao === arrIcao) || {
      icao: arrIcao,
      name: contract?.route.arrivalName || arrIcao,
      city: contract?.route.arrivalCity || '',
      country: dossier?.destinationCountryCode || 'BR',
      lat: -23.435,
      lng: -46.473,
      elevationFt: 2459,
      hasPavedRunway: true,
      isPortOfEntry: true,
    };

    const optimalStaging = findOptimalStagingAirport(depAirport, arrAirport, airportPool);
    const optimalPoe = findOptimalPortOfEntry(optimalStaging, arrAirport, airportPool);

    const stagingAirportIcao = optimalStaging.icao;
    const stagingAirportName = optimalStaging.name;
    const stagingAirportCity = optimalStaging.city;

    const portOfEntryIcao = dossier?.portOfEntryIcao || optimalPoe.icao;
    const portOfEntryName = dossier?.portOfEntryName || optimalPoe.name;
    const portOfEntryCity = dossier?.portOfEntryCity || optimalPoe.city;

    const defaultPlan: FerryRoutePlan = {
      contractId,
      originIcao: depIcao,
      destinationIcao: arrIcao,
      stagingAirportIcao,
      stagingAirportName,
      stagingAirportCity,
      portOfEntryIcao,
      portOfEntryName,
      portOfEntryCity,
      hasStops: false,
      technicalStops: [],
      permits: [],
      isClearedForDeparture: false,
      updatedAt: new Date().toISOString(),
    };

    return defaultPlan;
  };

  const updateFerryTechnicalStops = (contractId: string, stops: TechnicalStopDeclaration[]) => {
    setFerryRoutePlans((prev) => {
      const current = prev[contractId] || getFerryRoutePlan(contractId);
      const updated: FerryRoutePlan = {
        ...current,
        hasStops: stops.length > 0,
        technicalStops: stops,
        updatedAt: new Date().toISOString(),
      };
      return { ...prev, [contractId]: updated };
    });
  };

  const requestPortOfEntry = async (contractId: string) => {
    const plan = getFerryRoutePlan(contractId);

    setFerryRoutePlans((prev) => {
      const current = prev[contractId] || plan;
      return {
        ...prev,
        [contractId]: {
          ...current,
          isPoeRequested: true,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    const poeMsg: CommsMessage = {
      id: `msg_poe_${Date.now()}`,
      contractId,
      regulatoryBodyId: 'body_rfb_br',
      title: `📍 Port of Entry Homologado: ${plan.portOfEntryIcao}`,
      content: `[DESPACHO ADUANEIRO INTERNACIONAL] O Port of Entry obrigatório para ingresso no país de destino foi oficialmente designado: ${plan.portOfEntryIcao} (${plan.portOfEntryName}${plan.portOfEntryCity ? ` - ${plan.portOfEntryCity}` : ''}). Você agora está autorizado a planejar e declarar escalas técnicas (se necessárias) e solicitar as Autorizações de Sobrevoo e Pouso (Permits).`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'approval',
    };

    setCommsMessages((prev) => [poeMsg, ...prev]);
  };

  const requestOverflightPermits = async (contractId: string) => {
    const plan = getFerryRoutePlan(contractId);
    const contract = contracts.find((c) => c.id === contractId) || activeContract;

    // A Autorização de Saída do País só pode ser solicitada com o Manifesto eAPIS aprovado e com
    // a aeronave fisicamente pousada no Staging Airport designado.
    const manifestDoc = requiredDocuments.find((d) => d.code === 'EAPIS_MANIFEST');
    const manifestApproved = manifestDoc
      ? submittedDocuments.some(
          (s) => s.contractId === contractId && s.documentId === manifestDoc.id && s.status === 'approved'
        )
      : false;
    const isAtStagingAirport = !!currentLocationIcao && currentLocationIcao === plan.stagingAirportIcao;

    if (!manifestApproved || !isAtStagingAirport) {
      return;
    }

    // Gera autorizações de sobrevoo dinamicamente conforme as regras, zonas e países configurados no Admin
    const permits = generateRouteOverflightPermits(
      contractId,
      plan.originIcao,
      plan.destinationIcao,
      plan.stagingAirportIcao,
      plan.portOfEntryIcao,
      countriesInfo,
      regulatoryBodies,
      regulatoryZones,
      airportPool
    );

    setFerryRoutePlans((prev) => {
      const current = prev[contractId] || plan;
      return {
        ...prev,
        [contractId]: {
          ...current,
          permits,
          isPoeRequested: true,
          isClearedForDeparture: true,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    // Envia mensagem no CommsHub
    const permitMsg: CommsMessage = {
      id: `msg_pmt_${Date.now()}`,
      contractId,
      regulatoryBodyId: 'body_faa_us',
      title: `✈️ Autorização de Saída do País Concedida`,
      content: `Todas as ${permits.length} Autorizações de Sobrevoo e Pouso Técnico (Permits) solicitadas para o trajeto internacional foram deferidas pelas autoridades aeronáuticas em conformidade com as zonas regulatórias. Os códigos de autorização foram anexados ao plano de voo.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'approval',
    };

    const poeRevealMsg: CommsMessage = {
      id: `msg_poe_${Date.now()}`,
      contractId,
      regulatoryBodyId: 'body_rfb_br',
      title: `📍 Port of Entry de Destino Confirmado`,
      content: `Com a saída do país autorizada, prossiga diretamente para o Port of Entry designado para desembaraço aduaneiro de importação: ${plan.portOfEntryIcao} (${plan.portOfEntryName}).`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'info',
    };

    setCommsMessages((prev) => [poeRevealMsg, permitMsg, ...prev]);
  };

  const approveDocumentInstant = async (contractId: string, documentId: string) => {
    const approvedAt = new Date().toISOString();
    setSubmittedDocuments((prev) => {
      const existing = prev.find((r) => r.contractId === contractId && r.documentId === documentId);
      if (existing) {
        return prev.map((r) =>
          r.contractId === contractId && r.documentId === documentId
            ? { ...r, status: 'approved', reviewCompletedAt: approvedAt }
            : r
        );
      }
      return [
        {
          id: `sub_admin_${Date.now()}`,
          contractId,
          documentId,
          submittedAt: approvedAt,
          reviewCompletedAt: approvedAt,
          status: 'approved',
          formData: { admin_instant_approval: true },
        },
        ...prev,
      ];
    });

    if (user?.id) {
      try {
        const { data: existing } = await supabase
          .from('submitted_documents')
          .select('id')
          .eq('contract_id', contractId)
          .eq('document_id', documentId)
          .single();

        if (existing) {
          await supabase
            .from('submitted_documents')
            .update({ status: 'approved', review_completed_at: approvedAt })
            .eq('id', existing.id);
        } else {
          await supabase.from('submitted_documents').insert({
            id: `sub_admin_${Date.now()}`,
            pilot_id: user.id,
            contract_id: contractId,
            document_id: documentId,
            submitted_at: approvedAt,
            review_completed_at: approvedAt,
            status: 'approved',
            form_data: { admin_instant_approval: true },
          });
        }
      } catch (err) {
        console.error(err);
      }
    }

    const doc = requiredDocuments.find((d) => d.id === documentId);
    const body = regulatoryBodies.find((b) => b.id === doc?.regulatoryBodyId);
    if (body) {
      const approvalMsg: CommsMessage = {
        id: `msg_admin_app_${Date.now()}`,
        contractId,
        regulatoryBodyId: body.id,
        title: `⚡ [ADMIN] APROVAÇÃO INSTANTÂNEA: ${doc?.name || 'Documento'}`,
        content: `Liberação realizada instantaneamente via Painel de Testes Admin para a autoridade ${body.shortName}.`,
        timestamp: approvedAt,
        isRead: false,
        attachedDocumentId: documentId,
        type: 'approval',
      };
      setCommsMessages((prev) => [approvalMsg, ...prev]);

      if (user?.id) {
        try {
          await supabase.from('comms_messages').insert({
            id: approvalMsg.id,
            pilot_id: user.id,
            contract_id: approvalMsg.contractId,
            regulatory_body_id: approvalMsg.regulatoryBodyId,
            title: approvalMsg.title,
            content: approvalMsg.content,
            timestamp: approvalMsg.timestamp,
            is_read: approvalMsg.isRead,
            attached_document_id: approvalMsg.attachedDocumentId,
            type: approvalMsg.type,
          });
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const markCommsMessageRead = async (messageId: string) => {
    setCommsMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
    );
    if (user?.id) {
      try {
        await supabase.from('comms_messages').update({ is_read: true }).eq('id', messageId);
      } catch (err) {
        console.error(err);
      }
    }
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
        adminAdvanceFlightLeg,
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
        careerMode: profile.careerMode || 'full_career',
        setCareerMode,
        promotePilotLicense,
        isCareerModeModalOpen,
        setIsCareerModeModalOpen,
        adminCompanies,
        saveCompany,
        deleteCompany,
        toggleCompanyActive,
        regenerateMissions,
        airportsLoading,
        airportsCount: airportPool.length,
        refreshAirportsDatabase,
        adminAircrafts,
        saveAircraft,
        deleteAircraft,
        toggleAircraftActive,
        regulatoryZones,
        saveRegulatoryZone,
        deleteRegulatoryZone,
        countriesInfo,
        saveCountryInfo,
        regulatoryBodies,
        saveRegulatoryBody,
        deleteRegulatoryBody,
        requiredDocuments,
        saveRequiredDocument,
        deleteRequiredDocument,
        airportPool,
        toggleAirportPortOfEntry,
        updateAirportPoeInfo,
        submittedDocuments,
        submitMissionDocument,
        approveDocumentInstant,
        commsMessages,
        markCommsMessageRead,
        ferryRoutePlans,
        updateFerryTechnicalStops,
        requestPortOfEntry,
        requestOverflightPermits,
        getFerryRoutePlan,
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