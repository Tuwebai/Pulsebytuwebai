import { useCallback } from 'react';
import { clearCache } from '@/contexts/appContext.cache';
import type { User } from '@/contexts/appContext.types';

interface UseAppAuthParams {
  setError: (value: string | null) => void;
  setLoading: (value: boolean) => void;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signInWithGithub: () => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata?: { full_name?: string },
  ) => Promise<boolean>;
  user: User | null;
}

export function useAppAuth({
  setError,
  setLoading,
  signInWithEmail,
  signInWithGithub,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
}: UseAppAuthParams) {
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        return await signInWithEmail(email, password);
      } catch {
        setError('Error al iniciar sesión');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, signInWithEmail],
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        await signUpWithEmail(email, password, { full_name: name });
        return true;
      } catch {
        setError('Error al registrar usuario');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, signUpWithEmail],
  );

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await signInWithGoogle();
    } catch {
      setError('Error al iniciar sesión con Google');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, signInWithGoogle]);

  const loginWithGithub = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await signInWithGithub();
    } catch {
      setError('Error al iniciar sesión con GitHub');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, signInWithGithub]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await signOut();
      clearCache();
    } catch {
      setError('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, signOut]);

  return {
    login,
    loginWithGithub,
    loginWithGoogle,
    logout,
    register,
  };
}
