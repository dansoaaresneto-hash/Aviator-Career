import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Database, Key, Check, Globe, Copy, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { supabaseUrl, supabaseKey, isSupabaseConfigured, updateSupabaseCredentials } = useAuth();

  const [url, setUrl] = useState(supabaseUrl === 'https://your-project.supabase.co' ? '' : supabaseUrl);
  const [key, setKey] = useState(supabaseKey === 'your-anon-key' ? '' : supabaseKey);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseCredentials(url, key);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const envSnippet = `VITE_SUPABASE_URL=${url || 'https://seu-projeto.supabase.co'}
VITE_SUPABASE_ANON_KEY=${key || 'sua-chave-anonima-aqui'}`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">Conexão Supabase & Vercel</h3>
              <p className="text-xs text-slate-400">Configure o banco de dados em tempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Hospedagem no Vercel pronta!</strong>
              <p className="text-emerald-800 mt-0.5">
                Você pode colar as chaves do seu projeto Supabase abaixo ou definir nas Variáveis de Ambiente do Vercel como <code className="font-mono bg-emerald-100 px-1 rounded">VITE_SUPABASE_URL</code> e <code className="font-mono bg-emerald-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-600" />
                URL do Supabase (Project URL)
              </label>
              <input
                type="url"
                required
                placeholder="https://xyzproject.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                Chave Anônima (anon public key)
              </label>
              <textarea
                required
                rows={3}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Vercel Env Helper snippet */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">Snippet para .env do Vercel:</span>
              <button
                type="button"
                onClick={copyEnv}
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEnv ? 'Copiado!' : 'Copiar Snippet'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-emerald-400 bg-black/50 p-2.5 rounded-lg overflow-x-auto">
              {envSnippet}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              Criar conta grátis no Supabase <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                <span>{savedSuccess ? 'Salvo com Sucesso!' : 'Salvar Conexão'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
