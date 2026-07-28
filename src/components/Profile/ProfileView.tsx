import React from 'react';
import { usePilot } from '../../context/PilotContext';
import { User, Award, ShieldCheck, Zap, Coins, Clock, CheckCircle2, Star } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { profile } = usePilot();

  const xpForNextLevel = profile.level * 500;
  const xpPercentage = Math.min(100, Math.round((profile.xp / xpForNextLevel) * 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <User className="w-6 h-6 text-sky-500" />
            Perfil Oficial do Piloto
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Status da licença de pilotagem, nível de experiência e indicadores de desempenho
          </p>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 p-1 shadow-md shadow-sky-500/20 shrink-0">
          <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center border-2 border-white">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
            <h3 className="text-xl font-extrabold text-slate-800">{profile.name}</h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              {profile.title}
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium mb-3">
            Callsign de Rádio Registrado: <strong className="text-slate-800">{profile.preferredCallsign}</strong>
          </p>

          {/* XP Progress */}
          <div className="max-w-md bg-slate-50 p-3 rounded-lg border border-slate-200/70">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-600">Nível de Carreira {profile.level}</span>
              <span className="text-sky-600">{profile.xp} / {xpForNextLevel} XP</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: `${xpPercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Saldo Atual</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{profile.credits.toLocaleString('pt-BR')} CR</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Horas de Voo</span>
          <p className="text-2xl font-black text-slate-800 mt-1">{profile.totalFlightHours} h</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Contratos Concluídos</span>
          <p className="text-2xl font-black text-slate-800 mt-1">{profile.completedFlights}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Pousos Bem Sucedidos</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{profile.successfulLandings}</p>
        </div>
      </div>
    </div>
  );
};
