import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase, getSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';
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
  updateSupabaseCredentials: (url: string, key: string) => void;
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
  const [config, setConfig] = useState(getSupabaseConfig());

  useEffect(() => {
    localStorage.setItem('aviator_auth_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (!config.isConfigured) {
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();

      // Get current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || 'Comandante',
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
            fullName: session.user.user_metadata?.full_name || 'Comandante',
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
      console.warn('Supabase initialization warning:', err);
      setLoading(false);
    }
  }, [config.isConfigured]);

  const signIn = async (email: string, pass: string) => {
    if (!config.isConfigured) {
      // Offline / Local login
      setUser({
        id: 'local-' + Date.now(),
        email,
        fullName: email.split('@')[0].toUpperCase(),
        callsign: 'Piloto ' + email.split('@')[0],
        rank: 'Primeiro Oficial',
        isDemo: true,
      });
      return { success: true };
    }

    try {
      const supabase = getSupabase();
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
          fullName: data.user.user_metadata?.full_name || 'Comandante',
          callsign: data.user.user_metadata?.callsign || 'Piloto',
          rank: 'Capitão',
          isDemo: false,
        });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao conectar com Supabase' };
    }
  };

  const signUp = async (email: string, pass: string, name: string, callsign: string) => {
    if (!config.isConfigured) {
      setUser({
        id: 'local-' + Date.now(),
        email,
        fullName: name,
        callsign: callsign || 'Piloto',
        rank: 'Comandante',
        isDemo: true,
      });
      return { success: true };
    }

    try {
      const supabase = getSupabase();
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
    if (config.isConfigured) {
      try {
        const supabase = getSupabase();
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Signout error:', err);
      }
    }
    localStorage.removeItem('aviator_auth_user');
    setSupabaseUser(null);
    setUser(null);
  };

  const updateSupabaseCredentials = (url: string, key: string) => {
    saveSupabaseConfig(url, key);
    setConfig(getSupabaseConfig());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        loading,
        isSupabaseConfigured: config.isConfigured,
        supabaseUrl: config.url,
        supabaseKey: config.key,
        signIn,
        signUp,
        signInAsDemo,
        signOut,
        updateSupabaseCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
