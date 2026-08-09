import React from 'react';
import { usePilot } from '../../context/PilotContext';
import { StatCard } from './StatCard';
import {
  Coins,
  Clock,
  CheckCircle2,
  Award,
  PlaneTakeoff,
  Package,
  Users,
  Plane,
  ArrowRight,
  TrendingUp,
  Compass,
  Sparkles,
  FastForward
} from 'lucide-react';

export const Overview: React.FC = () => {
  const { profile, contracts, setActiveTab, setFilterType, activeContract, logbook, adminAdvanceFlightLeg } = usePilot();

  const cargoCount = contracts.filter((c) => c.type === 'cargo').length;
  const paxCount = contracts.filter((c) => c.type === 'passenger').length;
  const ferryCount = contracts.filter((c) => c.type === 'ferry').length;

  const handleSelectCategory = (type: 'cargo' | 'passenger' | 'ferry') => {
    setFilterType(type);
    setActiveTab('missions');
  };

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas / Ação "Começar um Voo" */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-xl p-6 sm:p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Bem-vindo ao Aviator Career Mode</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Pronto para decolar, Comandante {profile.name.split(' ')[0]}?
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Você começa com <strong className="text-amber-400">0 Créditos</strong> e licença de{' '}
            <span className="text-sky-300 font-semibold">{profile.title}</span>. Selecione contratos de transporte de cargas, passageiros ou translados de aeronaves para construir seu patrimônio e evoluir na aviação.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {!activeContract ? (
              <button
                onClick={() => setActiveTab('missions')}
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2.5 rounded-lg shadow-sm transition-all text-xs cursor-pointer"
              >
                <PlaneTakeoff className="w-4 h-4" />
                <span>Começar um Voo agora</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab('active-flight')}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-lg shadow-sm transition-all text-xs animate-pulse cursor-pointer"
                >
                  <Plane className="w-4 h-4" />
                  <span>Continuar Voo Ativo ({activeContract.route.departureIcao} ➔ {activeContract.route.arrivalIcao})</span>
                </button>

                <button
                  onClick={adminAdvanceFlightLeg}
                  className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black px-3.5 py-2.5 rounded-lg shadow-sm transition-all text-xs cursor-pointer border border-amber-400"
                  title="Avançar para a próxima etapa/perna do voo sem precisar voar no MSFS"
                >
                  <FastForward className="w-4 h-4 fill-current" />
                  <span>Avançar Perna [Admin]</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setActiveTab('fleet')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-4 py-2.5 rounded-lg backdrop-blur-sm border border-white/10 transition-all text-xs cursor-pointer"
            >
              <span>Ver Garagem de Aeronaves</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Estatísticas Principais */}
      <div className="grid grid-[#1e293b] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo de Créditos"
          value={`${profile.credits.toLocaleString('pt-BR')} CR`}
          subtitle="Capital inicial zerado"
          icon={<Coins className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-100/80"
          badgeText="Moeda"
        />

        <StatCard
          title="Horas de Voo"
          value={`${profile.totalFlightHours} h`}
          subtitle="Tempo total registrado em simulação"
          icon={<Clock className="w-5 h-5 text-sky-600" />}
          iconBgColor="bg-sky-100/80"
          badgeText="Logbook"
        />

        <StatCard
          title="Voos Concluídos"
          value={profile.completedFlights}
          subtitle="Contratos entregues com sucesso"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-100/80"
          badgeText="Status"
        />

        <StatCard
          title="Nível de Licença"
          value={`Nível ${profile.level}`}
          subtitle={profile.title}
          icon={<Award className="w-5 h-5 text-indigo-600" />}
          iconBgColor="bg-indigo-100/80"
          badgeText="Carreira"
        />
      </div>

      {/* Tipos de Missões Disponíveis (Categorias principais) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tipos de Missões Disponíveis</h3>
            <p className="text-xs text-slate-500">Escolha o segmento de voo que deseja operar hoje</p>
          </div>
          <button
            onClick={() => {
              setFilterType('all');
              setActiveTab('missions');
            }}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            Ver todos os {contracts.length} contratos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Carga Card */}
          <div
            onClick={() => handleSelectCategory('cargo')}
            className="group bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                {cargoCount} Disponíveis
              </span>
            </div>

            <h4 className="text-base font-extrabold text-slate-800 group-hover:text-amber-700 transition-colors">
              Transporte de Cargas
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Insumos médicos, encomendas expressas, peças industriais e suprimentos urgentes.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>Explorar fretes de carga</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Passageiros Card */}
          <div
            onClick={() => handleSelectCategory('passenger')}
            className="group bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:border-sky-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                {paxCount} Disponíveis
              </span>
            </div>

            <h4 className="text-base font-extrabold text-slate-800 group-hover:text-sky-700 transition-colors">
              Transporte de Passageiros
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Charters VIP, voos regionais, equipes de especialistas e turismo de luxo.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
              <span>Explorar voos de passageiros</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Translados Card */}
          <div
            onClick={() => handleSelectCategory('ferry')}
            className="group bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Plane className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {ferryCount} Disponíveis
              </span>
            </div>

            <h4 className="text-base font-extrabold text-slate-800 group-hover:text-emerald-700 transition-colors">
              Translados de Aeronaves
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Reposicionamento de frota para manutenção, entregas de fábrica e hangaragem.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Explorar voos de translado</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Histórico Recente e Progresso do Piloto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progresso de Licenças / Carreira */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              Progressão de Licenças
            </h3>
            <span className="text-xs font-bold text-sky-600">{profile.xp} XP acumulados</span>
          </div>

          <div className="space-y-3">
            {/* Step 1: Piloto Aluno */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-sky-50/70 border border-sky-100">
              <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-sky-900">Piloto Aluno</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Atual</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">Liberado para voos VFR e monomotores leves em curtas distâncias.</p>
              </div>
            </div>

            {/* Step 2: Piloto Privado (PPL) */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 opacity-80">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Piloto Privado (PPL)</span>
                  <span className="text-[10px] font-semibold text-slate-500">A partir do Nível 2</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Libera bimotores a pistão e voos noturnos.</p>
              </div>
            </div>

            {/* Step 3: Piloto Comercial (CPL) */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 opacity-60">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Piloto Comercial (CPL)</span>
                  <span className="text-[10px] font-semibold text-slate-500">A partir do Nível 3</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Libera turboélices pesados e voos de passageiros executivos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Últimos Voos Registrados */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-500" />
                Histórico de Voos Recentes
              </h3>
              <p className="text-xs text-slate-500">Registros no seu Diário de Bordo oficial</p>
            </div>

            {logbook.length > 0 && (
              <button
                onClick={() => setActiveTab('logbook')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                Ver histórico completo
              </button>
            )}
          </div>

          {logbook.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200/70 rounded-xl bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <PlaneTakeoff className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Nenhum voo realizado ainda</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Você começou sua carreira de piloto com 0 Créditos. Aceite seu primeiro contrato de voo para registrar sua primeira entrada no Diário de Bordo!
              </p>
              <button
                onClick={() => setActiveTab('missions')}
                className="mt-4 bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all shadow-sm cursor-pointer"
              >
                Escolher Primeiro Contrato
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {logbook.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {log.departureIcao}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{log.title}</h5>
                      <p className="text-[11px] text-slate-500">
                        {log.departureIcao} ➔ {log.arrivalIcao} • {log.distanceNm} NM • {log.aircraft}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-600">
                      +{log.earnedCredits.toLocaleString('pt-BR')} CR
                    </span>
                    <p className="text-[10px] text-slate-400">+{log.earnedXp} XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
