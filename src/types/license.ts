export type CareerMode = 'full_career' | 'free_career';

export type PilotLicenseId = 'student_pilot' | 'ppl' | 'cpl' | 'atpl_master_ferry';

export interface LicenseRequirement {
  id: string;
  label: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  isMet: boolean;
  description: string;
}

export interface PilotLicenseTier {
  id: PilotLicenseId;
  code: string; // 'AP', 'PPL', 'CPL', 'ATPL'
  name: string;
  shortName: string;
  subtitle: string;
  order: number; // 1, 2, 3, 4
  badgeBg: string;
  badgeTextColor: string;
  badgeBorderColor: string;
  iconName: string;
  description: string;
  allowedCategories: string[];
  allowedAircraftIcaos: string[]; // e.g. ['C172', 'DA40'] or ['*']
  privileges: string[];
  restrictions: string[];
  requirementsForNext?: {
    minFlightHours: number;
    minCompletedFlights: number;
    minNationalFerryCount: number; // Requer X translados nacionais antes do internacional/próxima licença
    minXp: number;
    minLandingScoreAvg: number;
  };
}

export interface LicenseProgressionStatus {
  currentLicenseId: PilotLicenseId;
  currentLicense: PilotLicenseTier;
  nextLicense?: PilotLicenseTier;
  isMaxLicense: boolean;
  requirements: LicenseRequirement[];
  canPromote: boolean;
  progressPercentage: number;
  nationalFerryCompletedCount: number;
  internationalFerryCompletedCount: number;
  totalFlightHours: number;
  completedFlights: number;
  avgLandingScore: number;
}
