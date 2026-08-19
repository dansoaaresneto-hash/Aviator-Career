import {
  AirportSample,
  Contract,
  CountryRegulatoryInfo,
  FerryDossier,
  FerryRoutePlan,
  OverflightPermitRecord,
  RegulatoryBody,
  RegulatoryZone,
  RequiredDocument,
  TechnicalStopDeclaration,
} from '../types';
import { calculateDistanceNm } from './aviationNavMath';
import { countryName } from './countryUtils';

export interface RegulatoryContext {
  countriesInfo: CountryRegulatoryInfo[];
  regulatoryBodies: RegulatoryBody[];
  regulatoryZones: RegulatoryZone[];
  airportPool?: AirportSample[];
}

export interface CountryRegulatoryStatus {
  countryIso: string;
  countryName: string;
  hasCountryInfo: boolean;
  hasZone: boolean;
  hasBody: boolean;
  hasPoe: boolean;
  poeCount: number;
  isEligibleForInternationalFerry: boolean;
  isEligibleForNational: boolean;
  missingRequirements: string[];
}

/**
 * Checks whether a given country has all required regulatory infrastructure configured:
 * 1. Registered in countriesInfo (Admin Countries tab)
 * 2. Has an active Regulatory Zone assigned (Admin Zones tab)
 * 3. Has at least 1 Regulatory Body (Admin Bodies tab)
 * 4. Has at least 1 Port of Entry airport (Admin Port of Entry tab)
 */
export function checkCountryRegulatoryStatus(
  countryIso: string,
  context: RegulatoryContext,
  airports: AirportSample[] = []
): CountryRegulatoryStatus {
  const cleanIso = (countryIso || '').trim().toUpperCase();
  const pool = context.airportPool && context.airportPool.length > 0 ? context.airportPool : airports;

  const info = context.countriesInfo?.find(
    (c) => c.isoCode.toUpperCase() === cleanIso
  );

  const zone = info
    ? context.regulatoryZones?.find((z) => z.id === info.zoneId || z.code === info.zoneId)
    : undefined;

  const bodies = (context.regulatoryBodies || []).filter(
    (b) =>
      b.countryIso?.toUpperCase() === cleanIso ||
      (zone && (b as any).regulatoryZoneId === zone.id)
  );

  const poes = pool.filter(
    (a) =>
      (a.country?.toUpperCase() === cleanIso ||
        (cleanIso === 'BR' && a.country === 'Brasil') ||
        (cleanIso === 'US' && a.country === 'Estados Unidos')) &&
      Boolean(a.isPortOfEntry)
  );

  const missing: string[] = [];
  if (!info) missing.push('País não cadastrado em Países Regulatórios');
  if (!zone) missing.push('Zona Regulatória não vinculada');
  if (bodies.length === 0) missing.push('Nenhum Órgão Regulador vinculado');
  if (poes.length === 0) missing.push('Nenhum Port of Entry (POE) configurado');

  const isEligibleForInternationalFerry =
    Boolean(info) && Boolean(zone) && bodies.length > 0 && poes.length > 0;
  const isEligibleForNational = Boolean(info) && Boolean(zone);

  return {
    countryIso: cleanIso,
    countryName: countryName(cleanIso),
    hasCountryInfo: Boolean(info),
    hasZone: Boolean(zone),
    hasBody: bodies.length > 0,
    hasPoe: poes.length > 0,
    poeCount: poes.length,
    isEligibleForInternationalFerry,
    isEligibleForNational,
    missingRequirements: missing,
  };
}

/**
 * Returns the list of ISO codes for countries that are 100% configured for International Ferry:
 * They have Country info, Regulatory Zone, Regulatory Body, AND at least one active Port of Entry.
 */
export function getEligibleInternationalCountries(
  context: RegulatoryContext,
  airports: AirportSample[] = []
): string[] {
  const pool = context.airportPool && context.airportPool.length > 0 ? context.airportPool : airports;
  const candidateCountries = Array.from(
    new Set([
      ...(context.countriesInfo || []).map((c) => c.isoCode.toUpperCase()),
      ...pool.map((a) => (a.country || '').toUpperCase()),
    ])
  ).filter((iso) => iso && iso.length === 2);

  return candidateCountries.filter((iso) => {
    const status = checkCountryRegulatoryStatus(iso, context, pool);
    return status.isEligibleForInternationalFerry;
  });
}

