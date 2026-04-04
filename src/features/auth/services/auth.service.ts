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
