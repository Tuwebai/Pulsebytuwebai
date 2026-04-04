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

    const applyRecoveredSession = async () => {
      const {
        data: { session: recoveredSession },
      } = await authService.getSession();

      if (!isMounted || !recoveredSession) {
        return false;
      }

      setSession(recoveredSession);
      setUser(recoveredSession.user);
      setLoading(false);
      return true;
    };

    const getInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await authService.getSession();

        if (sessionError) {
          setError(
            sessionError.message.includes('Invalid API key')
              ? 'Error de configuración: Clave API de Supabase inválida'
              : sessionError.message,
          );
          return;
        }

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
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
      } = authService.onAuthStateChange(async (event, nextSession) => {
        if (!nextSession && (await applyRecoveredSession())) {
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
      void applyRecoveredSession().catch(() => undefined);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', reconcileSession);
      window.addEventListener('online', reconcileSession);
      window.addEventListener('storage', reconcileSession);
      document.addEventListener('visibilitychange', reconcileSession);
    }

    return () => {
      isMounted = false;
      unsubscribe();

      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', reconcileSession);
        window.removeEventListener('online', reconcileSession);
        window.removeEventListener('storage', reconcileSession);
        document.removeEventListener('visibilitychange', reconcileSession);
      }
    };
  }, []);

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    try {
      setError(null);
      setLoading(true);
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
      setLoading(true);
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
      setLoading(true);
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
