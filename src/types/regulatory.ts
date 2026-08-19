export type RegulatoryRole = 'aduana' | 'aviação civil' | 'imigração';

export type DocumentPhase = 'departure' | 'enroute' | 'arrival';

export interface RegulatoryZone {
  id: string;
  code: string; // e.g. 'FAA', 'ANAC_LATAM', 'EASA'
  name: string; // e.g. 'FAA Zone (EUA e Territórios)'
  description: string;
  colorHex: string; // e.g. '#0284c7'
}

export interface CountryRegulatoryInfo {
  isoCode: string; // e.g. 'US', 'BR', 'PT'
  name: string;
  zoneId: string;
  requiresOverflightPermit: boolean;
  customsNotes: string;
}

export interface RegulatoryBody {
  id: string;
  countryIso: string;
  name: string; // e.g. 'U.S. Customs and Border Protection (CBP)'
  shortName: string; // 'CBP'
  role: RegulatoryRole;
  logoUrl?: string;
  contactFlavorText: string;
}

export interface FormFieldSchema {
  key: string;
  label: string;
  type: 'text' | 'number' | 'datetime' | 'select' | 'airport_select' | 'textarea' | 'checkbox';
  placeholder?: string;
  options?: string[];
  prefillFrom?:
    | 'mission.aircraft.registration'
    | 'mission.aircraft.model'
    | 'pilot.name'
    | 'pilot.callsign'
    | 'mission.poe.icao'
    | 'mission.departure.icao'
    | 'mission.arrival.icao';
  required?: boolean;
  filter?: string;
}

export interface FormSchema {
  fields: FormFieldSchema[];
}

export interface RequiredDocument {
  id: string;
  regulatoryBodyId: string;
  code: string; // e.g. 'EAPIS_MANIFEST', 'OVERFLIGHT_PERMIT', 'DI_IMPORT'
  name: string;
  systemName: string;
  phase: DocumentPhase;
  description: string;
  formSchema: FormSchema;
  requiresReviewDelayMinutes: number;
}

export interface SubmittedDocumentRecord {
  id: string;
  contractId: string;
  documentId: string;
  submittedAt: string; // ISO date
  reviewCompletedAt?: string; // ISO date
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  formData: Record<string, any>;
}

export interface TechnicalStopDeclaration {
  id: string;
  icao: string;
  name: string;
  country: string;
  purpose: 'refuel' | 'crew_rest' | 'technical_inspection' | 'both';
  etaUtc: string;
  stayDurationHours: number;
  fuelRequestedLiters?: number;
}

export interface OverflightPermitRecord {
  id: string;
  contractId: string;
  countryIso: string;
  countryName: string;
  firCode: string;
  authorityName: string;
  permitNumber: string;
  status: 'requested' | 'approved' | 'rejected';
  issuedAt: string;
  validUntil: string;
  notes: string;
}

export interface CommsMessage {
  id: string;
  contractId: string;
  regulatoryBodyId: string;
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachedDocumentId?: string;
  type: 'request' | 'approval' | 'rejection' | 'info';
}

export interface FerryRoutePlan {
  contractId: string;
  originIcao: string;
  destinationIcao: string;
  stagingAirportIcao: string;
  stagingAirportName: string;
  stagingAirportCity?: string;
  portOfEntryIcao: string;
  portOfEntryName: string;
  portOfEntryCity?: string;
  isPoeRequested?: boolean;
  hasStops: boolean;
  technicalStops: TechnicalStopDeclaration[];
  permits: OverflightPermitRecord[];
  isClearedForDeparture: boolean;
  updatedAt: string;
}
