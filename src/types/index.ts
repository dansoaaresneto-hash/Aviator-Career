export type MissionType = 'cargo' | 'passenger' | 'ferry';

export type UrgencyLevel = 'normal' | 'high' | 'urgent';

export interface RouteWaypoints {
  departureIcao: string;
  departureName: string;
  departureCity: string;
  departureCountry?: string;
  arrivalIcao: string;
  arrivalName: string;
  arrivalCity: string;
  arrivalCountry?: string;
  distanceNm: number;
  estimatedMinutes: number;
  recommendedAltitude: string;
  minRunwayLengthM: number;
}

export interface ContractCompany {
  id: string;
  name: string;
  logoColor: string;
  tagline: string;
  logoUrl?: string;
  icaoCode?: string;
}

export interface FerryDossier {
  aircraftModel: string;
  manufacturer: string;
  msn: string; // MSN - Manufacturer Serial Number
  originalRegistration: string;
  newRegistration: string;
  mtowKg: number; // MTOW Maximum Takeoff Weight
  currentOwner: string;
  ownerTaxId?: string;
  ownerAddress?: string;
  exportLicenseNo?: string;
  insurancePolicyNo?: string;
  originCountryCode: string;
  originCountryName: string;
  destinationCountryCode: string;
  destinationCountryName: string;
  portOfEntryIcao: string;
  portOfEntryName: string;
  portOfEntryCity: string;
  exportFeeCr: number;
  nationalizationFeeCr: number;
}

export interface Contract {
  id: string;
  title: string;
  type: MissionType;
  company: ContractCompany;
  route: RouteWaypoints;
  requiredAircraft: string;
  aircraftCategory: string; // e.g., 'Monomotor a Pistão', 'Bimotor', 'Sua própria frota'
  rewardCredits: number;
  rewardXp: number;
  description: string;
  payloadInfo: string; // e.g., '450 kg de suprimentos médicos' ou '4 Executivos'
  urgency: UrgencyLevel;
  weatherForecast: string;
  minPilotRankLevel: number;
  expiryHours: number;
  isCustom?: boolean;
  ferryDossier?: FerryDossier;
}

export interface FlightLog {
  id: string;
  contractId: string;
  title: string;
  type: MissionType;
  companyName: string;
  departureIcao: string;
  arrivalIcao: string;
  aircraft: string;
  distanceNm: number;
  flightDurationMinutes: number;
  earnedCredits: number;
  earnedXp: number;
  landingScore: number; // 0-100%
  completedAt: string; // ISO date string
  status: 'completed' | 'abandoned';
}

export interface AircraftModel {
  id: string;
  name: string; // Modelo / Fabricante (Ex: Cessna 172 Skyhawk)
  manufacturer: string; // Fabricante (Ex: Cessna)
  icaoCode: string; // Código ICAO (Ex: C172, B350, A20N)
  category: string; // Categoria/Tipo (Ex: Monomotor a Pistão, Turboélice, Jato Executivo, etc.)
  maxFuelGallons: number; // Capacidade Máxima de Combustível
  passengerCapacity: number; // Quantidade de Passageiros (sem considerar o Piloto)
  oewKg: number; // Peso Vazio (Operating Empty Weight - OEW em kg)
  mtowKg: number; // Peso Máximo de Decolagem (MTOW em kg)
  maxPayloadKg: number; // Carga Útil Máxima (Max Payload em kg)
  imageUrl?: string; // Foto/Imagem da aeronave (URL)
  cruisingSpeedKts?: number; // Velocidade de Cruzeiro (kts)
  rangeNm?: number; // Alcance máximo (NM)
  cargoCapacityKg?: number; // Capacidade de Carga em kg
  rentalFeePerFlight?: number; // Taxa de aluguel por voo em CR
  purchasePrice?: number; // Preço de compra em CR
  imagePlaceholderColor?: string; // Tailwind color theme for badge/fallback
  description?: string; // Descrição técnica
  isActive?: boolean; // Status ativo/inativo
  createdAt?: string;
}

export interface PilotProfile {
  name: string;
  title: string; // e.g. 'Piloto Aluno', 'Piloto Privado', 'Comandante Comercial'
  avatarUrl?: string;
  credits: number;
  xp: number;
  level: number;
  totalFlightHours: number;
  completedFlights: number;
  successfulLandings: number;
  preferredCallsign: string;
}

export type ActiveTab = 'overview' | 'missions' | 'active-flight' | 'flight-planner' | 'live-map' | 'fleet' | 'logbook' | 'profile' | 'settings' | 'connector' | 'admin-companies';

export * from './companyAdmin';
export * from './telemetry';

export interface FlightPlanWaypoint {
  id: string;
  identifier: string; // e.g. "SBGR", "BGC", "KLAX"
  name: string;
  type: 'airport' | 'vor' | 'ndb' | 'fix' | 'custom' | 'sid' | 'star';
  lat: number;
  lng: number;
  elevationFt?: number;
  freq?: string;
  viaAirway?: string;
  altitudeFt?: number;
  legDistanceNm?: number;
  legHeadingDeg?: number;
  cumulativeDistanceNm?: number;
  eteMinutes?: number;
}

export interface AeronauticalFix {
  id: string;
  identifier: string;
  name: string;
  type: 'airport' | 'vor' | 'ndb' | 'fix';
  typeCode?: string;
  facilityType?: string;
  isHeli?: boolean;
  lat: number;
  lng: number;
  elevationFt?: number;
  country?: string;
  city?: string;
  iata?: string;
  freq?: string;
  tier: number; // 1 (major hub/VOR), 2 (regional/RNAV), 3 (NDB/VFR), 4 (minor fix)
}

export interface AiracCycleInfo {
  cycle: string;
  effectiveDate: string;
  expirationDate: string;
  daysRemaining: number;
  isCurrent: boolean;
}

// Aeroporto real vindo da view `mission_airports` (Supabase), alimentada pelo
// dataset público do OurAirports. Usado pelo gerador de missões e, no futuro,
// pelo cálculo de paradas de reabastecimento em translados longos.
export interface AirportSample {
  icao: string;
  name: string;
  city: string;
  country: string; // ISO 3166-1 alpha-2, ex: BR, US, PT
  lat: number;
  lng: number;
  maxRunwayFt?: number;
  hasPavedRunway?: boolean;
}

export interface MetarData {
  icao: string;
  rawMetar: string;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  temperatureC: number;
  dewPointC: number;
  windSpeedKts: number;
  windDirectionDeg: number;
  visibilityKm: number;
  altimeterInHg: number;
  cloudsText: string;
  observedTime: string;
}

export interface ProcedureOption {
  identifier: string;
  name: string;
  type: 'SID' | 'STAR' | 'APP';
  runway?: string;
  commonRouteWaypoints?: FlightPlanWaypoint[];
}

