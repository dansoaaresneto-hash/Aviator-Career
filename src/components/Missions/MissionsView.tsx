import React, { useState } from 'react';
import { usePilot } from '../../context/PilotContext';
import { MissionFilters } from './MissionFilters';
import { MissionCard } from './MissionCard';
import { MissionDetailModal } from './MissionDetailModal';
import { FerryMissionModal } from './FerryMissionModal';
import { Contract } from '../../types';
import { PlaneTakeoff, SearchX, Building2, Loader2 } from 'lucide-react';

export const MissionsView: React.FC = () => {
  const {
    contracts,
    filterType,
    searchQuery,
    selectedContractForPreview,
    setSelectedContractForPreview,
    setActiveTab,
    airportsLoading,
  } = usePilot();

  // Filter contracts based on tab and search term
  const filteredContracts = contracts.filter((contract) => {
    // Filter by type tab
    if (filterType !== 'all' && contract.type !== filterType) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchIcao =
        contract.route.departureIcao.toLowerCase().includes(q) ||
        contract.route.arrivalIcao.toLowerCase().includes(q);
      const matchCity =
        contract.route.departureCity.toLowerCase().includes(q) ||
        contract.route.arrivalCity.toLowerCase().includes(q);
      const matchAircraft = contract.requiredAircraft.toLowerCase().includes(q);
      const matchTitle = contract.title.toLowerCase().includes(q);
      const matchCompany = contract.company.name.toLowerCase().includes(q);

      return matchIcao || matchCity || matchAircraft || matchTitle || matchCompany;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <PlaneTakeoff className="w-6 h-6 text-sky-500" />
            Quadro de Missões & Contratos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Missões geradas dinamicamente com base nas regras das empresas ativas no painel Admin.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('admin-companies')}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Building2 className="w-4 h-4" />
          <span>Gerenciar Empresas (Admin)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <MissionFilters />

      {/* Contracts Grid */}
      {filteredContracts.length === 0 && airportsLoading ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200/90 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Carregando base de aeroportos...</h3>
          <p className="text-xs text-slate-500 mt-1">
            Buscando aeroportos reais para gerar os contratos disponíveis.
          </p>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200/90 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum contrato encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tente mudar o filtro de busca ou a categoria de missão selecionada.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredContracts.map((contract) => (
            <MissionCard
              key={contract.id}
              contract={contract}
              onSelect={(c) => setSelectedContractForPreview(c)}
            />
          ))}
        </div>
      )}

      {/* Contract Detail Briefing Modal */}
      {selectedContractForPreview &&
      selectedContractForPreview.type === 'ferry' &&
      (Boolean(selectedContractForPreview.ferryDossier) ||
        (selectedContractForPreview.route.departureCountry &&
          selectedContractForPreview.route.arrivalCountry &&
          selectedContractForPreview.route.departureCountry !== selectedContractForPreview.route.arrivalCountry) ||
        selectedContractForPreview.aircraftCategory?.toLowerCase().includes('internacional') ||
        selectedContractForPreview.title?.toLowerCase().includes('translado internacional')) ? (
        <FerryMissionModal
          contract={selectedContractForPreview}
          onClose={() => setSelectedContractForPreview(null)}
        />
      ) : selectedContractForPreview ? (
        <MissionDetailModal
          contract={selectedContractForPreview}
          onClose={() => setSelectedContractForPreview(null)}
        />
      ) : null}
    </div>
  );
};
