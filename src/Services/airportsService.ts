import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AirportSample } from '../types';

// Cache local do pool de aeroportos, pra não bater no Supabase a cada
// carregamento de tela. A base do OurAirports muda pouco de um dia pro
// outro, então 24h de validade é bastante seguro.
const CACHE_KEY = 'aviator_airports_pool_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

interface CachedPool {
  fetchedAt: number;
  airports: AirportSample[];
}

function readCache(): AirportSample[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedPool = JSON.parse(raw);
    if (!parsed.airports?.length) return null;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed.airports;
  } catch {
    return null;
  }
}

function writeCache(airports: AirportSample[]) {
  try {
    const payload: CachedPool = { fetchedAt: Date.now(), airports };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage cheio ou indisponível — não é crítico, seguimos sem cache
  }
}

/**
 * Busca o pool de aeroportos reais (view `mission_airports`, alimentada pelo
 * OurAirports) para uso no gerador de missões. Usa cache local de 24h;
 * passe `forceRefresh: true` para ignorar o cache (ex: botão "Atualizar" no
 * admin).
 */
export async function fetchMissionAirportPool(options?: { forceRefresh?: boolean }): Promise<AirportSample[]> {
  if (!options?.forceRefresh) {
    const cached = readCache();
    if (cached) return cached;
  }

  if (!isSupabaseConfigured) {
    console.warn('Supabase não configurado — não é possível buscar a base de aeroportos.');
    return [];
  }

  const { data, error } = await supabase
    .from('mission_airports')
    .select('icao, name, city, country, lat, lng, max_runway_ft, has_paved_runway')
    .order('icao', { ascending: true });

  if (error) {
    console.error('Falha ao buscar aeroportos do Supabase:', error.message);
    // Se falhar mas tivermos um cache expirado, é melhor usar dado velho do
    // que nenhum dado — o app não pode ficar sem aeroportos pra gerar missões.
    return readCache() || [];
  }

  const airports: AirportSample[] = (data || []).map((row) => ({
    icao: row.icao,
    name: row.name,
    city: row.city || row.icao,
    country: row.country,
    lat: row.lat,
    lng: row.lng,
    maxRunwayFt: row.max_runway_ft ?? undefined,
    hasPavedRunway: row.has_paved_runway ?? undefined,
  }));

  writeCache(airports);
  return airports;
}
