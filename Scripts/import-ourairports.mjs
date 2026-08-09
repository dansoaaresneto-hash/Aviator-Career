#!/usr/bin/env node
// =========================================================================
// IMPORTADOR DE AEROPORTOS — OurAirports -> Supabase
// =========================================================================
// Baixa os datasets públicos (domínio público / CC0) de ourairports.com e
// grava nas tabelas `airports` e `runways` do Supabase (ver supabase_schema.sql,
// seção 6). Roda esse script sempre que quiser atualizar a base — os dados do
// OurAirports mudam diariamente, mas pra esse app rodar 1x por mês já é mais
// que suficiente (a GitHub Action .github/workflows/sync-airports.yml já faz
// isso sozinha).
//
// Como rodar:
//   1. Defina as variáveis de ambiente (nunca comite a Service Role Key):
//        SUPABASE_URL=https://SEU-PROJETO.supabase.co
//        SUPABASE_SERVICE_ROLE_KEY=eyJ... (em Project Settings > API no Supabase)
//   2. npm install (garante que @supabase/supabase-js está instalado)
//   3. node scripts/import-ourairports.mjs
//
// Filtros aplicados (de propósito, pra manter a base relevante pro Aviator):
//   - Só aeroportos com código ICAO válido (4 letras)
//   - Só os tipos small_airport / medium_airport / large_airport
//     (heliportos, balloonports e aeroportos fechados ficam de fora)
//   - Pistas: só as vinculadas a um aeroporto que passou no filtro acima
// =========================================================================

import { createClient } from '@supabase/supabase-js';

const AIRPORTS_CSV_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv';
const RUNWAYS_CSV_URL = 'https://davidmegginson.github.io/ourairports-data/runways.csv';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '\n❌ Faltam variáveis de ambiente.\n' +
      '   Defina SUPABASE_URL (ou VITE_SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY antes de rodar.\n' +
      '   A Service Role Key fica em Supabase > Project Settings > API > service_role.\n' +
      '   ATENÇÃO: essa chave ignora RLS — nunca coloque ela no frontend nem comite no git.\n'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const VALID_AIRPORT_TYPES = new Set(['small_airport', 'medium_airport', 'large_airport']);

// ---------------------------------------------------------------------
// Parser de CSV mínimo, mas correto: respeita campos entre aspas contendo
// vírgulas e aspas escapadas (padrão RFC 4180, formato usado pelo OurAirports).
// ---------------------------------------------------------------------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char === '\r') {
      // ignora — o \n seguinte já fecha a linha
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function rowsToObjects(rows) {
  const header = rows[0];
  return rows
    .slice(1)
    .filter((r) => r.length === header.length)
    .map((r) => {
      const obj = {};
      header.forEach((h, idx) => {
        obj[h] = r[idx];
      });
      return obj;
    });
}

async function downloadCsv(url, label) {
  console.log(`⬇️  Baixando ${label}...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao baixar ${label}: HTTP ${res.status}`);
  }
  const text = await res.text();
  console.log(`   ${label} baixado (${(text.length / 1024 / 1024).toFixed(1)} MB)`);
  return rowsToObjects(parseCsv(text));
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function upsertInBatches(table, rows, conflictKey, batchSize = 1000) {
  if (rows.length === 0) return;
  const batches = chunk(rows, batchSize);
  let done = 0;
  for (const batch of batches) {
    const { error } = await supabase.from(table).upsert(batch, { onConflict: conflictKey });
    if (error) {
      throw new Error(`Erro ao gravar em "${table}": ${error.message}`);
    }
    done += batch.length;
    process.stdout.write(`\r   ${table}: ${done}/${rows.length} registros`);
  }
  process.stdout.write('\n');
}

async function main() {
  console.log('=========================================================');
  console.log(' Sincronizando base de aeroportos (OurAirports -> Supabase)');
  console.log('=========================================================\n');

  // ---- 1. Aeroportos ----
  const airportRows = await downloadCsv(AIRPORTS_CSV_URL, 'airports.csv');

  const seen = new Set();
  const airports = [];
  for (const r of airportRows) {
    const icao = r.icao_code?.trim().toUpperCase();
    if (!icao || icao.length !== 4) continue;
    if (!VALID_AIRPORT_TYPES.has(r.type)) continue;
    if (seen.has(icao)) continue; // o dataset raramente tem ICAOs duplicados, mas evita erro no upsert
    seen.add(icao);

    airports.push({
      icao,
      iata: r.iata_code?.trim() || null,
      name: r.name?.trim() || icao,
      municipality: r.municipality?.trim() || null,
      country: r.iso_country?.trim() || null,
      continent: r.continent?.trim() || null,
      type: r.type,
      lat: r.latitude_deg ? parseFloat(r.latitude_deg) : null,
      lng: r.longitude_deg ? parseFloat(r.longitude_deg) : null,
      elevation_ft: r.elevation_ft ? parseInt(r.elevation_ft, 10) : null,
      scheduled_service: r.scheduled_service === 'yes',
    });
  }

  console.log(`\n✅ ${airports.length} aeroportos válidos de ${airportRows.length} registros totais no CSV.\n`);
  await upsertInBatches('airports', airports, 'icao');

  // ---- 2. Pistas (só as dos aeroportos que importamos) ----
  const runwayRows = await downloadCsv(RUNWAYS_CSV_URL, '\nrunways.csv');

  const runways = [];
  for (const r of runwayRows) {
    const airportIcao = r.airport_ident?.trim().toUpperCase();
    if (!airportIcao || !seen.has(airportIcao)) continue;

    runways.push({
      airport_icao: airportIcao,
      length_ft: r.length_ft ? parseInt(r.length_ft, 10) : null,
      width_ft: r.width_ft ? parseInt(r.width_ft, 10) : null,
      surface: r.surface?.trim() || null,
      lighted: r.lighted === '1',
      closed: r.closed === '1',
      le_ident: r.le_ident?.trim() || null,
      he_ident: r.he_ident?.trim() || null,
    });
  }

  console.log(`\n✅ ${runways.length} pistas vinculadas aos aeroportos importados.\n`);
  await upsertInBatches('runways', runways, 'airport_icao,le_ident,he_ident');

  console.log('\n🎉 Importação concluída com sucesso.');
}

main().catch((err) => {
  console.error('\n❌ Erro na importação:', err.message);
  process.exit(1);
});
