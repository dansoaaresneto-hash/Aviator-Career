import { Contract, AdminCompany, CompanyMissionType, FerryDossier } from '../types';

interface AirportSample {
  icao: string;
  name: string;
  city: string;
  country: string; // ISO code: BR, US, PT, ES, AR, CL, etc.
}

const AIRPORTS_DATABASE: AirportSample[] = [
  // Brasil (BR)
  { icao: 'SBSP', name: 'Aeroporto de Congonhas', city: 'São Paulo - SP', country: 'BR' },
  { icao: 'SBGR', name: 'Aeroporto Internacional de Guarulhos', city: 'Guarulhos - SP', country: 'BR' },
  { icao: 'SBRJ', name: 'Aeroporto Santos Dumont', city: 'Rio de Janeiro - RJ', country: 'BR' },
  { icao: 'SBGL', name: 'Aeroporto Internacional Galeão', city: 'Rio de Janeiro - RJ', country: 'BR' },
  { icao: 'SBKP', name: 'Aeroporto Internacional de Viracopos', city: 'Campinas - SP', country: 'BR' },
  { icao: 'SBCF', name: 'Aeroporto Internacional de Confins', city: 'Belo Horizonte - MG', country: 'BR' },
  { icao: 'SBBH', name: 'Aeroporto da Pampulha', city: 'Belo Horizonte - MG', country: 'BR' },
  { icao: 'SBBR', name: 'Aeroporto Internacional de Brasília', city: 'Brasília - DF', country: 'BR' },
  { icao: 'SBSG', name: 'Aeroporto Internacional de Natal', city: 'Natal - RN', country: 'BR' },
  { icao: 'SBEG', name: 'Aeroporto Internacional de Manaus', city: 'Manaus - AM', country: 'BR' },
  { icao: 'SBGO', name: 'Aeroporto de Goiânia Santa Genoveva', city: 'Goiânia - GO', country: 'BR' },
  { icao: 'SBMT', name: 'Aeroporto Campo de Marte', city: 'São Paulo - SP', country: 'BR' },
  { icao: 'SBJD', name: 'Aeroporto Estadual de Jundiaí', city: 'Jundiaí - SP', country: 'BR' },
  { icao: 'SBJR', name: 'Aeroporto de Jacarepaguá', city: 'Rio de Janeiro - RJ', country: 'BR' },
  { icao: 'SDAG', name: 'Aeroporto de Angra dos Reis', city: 'Angra dos Reis - RJ', country: 'BR' },
  { icao: 'SBDN', name: 'Aeroporto de Presidente Prudente', city: 'Presidente Prudente - SP', country: 'BR' },
  { icao: 'SBPF', name: 'Aeroporto de Passo Fundo', city: 'Passo Fundo - RS', country: 'BR' },
  { icao: 'SBCX', name: 'Aeroporto de Caxias do Sul', city: 'Caxias do Sul - RS', country: 'BR' },

  // Estados Unidos (US)
  { icao: 'KMIA', name: 'Miami International Airport', city: 'Miami - FL', country: 'US' },
  { icao: 'KJFK', name: 'John F. Kennedy International', city: 'New York - NY', country: 'US' },
  { icao: 'KLAX', name: 'Los Angeles International', city: 'Los Angeles - CA', country: 'US' },
  { icao: 'KTEB', name: 'Teterboro Executive Airport', city: 'Teterboro - NJ', country: 'US' },

  // Portugal & Europa (PT, ES, FR)
  { icao: 'LPPT', name: 'Aeroporto Humberto Delgado', city: 'Lisboa - Portugal', country: 'PT' },
  { icao: 'LEMD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madri - Espanha', country: 'ES' },
  { icao: 'LFPG', name: 'Charles de Gaulle Airport', city: 'Paris - França', country: 'FR' },

  // América do Sul (AR, CL, UY)
  { icao: 'SAEZ', name: 'Aeropuerto Internacional Ezeiza', city: 'Buenos Aires - Argentina', country: 'AR' },
  { icao: 'SCEL', name: 'Aeropuerto Arturo Merino Benítez', city: 'Santiago - Chile', country: 'CL' },
  { icao: 'SUMU', name: 'Aeropuerto Internacional Carrasco', city: 'Montevidéu - Uruguai', country: 'UY' },
];

