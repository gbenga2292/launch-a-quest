import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message?: string }>;
  guestLogin: () => void;
  logout: () => Promise<void>;
  canEditAssets: boolean;
  canEditSites: boolean;
  canImportAssets: boolean;
  canAccessSettings: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  // Permission flags based on user type
  const canEditAssets = !isGuest;
  const canEditSites = !isGuest;
  const canImportAssets = !isGuest;
  const canAccessSettings = !isGuest;

  useEffect(() => {
    // Check for guest mode in localStorage
    const guestMode = localStorage.getItem('guestMode') === 'true';
    if (guestMode) {
      setIsGuest(true);
      setIsAuthenticated(true);
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        setIsGuest(false); // Reset guest mode on auth state change
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      // Clear guest mode when logging in
      localStorage.removeItem('guestMode');
      setIsGuest(false);

      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const signup = async (email: string, password: string, confirmPassword: string): Promise<{ success: boolean; message?: string }> => {
    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Account created successfully! Please check your email to confirm your account.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Signup failed' };
    }
  };

  const guestLogin = () => {
    localStorage.setItem('guestMode', 'true');
    setIsGuest(true);
    setIsAuthenticated(true);
    setUser(null);
    setSession(null);
  };

  const logout = async (): Promise<void> => {
    if (isGuest) {
      // Clear guest mode
      localStorage.removeItem('guestMode');
      setIsGuest(false);
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
    } else {
      // Regular logout
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isGuest,
      user,
      session,
      login,
      signup,
      guestLogin,
      logout,
      canEditAssets,
      canEditSites,
      canImportAssets,
      canAccessSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
};
