import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { usePilot } from '../../context/PilotContext';
import {
  Laptop,
  Radio,
  Download,
  Terminal,
  Copy,
  Check,
  Plane,
  Gauge,
  Navigation,
  Scale,
  Compass,
  Clock,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  FileCode,
  MapPin
} from 'lucide-react';

export const ConnectorView: React.FC = () => {
  const {
    telemetry,
    connectionStatus,
    userToken,
    regenerateToken,
    startVirtualSimulation,
    stopVirtualSimulation,
    validateContract,
  } = useTelemetry();

  const { activeContract, setActiveTab } = usePilot();
  const [copiedToken, setCopiedToken] = useState(false);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(userToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleDownloadExe = () => {
    window.location.href = '/downloads/AviatorConnector.exe';
  };

  const handleDownloadBat = () => {
    window.location.href = `/api/connector/bat?token=${encodeURIComponent(userToken)}`;
  };

  const handleDownloadScript = () => {
    window.location.href = `/api/connector/script?token=${encodeURIComponent(userToken)}`;
  };

  const activeValidation = activeContract ? validateContract(activeContract) : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-700/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-400/30">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Sincronizador SimConnect
              </span>
              {connectionStatus === 'connected' && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700 px-2.5 py-0.5 rounded">
                  🟢 MSFS 2020/2024 Conectado
                </span>
              )}
              {connectionStatus === 'simulated' && (
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-700 px-2.5 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Simulador Virtual Ativo
                </span>
              )}
              {connectionStatus === 'disconnected' && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded">
                  🔴 Desconectado
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white">
              Conexão com Microsoft Flight Simulator
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              O conector local sincroniza a localização do seu avião (ICAO), o modelo e o peso de carga do MSFS diretamente com o Aviator em tempo real.
            </p>
          </div>

          {/* Token PIN Card */}
          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 flex flex-col justify-between shrink-0 min-w-[240px]">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Seu Token PIN de Conexão</span>
            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="text-xl font-black font-mono text-amber-400 tracking-wider">{userToken}</span>
              <button
                onClick={handleCopyToken}
                className="p-2 text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Copiar Token"
              >
                {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={regenerateToken}
              className="text-[10px] text-slate-400 hover:text-slate-200 mt-2 text-left underline cursor-pointer"
            >
              Gerar novo Token PIN
            </button>
          </div>
        </div>

        {/* Live Telemetry Instruments Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 text-center">
            <MapPin className="w-4 h-4 text-sky-400 mx-auto mb-1" />
            <span className="text-[9px] font-bold text-slate-400 uppercase">Aeroporto Atual</span>
            <p className="text-lg font-black font-mono text-white mt-0.5">
              {telemetry.airportIcao || '---'}
            </p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 text-center">
            <Plane className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <span className="text-[9px] font-bold text-slate-400 uppercase">Aeronave no MSFS</span>
            <p className="text-xs font-bold font-mono text-white mt-1 truncate" title={telemetry.aircraftTitle}>
              {telemetry.aircraftTitle || '---'}
            </p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 text-center">
            <Scale className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[9px] font-bold text-slate-400 uppercase">Peso de Carga</span>
            <p className="text-lg font-black font-mono text-white mt-0.5">
              {telemetry.payloadKg} <span className="text-xs text-slate-400">kg</span>
            </p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 text-center">
            <Gauge className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[9px] font-bold text-slate-400 uppercase">Velocidade (IAS)</span>
            <p className="text-lg font-black font-mono text-white mt-0.5">
              {telemetry.groundSpeedKts} <span className="text-xs text-slate-400">kts</span>
            </p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 text-center col-span-2 sm:col-span-1">
            <Navigation className="w-4 h-4 text-sky-400 mx-auto mb-1" />
            <span className="text-[9px] font-bold text-slate-400 uppercase">Altitude</span>
            <p className="text-lg font-black font-mono text-white mt-0.5">
              {telemetry.altitudeFt.toLocaleString()} <span className="text-xs text-slate-400">ft</span>
            </p>
          </div>
        </div>
      </div>

      {/* Active Contract Validation Card if flight is active */}
      {activeContract && activeValidation && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded border border-sky-200">
                Missão Ativa
              </span>
              <h3 className="text-base font-black text-slate-800 mt-1">{activeContract.title}</h3>
            </div>
            <button
              onClick={() => setActiveTab('active-flight')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3.5 py-2 rounded-lg border border-sky-200 transition-all cursor-pointer"
            >
              Ir para Painel do Voo
            </button>
          </div>

          <div
            className={`p-3.5 rounded-lg border text-xs font-medium flex items-center gap-2.5 ${
              activeValidation.overallStatus === 'approved'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : activeValidation.overallStatus === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            {activeValidation.overallStatus === 'approved' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {activeValidation.overallStatus === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
            {activeValidation.overallStatus === 'rejected' && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
            <span>{activeValidation.summaryText}</span>
          </div>
        </div>
      )}

      {/* Download Section & Setup Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Downloads */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-800">Opções de Download do Conector</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Baixe e execute o conector no seu computador para vincular o simulador ao aplicativo.
                </p>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Executable EXE */}
              <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                      Executável Direto
                    </span>
                    <Laptop className="w-5 h-5 text-sky-400" />
                  </div>
                  <h4 className="font-bold text-sm">AviatorConnector.exe</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Executável nativo sem necessidade de instalar o Python. Dê duplo clique e cole seu Token PIN.
                  </p>
                </div>

                <a
                  href="/downloads/AviatorConnector.exe"
                  download
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar AviatorConnector.exe</span>
                </a>
              </div>

              {/* Option 2: BAT Launcher */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      Script Windows
                    </span>
                    <Terminal className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">Iniciar_Conector.bat</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Instalador e iniciador automático para Windows. Instala bibliotecas do SimConnect e conecta.
                  </p>
                </div>

                <button
                  onClick={handleDownloadBat}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar .bat</span>
                </button>
              </div>

              {/* Option 3: PY Script */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                      Código Python
                    </span>
                    <FileCode className="w-5 h-5 text-sky-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">AviatorConnector.py</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Script Python customizado com seu Token ({userToken}) para quem já possui Python 3.
                  </p>
                </div>

                <button
                  onClick={handleDownloadScript}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar .py</span>
                </button>
              </div>
            </div>

            {/* Test in Browser */}
            <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-indigo-950">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <h5 className="font-extrabold">Quer testar sem baixar nada agora?</h5>
                  <p className="text-indigo-800 mt-0.5">
                    Ative o Simulador Virtual para simular o recebimento de dados do MSFS diretamente no navegador.
                  </p>
                </div>
              </div>

              {connectionStatus !== 'simulated' ? (
                <button
                  onClick={() =>
                    startVirtualSimulation({
                      airport: 'SBGR',
                      aircraft: 'Cessna 172 Skyhawk G1000',
                      payloadKg: 380,
                    })
                  }
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Ativar Teste Virtual</span>
                </button>
              ) : (
                <button
                  onClick={stopVirtualSimulation}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Desativar Teste Virtual</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: FAQ & Help */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
            Perguntas Frequentes & Ajuda
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <h4 className="font-bold text-slate-800">O que o aplicativo valida?</h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                1. <strong>Aeroporto:</strong> Se você está no ICAO de origem correto.<br />
                2. <strong>Aeronave:</strong> Se o modelo do avião condiz com a missão.<br />
                3. <strong>Peso:</strong> Se o combustível e carga no MSFS batem com o contrato.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <h4 className="font-bold text-slate-800">Preciso de licença do MSFS?</h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                O conector é compatível com o MSFS 2020, MSFS 2024 e qualquer versão com SimConnect padrão habilitado.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <h4 className="font-bold text-slate-800">Não sei usar o Python, e agora?</h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Não se preocupe! Basta baixar o arquivo <strong>Iniciar_Conector.bat</strong> acima. Ele instala o Python e configura tudo para você automaticamente sem precisar digitar comandos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
