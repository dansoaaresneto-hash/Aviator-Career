import { Contract, AdminCompany, CompanyMissionType, FerryDossier, AirportSample } from '../types';
import { calculateDistanceNm } from './aviationNavMath';
import { countryName } from './countryUtils';
import {
  findOptimalStagingAirport,
  findOptimalPortOfEntry,
  buildFerryDossier,
  getEligibleInternationalCountries,
  RegulatoryContext,
} from './regulatoryEngine';

const AIRCRAFT_TEMPLATES = [
  { name: 'Cessna 172 Skyhawk', cat: 'Monomotor a Pistão', speed: 120 },
  { name: 'Beechcraft Baron G58', cat: 'Bimotor a Pistão', speed: 180 },
  { name: 'Cessna 208B Grand Caravan', cat: 'Monomotor Turboélice', speed: 165 },
  { name: 'Daher TBM 930', cat: 'Turboélice Executivo', speed: 320 },
  { name: 'Beechcraft King Air 350i', cat: 'Bimotor Turboélice', speed: 300 },
  { name: 'Citation CJ4', cat: 'Jato Executivo', speed: 430 },
];

export function generateContractsFromCompanies(
  companies: AdminCompany[],
  airports: AirportSample[],
  regulatoryConfig?: RegulatoryContext
): Contract[] {
  const activeCompanies = companies.filter((c) => c.isActive);
  if (activeCompanies.length === 0 || airports.length === 0) return [];

  const generated: Contract[] = [];

  activeCompanies.forEach((comp) => {
    // Generate contracts per active company based on allowed mission types
    const types = comp.allowedMissionTypes;
    if (types.length === 0) return;

    types.forEach((missionTypeKey, idx) => {
      const contract = createSingleContract(comp, missionTypeKey, idx + 1, airports, regulatoryConfig);
      if (contract) {
        generated.push(contract);
      }
    });
  });

  return generated;
}

