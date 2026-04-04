import type { Session } from '@supabase/supabase-js';

const PULSE_AUTH_SESSION_KEY = 'pulse.auth.session';

interface PersistedPulseSession {
  accessToken: string;
  refreshToken: string;
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readPersistedPulseSession(): PersistedPulseSession | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(PULSE_AUTH_SESSION_KEY);

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue) as Partial<PersistedPulseSession>;

    if (typeof parsedValue.accessToken !== 'string' || typeof parsedValue.refreshToken !== 'string') {
      return null;
    }

    return {
      accessToken: parsedValue.accessToken,
      refreshToken: parsedValue.refreshToken,
    };
  } catch {
    return null;
  }
}

export function persistPulseSession(session: Session | null) {
  if (!canUseLocalStorage()) {
    return;
  }

  if (!session?.access_token || !session.refresh_token) {
    clearPersistedPulseSession();
    return;
  }

  try {
    window.localStorage.setItem(
      PULSE_AUTH_SESSION_KEY,
      JSON.stringify({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      } satisfies PersistedPulseSession),
    );
  } catch {
    // Si localStorage falla, no rompemos el login.
  }
}

export function clearPersistedPulseSession() {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(PULSE_AUTH_SESSION_KEY);
  } catch {
    // Si localStorage falla, no rompemos el logout.
  }
}
