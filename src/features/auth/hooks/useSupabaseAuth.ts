import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { authService } from '@/features/auth/services/auth.service';
import { getErrorMessage, getFriendlyAuthErrorMessage, waitForAuthenticatedState } from '@/features/auth/hooks/useSupabaseAuth.utils';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe = () => undefined;
    let isMounted = true;

    const syncSessionState = async () => {
      const {
        data: { session: nextSession },
        error: sessionError,
      } = await authService.getSession();

      if (!isMounted) {
        return false;
      }

      if (sessionError) {
        if (authService.isCorruptedSessionError(sessionError)) {
          await authService.clearCorruptedSession();
          setError(null);
          setSession(null);
          setUser(null);
          setLoading(false);
          return false;
        }

        setError(getFriendlyAuthErrorMessage(sessionError));
        setLoading(false);
        return false;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
      return Boolean(nextSession);
    };

    const getInitialSession = async () => {
      try {
        await syncSessionState();
      } catch (caughtError) {
        if (caughtError instanceof Error) {
          setError(getFriendlyAuthErrorMessage(caughtError));
        } else {
          setError(getErrorMessage(caughtError));
        }
      } finally {
        setLoading(false);
      }
    };

    void getInitialSession();

    try {
      const {
        data: { subscription },
      } = authService.onAuthStateChange(async (_event, nextSession) => {
        if (!isMounted) {
          return;
        }
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      });

      unsubscribe = () => {
        subscription.unsubscribe();
      };
    } catch {
      setError('Error al configurar autenticación');
      setLoading(false);
    }

    const reconcileSession = () => {
      void syncSessionState().catch(() => undefined);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', reconcileSession);
      window.addEventListener('online', reconcileSession);
    }

    return () => {
      isMounted = false;
      unsubscribe();

      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', reconcileSession);
        window.removeEventListener('online', reconcileSession);
      }
    };
  }, []);

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    try {
      setError(null);
      const { error: authError } = await authService.signInWithOAuth(provider);

      if (authError) {
        setError(getFriendlyAuthErrorMessage(authError));
        setLoading(false);
        return false;
      }

      return true;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? getFriendlyAuthErrorMessage(caughtError) : getErrorMessage(caughtError));
      setLoading(false);
      return false;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const { error: authError } = await authService.signInWithEmail(email, password);

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return false;
      }

      return waitForAuthenticatedState(async () => {
        const {
          data: { session: currentSession },
        } = await authService.getSession();

        return Boolean(currentSession?.user);
      });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      setLoading(false);
      return false;
    }
  };

  const signUpWithEmail = async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
      setError(null);
      const { error: authError } = await authService.signUpWithEmail(email, password, metadata);

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      setLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error: authError } = await authService.signOut();
      if (authError) {
        setError(authError.message);
      }
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signInWithGoogle: () => signInWithOAuth('google'),
    signInWithGithub: () => signInWithOAuth('github'),
    signInWithEmail,
    signUpWithEmail,
    signOut,
    clearError: () => setError(null),
  };
}
