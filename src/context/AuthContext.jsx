import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

const DEMO_USER = {
  id: 'demo-user-12345678-0000-0000-0000-000000000000',
  email: 'learner@studytrack.dev',
  user_metadata: {
    full_name: 'Aditya (Demo Scholar)'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      // In local/demo mode without Supabase keys
      const savedUser = localStorage.getItem('sp_demo_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          setUser(DEMO_USER);
        }
      } else {
        // Auto sign-in to demo account for frictionless experience
        setUser(DEMO_USER);
        localStorage.setItem('sp_demo_user', JSON.stringify(DEMO_USER));
      }
      setLoading(false);
      return;
    }

    // Real Supabase Auth
    let mounted = true;

    async function initSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Supabase session initialization error:', err);
        if (mounted) setAuthError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [isConfigured]);

  const signUp = async (email, password, fullName) => {
    setAuthError(null);
    if (!isConfigured) {
      const newUser = {
        id: `demo-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName || email.split('@')[0] }
      };
      setUser(newUser);
      localStorage.setItem('sp_demo_user', JSON.stringify(newUser));
      return { data: { user: newUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setAuthError(err.message);
      return { data: null, error: err };
    }
  };

  const signIn = async (email, password) => {
    setAuthError(null);
    if (!isConfigured) {
      const loginUser = {
        id: `demo-${Date.now()}`,
        email,
        user_metadata: { full_name: email.split('@')[0] }
      };
      setUser(loginUser);
      localStorage.setItem('sp_demo_user', JSON.stringify(loginUser));
      return { data: { user: loginUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setAuthError(err.message);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    setAuthError(null);
    if (!isConfigured) {
      setUser(null);
      localStorage.removeItem('sp_demo_user');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err) {
      setAuthError(err.message);
      return { error: err };
    }
  };

  const useDemoAccount = () => {
    setUser(DEMO_USER);
    localStorage.setItem('sp_demo_user', JSON.stringify(DEMO_USER));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        authError,
        isConfigured,
        signUp,
        signIn,
        signOut,
        useDemoAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
