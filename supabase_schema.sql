-- =========================================================================
-- AVIATOR CAREER SYSTEM - BANCO DE DADOS SUPABASE (ESTRUTURA COMPLETA)
-- =========================================================================
-- Instalação:
-- 1. Acesse o painel do seu projeto no Supabase (https://supabase.com/dashboard).
-- 2. No menu lateral, clique em "SQL Editor".
-- 3. Clique em "New Query", cole todo este código SQL e clique em "Run".
-- =========================================================================

-- 1. TABELA DE PERFIS DOS PILOTOS (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  callsign TEXT DEFAULT 'Piloto VFR',
  rank_title TEXT DEFAULT 'Piloto Aluno',
  avatar_url TEXT,
  credits BIGINT DEFAULT 125000,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_flight_hours NUMERIC(10,2) DEFAULT 0.0,
  completed_flights INTEGER DEFAULT 0,
  successful_landings INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Profiles
DROP POLICY IF EXISTS "Pilotos podem visualizar qualquer perfil de piloto" ON public.profiles;
CREATE POLICY "Pilotos podem visualizar qualquer perfil de piloto"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Pilotos podem atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Pilotos podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. TABELA DE DIÁRIO DE VOO (flight_logs)
CREATE TABLE IF NOT EXISTS public.flight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contract_id TEXT,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'cargo', 'passenger', 'ferry'
  company_name TEXT,
  departure_icao VARCHAR(10) NOT NULL,
  arrival_icao VARCHAR(10) NOT NULL,
  aircraft TEXT NOT NULL,
  distance_nm NUMERIC(10,2) DEFAULT 0,
  flight_duration_minutes INTEGER DEFAULT 0,
  earned_credits BIGINT DEFAULT 0,
  earned_xp INTEGER DEFAULT 0,
  landing_score INTEGER DEFAULT 100, -- 0 a 100%
  status TEXT DEFAULT 'completed', -- 'completed' ou 'abandoned'
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS em flight_logs
ALTER TABLE public.flight_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Flight Logs
DROP POLICY IF EXISTS "Pilotos podem ver seus próprios diários de voo" ON public.flight_logs;
CREATE POLICY "Pilotos podem ver seus próprios diários de voo"
  ON public.flight_logs FOR SELECT
  USING (auth.uid() = pilot_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ));

DROP POLICY IF EXISTS "Pilotos podem inserir seus próprios diários de voo" ON public.flight_logs;
CREATE POLICY "Pilotos podem inserir seus próprios diários de voo"
  ON public.flight_logs FOR INSERT
  WITH CHECK (auth.uid() = pilot_id);

-- 3. TABELA DE FROTA DE AERONAVES DOS PILOTOS (user_fleet)
CREATE TABLE IF NOT EXISTS public.user_fleet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  aircraft_id TEXT NOT NULL,
  registration TEXT NOT NULL,
  nickname TEXT,
  total_hours NUMERIC(10,2) DEFAULT 0,
  condition_percent INTEGER DEFAULT 100,
  location_icao VARCHAR(10) DEFAULT 'SBGR',
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS em user_fleet
ALTER TABLE public.user_fleet ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pilotos podem gerenciar sua própria frota" ON public.user_fleet;
CREATE POLICY "Pilotos podem gerenciar sua própria frota"
  ON public.user_fleet FOR ALL
  USING (auth.uid() = pilot_id);

-- 4. TRIGGER PARA CRIAR PERFIL AUTOMÁTICO AO CADASTRAR NO SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    callsign,
    rank_title,
    credits,
    xp,
    level,
    is_admin
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'callsign', 'Piloto VFR'),
    'Piloto Aluno',
    125000, -- Saldo inicial de boas-vindas
    0,
    1,
    FALSE -- Por padrão usuários normais. Edite manualmente no Supabase para dar Admin.
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Associar a trigger à tabela auth.users do Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- COMANDO PARA TRANSFORMAR SEU USUÁRIO EM ADMIN (OPCIONAL):
-- Execute o comando abaixo no SQL Editor trocando o e-mail pelo seu e-mail:
--
-- UPDATE public.profiles 
-- SET is_admin = true, rank_title = 'Administrador de Frota' 
-- WHERE email = 'seu-email@dominio.com';
-- =========================================================================

-- 5. TABELA DE TELEMETRIA DO SIMULADOR (sim_telemetry)
-- Guarda a última telemetria enviada pelo conector Python de cada piloto.
-- A identidade aqui é o Token PIN (ex: AV-119735), não o login do Supabase
-- Auth — por isso as políticas de RLS abaixo são abertas (o token já funciona
-- como o "segredo" que identifica cada piloto).
CREATE TABLE IF NOT EXISTS public.sim_telemetry (
  token TEXT PRIMARY KEY,
  connected BOOLEAN DEFAULT TRUE,
  sim_name TEXT,
  airport_icao TEXT,
  aircraft_title TEXT,
  total_weight_kg NUMERIC(10,2) DEFAULT 0,
  payload_kg NUMERIC(10,2) DEFAULT 0,
  fuel_kg NUMERIC(10,2) DEFAULT 0,
  latitude NUMERIC(10,6) DEFAULT 0,
  longitude NUMERIC(10,6) DEFAULT 0,
  altitude_ft NUMERIC(10,2) DEFAULT 0,
  ground_speed_kts NUMERIC(10,2) DEFAULT 0,
  on_ground BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sim_telemetry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Backend pode ler telemetria" ON public.sim_telemetry;
CREATE POLICY "Backend pode ler telemetria"
  ON public.sim_telemetry FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Backend pode inserir telemetria" ON public.sim_telemetry;
CREATE POLICY "Backend pode inserir telemetria"
  ON public.sim_telemetry FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Backend pode atualizar telemetria" ON public.sim_telemetry;
CREATE POLICY "Backend pode atualizar telemetria"
  ON public.sim_telemetry FOR UPDATE
  USING (true);