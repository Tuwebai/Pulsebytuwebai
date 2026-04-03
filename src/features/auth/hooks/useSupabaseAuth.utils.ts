import type { AuthError } from '@supabase/supabase-js';
import { SUPPORT_CONTACT } from '@/config/supportContact';

export function getFriendlyAuthErrorMessage(error: AuthError | Error): string {
  const normalizedMessage = error.message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return `No pudimos iniciar tu sesión con esos datos. Si tu acceso sigue pendiente o tu cuenta fue dada de baja, escribinos a ${SUPPORT_CONTACT.publicEmail}.`;
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Primero necesitás confirmar tu email para entrar a Pulse.';
  }

  return error.message;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Error inesperado';
}

export async function waitForAuthenticatedState(getAuthState: () => Promise<boolean>): Promise<boolean> {
  if (await getAuthState()) {
    return true;
  }

  return new Promise((resolve) => {
    let finished = false;

    const finish = (value: boolean) => {
      if (!finished) {
        finished = true;
        resolve(value);
      }
    };

    const checkAuth = async () => {
      if (await getAuthState()) {
        finish(true);
      } else {
        setTimeout(() => {
          void checkAuth();
        }, 100);
      }
    };

    setTimeout(() => {
      void checkAuth();
    }, 100);
    setTimeout(() => finish(false), 5000);
  });
}
