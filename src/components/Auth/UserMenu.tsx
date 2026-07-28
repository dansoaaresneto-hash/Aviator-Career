import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from './AuthModal';
import {
  User as UserIcon,
  LogOut,
  LogIn,
  ChevronDown,
  Database,
  Plane
} from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, signOut, isSupabaseConfigured } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Fazer Login</span>
        </button>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl p-1.5 pr-3 shadow-sm transition-all cursor-pointer"
      >
        <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center overflow-hidden border border-sky-200">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
          ) : (
            <span>{user.fullName.substring(0, 2).toUpperCase()}</span>
          )}
        </div>

        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 line-clamp-1">{user.fullName}</span>
            {user.isDemo && (
              <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                DEMO
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-medium block -mt-0.5">{user.callsign}</span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 text-xs space-y-1 animate-fadeIn">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-1">
            <p className="font-extrabold text-slate-800">{user.fullName}</p>
            <p className="text-slate-500 text-[11px] font-mono mt-0.5">{user.email}</p>
            <span className="inline-block mt-1.5 text-[9px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
              {user.rank}
            </span>
          </div>

          <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              {isSupabaseConfigured ? 'Supabase Conectado' : 'Supabase (Código)'}
            </span>
          </div>

          <button
            onClick={() => {
              setDropdownOpen(false);
              setShowAuthModal(true);
            }}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
          >
            <UserIcon className="w-4 h-4 text-sky-600" />
            <span>Trocar de Conta</span>
          </button>

          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={() => {
                setDropdownOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-left font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};
