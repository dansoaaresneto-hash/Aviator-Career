import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AirportSample } from '../types';

const PAGE_SIZE = 1000;

async function fetchAllMissionAirports() {
  let allRows: any[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('mission_airports')
      .select('icao, name, city, country, lat, lng, max_runway_ft, has_paved_runway, is_port_of_entry, poe_customs_hours, poe_notes')
      .order('icao', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allRows = allRows.concat(data);
    if (data.length < PAGE_SIZE) break; // última página

    from += PAGE_SIZE;
  }

  return allRows;
}

/**
 * Busca o pool de aeroportos reais diretamente do Supabase (tabela/view `mission_airports`).
 * Sem cache em localStorage para garantir sincronização global entre todos os usuários.
 */
export async function fetchMissionAirportPool(_options?: { forceRefresh?: boolean }): Promise<AirportSample[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase não configurado — não é possível buscar a base de aeroportos.');
    return [];
  }

  try {
    const data = await fetchAllMissionAirports();

    const airports: AirportSample[] = (data || []).map((row) => ({
      icao: row.icao,
      name: row.name,
      city: row.city || row.icao,
      country: row.country,
      lat: row.lat,
      lng: row.lng,
      maxRunwayFt: row.max_runway_ft ?? undefined,
      hasPavedRunway: row.has_paved_runway ?? undefined,
      isPortOfEntry: Boolean(row.is_port_of_entry),
      poeCustomsHours: row.poe_customs_hours || undefined,
      poeNotes: row.poe_notes || undefined,
    }));

    return airports;
  } catch (error: any) {
    console.error('Falha ao buscar aeroportos do Supabase:', error?.message || error);
    return [];
  }
}

export function updateAirportInCache(_icao: string, _updates: Partial<AirportSample>) {
  // Mantido para compatibilidade, sem op
}

export function clearAirportCache() {
  // Mantido para compatibilidade, sem op
}