function createSingleContract(
  comp: AdminCompany,
  missionTypeKey: CompanyMissionType,
  subIndex: number,
  airports: AirportSample[],
  regulatoryConfig?: RegulatoryContext
): Contract | null {
  const rules = comp.routeRules;
  const scope = rules?.scope || 'national';

  // Determine eligible international countries if regulatory context is provided
  const eligibleIntCountries = regulatoryConfig
    ? getEligibleInternationalCountries(regulatoryConfig, airports)
    : ['BR', 'US', 'PT'];

  let allowedOrigins = rules?.originCountries && rules.originCountries.length > 0 ? rules.originCountries : ['BR'];
  let allowedDests = rules?.destinationCountries && rules.destinationCountries.length > 0 ? rules.destinationCountries : ['BR'];

  // Determine scope restrictions
  let forceNational = scope === 'national';
  let forceInternational = scope === 'international';

  if (missionTypeKey === 'ferry_international' || missionTypeKey === 'pax_international') {
    forceInternational = true;
    forceNational = false;
  } else if (missionTypeKey === 'ferry_national' || missionTypeKey === 'pax_regional') {
    forceNational = true;
    forceInternational = false;
  } else if (scope === 'national') {
    forceNational = true;
    forceInternational = false;
  } else if (scope === 'international') {
    forceInternational = true;
    forceNational = false;
  }

  // If international, strictly enforce that origin and destination countries have complete regulatory infrastructure:
  // (Country info, Regulatory Zone, Regulatory Body, AND at least one Port of Entry)
  if (forceInternational) {
    allowedOrigins = allowedOrigins.filter((c) => eligibleIntCountries.includes(c.toUpperCase()));
    allowedDests = allowedDests.filter((c) => eligibleIntCountries.includes(c.toUpperCase()));

    // Fallback if the company had only unconfigured countries selected
    if (allowedOrigins.length === 0) {
      allowedOrigins = eligibleIntCountries.filter((c) => c !== 'BR');
      if (allowedOrigins.length === 0) allowedOrigins = eligibleIntCountries;
    }
    if (allowedDests.length === 0) {
      allowedDests = eligibleIntCountries.includes('BR') ? ['BR'] : eligibleIntCountries;
    }

    if (allowedOrigins.length === 0 || allowedDests.length === 0) {
      return null;
    }
  }

  // Filter possible departure airports
  let depAirports = airports.filter((a) => allowedOrigins.includes(a.country));
  if (depAirports.length === 0) {
    depAirports = airports.filter((a) => a.country === 'BR');
  }
  if (depAirports.length === 0) return null;

  // Shuffle candidate departure airports to pick one that has matching arrival options
  const shuffledDeps = [...depAirports].sort(() => 0.5 - Math.random());
  let dep: AirportSample | null = null;
  let arrAirports: AirportSample[] = [];

  for (const candidateDep of shuffledDeps) {
    let candidates = airports.filter((a) => allowedDests.includes(a.country) && a.icao !== candidateDep.icao);

    if (forceNational) {
      candidates = candidates.filter((a) => a.country === candidateDep.country);
      if (candidates.length === 0) {
        candidates = airports.filter((a) => a.country === candidateDep.country && a.icao !== candidateDep.icao);
      }
    } else if (forceInternational) {
      candidates = candidates.filter(
        (a) => a.country !== candidateDep.country && eligibleIntCountries.includes(a.country.toUpperCase())
      );
    }

    if (candidates.length > 0) {
      dep = candidateDep;
      arrAirports = candidates;
      break;
    }
  }

  if (!dep || arrAirports.length === 0) return null;

  // Filter candidates by minDistanceNm / maxDistanceNm if specified
  let arr = arrAirports[Math.floor(Math.random() * arrAirports.length)];
  let distance = calculateDistanceNm(dep.lat, dep.lng, arr.lat, arr.lng);

  if (rules?.minDistanceNm || rules?.maxDistanceNm) {
    const min = rules?.minDistanceNm ?? 0;
    const max = rules?.maxDistanceNm ?? Infinity;
    let attempts = 0;
    while ((distance < min || distance > max) && attempts < 20) {
      arr = arrAirports[Math.floor(Math.random() * arrAirports.length)];
      distance = calculateDistanceNm(dep.lat, dep.lng, arr.lat, arr.lng);
      attempts++;
    }
  }

  const estTimeMins = Math.round((distance / 220) * 60) + 15;

  const contractCompanyObj = {
    id: comp.id,
    name: comp.name,
    icaoCode: comp.icaoCode,
    logoUrl: comp.logoUrl,
    logoColor: comp.logoColor,
    tagline: comp.description,
  };

  const contractId = `contract-${comp.icaoCode.toLowerCase()}-${missionTypeKey}-${subIndex}-${Math.floor(Math.random() * 1000)}`;

  // Determine Mission Category
  if (missionTypeKey === 'ferry_international' && dep.country !== arr.country) {
    const stagingAirport = findOptimalStagingAirport(dep, arr, airports);
    const poeAirport = findOptimalPortOfEntry(stagingAirport, arr, airports);
    const ferryDossier = buildFerryDossier(dep, arr, airports, comp.name, comp.icaoCode, subIndex);

    const stagingIcao = stagingAirport.icao;
    const portIcao = poeAirport.icao;

    const routeTitle = `Translado Internacional (${comp.icaoCode}): ${dep.icao} ➔ ${arr.icao}`;

    const routeDesc = `Translado internacional da aeronave sob gestão da ${comp.name}. Voo de entrega técnica e translado internacional de ${dep.icao} (${dep.city || dep.name}) com destino a ${arr.icao} (${arr.city || arr.name}).`;

    return {
      id: contractId,
      title: routeTitle,
      type: 'ferry',
      company: contractCompanyObj,
      route: {
        departureIcao: dep.icao,
        departureName: dep.name,
        departureCity: dep.city,
        departureCountry: countryName(dep.country),
        arrivalIcao: arr.icao,
        arrivalName: arr.name,
        arrivalCity: arr.city,
        arrivalCountry: countryName(arr.country),
        distanceNm: distance,
        estimatedMinutes: estTimeMins,
        recommendedAltitude: distance > 1500 ? 'FL280 / 28.000 ft' : 'FL180 / 18.000 ft',
        minRunwayLengthM: 1800,
      },
      requiredAircraft: 'King Air 350i / TBM 930',
      aircraftCategory: 'Translado Internacional',
      rewardCredits: Math.round(distance * 12 + 10000),
      rewardXp: Math.round(distance * 0.5 + 800),
      description: routeDesc,
      payloadInfo: 'Voo Ferry Internacional (Sem Carga)',
      urgency: 'high',
      weatherForecast: 'Perfil de rota meteorológica padrão em cruzeiro IFR.',
      minPilotRankLevel: comp.minPilotLevel,
      expiryHours: 72,
      ferryDossier,
    };
  }

  if (missionTypeKey === 'ferry_national') {
    return {
      id: contractId,
      title: `Translado Nacional (${comp.icaoCode}): ${dep.icao} ➔ ${arr.icao}`,
      type: 'ferry',
      company: contractCompanyObj,
      route: {
        departureIcao: dep.icao,
        departureName: dep.name,
        departureCity: dep.city,
        departureCountry: countryName(dep.country),
        arrivalIcao: arr.icao,
        arrivalName: arr.name,
        arrivalCity: arr.city,
        arrivalCountry: countryName(arr.country),
        distanceNm: distance,
        estimatedMinutes: estTimeMins,
        recommendedAltitude: distance > 200 ? 'FL100 / 10.000 ft' : '4.500 ft',
        minRunwayLengthM: 1200,
      },
      requiredAircraft: 'Cessna 172 / Baron G58',
      aircraftCategory: 'Monomotor / Bimotor (Ferry)',
      rewardCredits: Math.round(distance * 15 + 850),
      rewardXp: Math.round(distance * 0.8 + 120),
      description: `Reposicionamento de frota e entrega técnica entre hangares contratados pela ${comp.name}. Voo solo sem passageiros.`,
      payloadInfo: 'Voo Ferry Nacional',
      urgency: 'normal',
      weatherForecast: 'Condições VFR/IFR favoráveis na rota.',
      minPilotRankLevel: comp.minPilotLevel,
      expiryHours: 48,
    };
  }

  if (missionTypeKey === 'pax_regional' || missionTypeKey === 'pax_international') {
    const isInt = missionTypeKey === 'pax_international';
    const paxCount = Math.floor(2 + Math.random() * 6);
    return {
      id: contractId,
      title: isInt
        ? `Voo Executivo Internacional (${comp.icaoCode}): ${dep.city} ➔ ${arr.city}`
        : `Charter Regional Executivo (${comp.icaoCode}): ${dep.icao} ➔ ${arr.icao}`,
      type: 'passenger',
      company: contractCompanyObj,
      route: {
        departureIcao: dep.icao,
        departureName: dep.name,
        departureCity: dep.city,
        departureCountry: countryName(dep.country),
        arrivalIcao: arr.icao,
        arrivalName: arr.name,
        arrivalCity: arr.city,
        arrivalCountry: countryName(arr.country),
        distanceNm: distance,
        estimatedMinutes: estTimeMins,
        recommendedAltitude: isInt ? 'FL250 / 25.000 ft' : 'FL120 / 12.000 ft',
        minRunwayLengthM: 1300,
      },
      requiredAircraft: isInt ? 'Beechcraft King Air 350i' : 'Diamond DA40 / Baron G58',
      aircraftCategory: isInt ? 'Bimotor Turboélice' : 'Monomotor / Bimotor',
      rewardCredits: Math.round(distance * 14 + 1200),
      rewardXp: Math.round(distance * 0.9 + 150),
      description: `Transporte de passageiros e executivos sob fretamento corporativo com a ${comp.name}. Atendimento de excelência e suave pilotagem requeridos.`,
      payloadInfo: `${paxCount} Passageiros VIP`,
      urgency: 'high',
      weatherForecast: 'Céu aberto com vento suave de cauda em cruzeiro.',
      minPilotRankLevel: comp.minPilotLevel,
      expiryHours: 36,
    };
  }

  // Cargo default
  const payloadWeight = Math.floor(180 + Math.random() * 450);
  return {
    id: contractId,
    title: `Transporte de Carga Expressa (${comp.icaoCode}): ${dep.icao} ➔ ${arr.icao}`,
    type: 'cargo',
    company: contractCompanyObj,
    route: {
      departureIcao: dep.icao,
      departureName: dep.name,
      departureCity: dep.city,
      departureCountry: countryName(dep.country),
      arrivalIcao: arr.icao,
      arrivalName: arr.name,
      arrivalCity: arr.city,
      arrivalCountry: countryName(arr.country),
      distanceNm: distance,
      estimatedMinutes: estTimeMins,
      recommendedAltitude: distance > 200 ? 'FL100 / 10.000 ft' : '6.500 ft',
      minRunwayLengthM: 1400,
    },
    requiredAircraft: 'Cessna 208B Grand Caravan',
    aircraftCategory: 'Monomotor Turboélice / Carga',
    rewardCredits: Math.round(distance * 13 + 950),
    rewardXp: Math.round(distance * 0.85 + 130),
    description: `Remessa prioritária de peças de reposição industrial e encomendas sob demanda geridas pela ${comp.name}.`,
    payloadInfo: `${payloadWeight} kg de Carga`,
    urgency: 'urgent',
    weatherForecast: 'Nuvens dispersas ao longo da aerovia.',
    minPilotRankLevel: comp.minPilotLevel,
    expiryHours: 24,
  };
}
