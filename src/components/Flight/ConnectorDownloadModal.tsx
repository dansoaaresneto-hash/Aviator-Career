import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import {
  X,
  Download,
  Terminal,
  Copy,
  Check,
  Radio,
  HelpCircle,
  Laptop,
  CheckCircle2,
  FileCode,
  ShieldCheck
} from 'lucide-react';

export const ConnectorDownloadModal: React.FC = () => {
  const {
    showConnectorModal,
    setShowConnectorModal,
    userToken,
    regenerateToken,
    connectionStatus,
    telemetry,
  } = useTelemetry();

  const [copiedToken, setCopiedToken] = useState(false);
  const [activeTab, setActiveTab] = useState<'download' | 'instructions'>('download');

  if (!showConnectorModal) return null;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(userToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleDownloadBat = () => {
    window.location.href = `/api/connector/bat?token=${encodeURIComponent(userToken)}`;
  };

  const handleDownloadScript = () => {
    window.location.href = `/api/connector/script?token=${encodeURIComponent(userToken)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Central do Conector Aviator</h3>
                <span className="text-[10px] bg-sky-500 text-white font-extrabold px-2 py-0.5 rounded uppercase">
                  MSFS 2020 / 2024
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Conecte seu Microsoft Flight Simulator para sincronizar aeroporto, aeronave e peso em tempo real.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConnectorModal(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-100 p-4 px-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Status do Conector:</span>
            {connectionStatus === 'connected' && (
              <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                CONECTADO AO MSFS
              </span>
            )}
            {connectionStatus === 'disconnected' && (
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-md border border-slate-300">
                <Radio className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                AGUARDANDO CONEXÃO LOCAL
              </span>
            )}
          </div>

          {/* User PIN Token Box */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400">Seu Token PIN:</span>
            <span className="font-mono font-black text-sky-700 text-sm tracking-wider">{userToken}</span>
            <button
              onClick={handleCopyToken}
              className="p-1 text-slate-400 hover:text-sky-600 rounded transition-colors cursor-pointer"
              title="Copiar Token"
            >
              {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 text-xs font-bold bg-white">
          <button
            onClick={() => setActiveTab('download')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'download'
                ? 'border-sky-600 text-sky-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Baixar Instalador / Script
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'instructions'
                ? 'border-sky-600 text-sky-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Passo a Passo Simples
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: DOWNLOAD */}
          {activeTab === 'download' && (
            <div className="space-y-5">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-900 leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sky-950 mb-1">Como funciona o Conector do Aviator?</h4>
                  <p>
                    O conector é um pequeno utilitário seguro que roda no seu computador. Ele lê automaticamente os dados de telemetria do <strong>Microsoft Flight Simulator</strong> via SimConnect (aeroporto atual, modelo da aeronave e peso de carga) e envia para a sua conta no aplicativo a cada 3 segundos.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Option: BAT Launcher */}
                <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col justify-between space-y-4 shadow-md">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        Recomendado para Windows
                      </span>
                      <Terminal className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Iniciador Automático (.BAT)</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Baixe o executável .bat de clique duplo. Ele instala as dependências do Python automaticamente e conecta com 1 clique.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadBat}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Iniciar_Conector.bat</span>
                  </button>
                </div>

                {/* Secondary Option: Python Script */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Desenvolvedores / Python
                      </span>
                      <FileCode className="w-5 h-5 text-sky-600" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">Script Python Directo (.PY)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Faça o download direto do script em código aberto Python já pré-configurado com o seu Token de Conexão.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadScript}
                    className="w-full bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar AviatorConnector.py</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-800 text-sm">3 Passos para Executar no seu Computador:</h4>

              <div className="space-y-3 text-xs">
                <div className="flex gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="w-7 h-7 rounded-full bg-sky-500 text-white font-black flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">Baixe o arquivo Iniciar_Conector.bat</h5>
                    <p className="text-slate-600 mt-0.5">
                      Clique no botão de download e salve o arquivo na pasta de sua preferência (ex: Área de Trabalho ou Downloads).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="w-7 h-7 rounded-full bg-sky-500 text-white font-black flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">Abra o Microsoft Flight Simulator</h5>
                    <p className="text-slate-600 mt-0.5">
                      Inicie o MSFS 2020 ou MSFS 2024, escolha sua aeronave, posicione-se na pista ou pátio do aeroporto desejado e inicie o voo.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="w-7 h-7 rounded-full bg-sky-500 text-white font-black flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">Dê duplo clique no Iniciar_Conector.bat</h5>
                    <p className="text-slate-600 mt-0.5">
                      Uma janela preta do terminal irá abrir e confirmar a conexão com a mensagem <span className="text-emerald-700 font-bold">"✅ Conectado com sucesso ao Microsoft Flight Simulator"</span>. O aplicativo no navegador passará automaticamente para o status Conectado!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={regenerateToken}
            className="text-slate-500 hover:text-slate-800 transition-colors font-semibold cursor-pointer"
          >
            Gerar Novo Token PIN
          </button>

          <button
            onClick={() => setShowConnectorModal(false)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-lg transition-all cursor-pointer"
          >
            Concluído / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
