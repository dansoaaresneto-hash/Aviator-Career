import React, { useState } from 'react';
import { usePilot } from '../../context/PilotContext';
import { AdminCompany } from '../../types';
import { CompanyCard } from './CompanyCard';
import { CompanyModal } from './CompanyModal';
import { AdminAircraftsView } from './AdminAircraftsView';
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  Globe,
  Award,
  CheckCircle2,
  ShieldCheck,
  PlaneTakeoff,
  Layers,
  Plane,
} from 'lucide-react';

export const AdminCompaniesView: React.FC = () => {
  const {
    adminCompanies,
    saveCompany,
    deleteCompany,
    toggleCompanyActive,
    regenerateMissions,
    contracts,
    adminAircrafts,
    airportsLoading,
    airportsCount,
    refreshAirportsDatabase,
  } = usePilot();

  const [activeAdminTab, setActiveAdminTab] = useState<'companies' | 'aircrafts'>('companies');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<AdminCompany | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSyncingAirports, setIsSyncingAirports] = useState(false);

  const handleCreateNew = () => {
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  const handleEdit = (company: AdminCompany) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    regenerateMissions();
    setTimeout(() => {
      setIsRegenerating(false);
    }, 600);
  };

  const handleSyncAirports = async () => {
    setIsSyncingAirports(true);
    await refreshAirportsDatabase();
    setIsSyncingAirports(false);
  };

  // Filter companies
  const filteredCompanies = adminCompanies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.icaoCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'active') return matchesSearch && company.isActive;
    if (filterStatus === 'inactive') return matchesSearch && !company.isActive;
    return matchesSearch;
  });

  const activeCount = adminCompanies.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Admin Sub-navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveAdminTab('companies')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === 'companies'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Empresas Fictícias</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeAdminTab === 'companies'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {adminCompanies.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('aircrafts')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === 'aircrafts'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Gestão de Aeronaves</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeAdminTab === 'aircrafts'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {adminAircrafts.length}
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 pr-2 text-slate-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-sky-500" />
          <span>Painel de Controle Admin</span>
        </div>
      </div>

      {activeAdminTab === 'aircrafts' ? (
        <AdminAircraftsView />
      ) : (
        <>
          {/* Top Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-400 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Painel de Administração do Sistema</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                  <Building2 className="w-7 h-7 text-sky-400" />
                  Gerenciamento de Empresas Fictícias
                </h1>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-normal">
                  Cadastre e gerencie empresas fictícias, configure seus logotipos, níveis mínimos exigidos de piloto, tipos de missão oferecidos e regras de atuação regional de rotas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={handleSyncAirports}
                  disabled={isSyncingAirports || airportsLoading}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  title="Rebusca a base de aeroportos no Supabase em lotes de 1000, ignorando o cache local de 24h"
                >
                  <Globe className={`w-4 h-4 text-emerald-400 ${isSyncingAirports || airportsLoading ? 'animate-spin' : ''}`} />
                  <span>Sincronizar Base de Aeroportos</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-black">
                    {airportsLoading ? '...' : `${airportsCount} ICAOs`}
                  </span>
                </button>

                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 text-sky-400 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>Regerar Missões Ativas</span>
                </button>

                <button
                  onClick={handleCreateNew}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>Cadastrar Nova Empresa</span>
                </button>
              </div>
            </div>
          </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Empresas Cadastradas</span>
            <span className="text-lg font-black text-slate-800">{adminCompanies.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Empresas Ativas</span>
            <span className="text-lg font-black text-emerald-700">{activeCount} de {adminCompanies.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <PlaneTakeoff className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Missões Geradas</span>
            <span className="text-lg font-black text-amber-700">{contracts.length} Contratos</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Motor de Rotas</span>
            <span className="text-lg font-black text-purple-700">Dinamico MSFS</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar empresa por nome ou ICAO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg w-full sm:w-auto text-xs font-bold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({adminCompanies.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ativas ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filterStatus === 'inactive'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inativas ({adminCompanies.length - activeCount})
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onEdit={handleEdit}
              onDelete={deleteCompany}
              onToggleActive={toggleCompanyActive}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm">
            Nenhuma empresa encontrada
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Nenhuma empresa atende aos critérios de busca selecionados. Clique abaixo para cadastrar uma nova empresa fictícia.
          </p>
          <button
            onClick={handleCreateNew}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Empresa</span>
          </button>
        </div>
      )}

      {/* Info Notice Box */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 border border-slate-700/80 space-y-2">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-sky-400" />
          Como Funciona o Gerador de Missões por Regras
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          As empresas cadastradas atuam como os contratantes do sistema. O gerador de voos analisa as empresas marcadas como <strong>Ativas</strong>, filtra seus <strong>Tipos de Missão</strong> habilitados (Traslados, Passageiros, Cargas) e aplica as restrições de <strong>Países e Regiões</strong> para gerar contratos realistas no simulador MSFS.
        </p>
      </div>

      {/* Modal Dialog */}
      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveCompany}
        editingCompany={editingCompany}
      />
        </>
      )}
    </div>
  );
};
