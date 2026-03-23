import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabase';

interface EnablePulseAccessResponse {
  invited: boolean;
  user_id: string;
  email: string;
  pulse_access_status: 'invited' | 'active';
  pulse_access_granted_at: string | null;
  pulse_access_granted_by: string | null;
}

function isEnablePulseAccessResponse(value: unknown): value is EnablePulseAccessResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.invited === 'boolean' &&
    typeof payload.user_id === 'string' &&
    typeof payload.email === 'string' &&
    (payload.pulse_access_status === 'invited' || payload.pulse_access_status === 'active') &&
    (typeof payload.pulse_access_granted_at === 'string' || payload.pulse_access_granted_at === null) &&
    (typeof payload.pulse_access_granted_by === 'string' || payload.pulse_access_granted_by === null)
  );
}

export async function enablePulseAccess(userId: string): Promise<EnablePulseAccessResponse> {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesion de administrador no esta disponible para habilitar Pulse.');
  }

  const { data, error } = await supabase.functions.invoke('enable-pulse-access', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    },
    body: {
      userId
    }
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null) as { error?: string } | null;

      if (error.context.status === 401) {
        throw new Error('Tu sesion no tiene permisos para habilitar acceso a Pulse.');
      }

      if (error.context.status === 403) {
        throw new Error('Solo un administrador puede habilitar acceso a Pulse.');
      }

      if (error.context.status === 404 && payload?.error === 'USER_NOT_FOUND') {
        throw new Error('No encontramos el usuario de Pulse para habilitarlo.');
      }

      if (error.context.status === 409 && payload?.error === 'ACCESS_DISABLED') {
        throw new Error('El usuario tiene el acceso a Pulse revocado. Reactivarlo requiere una accion separada.');
      }

      throw new Error('No pudimos habilitar el acceso a Pulse desde el backend.');
    }

    if (error instanceof FunctionsRelayError) {
      throw new Error('El relay de Supabase rechazo la solicitud para habilitar Pulse.');
    }

    if (error instanceof FunctionsFetchError) {
      throw new Error('No pudimos conectarnos con la funcion que habilita acceso a Pulse.');
    }

    throw new Error('No pudimos habilitar el acceso a Pulse.');
  }

  if (!isEnablePulseAccessResponse(data)) {
    throw new Error('La respuesta para habilitar Pulse vino incompleta.');
  }

  return data;
}
