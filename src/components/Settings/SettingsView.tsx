import React, { useState } from 'react';
import { usePilot } from '../../context/PilotContext';
import { CareerModeSelectModal } from '../Career/CareerModeSelectModal';
import { Settings, Save, RotateCcw, ShieldAlert, Check, Award, Compass, RefreshCw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { profile, updateProfileName, resetCareerData } = usePilot();
  const [nameInput, setNameInput] = useState(profile.name);
  const [callsignInput, setCallsignInput] = useState(profile.preferredCallsign);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileName(nameInput, callsignInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const isFullCareer = profile.careerMode !== 'free_career';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-500" />
          Configurações do Aplicativo
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Ajuste as preferências de piloto, identificadores de chamada e dados do modo carreira
        </p>
      </div>

      {/* Career Mode Selector Box */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>Modo de Jogo & Progressão</span>
          <span
            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
              isFullCareer
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}
          >
            {isFullCareer ? 'Modo Carreira Completo' : 'Modo Carreira Livre'}
          </span>
        </h3>

        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/70">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${
              isFullCareer
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                : 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
            }`}
          >
            {isFullCareer ? <Award className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900">
              {isFullCareer ? 'Progressão Oficial por Brevês (ANAC/FAA)' : 'Modo Sandbox Livre (Acesso Total)'}
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              {isFullCareer
                ? 'Avanço por licenças (Aluno Piloto ➔ PPL ➔ CPL ➔ ATPL). Missões de translado internacional são desbloqueadas após cumprir os requisitos.'
                : 'Todas as aeronaves, jatos e translados nacionais e internacionais estão 100% desbloqueados.'}
            </p>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsModeModalOpen(true)}
            className="bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Alternar Modo de Jogo</span>
          </button>
        </div>
      </div>

      {/* Pilot Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
          Dados de Identificação do Piloto
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Nome do Piloto</label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Callsign Preferido (Indicativo de Rádio)</label>
          <input
            type="text"
            value={callsignInput}
            onChange={(e) => setCallsignInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            required
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            className="bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Dados salvos com sucesso!
            </span>
          )}
        </div>
      </form>

      {/* Danger Zone: Reset Career */}
      <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-red-600 flex items-center gap-2 border-b border-red-100 pb-3">
          <ShieldAlert className="w-4 h-4" />
          Zona de Risco - Reiniciar Carreira
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          Ao reiniciar sua carreira, seu saldo de Créditos voltará a ser <strong>0 CR</strong>, sua licença retornará ao início (Aluno Piloto) e o diário de bordo será apagado.
        </p>

        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs px-4 py-2.5 rounded-lg border border-red-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar Progresso da Carreira</span>
          </button>
        ) : (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200 space-y-3">
            <p className="text-xs font-bold text-red-800">
              Tem certeza que deseja apagar todos os dados e começar do zero com 0 Créditos?
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={resetCareerData}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer"
              >
                Sim, Reiniciar do Zero
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="bg-white text-slate-600 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-lg border border-slate-200 transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <CareerModeSelectModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        isInitialSetup={false}
      />
    </div>
  );
};
