import React from 'react';
import { usePilot } from '../../context/PilotContext';
import { Package, Users, Plane, Layers } from 'lucide-react';

export const MissionFilters: React.FC = () => {
  const { filterType, setFilterType, contracts } = usePilot();

  const countAll = contracts.length;
  const countCargo = contracts.filter((c) => c.type === 'cargo').length;
  const countPax = contracts.filter((c) => c.type === 'passenger').length;
  const countFerry = contracts.filter((c) => c.type === 'ferry').length;

  const tabs: { id: 'all' | 'cargo' | 'passenger' | 'ferry'; label: string; count: number; icon: React.ReactNode }[] = [
    {
      id: 'all',
      label: 'Todas as Missões',
      count: countAll,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'cargo',
      label: 'Transporte de Cargas',
      count: countCargo,
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'passenger',
      label: 'Passageiros',
      count: countPax,
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'ferry',
      label: 'Translados de Aeronaves',
      count: countFerry,
      icon: <Plane className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-4 mb-6">
      {tabs.map((tab) => {
        const isActive = filterType === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                isActive ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
