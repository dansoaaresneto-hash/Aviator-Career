import { createClient, SupabaseClient } from '@supabase/supabase-js';

// =========================================================================
// CHAVES DE CONEXÃO COM O SUPABASE (EDITE DIRETAMENTE AQUI)
// Insira a URL e a Chave Anônima do seu projeto Supabase:
// =========================================================================
export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://sua-url-do-projeto.supabase.co';
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sua-chave-anonima-aqui';

// Verifica se as chaves foram preenchidas no código ou via arquivo .env
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('sua-url-do-projeto') &&
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_ANON_KEY.includes('sua-chave-anonima') &&
  !SUPABASE_ANON_KEY.includes('your-anon-key')
);

// Instância global do cliente Supabase
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
