import React from 'react';
import { AircraftModel } from '../../types';
import {
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  Fuel,
  Weight,
  Package,
  Plane,
  Gauge,
  Navigation,
} from 'lucide-react';

interface AircraftCardProps {
  aircraft: AircraftModel;
  onEdit: (aircraft: AircraftModel) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export const AircraftCard: React.FC<AircraftCardProps> = ({
  aircraft,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const isActive = aircraft.isActive !== false;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg ${
        isActive ? 'border-slate-200/90 hover:border-sky-300' : 'border-slate-200 opacity-75 bg-slate-50/50'
      }`}
    >
      <div>
        {/* Aircraft Image Header with Badges */}
        <div className="relative h-44 bg-slate-900 overflow-hidden flex items-center justify-center">
          {aircraft.imageUrl ? (
            <img
              src={aircraft.imageUrl}
              alt={aircraft.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 space-y-1 p-4 text-center">
              <Plane className="w-10 h-10 opacity-30 text-slate-300" />
              <span className="text-xs font-mono font-bold text-slate-400">Sem Foto Cadastrada</span>
            </div>
          )}

          {/* Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

          {/* ICAO Badge Top Left */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-sky-500 text-white shadow-xs">
              {aircraft.icaoCode}
            </span>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
              {aircraft.category}
            </span>
          </div>

          {/* Active Status Badge Top Right */}
          <div className="absolute top-3 right-3">
            <button
              onClick={() => onToggleActive(aircraft.id)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 backdrop-blur-md transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/90 text-white border border-emerald-400/30'
                  : 'bg-slate-800/90 text-slate-300 border border-slate-700'
              }`}
              title={isActive ? 'Clique para desativar' : 'Clique para ativar'}
            >
              {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 text-red-400" />}
              <span>{isActive ? 'Ativa' : 'Inativa'}</span>
            </button>
          </div>

          {/* Model Name & Manufacturer Bottom Left */}
          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider block">
              {aircraft.manufacturer}
            </span>
            <h3 className="text-base font-black text-white leading-tight drop-shadow-sm truncate">
              {aircraft.name}
            </h3>
          </div>
        </div>

        {/* Technical Specifications Grid */}
        <div className="p-4 space-y-3">
          {aircraft.description && (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-normal">
              {aircraft.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* Combustível Máximo */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Fuel className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Combustível</span>
                <span className="text-xs font-black text-slate-800 truncate block mt-0.5">
                  {aircraft.maxFuelGallons ? `${aircraft.maxFuelGallons.toLocaleString('pt-BR')} gal` : 'N/I'}
                </span>
              </div>
            </div>

            {/* Passageiros */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Passageiros</span>
                <span className="text-xs font-black text-slate-800 truncate block mt-0.5">
                  {aircraft.passengerCapacity} pax
                </span>
              </div>
            </div>

            {/* Peso Vazio OEW */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-500/10 text-slate-600 flex items-center justify-center shrink-0">
                <Weight className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Peso Vazio (OEW)</span>
                <span className="text-xs font-black text-slate-800 truncate block mt-0.5">
                  {aircraft.oewKg ? `${aircraft.oewKg.toLocaleString('pt-BR')} kg` : 'N/I'}
                </span>
              </div>
            </div>

            {/* MTOW */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                <Plane className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">MTOW Decolagem</span>
                <span className="text-xs font-black text-slate-800 truncate block mt-0.5">
                  {aircraft.mtowKg ? `${aircraft.mtowKg.toLocaleString('pt-BR')} kg` : 'N/I'}
                </span>
              </div>
            </div>
          </div>

          {/* Max Payload Badge */}
          <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-sky-800 uppercase flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-sky-600" />
              Carga Útil Máxima (Max Payload):
            </span>
            <span className="font-black text-sky-900">
              {aircraft.maxPayloadKg ? `${aircraft.maxPayloadKg.toLocaleString('pt-BR')} kg` : 'N/I'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {aircraft.cruisingSpeedKts && (
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-sky-500" />
              {aircraft.cruisingSpeedKts} kts
            </span>
          )}
          {aircraft.rangeNm && (
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-indigo-500" />
              {aircraft.rangeNm} NM
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(aircraft)}
            className="p-2 text-slate-600 hover:text-sky-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
            title="Editar Aeronave"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Tem certeza que deseja excluir a aeronave ${aircraft.name}?`)) {
                onDelete(aircraft.id);
              }
            }}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Excluir Aeronave"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
