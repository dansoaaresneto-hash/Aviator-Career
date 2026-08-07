import React, { useState, useMemo } from 'react';
import { usePilot } from '../../context/PilotContext';
import { AircraftModel } from '../../types';
import { AircraftCard } from './AircraftCard';
import { AircraftModal } from './AircraftModal';
import {
  Plane,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Users,
  Fuel,
  Weight,
  Package,
  Layers,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export const AdminAircraftsView: React.FC = () => {
  const { adminAircrafts, saveAircraft, deleteAircraft, toggleAircraftActive } = usePilot();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<AircraftModel | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    adminAircrafts.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [adminAircrafts]);

  // Filtered aircrafts
  const filteredAircrafts = useMemo(() => {
    return adminAircrafts.filter((aircraft) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = aircraft.name.toLowerCase().includes(query);
        const matchesIcao = aircraft.icaoCode?.toLowerCase().includes(query);
        const matchesManufacturer = aircraft.manufacturer.toLowerCase().includes(query);
        const matchesCategory = aircraft.category.toLowerCase().includes(query);
        if (!matchesName && !matchesIcao && !matchesManufacturer && !matchesCategory) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && aircraft.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'active' && aircraft.isActive === false) return false;
      if (selectedStatus === 'inactive' && aircraft.isActive !== false) return false;

      return true;
    });
  }, [adminAircrafts, searchQuery, selectedCategory, selectedStatus]);

  // Metrics calculation
  const totalCount = adminAircrafts.length;
  const activeCount = adminAircrafts.filter((a) => a.isActive !== false).length;
  const totalPaxCapacity = adminAircrafts.reduce((sum, a) => sum + (a.passengerCapacity || 0), 0);
  const totalPayloadCapacityKg = adminAircrafts.reduce((sum, a) => sum + (a.maxPayloadKg || 0), 0);

  const handleOpenAddModal = () => {
    setEditingAircraft(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (aircraft: AircraftModel) => {
    setEditingAircraft(aircraft);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Plane className="w-6 h-6 text-sky-500" />
            Gestão & Cadastro de Aeronaves
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre modelos de aviões, defina capacidade de passageiros, pesos (OEW/MTOW), carga útil e fotos.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Aeronave</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Aeronaves */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Frota</span>
            <span className="text-lg font-black text-slate-800">{totalCount} modelos</span>
          </div>
        </div>

        {/* Aeronaves Ativas */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ativas</span>
            <span className="text-lg font-black text-slate-800">{activeCount} ativas</span>
          </div>
        </div>

        {/* Capacidade Total Pax */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Capacidade Pax</span>
            <span className="text-lg font-black text-slate-800">{totalPaxCapacity.toLocaleString('pt-BR')} pax</span>
          </div>
        </div>

        {/* Carga Útil Total */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carga Útil Total</span>
            <span className="text-lg font-black text-slate-800">{totalPayloadCapacityKg.toLocaleString('pt-BR')} kg</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por modelo, ICAO, fabricante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-white text-slate-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                selectedStatus === 'active'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ativas
            </button>
            <button
              onClick={() => setSelectedStatus('inactive')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                selectedStatus === 'inactive'
                  ? 'bg-white text-slate-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Inativas
            </button>
          </div>
        </div>
      </div>

      {/* Aircraft Cards Grid */}
      {filteredAircrafts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAircrafts.map((aircraft) => (
            <AircraftCard
              key={aircraft.id}
              aircraft={aircraft}
              onEdit={handleOpenEditModal}
              onDelete={deleteAircraft}
              onToggleActive={toggleAircraftActive}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Plane className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">Nenhuma aeronave encontrada</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Nenhuma aeronave corresponde aos seus filtros de busca atuais. Tente ajustar a busca ou cadastrar um novo modelo.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="mt-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AircraftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveAircraft}
        editingAircraft={editingAircraft}
      />
    </div>
  );
};
