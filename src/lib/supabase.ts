import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default / Fallback keys configured by developer
const DEFAULT_SUPABASE_URL = 'https://your-project.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'your-anon-key';

// Helper to get active keys (Env variables -> localStorage custom override -> Defaults)
export const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem('aviator_supabase_url');
  const customKey = localStorage.getItem('aviator_supabase_key');

  const env = (import.meta as any).env || {};
  const url = env.VITE_SUPABASE_URL || customUrl || DEFAULT_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY || customKey || DEFAULT_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    url &&
    key &&
    url !== 'https://your-project.supabase.co' &&
    key !== 'your-anon-key'
  );

  return { url, key, isConfigured };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const { url, key } = getSupabaseConfig();
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('aviator_supabase_url', url.trim());
  localStorage.setItem('aviator_supabase_key', key.trim());
  const { url: newUrl, key: newKey } = getSupabaseConfig();
  supabaseInstance = createClient(newUrl, newKey);
};
