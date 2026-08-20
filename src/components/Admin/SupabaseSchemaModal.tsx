import React, { useState } from 'react';
import { Database, CheckCircle2, Copy, Check, X, Shield, Terminal, ArrowUpRight } from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_URL } from '../../lib/supabase';

interface SupabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSchemaModal: React.FC<SupabaseSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- AVIATOR CAREER - ESTRUTURA SUPABASE (EMPRESAS E AERONAVES)
-- Execute este script no SQL Editor do Supabase para criar as tabelas reais:

-- 1. TABELA DE EMPRESAS AÉREAS CADASTRADAS (admin_companies)
CREATE TABLE IF NOT EXISTS public.admin_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icao_code TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  logo_color TEXT DEFAULT 'from-blue-600 to-sky-500',
  min_pilot_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  allowed_mission_types JSONB DEFAULT '[]'::jsonb,
  route_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode ler empresas" ON public.admin_companies;
CREATE POLICY "Qualquer um pode ler empresas"
  ON public.admin_companies FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Todos podem gerenciar empresas" ON public.admin_companies;
CREATE POLICY "Todos podem gerenciar empresas"
  ON public.admin_companies FOR ALL
  USING (true);

-- 2. TABELA DE CATÁLOGO DE AERONAVES (admin_aircrafts)
CREATE TABLE IF NOT EXISTS public.admin_aircrafts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  icao_code TEXT,
  category TEXT NOT NULL,
  max_fuel_gallons NUMERIC(10,2) DEFAULT 0,
  passenger_capacity INTEGER DEFAULT 0,
  oew_kg NUMERIC(10,2) DEFAULT 0,
  mtow_kg NUMERIC(10,2) DEFAULT 0,
  max_payload_kg NUMERIC(10,2) DEFAULT 0,
  image_url TEXT,
  cruising_speed_kts NUMERIC(10,2) DEFAULT 0,
  range_nm NUMERIC(10,2) DEFAULT 0,
  cargo_capacity_kg NUMERIC(10,2) DEFAULT 0,
  rental_fee_per_flight NUMERIC(10,2) DEFAULT 0,
  purchase_price NUMERIC(10,2) DEFAULT 0,
  image_placeholder_color TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_aircrafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode ler aeronaves" ON public.admin_aircrafts;
CREATE POLICY "Qualquer um pode ler aeronaves"
  ON public.admin_aircrafts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Todos podem gerenciar aeronaves" ON public.admin_aircrafts;
CREATE POLICY "Todos podem gerenciar aeronaves"
  ON public.admin_aircrafts FOR ALL
  USING (true);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                Conexão e Banco Supabase
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {isSupabaseConfigured ? 'Conectado' : 'Chave Pendente'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-md font-mono mt-0.5">
                {SUPABASE_URL}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600">
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-3.5 space-y-1.5">
            <h4 className="font-bold text-sky-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sky-600" />
              Sincronização em Nuvem em Tempo Real
            </h4>
            <p className="text-sky-700 leading-relaxed">
              O aplicativo agora sincroniza automaticamente as empresas, regras de rotas e aeronaves diretamente com a nuvem do Supabase. Para garantir que as tabelas de Empresas (<code className="font-bold">admin_companies</code>) e Aeronaves (<code className="font-bold">admin_aircrafts</code>) existam no seu projeto, execute o script SQL abaixo no seu painel.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-500" />
                Script SQL de Atualização do Banco:
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
              {sqlCode}
            </pre>
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-600 font-medium">Acessar Painel do Supabase:</span>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Abrir SQL Editor <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Entendido, Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