/**
 * Finds the optimal Staging Airport (Port of Exit) in the origin country.
 * Per aviation regulations and user specification:
 * - Must be an airport configured as a Port of Entry (isPortOfEntry = true) in the origin country.
 * - Chooses the Port of Entry that is geographically closest to the destination.
 * Example: Starting from Texas/US to Brazil -> chooses Miami (KMIA) or Fort Lauderdale (KFLL),
 * as they are the US Ports of Entry closest to Brazil.
 */
export function findOptimalStagingAirport(
  departure: AirportSample,
  destination: AirportSample,
  airportPool: AirportSample[]
): AirportSample {
  const originCountry = departure.country;

  // 1. All registered Ports of Entry in origin country
  const originPoes = airportPool.filter(
    (ap) => ap.country === originCountry && ap.isPortOfEntry
  );

  if (originPoes.length > 0) {
    // Sort by distance to final destination ascending
    const sorted = [...originPoes].sort((a, b) => {
      const distA = calculateDistanceNm(a.lat, a.lng, destination.lat, destination.lng);
      const distB = calculateDistanceNm(b.lat, b.lng, destination.lat, destination.lng);
      return distA - distB;
    });

    return sorted[0];
  }

  // 2. Fallback: all paved/major airports in origin country sorted by proximity to destination
  const originFallbacks = airportPool.filter(
    (ap) => ap.country === originCountry && ap.hasPavedRunway !== false
  );

  if (originFallbacks.length > 0) {
    const sorted = [...originFallbacks].sort((a, b) => {
      const distA = calculateDistanceNm(a.lat, a.lng, destination.lat, destination.lng);
      const distB = calculateDistanceNm(b.lat, b.lng, destination.lat, destination.lng);
      return distA - distB;
    });
    return sorted[0];
  }

  return departure;
}

/**
 * Finds the optimal Port of Entry (POE) in the destination country.
 * Per aviation regulations:
 * - Must be an airport configured as a Port of Entry (isPortOfEntry = true) in the destination country.
 * - Chooses the Port of Entry that is geographically closest to the Staging Airport (exit point).
 * Example: Coming from Miami (KMIA) to Brazil -> chooses Manaus (SBEG), Belém (SBBE) or Natal (SBSG),
 * as they are the closest entry points into Brazilian airspace from the north/northwest.
 */
export function findOptimalPortOfEntry(
  stagingAirport: AirportSample,
  destination: AirportSample,
  airportPool: AirportSample[]
): AirportSample {
  const destCountry = destination.country;

  // 1. All registered Ports of Entry in destination country
  const destPoes = airportPool.filter(
    (ap) => ap.country === destCountry && ap.isPortOfEntry
  );

  if (destPoes.length > 0) {
    // Sort by distance from staging airport ascending
    const sorted = [...destPoes].sort((a, b) => {
      const distA = calculateDistanceNm(stagingAirport.lat, stagingAirport.lng, a.lat, a.lng);
      const distB = calculateDistanceNm(stagingAirport.lat, stagingAirport.lng, b.lat, b.lng);
      return distA - distB;
    });

    return sorted[0];
  }

  // 2. Fallback: all paved airports in destination country
  const destFallbacks = airportPool.filter(
    (ap) => ap.country === destCountry && ap.hasPavedRunway !== false
  );

  if (destFallbacks.length > 0) {
    const sorted = [...destFallbacks].sort((a, b) => {
      const distA = calculateDistanceNm(stagingAirport.lat, stagingAirport.lng, a.lat, a.lng);
      const distB = calculateDistanceNm(stagingAirport.lat, stagingAirport.lng, b.lat, b.lng);
      return distA - distB;
    });
    return sorted[0];
  }

  return destination;
}

