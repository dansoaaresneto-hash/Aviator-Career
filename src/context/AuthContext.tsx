import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface PilotUser {
  id: string;
  email: string;
  fullName: string;
  callsign: string;
  rank: string;
  avatarUrl?: string;
  companyName?: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: PilotUser | null;
  supabaseUser: User | null;
  loading: boolean;
  isSupabaseConfigured: boolean;
  supabaseUrl: string;
  supabaseKey: string;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, name: string, callsign: string) => Promise<{ success: boolean; error?: string }>;
  signInAsDemo: (pilotName?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PILOT: PilotUser = {
  id: 'demo-pilot-001',
  email: 'cmte.neto@aviator.com',
  fullName: 'Cmte. Daniel Neto',
  callsign: 'Aviator Alpha',
  rank: 'Capitão Sênior',
  companyName: 'Neto Wings Cargo',
  avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=250&q=80',
  isDemo: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PilotUser | null>(() => {
    const saved = localStorage.getItem('aviator_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aviator_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aviator_auth_user');
    }
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      // Get current session from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Comandante',
            callsign: session.user.user_metadata?.callsign || 'Piloto VFR',
            rank: 'Capitão',
            avatarUrl: session.user.user_metadata?.avatar_url,
            isDemo: false,
          });
        }
        setLoading(false);
      });

      // Listen for auth state changes
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Comandante',
            callsign: session.user.user_metadata?.callsign || 'Piloto VFR',
            rank: 'Capitão',
            isDemo: false,
          });
        } else if (event === 'SIGNED_OUT') {
          setSupabaseUser(null);
          setUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch (err) {
      console.warn('Erro ao inicializar Supabase:', err);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      // Fallback local caso as chaves ainda não tenham sido inseridas no código
      const localPilot: PilotUser = {
        id: 'local-' + Date.now(),
        email,
        fullName: email.split('@')[0].toUpperCase(),
        callsign: 'Piloto ' + email.split('@')[0],
        rank: 'Primeiro Oficial',
        isDemo: true,
      };
      setUser(localPilot);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setSupabaseUser(data.user);
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name || email.split('@')[0],
          callsign: data.user.user_metadata?.callsign || 'Piloto',
          rank: 'Capitão',
          isDemo: false,
        });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao conectar ao Supabase' };
    }
  };

  const signUp = async (email: string, pass: string, name: string, callsign: string) => {
    if (!isSupabaseConfigured) {
      const localPilot: PilotUser = {
        id: 'local-' + Date.now(),
        email,
        fullName: name,
        callsign: callsign || 'Piloto VFR',
        rank: 'Comandante',
        isDemo: true,
      };
      setUser(localPilot);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: name,
            callsign: callsign,
          },
        },
      });

      if (error) return { success: false, error: error.message };

      if (data.user) {
        setSupabaseUser(data.user);
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          fullName: name,
          callsign: callsign,
          rank: 'Comandante',
          isDemo: false,
        });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro no cadastro' };
    }
  };

  const signInAsDemo = (pilotName = 'Cmte. Daniel Neto') => {
    setUser({
      ...DEMO_PILOT,
      fullName: pilotName,
    });
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Erro ao sair do Supabase:', err);
      }
    }
    localStorage.removeItem('aviator_auth_user');
    setSupabaseUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        loading,
        isSupabaseConfigured,
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_ANON_KEY,
        signIn,
        signUp,
        signInAsDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
