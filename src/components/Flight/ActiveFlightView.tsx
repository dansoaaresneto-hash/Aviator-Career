import React, { useState, useEffect } from 'react';
import { usePilot } from '../../context/PilotContext';
import { FlightTelemetryHeader } from './FlightTelemetryHeader';
import { ContractSummaryCard } from './ContractSummaryCard';
import { FlightOperationView, OperationTabId } from './FlightOperationView';
import { FlightDebriefModal } from './FlightDebriefModal';
import { MissionValidationBanner } from './MissionValidationBanner';
import { ConnectorDownloadModal } from './ConnectorDownloadModal';
import { Plane, MapPin } from 'lucide-react';

export const ActiveFlightView: React.FC = () => {
  const { activeContract, flightPhase, currentLocationIcao } = usePilot();
  const [showDebrief, setShowDebrief] = useState(false);
  const [activeTab, setActiveTab] = useState<OperationTabId>('planner');

  // Abre automaticamente o modal de debrief ao pousar
  useEffect(() => {
    if (flightPhase === 'landed') {
      setShowDebrief(true);
    }
  }, [flightPhase]);

  if (!activeContract) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-sm max-w-lg mx-auto mt-8">
        <Plane className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-800">Nenhum Voo Ativo</h3>
        <p className="text-xs text-slate-500 mt-1">
          Você não aceitou nenhum contrato no momento. Acesse a guia de Missões para selecionar um voo.
        </p>
      </div>
    );
  }

  const hasIntermediateStop =
    currentLocationIcao && currentLocationIcao !== activeContract.route.departureIcao;

  return (
    <div className="space-y-5">
      {/* SHAPE SUPERIOR AZUL/DARK SLATE (#0F172B): Progresso, Rota e Telemetria */}
      <FlightTelemetryHeader contract={activeContract} />

      {/* Pre-Flight Validation Banner (se houver pendências de documentação) */}
      <MissionValidationBanner />

      {/* Alerta de Escala Intermediária se a aeronave pousou em trânsito */}
      {hasIntermediateStop && flightPhase !== 'landed' && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sky-950 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <h4 className="text-xs font-extrabold">
                Aeronave Pousada em Escala / Port of Entry: {currentLocationIcao}
              </h4>
            </div>
            <span className="text-[10px] font-bold bg-sky-200/60 text-sky-900 px-2 py-0.5 rounded">
              Posição Salva
            </span>
          </div>
          <p className="text-xs text-sky-800 leading-relaxed">
            Para dar continuidade ao trajeto até {activeContract.route.arrivalIcao}, decole novamente deste aeroporto no simulador MSFS.
          </p>
        </div>
      )}

      {/* 2 SHAPES CENTRAIS: ESQUERDA (Contrato & Checklist) | DIREITA (Mapa/Tablet de Operações) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* SHAPE ESQUERDO (Aprox 300px / 4 colunas): Informações da Missão e Checklist das Etapas */}
        <div className="lg:col-span-4 flex flex-col">
          <ContractSummaryCard
            contract={activeContract}
            activeView={activeTab}
            onSelectView={(view) => setActiveTab(view)}
            onOpenDebrief={() => setShowDebrief(true)}
          />
        </div>

        {/* SHAPE DIREITO (Aprox 640px / 8 colunas): Tablet/Mapa de Voo & Módulos Operacionais */}
        <div className="lg:col-span-8 flex flex-col">
          <FlightOperationView
            contract={activeContract}
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
          />
        </div>
      </div>

      {/* Flight Debrief Modal upon landing */}
      {showDebrief && <FlightDebriefModal onClose={() => setShowDebrief(false)} />}

      {/* Connector Download & Help Modal */}
      <ConnectorDownloadModal />
    </div>
  );
};