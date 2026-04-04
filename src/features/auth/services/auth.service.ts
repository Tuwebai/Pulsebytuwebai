import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabase';
import { config } from '@/config/environment';
import {
  clearPersistedPulseSession,
  persistPulseSession,
  readPersistedPulseSession,
} from '@/features/auth/services/authSessionPersistence.service';

type AuthChangeCallback = (event: AuthChangeEvent, session: Session | null) => void | Promise<void>;

let explicitSignOutInProgress = false;

async function recoverSessionFromPersistence() {
  const persistedSession = readPersistedPulseSession();

  if (!persistedSession) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: persistedSession.accessToken,
    refresh_token: persistedSession.refreshToken,
  });

  if (error || !data.session) {
    return null;
  }

  persistPulseSession(data.session);
  return data.session;
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
    const sessionResult = await supabase.auth.getSession();

    if (sessionResult.data.session) {
      persistPulseSession(sessionResult.data.session);
      return sessionResult;
    }

    const recoveredSession = await recoverSessionFromPersistence();

    if (recoveredSession) {
      return {
        data: { session: recoveredSession },
        error: null,
      };
    }

    return sessionResult;
  },

  onAuthStateChange(callback: AuthChangeCallback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        persistPulseSession(session);
        await callback(event, session);
        return;
      }

      if (event === 'SIGNED_OUT' && !explicitSignOutInProgress) {
        const recoveredSession = await recoverSessionFromPersistence();

        if (recoveredSession) {
          await callback('TOKEN_REFRESHED', recoveredSession);
          return;
        }
      }

      if (event === 'SIGNED_OUT' && explicitSignOutInProgress) {
        clearPersistedPulseSession();
      }

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

      if (data.session) {
        persistPulseSession(data.session);
        return data.session;
      }
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

      if (data.session) {
        persistPulseSession(data.session);
        return data.session;
      }
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (session) {
      persistPulseSession(session);
      return session;
    }

    return recoverSessionFromPersistence();
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
    explicitSignOutInProgress = true;

    try {
      const signOutResult = await supabase.auth.signOut();

      if (!signOutResult.error) {
        clearPersistedPulseSession();
      }

      return signOutResult;
    } finally {
      explicitSignOutInProgress = false;
    }
  },

  async recoverSession() {
    return recoverSessionFromPersistence();
  },
};
