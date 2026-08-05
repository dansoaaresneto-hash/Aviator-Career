import React from 'react';
import { usePilot } from '../context/PilotContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  PlaneTakeoff,
  Plane,
  Warehouse,
  BookOpen,
  User,
  Settings,
  Sparkles,
  Award,
  ShieldCheck,
  Compass,
  Laptop,
  Radio,
  Building2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { profile, activeTab, setActiveTab, activeContract } = usePilot();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'missions',
      label: 'Missões & Voos',
      icon: <PlaneTakeoff className="w-5 h-5" />,
      badge: 'Contratos',
    },
    {
      id: 'admin-companies',
      label: 'Empresas (Admin)',
      icon: <Building2 className="w-5 h-5 text-purple-500" />,
      badge: 'ADMIN',
    },
    {
      id: 'flight-planner',
      label: 'Planejador de Voo',
      icon: <Compass className="w-5 h-5 text-amber-500" />,
      badge: 'AIRAC',
    },
    {
      id: 'live-map',
      label: 'Mapa ao Vivo',
      icon: <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />,
      badge: 'RADAR',
    },
    {
      id: 'connector',
      label: 'Conector MSFS',
      icon: <Laptop className="w-5 h-5 text-sky-500" />,
      badge: 'SimConnect',
    },
    ...(activeContract
      ? [
          {
            id: 'active-flight' as ActiveTab,
            label: 'Voo Em Andamento',
            icon: <Plane className="w-5 h-5 animate-pulse text-amber-300" />,
            badge: 'EM VOO',
          },
        ]
      : []),
    {
      id: 'fleet',
      label: 'Minha Garagem',
      icon: <Warehouse className="w-5 h-5" />,
    },
    {
      id: 'logbook',
      label: 'Diário de Bordo',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: 'Perfil do Piloto',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-72 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Top Pilot Profile Card - Reference Image Inspired */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100 mb-5">
          <div className="relative mb-2.5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-md shadow-sky-500/20">
              <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center border-2 border-white">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                  alt="Avatar do Piloto"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback avatar icon
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <User className="w-8 h-8 text-slate-300 hidden" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center" title="Status: Ativo">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </span>
          </div>

          <h3 className="font-bold text-slate-800 text-base leading-tight">{profile.name}</h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            {profile.title}
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100">
            <Award className="w-3.5 h-3.5 text-sky-600" />
            <span>Nível {profile.level}</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-sky-400' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info box */}
      <div className="mt-5 pt-3.5 border-t border-slate-100">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-3.5 text-white shadow-inner">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" /> Aviator MSFS
            </span>
            <span className="text-[9px] bg-slate-700/80 text-slate-300 px-1.5 py-0.2 rounded">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
            Modo carreira ativo. Selecione missões e ganhe créditos para evoluir seu ranking.
          </p>
        </div>
      </div>
    </aside>
  );
};
