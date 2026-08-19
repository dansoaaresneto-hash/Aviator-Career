import React, { useState } from 'react';
import {
  Contract,
  FerryDossier,
  TechnicalStopDeclaration,
  AirportSample,
  AircraftModel,
} from '../../../types';
import { usePilot } from '../../../context/PilotContext';
import { AirportSearchSelect } from '../../Common/AirportSearchSelect';
import {
  MapPin,
  Plus,
  Trash2,
  Globe,
  AlertCircle,
  FileCheck,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Sparkles,
  PlaneTakeoff,
  Clock,
  Radio,
} from 'lucide-react';

interface TechnicalStopsSectionProps {
  contract: Contract;
  dossier?: FerryDossier;
}

export const TechnicalStopsSection: React.FC<TechnicalStopsSectionProps> = ({ contract, dossier }) => {
  const {
    airportPool,
    adminAircrafts,
    ferryRoutePlans,
    updateFerryTechnicalStops,
    requestPortOfEntry,
    requestOverflightPermits,
    getFerryRoutePlan,
    requiredDocuments,
    submittedDocuments,
    currentLocationIcao,
    flightPhase,
  } = usePilot();

  const plan = getFerryRoutePlan(contract.id);
  const stops = plan.technicalStops || [];
  const permits = plan.permits || [];

  // O Staging Airport só é conhecido depois que o Manifesto (eAPIS) é aprovado.
  const manifestDoc = requiredDocuments.find((d) => d.code === 'EAPIS_MANIFEST');
  const isStagingKnown = manifestDoc
    ? submittedDocuments.some(
        (s) => s.contractId === contract.id && s.documentId === manifestDoc.id && s.status === 'approved'
      )
    : false;

  // O piloto está fisicamente posicionado no Staging Airport (Port of Exit)
  const isAtStagingAirport =
    isStagingKnown &&
    ((!!currentLocationIcao && currentLocationIcao === plan.stagingAirportIcao) ||
      (plan.stagingAirportIcao === contract.route.departureIcao && (flightPhase === 'briefing' || flightPhase === 'taxi')));

  // O Port of Entry é conhecido se foi solicitado pelo piloto no Staging Airport,
  // ou se os permits já foram emitidos, ou se a aeronave já avançou além do Staging Airport
  const isPoeKnown = Boolean(
    plan.isPoeRequested ||
    plan.isClearedForDeparture ||
    permits.length > 0 ||
    currentLocationIcao === plan.portOfEntryIcao ||
    currentLocationIcao === contract.route.arrivalIcao
  );

  // Busca dados da aeronave para autonomia
  const aircraftInfo: AircraftModel | undefined = adminAircrafts.find(
    (a) => a.name.toLowerCase() === contract.requiredAircraft.toLowerCase()
  );
  const aircraftRangeNm = aircraftInfo?.rangeNm || 850;
  const routeDistanceNm = contract.route.distanceNm || 3200;
  const requiresStops = routeDistanceNm > aircraftRangeNm;
  const estimatedStopsRecommended = Math.ceil(routeDistanceNm / (aircraftRangeNm * 0.8)) - 1;

  // Estado local para adicionar nova parada e requisições
  const [selectedIcao, setSelectedIcao] = useState('');
  const [purpose, setPurpose] = useState<'refuel' | 'crew_rest' | 'both'>('refuel');
  const [etaUtc, setEtaUtc] = useState('14:30Z');
  const [stayHours, setStayHours] = useState(2);
  const [isRequestingPoe, setIsRequestingPoe] = useState(false);
  const [isSubmittingPermits, setIsSubmittingPermits] = useState(false);

  // Lista de aeroportos internacionais para sugestão de escala baseados no airportPool e POEs
  const suggestedAirports = airportPool.filter(
    (ap) =>
      ap.isPortOfEntry ||
      ['MYNN', 'TTPP', 'TIST', 'TNCM', 'SOCA', 'SYCJ', 'SVMI', 'SBEG', 'SBSG', 'KMIA', 'KFLL', 'LPPT', 'GVAC', 'SKBO', 'MPTO'].includes(
        ap.icao
      )
  );

  const handleAddStop = () => {
    if (!selectedIcao || !isPoeKnown) return;
    const ap = airportPool.find((a) => a.icao === selectedIcao);
    const newStop: TechnicalStopDeclaration = {
      id: `stop_${Date.now()}`,
      icao: selectedIcao,
      name: ap ? ap.name : selectedIcao,
      country: ap ? ap.country : 'INTL',
      purpose,
      etaUtc,
      stayDurationHours: Number(stayHours) || 2,
    };

    updateFerryTechnicalStops(contract.id, [...stops, newStop]);
    setSelectedIcao('');
  };

  const handleRemoveStop = (id: string) => {
    if (!isPoeKnown) return;
    updateFerryTechnicalStops(
      contract.id,
      stops.filter((s) => s.id !== id)
    );
  };

  const handleRequestPoe = async () => {
    setIsRequestingPoe(true);
    await requestPortOfEntry(contract.id);
    setIsRequestingPoe(false);
  };

  const handleRequestPermits = async () => {
    setIsSubmittingPermits(true);
    await requestOverflightPermits(contract.id);
    setIsSubmittingPermits(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Range Assessment */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Planejamento de Escalas & Autorizações Internacionais
              </h3>
              <p className="text-xs text-slate-500">
                Port of Exit (Staging) ➔ Escalas Técnicas Homologadas ➔ Port of Entry Aduaneiro (POE)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono">
              Autonomia: {aircraftRangeNm} NM
            </span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-sky-100 text-sky-800 font-mono">
              Distância: {routeDistanceNm} NM
            </span>
          </div>
        </div>

        {/* Staging Airport & Port of Entry Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Staging Airport (Port of Exit) Card */}
          {isStagingKnown ? (
            <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
              isAtStagingAirport ? 'bg-sky-50/80 border-sky-300 ring-1 ring-sky-300/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
                  <PlaneTakeoff className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 font-mono">
                      Staging Airport de Saída (Port of Exit)
                    </span>
                    {isAtStagingAirport && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono uppercase">
                        Aeronave em Solo
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 font-mono text-sm">
                    {plan.stagingAirportIcao} — {plan.stagingAirportName}
                  </h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Último pouso no país de origem para encerramento aduaneiro e inspeção antes de deixar o espaço aéreo doméstico.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-sky-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Status de Posição:</span>
                <span className={`font-bold font-mono ${isAtStagingAirport ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isAtStagingAirport ? `✓ Pousado em ${plan.stagingAirportIcao}` : `Local atual: ${currentLocationIcao || 'A caminho'}`}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 border-dashed flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                  Staging Airport de Saída (Port of Exit)
                </span>
                <h4 className="font-bold text-slate-500 text-sm">A Definir via eAPIS</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Transmita e aguarde a aprovação do Manifesto de Saída Internacional na aba "Despacho & eAPIS" para determinar o Staging Airport.
                </p>
              </div>
            </div>
          )}

          {/* Port of Entry (POE) Card */}
          {isPoeKnown ? (
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300 ring-1 ring-emerald-300/60 flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 font-mono">
                      Port of Entry de Entrada Obrigatória (POE)
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono uppercase">
                      Confirmado
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 font-mono text-sm">
                    {plan.portOfEntryIcao} — {plan.portOfEntryName}
                  </h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Primeiro ponto de toque obrigatório no país de destino para desembaraço aduaneiro (DI/Receita Federal e Vistoria RAB/ANAC).
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px]">
                <span className="text-emerald-800 font-medium">Designação Oficial:</span>
                <span className="text-emerald-700 font-bold font-mono">
                  {plan.portOfEntryCity ? `${plan.portOfEntryCity}, ` : ''}{plan.destinationIcao ? 'País de Destino' : ''}
                </span>
              </div>
            </div>
          ) : isAtStagingAirport ? (
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-sky-50 border border-amber-300 ring-1 ring-amber-300/60 flex flex-col justify-between gap-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Radio className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 font-mono">
                      Port of Entry de Entrada Obrigatória (POE)
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white font-mono uppercase">
                      Pronto p/ Solicitar
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Aeronave Pousada no Port of Exit ({plan.stagingAirportIcao})
                  </h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Você está em solo no Staging Airport. Solicite a designação oficial do Port of Entry para liberar a declaração de escalas técnicas e emissão dos Permits.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestPoe}
                disabled={isRequestingPoe}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isRequestingPoe ? 'Designando Port of Entry...' : '📍 Solicitar Port of Entry de Destino'}</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 border-dashed flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                  Port of Entry de Entrada Obrigatória (POE)
                </span>
                <h4 className="font-bold text-slate-500 text-sm">Desconhecido</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {isStagingKnown
                    ? `Pouse no Staging Airport (${plan.stagingAirportIcao}) para desbloquear o botão "Solicitar Port of Entry" e declarar escalas técnicas.`
                    : 'Aguarde a designação do Staging Airport via Manifesto eAPIS.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Autonomy Recommendation Banner */}
        {requiresStops && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <span className="font-extrabold block">Alerta de Autonomia de Voo:</span>
              <p className="text-amber-800 mt-0.5">
                A distância total da rota ({routeDistanceNm} NM) ultrapassa a autonomia da aeronave ({aircraftRangeNm} NM). 
                É necessário declarar pelo menos <strong>{Math.max(1, estimatedStopsRecommended)} escala(s) de reabastecimento</strong> para emissão dos permits.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Technical Stops Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Form to declare stops */}
        <div className={`lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-4 relative ${
          !isPoeKnown ? 'opacity-90' : ''
        }`}>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-500" />
              <h4 className="text-sm font-bold text-slate-900">Adicionar Escala Técnica / Descanso</h4>
            </div>
            {!isPoeKnown && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 flex items-center gap-1 border border-slate-200">
                <Lock className="w-3 h-3 text-slate-400" /> BLOQUEADO
              </span>
            )}
          </div>

          {!isPoeKnown ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-600 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Declaração de Escalas Bloqueada</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                A opção de declarar escalas técnicas só fica liberada quando a aeronave estiver no Port of Exit ({plan.stagingAirportIcao || 'Staging Airport'}) e o <strong>Port of Entry</strong> de destino tiver sido solicitado e homologado.
              </p>
              <div className="pt-2 border-t border-slate-200 text-[11px]">
                <strong className="text-slate-700">Ação necessária: </strong>
                {!isStagingKnown ? (
                  <span className="text-sky-700">Aprovar o Manifesto na aba "Despacho & eAPIS"</span>
                ) : !isAtStagingAirport ? (
                  <span className="text-amber-700">Voar e pousar no Port of Exit ({plan.stagingAirportIcao})</span>
                ) : (
                  <span className="text-sky-700">Clicar em "Solicitar Port of Entry" no card acima</span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Aeroporto de Parada (ICAO / Nome / Cidade)
                </label>
                <AirportSearchSelect
                  value={selectedIcao}
                  onChange={(icao) => setSelectedIcao(icao)}
                  suggestedIcaos={['MYNN', 'TTPP', 'TIST', 'TNCM', 'SOCA', 'SYCJ', 'SVMI', 'SBEG', 'SBSG', 'KMIA', 'KFLL', 'LPPT', 'GVAC', 'SKBO', 'MPTO']}
                  placeholder="Digite o nome, ICAO ou cidade do aeroporto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Propósito
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="refuel">Reabastecimento</option>
                    <option value="crew_rest">Descanso do Piloto</option>
                    <option value="both">Reabastecimento & Pernoite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Tempo em Solo
                  </label>
                  <select
                    value={stayHours}
                    onChange={(e) => setStayHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value={1}>1 Hora (Rápido)</option>
                    <option value={2}>2 Horas (Padrão)</option>
                    <option value={6}>6 Horas (Descanso)</option>
                    <option value={12}>12 Horas (Pernoite)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Previsão de Chegada (ETA UTC)
                </label>
                <input
                  type="text"
                  value={etaUtc}
                  onChange={(e) => setEtaUtc(e.target.value)}
                  placeholder="Ex: 15:45Z / 18:00 UTC"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddStop}
                disabled={!selectedIcao}
                className="w-full mt-2 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Escala ao Plano</span>
              </button>
            </div>
          )}
        </div>

        {/* Declared stops list */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-bold text-slate-900">
                Escalas Declaradas no Trajeto ({stops.length})
              </h4>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded font-mono">
              Waypoints de Trânsito
            </span>
          </div>

          {stops.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 space-y-2">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">Nenhuma escala declarada ainda.</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                {isPoeKnown
                  ? 'Se sua aeronave precisa de reabastecimento ou descanso da tripulação, adicione as escalas no formulário ao lado.'
                  : 'Desbloqueie o Port of Entry para adicionar escalas técnicas.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-xs">{stop.icao}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                          {stop.purpose === 'refuel' ? 'Reabastecimento' : stop.purpose === 'crew_rest' ? 'Descanso' : 'Abastecimento & Pernoite'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">{stop.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-[10px] text-slate-500 font-mono">
                      <span className="block font-bold text-slate-700">ETA: {stop.etaUtc}</span>
                      <span>Solo: {stop.stayDurationHours}h</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStop(stop.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remover escala"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action to Request Exit Authorization / Overflight Permits */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              {permits.length > 0 ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Autorização de Saída do País concedida ({permits.length} permits ativos)
                </span>
              ) : !isStagingKnown ? (
                <span>Aguarde a aprovação do Manifesto para definir o Port of Exit.</span>
              ) : !isAtStagingAirport ? (
                <span>
                  Disponível somente com a aeronave pousada no Staging Airport ({plan.stagingAirportIcao}). Posição atual: {currentLocationIcao || 'em rota'}.
                </span>
              ) : !isPoeKnown ? (
                <span>Solicite o Port of Entry antes de emitir os permits.</span>
              ) : (
                <span>Aeronave em solo e POE homologado. Solicite a liberação de saída do país e permits.</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleRequestPermits}
              disabled={isSubmittingPermits || !isAtStagingAirport || !isPoeKnown}
              title={!isAtStagingAirport ? 'Pouse no Staging Airport para solicitar' : !isPoeKnown ? 'Solicite o Port of Entry primeiro' : undefined}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAtStagingAirport && isPoeKnown ? <FileCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{permits.length > 0 ? 'Atualizar / Reemitir Autorização' : 'Solicitar Autorização de Saída do País & Permits'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Overflight & Landing Permits Official Registry */}
      {permits.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-black text-slate-900">
                Autorizações Oficiais de Sobrevoo & Pouso (Overflight Permits)
              </h4>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-200">
              Aprovado pelos Órgãos Reguladores
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {permits.map((permit) => (
              <div
                key={permit.id}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-xs relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                    {permit.firCode}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> VÁLIDO
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{permit.countryName}</span>
                  <h5 className="font-bold text-slate-900 text-xs">{permit.authorityName}</h5>
                </div>

                <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px]">
                  <span className="text-[9px] text-slate-400 uppercase block font-sans">Código do Permit:</span>
                  <strong className="text-sky-700">{permit.permitNumber}</strong>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed italic">{permit.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
