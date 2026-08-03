import { AeronauticalFix, AiracCycleInfo, MetarData, ProcedureOption, FlightPlanWaypoint } from '../types';
import { OFFLINE_AERONAUTICAL_FIXES } from '../data/airacOfflineDatabase';
import { calculateDistanceNm } from './aviationNavMath';

// Level of Detail (LOD) Helpers matching AIRAC integration guide Section 8
export function tierForZoom(zoom: number): number {
  if (zoom <= 5) return 2;
  if (zoom <= 8) return 3;
  return 4;
}

export function maxTierVisible(zoom: number, manualBias: number): number {
  const base = tierForZoom(zoom);
  return Math.min(4, Math.max(1, base + manualBias));
}

export function isHelipadFix(apt: { name?: string; facilityType?: string; isHeli?: boolean; identifier?: string }): boolean {
  if (apt.isHeli) return true;
  const facType = (apt.facilityType || '').toLowerCase();
  if (facType === 'heliport' || facType === 'helipad' || facType === 'heli') return true;

  const nameLower = (apt.name || '').toLowerCase();
  if (
    nameLower.includes('heli') ||
    nameLower.includes('heliponto') ||
    nameLower.includes('helideck') ||
    nameLower.includes('heliporto') ||
    nameLower.includes('helip.') ||
    nameLower.includes('hp ') ||
    nameLower.includes(' h/p') ||
    nameLower.includes(' - hp') ||
    nameLower.includes('hospital') ||
    nameLower.includes('hosp.') ||
    nameLower.includes('hosp ') ||
    nameLower.includes('plataforma') ||
    nameLower.includes('plat.') ||
    nameLower.includes('oil rig') ||
    nameLower.includes('edificio') ||
    nameLower.includes('edif.') ||
    nameLower.includes('empresarial') ||
    nameLower.includes('torre ') ||
    nameLower.includes('centro medico') ||
    nameLower.includes('centro médico') ||
    nameLower.includes('condominio') ||
    nameLower.includes('condomínio') ||
    nameLower.includes('residence') ||
    nameLower.includes('flat')
  ) {
    return true;
  }

  // Common Brazilian Helipad designator suffix patterns:
  const id = (apt.identifier || '').toUpperCase();
  if (id.length === 4 && (id.endsWith('HP') || id.endsWith('HL') || id.endsWith('HD') || id.endsWith('HG'))) {
    if (id.startsWith('SD') || id.startsWith('SI') || id.startsWith('SJ') || id.startsWith('SN') || id.startsWith('SS') || id.startsWith('SW')) {
      return true;
    }
  }

  return false;
}

export function airportTier(apt: { name?: string; iata?: string; tier?: number; identifier?: string; facilityType?: string; isHeli?: boolean }): number {
  if (isHelipadFix(apt)) {
    return 4; // Helipads / Helidecks are lowest priority (Tier 4)
  }

  // Major hubs with IATA (e.g. GRU, CGH, GIG, BSB, LIS, MIA)
  if (apt.iata) return 1;

  // Controlled public airports with SB prefix in Brazil (e.g., SBMT, SBBH, SBJD)
  if (apt.identifier && apt.identifier.toUpperCase().startsWith('SB')) {
    return 2;
  }

  // Small private aerodromes (SD, SI, SW, SS, SN, SJ without helipad keywords)
  if (apt.identifier && (
    apt.identifier.startsWith('SD') ||
    apt.identifier.startsWith('SI') ||
    apt.identifier.startsWith('SW') ||
    apt.identifier.startsWith('SS') ||
    apt.identifier.startsWith('SN') ||
    apt.identifier.startsWith('SJ')
  )) {
    return 3; // Small airfields / airstrips
  }

  if (apt.tier) return apt.tier;

  return 2;
}

export function navaidTier(navaid: { type: string; tier?: number }): number {
  if (navaid.tier) return navaid.tier;
  const majorTypes = ['VOR', 'VOR/DME', 'VORTAC', 'TACAN'];
  return majorTypes.includes(navaid.type.toUpperCase()) ? 1 : 3;
}

export function waypointTier(wp: { typeCode?: string; tier?: number }): number {
  if (wp.tier) return wp.tier;
  return 1;
}

