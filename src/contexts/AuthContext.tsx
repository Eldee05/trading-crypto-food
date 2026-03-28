import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  location?: string;
  spice_level: string;
  referral_code: string;
  is_verified: boolean;
  kar_balance: number;
  total_trades: number;
  total_earned: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, displayName: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateBalance: (amount: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateReferralCode(username: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = username.slice(0, 3).toUpperCase();
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('karrotify_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        // Refresh from DB
        refreshUserFromDB(parsed.id);
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const refreshUserFromDB = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      const u = mapProfile(data);
      setUser(u);
      localStorage.setItem('karrotify_user', JSON.stringify(u));
    }
  };

  const mapProfile = (data: any): User => ({
    id: data.id,
    username: data.username || '',
    display_name: data.display_name || '',
    email: data.email || '',
    avatar_url: data.avatar_url,
    bio: data.bio,
    phone: data.phone,
    location: data.location,
    spice_level: data.spice_level || 'medium',
    referral_code: data.referral_code || '',
    is_verified: data.is_verified || false,
    kar_balance: Number(data.kar_balance) || 0,
    total_trades: data.total_trades || 0,
    total_earned: Number(data.total_earned) || 0,
  });

  const login = async (email: string, password: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
    if (!data) throw new Error('Account not found. Please sign up first.');
    const u = mapProfile(data);
    setUser(u);
    localStorage.setItem('karrotify_user', JSON.stringify(u));
  };

  const signup = async (email: string, username: string, displayName: string, referralCode?: string) => {
    const { data: existing } = await supabase.from('profiles').select('id').eq('email', email).single();
    if (existing) throw new Error('Email already registered');

    const refCode = generateReferralCode(username);
    const { data, error } = await supabase.from('profiles').insert({
      email,
      username,
      display_name: displayName,
      referral_code: refCode,
      kar_balance: 10, // Welcome bonus
      is_verified: false,
    }).select().single();

    if (error) throw new Error(error.message);
    const u = mapProfile(data);
    setUser(u);
    localStorage.setItem('karrotify_user', JSON.stringify(u));

    // Process referral if code provided
    if (referralCode) {
      try {
        await supabase.functions.invoke('process-referral', {
          body: { referral_code: referralCode, referee_id: data.id }
        });
        // Refresh balance
        await refreshUserFromDB(data.id);
      } catch { /* referral failed silently */ }
    }

    // Welcome notification
    await supabase.from('notifications').insert({
      user_id: data.id,
      title: 'Welcome to Karrotify!',
      message: 'You received 10 KAR welcome bonus. Start trading and earn more!',
      notification_type: 'reward'
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('karrotify_user');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) throw new Error(error.message);
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('karrotify_user', JSON.stringify(updated));
  };

  const updateBalance = (amount: number) => {
    if (!user) return;
    const updated = { ...user, kar_balance: user.kar_balance + amount };
    setUser(updated);
    localStorage.setItem('karrotify_user', JSON.stringify(updated));
  };

  const refreshUser = async () => {
    if (user) await refreshUserFromDB(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, loading, login, signup, logout,
      updateProfile, updateBalance, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
