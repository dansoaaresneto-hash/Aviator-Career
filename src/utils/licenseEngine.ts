import { Contract, FlightLog, PilotProfile } from '../types';
import {
  PilotLicenseId,
  PilotLicenseTier,
  LicenseProgressionStatus,
  LicenseRequirement,
} from '../types/license';
import { PILOT_LICENSES } from '../data/licenses';

export function getLicenseById(id?: PilotLicenseId): PilotLicenseTier {
  const found = PILOT_LICENSES.find((l) => l.id === id);
  return found || PILOT_LICENSES[0];
}

export function getLicenseByOrder(order: number): PilotLicenseTier | undefined {
  return PILOT_LICENSES.find((l) => l.order === order);
}

/**
 * Retorna as estatísticas detalhadas de translados e histórico de voo do piloto
 */
export function getPilotLogStats(logbook: FlightLog[]) {
  let nationalFerryCount = 0;
  let internationalFerryCount = 0;
  let totalScoreSum = 0;
  let scoredLandingsCount = 0;

  for (const log of logbook) {
    if (log.status === 'completed') {
      if (log.type === 'ferry') {
        const isInternational =
          log.title.toLowerCase().includes('internacional') ||
          log.title.toLowerCase().includes('transatlântico') ||
          log.title.toLowerCase().includes('transatlantico');

        if (isInternational) {
          internationalFerryCount += 1;
        } else {
          nationalFerryCount += 1;
        }
      }

      if (log.landingScore && log.landingScore > 0) {
        totalScoreSum += log.landingScore;
        scoredLandingsCount += 1;
      }
    }
  }

  const avgLandingScore =
    scoredLandingsCount > 0 ? Math.round(totalScoreSum / scoredLandingsCount) : 100;

  return {
    nationalFerryCount,
    internationalFerryCount,
    avgLandingScore,
  };
}

/**
 * Calcula o status de progressão de licença do piloto com os requisitos da próxima etapa
 */
export function calculateLicenseProgression(
  profile: PilotProfile,
  logbook: FlightLog[]
): LicenseProgressionStatus {
  const currentLicenseId: PilotLicenseId = profile.licenseId || 'student_pilot';
  const currentLicense = getLicenseById(currentLicenseId);
  const nextLicense = getLicenseByOrder(currentLicense.order + 1);

  const { nationalFerryCount, internationalFerryCount, avgLandingScore } =
    getPilotLogStats(logbook);

  const totalHours = profile.totalFlightHours || 0;
  const completedFlights = profile.completedFlights || 0;
  const currentXp = profile.xp || 0;

  if (!nextLicense || !currentLicense.requirementsForNext) {
    return {
      currentLicenseId,
      currentLicense,
      nextLicense: undefined,
      isMaxLicense: true,
      requirements: [],
      canPromote: false,
      progressPercentage: 100,
      nationalFerryCompletedCount: nationalFerryCount,
      internationalFerryCompletedCount: internationalFerryCount,
      totalFlightHours: totalHours,
      completedFlights,
      avgLandingScore,
    };
  }

  const reqs = currentLicense.requirementsForNext;
  const requirements: LicenseRequirement[] = [];

  // 1. Horas de Voo
  requirements.push({
    id: 'flight_hours',
    label: 'Horas de Voo Registradas',
    currentValue: totalHours,
    targetValue: reqs.minFlightHours,
    unit: 'h',
    isMet: totalHours >= reqs.minFlightHours,
    description: `Acumule pelo menos ${reqs.minFlightHours}h de voo registradas no diário de bordo`,
  });

  // 2. Total de Voos Concluídos
  requirements.push({
    id: 'completed_flights',
    label: 'Voos Concluídos',
    currentValue: completedFlights,
    targetValue: reqs.minCompletedFlights,
    unit: 'voos',
    isMet: completedFlights >= reqs.minCompletedFlights,
    description: `Complete com sucesso ${reqs.minCompletedFlights} voos operacionais`,
  });

  // 3. Translados Nacionais (se exigido para a licença)
  if (reqs.minNationalFerryCount > 0) {
    requirements.push({
      id: 'national_ferry',
      label: 'Missões de Translado Nacional',
      currentValue: nationalFerryCount,
      targetValue: reqs.minNationalFerryCount,
      unit: 'missões',
      isMet: nationalFerryCount >= reqs.minNationalFerryCount,
      description: `Realize pelo menos ${reqs.minNationalFerryCount} translados nacionais de reposicionamento de aeronave`,
    });
  }

  // 4. Experiência (XP)
  requirements.push({
    id: 'xp',
    label: 'Pontos de Experiência (XP)',
    currentValue: currentXp,
    targetValue: reqs.minXp,
    unit: 'XP',
    isMet: currentXp >= reqs.minXp,
    description: `Acumule ${reqs.minXp.toLocaleString('pt-BR')} XP em suas operações`,
  });

  // 5. Qualidade de Pouso Média
  requirements.push({
    id: 'landing_score',
    label: 'Qualidade Média de Pouso',
    currentValue: avgLandingScore,
    targetValue: reqs.minLandingScoreAvg,
    unit: '%',
    isMet: avgLandingScore >= reqs.minLandingScoreAvg,
    description: `Mantenha média de pouso suave de pelo menos ${reqs.minLandingScoreAvg}%`,
  });

  // Calcula porcentagem geral
  const metCount = requirements.filter((r) => r.isMet).length;
  const progressPercentage = Math.round((metCount / requirements.length) * 100);
  const canPromote = metCount === requirements.length;

  return {
    currentLicenseId,
    currentLicense,
    nextLicense,
    isMaxLicense: false,
    requirements,
    canPromote,
    progressPercentage,
    nationalFerryCompletedCount: nationalFerryCount,
    internationalFerryCompletedCount: internationalFerryCount,
    totalFlightHours: totalHours,
    completedFlights,
    avgLandingScore,
  };
}