/**
 * Builds a dynamic FerryDossier for international ferry missions, ensuring that
 * the Staging Airport (exit POE) and Destination POE are calculated according to
 * real airport coordinates and admin-configured POEs.
 */
export function buildFerryDossier(
  dep: AirportSample,
  arr: AirportSample,
  airportPool: AirportSample[],
  companyName: string,
  companyIcao: string,
  subIndex: number
): FerryDossier {
  const isUS = dep.country === 'US';
  const originalReg = isUS
    ? `N${Math.floor(100 + Math.random() * 800)}TX`
    : `CS-${companyIcao.substring(0, 2)}X`;
  const newReg = `PR-${companyIcao.substring(0, 2)}${subIndex}`;

  const staging = findOptimalStagingAirport(dep, arr, airportPool);
  const poe = findOptimalPortOfEntry(staging, arr, airportPool);

  return {
    aircraftModel: 'King Air 350i / TBM 930',
    manufacturer: isUS ? 'Textron Aviation' : 'Daher Aerospace',
    msn: `MSN ${1000 + Math.floor(Math.random() * 500)}`,
    originalRegistration: originalReg,
    newRegistration: newReg,
    mtowKg: isUS ? 6804 : 3354,
    currentOwner: `${companyName} Global Aircraft Leasing`,
    ownerTaxId: `REG-${dep.country}-${Math.floor(100000 + Math.random() * 800000)}`,
    originCountryCode: dep.country,
    originCountryName: countryName(dep.country),
    destinationCountryCode: arr.country,
    destinationCountryName: countryName(arr.country),
    portOfEntryIcao: poe.icao,
    portOfEntryName: poe.name,
    portOfEntryCity: `${poe.city} (${countryName(arr.country)})`,
    exportFeeCr: 1800,
    nationalizationFeeCr: 3800,
  };
}

/**
 * Generates dynamic overflight permits based on the Admin's configured countriesInfo,
 * regulatoryBodies, and regulatoryZones for the route from origin to destination.
 */
