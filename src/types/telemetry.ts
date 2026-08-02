export interface OnlinePilotData {
  token: string;
  connected: boolean;
  pilotName?: string;
  callsign?: string;
  simName: string;
  airportIcao: string;
  aircraftTitle: string;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  groundSpeedKts: number;
  onGround: boolean;
  lastUpdated: string;
}

export interface SimTelemetryData {
  token: string;
  connected: boolean;
  simName: string;
  airportIcao: string;
  airportName?: string;
  aircraftTitle: string;
  aircraftCategory?: string;
  totalWeightKg: number;
  payloadKg: number;
  fuelKg: number;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  groundSpeedKts: number;
  onGround: boolean;
  lastUpdated: string;
  isSimulated?: boolean;
}

export type ValidationStatus = 'valid' | 'warning' | 'invalid' | 'pending';

export interface ValidationItem {
  key: 'airport' | 'aircraft' | 'weight';
  title: string;
  status: ValidationStatus;
  currentValue: string;
  requiredValue: string;
  message: string;
  details?: string;
}

export interface MissionValidationResult {
  overallStatus: 'approved' | 'warning' | 'rejected' | 'pending';
  canDepart: boolean;
  airportCheck: ValidationItem;
  aircraftCheck: ValidationItem;
  weightCheck: ValidationItem;
  summaryText: string;
}
