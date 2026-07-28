import React from 'react';
import { usePilot } from '../context/PilotContext';
import { UserMenu } from './Auth/UserMenu';
import { Search, Coins, Zap, PlaneTakeoff, Bell, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, searchQuery, setSearchQuery, setActiveTab, activeContract } = usePilot();

  const xpForNextLevel = profile.level * 500;
  const xpPercentage = Math.min(100, Math.round((profile.xp / xpForNextLevel) * 100));

  return (
    <header className="bg-white rounded-xl p-4 px-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      {/* Search Input - Clean Light Design */}
      <div className="relative w-full md:w-96">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar contratos, rotas (ICAO), aeronaves..."
          className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
        />
      </div>

      {/* Stats Indicators & Quick Actions */}
      <div className="flex items-center flex-wrap gap-3 w-full md:w-auto justify-end">
        {/* Credits Counter - Starts at 0 CR as requested */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-200/80 px-3.5 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/30">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-700/80 tracking-wider">Saldo de Créditos</div>
            <div className="text-sm font-extrabold text-amber-900 leading-tight">
              {profile.credits.toLocaleString('pt-BR')} <span className="text-xs font-bold text-amber-700">CR</span>
            </div>
          </div>
        </div>

        {/* Level XP Progress Widget */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm shadow-sky-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-slate-600">
              <span>NÍVEL {profile.level}</span>
              <span className="text-sky-600">{profile.xp} / {xpForNextLevel} XP</span>
            </div>
            <div className="w-28 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Action Button: "Começar um voo" */}
        {!activeContract ? (
          <button
            onClick={() => setActiveTab('missions')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <PlaneTakeoff className="w-4 h-4" />
            <span>Começar um Voo</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('active-flight')}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all animate-pulse cursor-pointer"
          >
            <PlaneTakeoff className="w-4 h-4" />
            <span>Voo em Andamento</span>
          </button>
        )}

        {/* Top bar icons & User Menu */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <UserMenu />
          <button className="hidden lg:block p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors relative cursor-pointer" title="Notificações">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 bg-sky-500 rounded-full absolute top-1.5 right-1.5"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
