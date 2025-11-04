import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/data/supabaseClient";
import type { User, AuthError } from "@supabase/supabase-js";

// =====================================================
// Types
// =====================================================

type OAuthProvider = "google" | "github";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
}

interface AuthResult {
  error: AuthError | null;
}

// =====================================================
// Context Creation
// =====================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =====================================================
// Auth Provider Component
// =====================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // Initialize: Check for existing session
  // =====================================================
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // =====================================================
  // Sign Up (Email + Password)
  // =====================================================
  const signUp = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Auto-confirm for development (remove in production)
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { error };
  };

  // =====================================================
  // Sign In (Email + Password)
  // =====================================================
  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  // =====================================================
  // Sign In with OAuth (Google, GitHub)
  // =====================================================
  const signInWithOAuth = async (provider: OAuthProvider): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(`OAuth error (${provider}):`, error.message);
      throw error;
    }
  };

  // =====================================================
  // Sign Out
  // =====================================================
  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error.message);
      throw error;
    }
  };

  // =====================================================
  // Reset Password (Send Email)
  // =====================================================
  const resetPassword = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  };

  // =====================================================
  // Update Password (After Reset Link)
  // =====================================================
  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error };
  };

  // =====================================================
  // Context Value
  // =====================================================
  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =====================================================
// useAuth Hook (Consumer)
// =====================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