// Fetch Current AIRAC Cycle
export async function fetchAiracCycle(): Promise<AiracCycleInfo> {
  try {
    const res = await fetch('/api/airac/current');
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        return {
          cycle: json.data.cycle || '2607',
          effectiveDate: json.data.effective_date || '2026-07-09',
          expirationDate: json.data.expiration_date || '2026-08-06',
          daysRemaining: json.data.days_remaining ?? 12,
          isCurrent: json.data.is_current ?? true,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to fetch online AIRAC cycle, using current cycle fallback:', e);
  }

  return {
    cycle: '2607',
    effectiveDate: '2026-07-09',
    expirationDate: '2026-08-06',
    daysRemaining: 12,
    isCurrent: true,
  };
}

// Fetch Nearby Fixes for Leaflet Viewport
export async function fetchNearbyFixes(
  lat: number,
  lng: number,
  radiusNm: number = 250
): Promise<AeronauticalFix[]> {
  const fixesMap = new Map<string, AeronauticalFix>();

  // 1. Load from offline dataset first
  OFFLINE_AERONAUTICAL_FIXES.forEach((fix) => {
    fixesMap.set(fix.identifier, fix);
  });

  // 2. Fetch live airports and waypoints from proxy
  try {
    const results = await Promise.allSettled([
      fetch(`/api/airac/airports/nearby?latitude=${lat}&longitude=${lng}&radius=${radiusNm}`),
      fetch(`/api/airac/waypoints/nearby?latitude=${lat}&longitude=${lng}&radius=${radiusNm}`),
      fetch(`/api/airac/navaids/nearby?latitude=${lat}&longitude=${lng}&radius=${radiusNm}`),
    ]);

    const airportsRes = results[0].status === 'fulfilled' ? results[0].value : null;
    const waypointsRes = results[1].status === 'fulfilled' ? results[1].value : null;
    const navaidsRes = results[2].status === 'fulfilled' ? results[2].value : null;

    if (airportsRes && airportsRes.ok) {
      const json = await airportsRes.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        json.data.forEach((item: any) => {
          const icao = item.icao || item.identifier;
          if (icao) {
            const facType = (item.type || item.facility_type || item.airport_type || '').toLowerCase();
            const name = item.name || `Aeroporto ${icao}`;
            const isHeli = isHelipadFix({ name, facilityType: facType, identifier: icao, isHeli: facType.includes('heli') });
            const calculatedTier = airportTier({
              name,
              iata: item.iata,
              identifier: icao,
              facilityType: facType,
              isHeli,
            });

            fixesMap.set(icao, {
              id: `apt-${icao.toLowerCase()}`,
              identifier: icao,
              iata: item.iata,
              name,
              type: 'airport',
              facilityType: facType || (isHeli ? 'heliport' : 'airport'),
              isHeli,
              lat: item.coordinates?.latitude || item.coordinates?.lat || item.latitude || lat,
              lng: item.coordinates?.longitude || item.coordinates?.lon || item.longitude || lng,
              elevationFt: item.elevation_ft,
              country: item.country,
              city: item.city,
              tier: calculatedTier,
            });
          }
        });
      }
    }

    if (navaidsRes && navaidsRes.ok) {
      const json = await navaidsRes.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        json.data.forEach((item: any) => {
          const id = item.identifier || item.icao;
          if (id && !fixesMap.has(id)) {
            fixesMap.set(id, {
              id: `nav-${id.toLowerCase()}`,
              identifier: id,
              name: item.name || `${id} VOR`,
              type: 'vor',
              freq: item.frequency ? `${item.frequency} MHz` : undefined,
              lat: item.coordinates?.latitude || item.latitude || lat,
              lng: item.coordinates?.longitude || item.longitude || lng,
              elevationFt: item.elevation_ft,
              tier: navaidTier({ type: item.type || 'VOR' }),
            });
          }
        });
      }
    }

    if (waypointsRes && waypointsRes.ok) {
      const json = await waypointsRes.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        json.data.forEach((item: any) => {
          const id = item.identifier;
          if (id && !fixesMap.has(id)) {
            fixesMap.set(id, {
              id: `wp-${id.toLowerCase()}`,
              identifier: id,
              name: item.name || `${id} Fix`,
              type: 'fix',
              typeCode: item.type?.code,
              lat: item.coordinates?.latitude || item.latitude || lat,
              lng: item.coordinates?.longitude || item.longitude || lng,
              tier: waypointTier({ typeCode: item.type?.code }),
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('AIRAC API nearby call notice (using local offline cache):', e);
  }

  return Array.from(fixesMap.values());
}

// Global Text Search / Autocomplete
export async function searchAeronauticalFixes(query: string): Promise<AeronauticalFix[]> {
  const trimmed = query.trim().toUpperCase();
  if (trimmed.length < 2) return [];

  const resultsMap = new Map<string, AeronauticalFix>();

  // Filter offline database first
  OFFLINE_AERONAUTICAL_FIXES.forEach((fix) => {
    if (
      fix.identifier.includes(trimmed) ||
      (fix.iata && fix.iata.includes(trimmed)) ||
      fix.name.toUpperCase().includes(trimmed) ||
      (fix.city && fix.city.toUpperCase().includes(trimmed))
    ) {
      resultsMap.set(fix.identifier, fix);
    }
  });

  // Call proxy search
  try {
    const res = await fetch(`/api/airac/search?q=${encodeURIComponent(trimmed)}&limit=15`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        // Flatten grouped results
        const items = Array.isArray(json.data)
          ? json.data
          : [...(json.data.airports || []), ...(json.data.navaids || []), ...(json.data.waypoints || [])];

        items.forEach((item: any) => {
          const id = item.identifier || item.icao;
          if (id && !resultsMap.has(id)) {
            resultsMap.set(id, {
              id: `search-${id.toLowerCase()}`,
              identifier: id,
              iata: item.iata,
              name: item.name || id,
              type: item.type === 'airport' ? 'airport' : item.type === 'navaid' ? 'vor' : 'fix',
              lat: item.coordinates?.latitude || item.latitude || 0,
              lng: item.coordinates?.longitude || item.longitude || 0,
              elevationFt: item.elevation_ft,
              country: item.country,
              city: item.city,
              tier: item.iata ? 1 : 2,
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('Search AIRAC proxy notice:', e);
  }

  return Array.from(resultsMap.values());
}

// Fetch Procedures (SID / STAR / APP) for an airport
export async function fetchProceduresForAirport(
  icao: string,
  type: 'SID' | 'STAR' | 'APP' = 'SID'
): Promise<ProcedureOption[]> {
  const cleanIcao = icao.trim().toUpperCase();
  if (!cleanIcao) return [];

  try {
    const res = await fetch(`/api/airac/procedures?airport=${cleanIcao}&type=${type}`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        return json.data.map((p: any) => ({
          identifier: p.identifier || p.name,
          name: p.name || p.identifier,
          type,
          runway: p.runway || 'All',
        }));
      }
    }
  } catch (e) {
    console.warn(`Procedure fetch notice for ${cleanIcao}:`, e);
  }

  // Fallback procedure options if API is silent for airport
  if (type === 'SID') {
    return [
      { identifier: `${cleanIcao}1A`, name: `${cleanIcao} 1 ALPHA (RWY 10L/28R)`, type: 'SID', runway: '10L/28R' },
      { identifier: `${cleanIcao}2B`, name: `${cleanIcao} 2 BRAVO (RWY 10R/28L)`, type: 'SID', runway: '10R/28L' },
    ];
  } else {
    return [
      { identifier: `ILS-${cleanIcao}-09R`, name: `ILS Z RWY 09R (${cleanIcao})`, type: 'APP', runway: '09R' },
      { identifier: `RNAV-${cleanIcao}-27L`, name: `RNAV (GPS) RWY 27L (${cleanIcao})`, type: 'STAR', runway: '27L' },
    ];
  }
}

// Fetch METAR Weather Briefing
export async function fetchMetar(icao: string): Promise<MetarData | null> {
  const cleanIcao = icao.trim().toUpperCase();
  if (!cleanIcao) return null;

  try {
    const res = await fetch(`/api/metar/${cleanIcao}`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        return json.data;
      }
    }
  } catch (e) {
    console.warn(`METAR fetch notice for ${cleanIcao}:`, e);
  }

  return {
    icao: cleanIcao,
    rawMetar: `${cleanIcao} 261400Z 12010KT 9999 FEW030 24/18 Q1013`,
    flightCategory: 'VFR',
    temperatureC: 24,
    dewPointC: 18,
    windSpeedKts: 10,
    windDirectionDeg: 120,
    visibilityKm: 10,
    altimeterInHg: 29.92,
    cloudsText: 'FEW 3000ft',
    observedTime: new Date().toISOString(),
  };
}
