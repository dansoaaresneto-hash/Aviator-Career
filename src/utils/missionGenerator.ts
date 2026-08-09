import { Contract, AdminCompany, CompanyMissionType, FerryDossier, AirportSample } from '../types';
import { calculateDistanceNm } from './aviationNavMath';

const AIRCRAFT_TEMPLATES = [
  { name: 'Cessna 172 Skyhawk', cat: 'Monomotor a Pistão', speed: 120 },
  { name: 'Beechcraft Baron G58', cat: 'Bimotor a Pistão', speed: 180 },
  { name: 'Cessna 208B Grand Caravan', cat: 'Monomotor Turboélice', speed: 165 },
  { name: 'Daher TBM 930', cat: 'Turboélice Executivo', speed: 320 },
  { name: 'Beechcraft King Air 350i', cat: 'Bimotor Turboélice', speed: 300 },
  { name: 'Citation CJ4', cat: 'Jato Executivo', speed: 430 },
];

// Nomes de países usados nos dossiês de translado internacional (a base do
// OurAirports só nos dá o código ISO2 do país, então mapeamos os mais comuns
// nas rotas do app; os demais caem no próprio código ISO2 como fallback).
const COUNTRY_NAMES: Record<string, string> = {
  BR: 'Brasil',
  US: 'Estados Unidos',
  PT: 'Portugal',
  ES: 'Espanha',
  FR: 'França',
  AR: 'Argentina',
  CL: 'Chile',
  UY: 'Uruguai',
  PY: 'Paraguai',
  CO: 'Colômbia',
  PE: 'Peru',
};

function countryName(iso: string): string {
  return COUNTRY_NAMES[iso] || iso;
}

export function generateContractsFromCompanies(companies: AdminCompany[], airports: AirportSample[]): Contract[] {
  const activeCompanies = companies.filter((c) => c.isActive);
  if (activeCompanies.length === 0 || airports.length === 0) return [];

  const generated: Contract[] = [];

  activeCompanies.forEach((comp) => {
    // Generate 2-3 contracts per active company based on allowed mission types
    const types = comp.allowedMissionTypes;
    if (types.length === 0) return;

    types.forEach((missionTypeKey, idx) => {
      const contract = createSingleContract(comp, missionTypeKey, idx + 1, airports);
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
  airports: AirportSample[]
): Contract | null {
  const rules = comp.routeRules;
  const scope = rules?.scope || 'national';
  const allowedOrigins = rules?.originCountries && rules.originCountries.length > 0 ? rules.originCountries : ['BR'];
  const allowedDests = rules?.destinationCountries && rules.destinationCountries.length > 0 ? rules.destinationCountries : ['BR'];

  // Determine scope restrictions
  let forceNational = scope === 'national' || missionTypeKey === 'ferry_national' || missionTypeKey === 'pax_regional';
  let forceInternational = scope === 'international';

  if (scope === 'national') {
    forceNational = true;
    forceInternational = false;
  } else if (scope === 'international') {
    forceInternational = true;
    forceNational = false;
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
      // Fallback: if user selected origin countries but destination countries didn't include it, look in same country
      if (candidates.length === 0) {
        candidates = airports.filter((a) => a.country === candidateDep.country && a.icao !== candidateDep.icao);
      }
    } else if (forceInternational) {
      candidates = candidates.filter((a) => a.country !== candidateDep.country);
      if (candidates.length === 0) {
        candidates = airports.filter((a) => a.country !== candidateDep.country && a.icao !== candidateDep.icao);
      }
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
    const isUS = dep.country === 'US';
    const originalReg = isUS ? `N${Math.floor(100 + Math.random() * 800)}TX` : `CS-${comp.icaoCode.substring(0, 2)}X`;
    const newReg = `PR-${comp.icaoCode.substring(0, 2)}${subIndex}`;
    // Port of entry no Brasil: usa um aeroporto internacional brasileiro real
    // da própria base (prioriza os que têm atendimento de linha / scheduled_service).
    const brPorts = airports.filter((a) => a.country === 'BR' && a.icao !== dep.icao && a.icao !== arr.icao);
    const portCandidates = brPorts.filter((a) => a.hasPavedRunway !== false);
    const portAirport = (portCandidates.length > 0 ? portCandidates : brPorts)[
      Math.floor(Math.random() * Math.max(1, (portCandidates.length > 0 ? portCandidates : brPorts).length))
    ] || arr;
    const portIcao = portAirport.icao;

    const ferryDossier: FerryDossier = {
      aircraftModel: 'King Air 350i / TBM 930',
      manufacturer: isUS ? 'Textron Aviation' : 'Daher Aerospace',
      msn: `MSN ${1000 + Math.floor(Math.random() * 500)}`,
      originalRegistration: originalReg,
      newRegistration: newReg,
      mtowKg: isUS ? 6804 : 3354,
      currentOwner: `${comp.name} Global Leasing`,
      ownerTaxId: `REG-${dep.country}-${Math.floor(100000 + Math.random() * 800000)}`,
      originCountryCode: dep.country,
      originCountryName: countryName(dep.country),
      destinationCountryCode: arr.country,
      destinationCountryName: countryName(arr.country),
      portOfEntryIcao: portIcao,
      portOfEntryName: portAirport.name,
      portOfEntryCity: `${portAirport.city} (${countryName('BR')})`,
      exportFeeCr: 1800,
      nationalizationFeeCr: 3800,
    };

    return {
      id: contractId,
      title: `Translado Internacional (${comp.icaoCode}): ${dep.icao} ➔ ${portIcao} ➔ ${arr.icao}`,
      type: 'ferry',
      company: contractCompanyObj,
      route: {
        departureIcao: dep.icao,
        departureName: dep.name,
        departureCity: dep.city,
        arrivalIcao: arr.icao,
        arrivalName: arr.name,
        arrivalCity: arr.city,
        distanceNm: distance,
        estimatedMinutes: estTimeMins,
        recommendedAltitude: distance > 1500 ? 'FL280 / 28.000 ft' : 'FL180 / 18.000 ft',
        minRunwayLengthM: 1800,
      },
      requiredAircraft: 'King Air 350i / TBM 930',
      aircraftCategory: 'Translado Internacional',
      rewardCredits: Math.round(distance * 12 + 10000),
      rewardXp: Math.round(distance * 0.5 + 800),
      description: `Translado transatlântico/internacional da aeronave sob gestão da ${comp.name}. Requer vistoria e desembaraço alfandegário no Port of Entry (${portIcao}) antes da perna final para ${arr.icao}.`,
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
        arrivalIcao: arr.icao,
        arrivalName: arr.name,
        arrivalCity: arr.city,
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
        arrivalIcao: arr.icao,
        arrivalName: arr.name,
        arrivalCity: arr.city,
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
      arrivalIcao: arr.icao,
      arrivalName: arr.name,
      arrivalCity: arr.city,
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
