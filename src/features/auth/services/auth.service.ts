import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabase';
import { config } from '@/config/environment';

type AuthChangeCallback = (event: AuthChangeEvent, session: Session | null) => void | Promise<void>;
const SUPABASE_AUTH_STORAGE_KEY = 'pulse.auth.supabase';
const SUPABASE_AUTH_STORAGE_KEYS = [SUPABASE_AUTH_STORAGE_KEY, `${SUPABASE_AUTH_STORAGE_KEY}-code-verifier`];

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeAuthErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return '';
  }

  return error.message.trim().toLowerCase();
}

function isCorruptedSessionError(error: unknown) {
  const message = normalizeAuthErrorMessage(error);

  return (
    message.includes('refresh token') ||
    message.includes('refresh_token') ||
    message.includes('invalid grant') ||
    message.includes('jwt') ||
    message.includes('session') && message.includes('not found')
  );
}

async function clearLocalAuthState() {
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);

  if (!canUseLocalStorage()) {
    return;
  }

  for (const storageKey of SUPABASE_AUTH_STORAGE_KEYS) {
    window.localStorage.removeItem(storageKey);
  }
}

function readOAuthHashParams() {
  if (typeof window === 'undefined' || !window.location.hash) {
    return null;
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

export const authService = {
  async getSession() {
    return supabase.auth.getSession();
  },

  onAuthStateChange(callback: AuthChangeCallback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      await callback(event, session);
    });
  },

  async signInWithOAuth(provider: 'google' | 'github') {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: config.getAuthRedirectUrl(),
      },
    });
  },

  async processOAuthCallback() {
    if (typeof window === 'undefined') {
      return null;
    }

    const currentUrl = new URL(window.location.href);
    const code = currentUrl.searchParams.get('code');

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw error;
      }

      if (data.session) return data.session;
    }

    const hashSession = readOAuthHashParams();
    if (hashSession) {
      const { data, error } = await supabase.auth.setSession({
        access_token: hashSession.accessToken,
        refresh_token: hashSession.refreshToken,
      });

      if (error) {
        throw error;
      }

      if (data.session) return data.session;
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return session;
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

  async clearCorruptedSession() {
    await clearLocalAuthState();
  },

  isCorruptedSessionError,
};
