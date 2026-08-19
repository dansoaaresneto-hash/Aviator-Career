import React from 'react';
import { usePilot } from '../../context/PilotContext';
import { CareerMode } from '../../types/license';
import {
  Award,
  Sparkles,
  Plane,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  CheckCircle2,
  ArrowRight,
  Compass,
} from 'lucide-react';

interface CareerModeSelectModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isInitialSetup?: boolean;
}

export const CareerModeSelectModal: React.FC<CareerModeSelectModalProps> = ({
  isOpen,
  onClose,
  isInitialSetup = false,
}) => {
  const { profile, setCareerMode } = usePilot();

  if (!isOpen) return null;

  const handleSelectMode = (mode: CareerMode) => {
    setCareerMode(mode);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {isInitialSetup ? 'Primeiro Acesso ao Aviator Hub' : 'Configuração de Modo de Jogo'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Escolha seu Modo de Carreira
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Defina como você deseja progredir no simulador de voo. Você poderá alternar de modo a qualquer momento nas configurações.
            </p>
          </div>
        </div>

        {/* Modes Comparison Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Card 1: Modo Carreira Completo (Recomendado) */}
            <div className="bg-white rounded-2xl p-6 border-2 border-sky-500 shadow-lg shadow-sky-500/5 flex flex-col justify-between relative hover:border-sky-600 transition-all">
              <div className="absolute -top-3.5 left-6 bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <Award className="w-3 h-3" />
                Recomendado (Mais Realista)
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-black">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Modo Carreira Completo</h3>
                    <p className="text-xs font-bold text-sky-600">Progressão Oficial de Licenças</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  Comece como <strong>Aluno Piloto</strong> voando monomotores leves, acumule horas e realize voos para conquistar sua licença <strong>PPL</strong>, avance para <strong>CPL</strong> com bimotores e translados nacionais, até atingir a licença máxima <strong>ATPL</strong> com jatos e translados internacionais.
                </p>

                <div className="space-y-2.5 mb-6 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="font-black text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                    Características do Modo:
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Início em <strong>Aluno Piloto</strong> (C172, DA40)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Translado Nacional</strong> desbloqueado no PPL</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Translado Internacional</strong> liberado após cumprir translados nacionais e obter ATPL</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Sem restrições de horário:</strong> voe em tempo real diurno ou noturno quando preferir</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectMode('full_career')}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Jogar Modo Carreira Completo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Card 2: Modo Carreira Livre */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-black">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Modo Carreira Livre</h3>
                    <p className="text-xs font-bold text-purple-600">Sandbox & Liberdade Total</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  Voe livremente sem barreiras de licenças. Todas as aeronaves, jatos executivos, voos comerciais e missões de translado nacional e internacional ficam <strong>100% desbloqueadas imediatamente</strong>.
                </p>

                <div className="space-y-2.5 mb-6 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="font-black text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                    Características do Modo:
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>Todas as aeronaves liberadas (Monomotores, Bimotores, Turboélices e Jatos)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>Translados Nacionais e Internacionais disponíveis desde o 1º voo</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>Sem requisitos de promoção ou bloqueio de contratos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>Ideal para quem quer apenas voar sua aeronave favorita</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectMode('free_career')}
                className="w-full bg-slate-900 hover:bg-purple-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Jogar Modo Carreira Livre</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500 font-medium shrink-0">
          Você pode alternar de modo quando quiser através da aba <strong>Configurações</strong> ou <strong>Licenças & Carreira</strong>.
        </div>
      </div>
    </div>
  );
};
