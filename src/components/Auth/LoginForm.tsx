import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Plane,
  Mail,
  Lock,
  User as UserIcon,
  Radio,
  ArrowRight,
  Database,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onOpenSupabaseConfig?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onOpenSupabaseConfig }) => {
  const { signIn, signUp, signInAsDemo, isSupabaseConfigured } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isRegister) {
      if (!fullName.trim()) {
        setErrorMsg('Por favor informe o nome do Comandante.');
        setLoading(false);
        return;
      }
      const res = await signUp(email, password, fullName, callsign || 'Piloto VFR');
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Erro no cadastro do piloto');
      }
    } else {
      const res = await signIn(email, password);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'E-mail ou senha incorretos');
      }
    }
    setLoading(false);
  };

  const handleDemoLogin = () => {
    signInAsDemo('Cmte. Piloto de Testes');
    if (onSuccess) onSuccess();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white text-center relative">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 mx-auto mb-3 shadow-inner">
          <Plane className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black tracking-tight text-white">
          {isRegister ? 'Cadastro de Novo Piloto' : 'Acesso ao Aviator Career'}
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          {isRegister ? 'Crie sua conta de comandante para salvar seus voos' : 'Faça login com sua conta para conectar ao simulador'}
        </p>

        {/* Database Status Tag */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[10px]">
          {isSupabaseConfigured ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Supabase Autenticação Conectado
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenSupabaseConfig}
              className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-900 px-2.5 py-0.5 rounded-full border border-amber-800 transition-all cursor-pointer"
            >
              <Database className="w-3 h-3 text-amber-400" />
              Conectar Supabase (Modo Teste)
            </button>
          )}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isRegister && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome do Comandante
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Daniel Soares"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Callsign / Indicativo
              </label>
              <div className="relative">
                <Radio className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Ex: PR-NET / Aviator 01"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            E-mail de Acesso
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              placeholder="seu-email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Senha
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <span>{loading ? 'Processando...' : isRegister ? 'Criar Minha Conta de Piloto' : 'Entrar no Sistema'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Quick Demo Login Option */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Entrar no Modo Teste (Sem Cadastro)</span>
          </button>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="text-sky-600 hover:text-sky-700 font-bold cursor-pointer"
            >
              {isRegister ? 'Já possui uma conta? Faça Login' : 'Criar nova conta de piloto'}
            </button>

            {onOpenSupabaseConfig && (
              <button
                type="button"
                onClick={onOpenSupabaseConfig}
                className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer flex items-center gap-1"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Chaves Supabase</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
