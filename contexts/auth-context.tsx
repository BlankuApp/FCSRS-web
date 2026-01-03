'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  username: string;
  avatar: string;
  role: 'user' | 'admin' | 'pro';
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (username: string, avatar: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        apiClient.setToken(session.access_token);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only update state if user actually changed to prevent unnecessary re-renders
      setSession(prevSession => {
        const prevId = prevSession?.user?.id;
        const newId = session?.user?.id;
        if (prevId !== newId) {
          return session;
        }
        return prevSession;
      });
      setUser(prevUser => {
        const prevUserId = prevUser?.id;
        const newId = session?.user?.id;
        if (prevUserId !== newId) {
          return session?.user ?? null;
        }
        return prevUser;
      });
      if (session?.access_token) {
        apiClient.setToken(session.access_token);
      } else {
        apiClient.setToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar: `https://avatar.iran.liara.run/public/${randomNumber}`,
          role: 'user',
        },
      },
    });
    if (error) throw error;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }, []);

  const updateProfile = useCallback(async (username: string, avatar: string) => {
    const { error } = await supabase.auth.updateUser({
      data: {
        username,
        avatar,
      },
    });
    if (error) throw error;
  }, []);

  const username = user?.user_metadata?.username ?? 'User';
  const avatar = user?.user_metadata?.avatar ?? '';
  const role = (user?.user_metadata?.role ?? 'user') as 'user' | 'admin' | 'pro';

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      username,
      avatar,
      role,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
    }),
    [user, session, loading, username, avatar, role, signUp, signIn, signOut, resetPassword, updatePassword, updateProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
