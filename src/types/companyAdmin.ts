import { MissionType } from './index';

export type CompanyMissionType =
  | 'ferry_national'
  | 'ferry_international'
  | 'pax_regional'
  | 'pax_international'
  | 'cargo';

export interface RegionDefinition {
  id: string;
  name: string;
  flagEmoji: string;
  countries: {
    code: string;
    name: string;
  }[];
}

export interface CompanyRouteRule {
  scope: 'national' | 'international' | 'global'; // Scope mode
  selectedRegions: string[]; // Region IDs (e.g., 'south_america', 'north_america', 'europe', 'asia_oceania')
  originCountries: string[]; // Country ISO codes
  destinationCountries: string[]; // Country ISO codes
  minDistanceNm?: number;
  maxDistanceNm?: number;
}

export interface AdminCompany {
  id: string;
  name: string; // Nome da Empresa
  icaoCode: string; // Código ICAO fictício (e.g. AZU, GLO, FEX, SWY)
  description: string; // Descrição / Tagline
  logoUrl?: string; // Data URL or Image URL
  logoColor: string; // Tailwind gradient/color for theme/fallback
  minPilotLevel: number; // Nível Mínimo do Piloto (1 - 20)
  isActive: boolean; // Status da Empresa (Ativa/Inativa)
  allowedMissionTypes: CompanyMissionType[]; // Tipos de Missão Ativos
  routeRules: CompanyRouteRule; // Regras de Atuação de Rotas
  createdAt?: string;
}

export const WORLD_REGIONS: RegionDefinition[] = [
  {
    id: 'south_america',
    name: 'América do Sul',
    flagEmoji: '🌎',
    countries: [
      { code: 'BR', name: 'Brasil' },
      { code: 'AR', name: 'Argentina' },
      { code: 'CL', name: 'Chile' },
      { code: 'CO', name: 'Colômbia' },
      { code: 'PE', name: 'Peru' },
      { code: 'UY', name: 'Uruguai' },
      { code: 'PY', name: 'Paraguai' },
    ],
  },
  {
    id: 'north_america',
    name: 'América do Norte',
    flagEmoji: '🗽',
    countries: [
      { code: 'US', name: 'Estados Unidos' },
      { code: 'CA', name: 'Canadá' },
      { code: 'MX', name: 'México' },
    ],
  },
  {
    id: 'europe',
    name: 'Europa',
    flagEmoji: '🏰',
    countries: [
      { code: 'PT', name: 'Portugal' },
      { code: 'ES', name: 'Espanha' },
      { code: 'FR', name: 'França' },
      { code: 'DE', name: 'Alemanha' },
      { code: 'GB', name: 'Reino Unido' },
      { code: 'IT', name: 'Itália' },
      { code: 'CH', name: 'Suíça' },
    ],
  },
  {
    id: 'asia_oceania',
    name: 'Ásia & Oceania',
    flagEmoji: '🌏',
    countries: [
      { code: 'JP', name: 'Japão' },
      { code: 'AU', name: 'Austrália' },
      { code: 'AE', name: 'Emirados Árabes Unidos' },
    ],
  },
];

export const MISSION_TYPE_LABELS: Record<CompanyMissionType, { label: string; cat: MissionType; desc: string; icon: string }> = {
  ferry_national: {
    label: 'Traslado Nacional',
    cat: 'ferry',
    desc: 'Reposicionamento e entrega de aeronaves dentro do mesmo país.',
    icon: 'PlaneTakeoff',
  },
  ferry_international: {
    label: 'Traslado Internacional',
    cat: 'ferry',
    desc: 'Voo transatlântico/internacional com Port of Entry, alfândega e dossiê.',
    icon: 'Globe',
  },
  pax_regional: {
    label: 'Passageiros Comercial Regional',
    cat: 'passenger',
    desc: 'Voos executivos e comerciais regionais de curta/média distância.',
    icon: 'Users',
  },
  pax_international: {
    label: 'Passageiros Comercial Internacional',
    cat: 'passenger',
    desc: 'Rotas internacionais de passageiros em aeronaves executivas/jets.',
    icon: 'Plane',
  },
  cargo: {
    label: 'Transporte de Cargas',
    cat: 'cargo',
    desc: 'Frete aéreo de suprimentos, peças industriais e e-commerce.',
    icon: 'Box',
  },
};
