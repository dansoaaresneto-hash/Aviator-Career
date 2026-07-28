import React from 'react';
import { LoginForm } from './LoginForm';
import {
  Plane,
  Database,
  Radio,
  Award,
  Globe,
  ExternalLink,
  Laptop
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 lg:p-12 relative overflow-hidden selection:bg-sky-500 selection:text-white">
      {/* Background Decorative Radial Gradient */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Navigation */}
      <header className="flex items-center justify-between max-w-7xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Plane className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white uppercase font-mono">
              Aviator <span className="text-sky-400">Career</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              MSFS Flight Management System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl backdrop-blur-md">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Supabase Auth Ready</span>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl w-full mx-auto my-auto py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Side: Presentation & Value Prop */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-sky-400" />
            <span>SimConnect & Supabase Ready</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            Gerencie sua Carreira na <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-emerald-400">Aviação Virtual</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            Conecte o Microsoft Flight Simulator (2020 / 2024), escolha contratos de frete ou passageiros, acumule saldo e registre todas as suas etapas em tempo real na nuvem.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-sm space-y-1.5">
              <div className="flex items-center gap-2 text-sky-400 font-extrabold text-sm">
                <Laptop className="w-4 h-4" />
                <span>Telemetria MSFS em Tempo Real</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detector de Pousos (Touchdown rate, G-force), altitude, velocidade IAS e combustível direto do seu simulador.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-sm space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                <Database className="w-4 h-4" />
                <span>Autenticação Supabase</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Suas horas de voo e missões salvas com segurança no banco de dados relacional em tempo real.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-sm space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                <Award className="w-4 h-4" />
                <span>Modo Carreira Completo</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Contratos de carga e passageiros, gerenciamento de frota de aeronaves, reputação e despesas operacionais.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-sm space-y-1.5">
              <div className="flex items-center gap-2 text-purple-400 font-extrabold text-sm">
                <Globe className="w-4 h-4" />
                <span>Hospedagem no Vercel</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Totalmente preparado para deploy no Vercel com suporte a múltiplos usuários cadastrados.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login / Register Form */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <LoginForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-800/80 pt-6 relative z-10">
        <p>© 2026 Aviator Career Center. Múltiplos usuários & Supabase.</p>
        <div className="flex items-center gap-4">
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            Hospedado no Vercel <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
};