/**
 * Verifica se um contrato/missão é elegível para o piloto com base no Modo de Carreira e Licença
 */
export function checkContractEligibility(
  contract: Contract,
  profile: PilotProfile,
  logbook: FlightLog[]
): {
  isEligible: boolean;
  reason?: string;
  requiredLicense?: PilotLicenseTier;
  unlockRequirementHint?: string;
} {
  // No Modo Carreira Livre, todas as missões estão 100% liberadas
  if (profile.careerMode === 'free_career') {
    return { isEligible: true };
  }

  const currentLicenseId: PilotLicenseId = profile.licenseId || 'student_pilot';
  const currentLicense = getLicenseById(currentLicenseId);
  const { nationalFerryCount } = getPilotLogStats(logbook);

  const isInternationalFerry =
    contract.type === 'ferry' &&
    Boolean(
      contract.ferryDossier ||
        contract.aircraftCategory?.toLowerCase().includes('internacional') ||
        contract.title?.toLowerCase().includes('internacional') ||
        (contract.route.departureCountry &&
          contract.route.arrivalCountry &&
          contract.route.departureCountry !== contract.route.arrivalCountry)
    );

  const isNationalFerry = contract.type === 'ferry' && !isInternationalFerry;

  // 1. Verificação de Translado Internacional: Apenas Comandante ATPL
  if (isInternationalFerry) {
    if (currentLicense.order < 4) {
      const atplLicense = getLicenseById('atpl_master_ferry');
      return {
        isEligible: false,
        requiredLicense: atplLicense,
        reason: 'Translado Internacional de Aeronave requer a Licença máxima de Comandante (ATPL).',
        unlockRequirementHint: `Você precisa acumular translados nacionais (${nationalFerryCount}/4 realizados) e obter a habilitação ATPL.`,
      };
    }
  }

  // 2. Verificação de Translado Nacional: Requer no mínimo Piloto Privado (PPL)
  if (isNationalFerry) {
    if (currentLicense.order < 2) {
      const pplLicense = getLicenseById('ppl');
      return {
        isEligible: false,
        requiredLicense: pplLicense,
        reason: 'Missões de Translado Nacional exigem no mínimo a Licença de Piloto Privado (PPL).',
        unlockRequirementHint: 'Conquiste sua licença PPL completando 2.0h de voo e 3 voos locais como Aluno Piloto.',
      };
    }
  }

  // 3. Verificação de Categoria de Aeronave
  const reqCategory = contract.aircraftCategory || '';
  const isJet =
    reqCategory.toLowerCase().includes('jato') ||
    reqCategory.toLowerCase().includes('airliner') ||
    reqCategory.toLowerCase().includes('comercial');
  const isTurbopropOrTwin =
    reqCategory.toLowerCase().includes('turboélice') ||
    reqCategory.toLowerCase().includes('turboelice') ||
    reqCategory.toLowerCase().includes('bimotor');

  if (isJet && currentLicense.order < 4) {
    const atplLicense = getLicenseById('atpl_master_ferry');
    return {
      isEligible: false,
      requiredLicense: atplLicense,
      reason: 'Operação de Jatos Executivos e Airliners requer a Licença de Linha Aérea (ATPL).',
      unlockRequirementHint: 'Avance na carreira para desbloquear Type Rating em aeronaves a jato.',
    };
  }

  if (isTurbopropOrTwin && currentLicense.order < 3) {
    const cplLicense = getLicenseById('cpl');
    return {
      isEligible: false,
      requiredLicense: cplLicense,
      reason: 'Operação de Bimotores e Turboélices requer a Licença de Piloto Comercial & IFR (CPL).',
      unlockRequirementHint: 'Obtenha a licença CPL cumprindo 5h de voo e 2 missões de translado nacional.',
    };
  }

  // 4. Verificação de Transporte de Passageiros: Aluno Piloto não pode transportar pax comercial
  if (contract.type === 'passenger' && currentLicense.order < 2) {
    const pplLicense = getLicenseById('ppl');
    return {
      isEligible: false,
      requiredLicense: pplLicense,
      reason: 'Alunos Pilotos estão proibidos pela regulamentação de transportar passageiros.',
      unlockRequirementHint: 'Conquiste a Licença PPL para iniciar o transporte de passageiros.',
    };
  }

  return { isEligible: true };
}
