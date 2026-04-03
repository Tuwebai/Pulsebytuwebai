import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabase';
import { config } from '@/config/environment';

type AuthChangeCallback = (event: AuthChangeEvent, session: Session | null) => void | Promise<void>;

export const authService = {
  async getSession() {
    return supabase.auth.getSession();
  },

  onAuthStateChange(callback: AuthChangeCallback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async signInWithOAuth(provider: 'google' | 'github') {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: config.getAuthRedirectUrl(),
      },
    });
  },

  async signInWithEmail(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signUpWithEmail(email: string, password: string, metadata?: { full_name?: string }) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
  },

  async signOut() {
    return supabase.auth.signOut();
  },
};