export function generateRouteOverflightPermits(
  contractId: string,
  originIcao: string,
  destinationIcao: string,
  stagingIcao: string,
  poeIcao: string,
  countriesInfo: CountryRegulatoryInfo[],
  regulatoryBodies: RegulatoryBody[],
  regulatoryZones: RegulatoryZone[],
  airportPool: AirportSample[]
): OverflightPermitRecord[] {
  const originAirport = airportPool.find((a) => a.icao === originIcao);
  const destAirport = airportPool.find((a) => a.icao === destinationIcao);
  const originCountry = originAirport?.country || 'US';
  const destCountry = destAirport?.country || 'BR';

  const now = new Date();
  const validUntilDate = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours

  const permits: OverflightPermitRecord[] = [];

  // Determine transit regions / countries requiring permits from Admin's countriesInfo
  // If USA to Brazil: Bahamas (BS), Trinidad & Tobago (TT), Brazil (BR)
  // If Europe (PT/ES) to Brazil: Eurocontrol/Spain, Cape Verde (CV), Brazil (BR)
  const isUsToBr = originCountry === 'US' && destCountry === 'BR';
  const isEuToBr = (originCountry === 'PT' || originCountry === 'ES') && destCountry === 'BR';

  if (isUsToBr) {
    // 1. Bahamas Transit
    const bcaaBody = regulatoryBodies.find((b) => b.countryIso === 'BS');
    permits.push({
      id: `pmt_bha_${Date.now()}`,
      contractId,
      countryIso: 'BS',
      countryName: 'Bahamas',
      firCode: 'MYNA (Nassau FIR)',
      authorityName: bcaaBody?.name || 'Bahamas Civil Aviation Authority (BCAA)',
      permitNumber: `BHA-OFL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'approved',
      issuedAt: now.toISOString(),
      validUntil: validUntilDate.toISOString(),
      notes: `Autorização de sobrevoo e descida técnica em rota a partir do Staging (${stagingIcao}).`,
    });

    // 2. Caribbean / Trinidad & Tobago Transit
    const ttcaaBody = regulatoryBodies.find((b) => b.countryIso === 'TT');
    permits.push({
      id: `pmt_ttp_${Date.now() + 1}`,
      contractId,
      countryIso: 'TT',
      countryName: 'Trinidad e Tobago & Caribe Sul',
      firCode: 'TTZP (Piarco Oceanic FIR)',
      authorityName: ttcaaBody?.name || 'Trinidad & Tobago Civil Aviation Authority (TTCAA)',
      permitNumber: `TTP-LND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'approved',
      issuedAt: now.toISOString(),
      validUntil: validUntilDate.toISOString(),
      notes: 'Aprovação para cruzar espaço aéreo caribenho e escala técnica em Piarco.',
    });
  } else if (isEuToBr) {
    // European / Cape Verde route
    const easaBody = regulatoryBodies.find((b) => b.shortName === 'EASA');
    permits.push({
      id: `pmt_easa_${Date.now()}`,
      contractId,
      countryIso: originCountry,
      countryName: 'Zona EASA / Eurocontrol',
      firCode: 'LPPO (Santa Maria Oceanic FIR)',
      authorityName: easaBody?.name || 'EASA & Eurocontrol Flight Operations',
      permitNumber: `EUR-CLR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'approved',
      issuedAt: now.toISOString(),
      validUntil: validUntilDate.toISOString(),
      notes: `Autorização de saída oceânica a partir do Staging (${stagingIcao}).`,
    });

    permits.push({
      id: `pmt_cv_${Date.now() + 1}`,
      contractId,
      countryIso: 'CV',
      countryName: 'Cabo Verde (Atlântico Médio)',
      firCode: 'GVSC (Sal Oceanic FIR)',
      authorityName: 'Agência de Aviação Civil de Cabo Verde (AAC)',
      permitNumber: `CVA-OFL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'approved',
      issuedAt: now.toISOString(),
      validUntil: validUntilDate.toISOString(),
      notes: 'Autorização de sobrevoo e escala técnica transatlântica.',
    });
  } else {
    // Generic international transit
    const adminPermitCountries = countriesInfo.filter((c) => c.requiresOverflightPermit);
    adminPermitCountries.slice(0, 2).forEach((c, idx) => {
      const body = regulatoryBodies.find((b) => b.countryIso === c.isoCode);
      permits.push({
        id: `pmt_gen_${Date.now() + idx}`,
        contractId,
        countryIso: c.isoCode,
        countryName: c.name,
        firCode: `${c.isoCode}XX FIR`,
        authorityName: body?.name || `Autoridade de Aviação Civil (${c.name})`,
        permitNumber: `INT-OFL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'approved',
        issuedAt: now.toISOString(),
        validUntil: validUntilDate.toISOString(),
        notes: `Autorização regulatória de sobrevoo conforme regras de ${c.name}.`,
      });
    });
  }

  // 3. Destination Country Entry Authorization (ASV / Special Flight Authorization)
  const destBody = regulatoryBodies.find(
    (b) => (b.countryIso === destCountry || b.countryIso === 'BR') && b.role === 'aviação civil'
  );
  const destZone = regulatoryZones.find((z) => z.code === 'ANAC_LATAM');

  permits.push({
    id: `pmt_dest_${Date.now() + 2}`,
    contractId,
    countryIso: destCountry,
    countryName: destCountry === 'BR' ? 'Brasil (Espaço Aéreo e Fronteira)' : countryName(destCountry),
    firCode: destCountry === 'BR' ? 'SBAO (Atlântico FIR) & SBRE (Recife FIR)' : `${destCountry} FIR`,
    authorityName: destBody?.name || 'DECEA / ANAC (Autorização Especial de Voo ASV)',
    permitNumber: `ASV-${destCountry}-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    status: 'approved',
    issuedAt: now.toISOString(),
    validUntil: validUntilDate.toISOString(),
    notes: `Entrada autorizada exclusivamente via Port of Entry designado (${poeIcao}) sob controle da ${destZone?.name || 'Autoridade de Destino'}.`,
  });

  return permits;
}