// Helper to calculate approximate distance in NM between ICAOs
function getDistanceNm(dep: AirportSample, arr: AirportSample): number {
  if (dep.country === arr.country) {
    if (dep.city.includes('São Paulo') && arr.city.includes('Rio de Janeiro')) return 198;
    if (dep.city.includes('Campinas') && arr.city.includes('Belo Horizonte')) return 220;
    if (dep.city.includes('São Paulo') && arr.city.includes('Jundiaí')) return 32;
    if (dep.city.includes('Rio de Janeiro') && arr.city.includes('Angra')) return 62;
    if (dep.city.includes('Belo Horizonte') && arr.city.includes('Goiânia')) return 290;
    if (dep.city.includes('Caxias') && arr.city.includes('Passo Fundo')) return 95;
    return Math.floor(100 + Math.random() * 350);
  }
  // International
  if ((dep.country === 'PT' || dep.country === 'ES') && arr.country === 'BR') return 3850;
  if (dep.country === 'US' && arr.country === 'BR') return 2890;
  if (dep.country === 'AR' && arr.country === 'BR') return 1200;
  if (dep.country === 'CL' && arr.country === 'BR') return 1650;
  return Math.floor(1200 + Math.random() * 2500);
}

const AIRCRAFT_TEMPLATES = [
  { name: 'Cessna 172 Skyhawk', cat: 'Monomotor a Pistão', speed: 120 },
  { name: 'Beechcraft Baron G58', cat: 'Bimotor a Pistão', speed: 180 },
  { name: 'Cessna 208B Grand Caravan', cat: 'Monomotor Turboélice', speed: 165 },
  { name: 'Daher TBM 930', cat: 'Turboélice Executivo', speed: 320 },
  { name: 'Beechcraft King Air 350i', cat: 'Bimotor Turboélice', speed: 300 },
  { name: 'Citation CJ4', cat: 'Jato Executivo', speed: 430 },
];

export function generateContractsFromCompanies(companies: AdminCompany[]): Contract[] {
  const activeCompanies = companies.filter((c) => c.isActive);
  if (activeCompanies.length === 0) return [];

  const generated: Contract[] = [];

  activeCompanies.forEach((comp) => {
    // Generate 2-3 contracts per active company based on allowed mission types
    const types = comp.allowedMissionTypes;
    if (types.length === 0) return;

    types.forEach((missionTypeKey, idx) => {
      const contract = createSingleContract(comp, missionTypeKey, idx + 1);
      if (contract) {
        generated.push(contract);
      }
    });
  });

  return generated;
}

function createSingleContract(comp: AdminCompany, missionTypeKey: CompanyMissionType, subIndex: number): Contract | null {
  const rules = comp.routeRules;
  const allowedOrigins = rules.originCountries.length > 0 ? rules.originCountries : ['BR'];
  const allowedDests = rules.destinationCountries.length > 0 ? rules.destinationCountries : ['BR'];

  // Filter airports matching allowed origin / dest countries
  const depAirports = AIRPORTS_DATABASE.filter((a) => allowedOrigins.includes(a.country));
  let arrAirports = AIRPORTS_DATABASE.filter((a) => allowedDests.includes(a.country));

  if (depAirports.length === 0) return null;

  const dep = depAirports[Math.floor(Math.random() * depAirports.length)];
  
  // Filter out same airport
  arrAirports = arrAirports.filter((a) => a.icao !== dep.icao);
  if (arrAirports.length === 0) arrAirports = AIRPORTS_DATABASE.filter((a) => a.icao !== dep.icao);
  
  const arr = arrAirports[Math.floor(Math.random() * arrAirports.length)];
  const distance = getDistanceNm(dep, arr);
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
  if (missionTypeKey === 'ferry_international') {
    const isUS = dep.country === 'US';
    const originalReg = isUS ? `N${Math.floor(100 + Math.random() * 800)}TX` : `CS-${comp.icaoCode.substring(0, 2)}X`;
    const newReg = `PR-${comp.icaoCode.substring(0, 2)}${subIndex}`;
    const portIcao = dep.country === 'US' ? 'SBEG' : 'SBSG';

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
      originCountryName: dep.country === 'US' ? 'Estados Unidos' : dep.country === 'PT' ? 'Portugal' : dep.country,
      destinationCountryCode: arr.country,
      destinationCountryName: arr.country === 'BR' ? 'Brasil' : arr.country,
      portOfEntryIcao: portIcao,
      portOfEntryName: portIcao === 'SBEG' ? 'Aeroporto Internacional de Manaus' : 'Aeroporto Internacional de Natal',
      portOfEntryCity: portIcao === 'SBEG' ? 'Manaus - AM (Brasil)' : 'Natal - RN (Brasil)',
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
