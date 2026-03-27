import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabase';

export interface EnablePulseAccessResponse {
  invited: boolean;
  email_sent: boolean;
  delivery_type: 'invite' | 'magiclink' | 'none';
  user_id: string;
  email: string;
  pulse_access_status: 'invited' | 'active';
  pulse_access_granted_at: string | null;
  pulse_access_granted_by: string | null;
}

interface LegacyEnablePulseAccessResponse {
  invited: boolean;
  user_id: string;
  email: string;
  pulse_access_status: 'invited' | 'active';
  pulse_access_granted_at: string | null;
  pulse_access_granted_by: string | null;
}

function isLegacyEnablePulseAccessResponse(value: unknown): value is LegacyEnablePulseAccessResponse {
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

function isEnablePulseAccessResponse(value: unknown): value is EnablePulseAccessResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.invited === 'boolean' &&
    typeof payload.email_sent === 'boolean' &&
    (payload.delivery_type === 'invite' ||
      payload.delivery_type === 'magiclink' ||
      payload.delivery_type === 'none') &&
    typeof payload.user_id === 'string' &&
    typeof payload.email === 'string' &&
    (payload.pulse_access_status === 'invited' || payload.pulse_access_status === 'active') &&
    (typeof payload.pulse_access_granted_at === 'string' || payload.pulse_access_granted_at === null) &&
    (typeof payload.pulse_access_granted_by === 'string' || payload.pulse_access_granted_by === null)
  );
}

function normalizeEnablePulseAccessResponse(data: unknown): EnablePulseAccessResponse | null {
  if (isEnablePulseAccessResponse(data)) {
    return data;
  }

  if (isLegacyEnablePulseAccessResponse(data)) {
    return {
      ...data,
      email_sent: false,
      delivery_type: 'none',
    };
  }

  return null;
}

export async function invokeEnablePulseAccess(
  userId: string,
  action: 'enable' | 'resend' = 'enable',
): Promise<EnablePulseAccessResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesión de administrador no está disponible para habilitar Pulse.');
  }

  const { data, error } = await supabase.functions.invoke('enable-pulse-access', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: {
      userId,
      action,
    },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null) as { error?: string } | null;

      if (error.context.status === 401) {
        throw new Error('Tu sesión no tiene permisos para habilitar acceso a Pulse.');
      }

      if (error.context.status === 403) {
        throw new Error('Solo un administrador puede habilitar acceso a Pulse.');
      }

      if (error.context.status === 404 && payload?.error === 'USER_NOT_FOUND') {
        throw new Error('No encontramos el usuario de Pulse para habilitarlo.');
      }

      if (error.context.status === 409 && payload?.error === 'ACCESS_DISABLED') {
        throw new Error('El usuario tiene el acceso a Pulse revocado. Reactivarlo requiere una acción separada.');
      }

      if (error.context.status === 502 && payload?.error === 'MAGIC_LINK_EMAIL_FAILED') {
        throw new Error(
          'Supabase Auth no pudo enviar el enlace de acceso. Revisá SMTP y el template de Magic Link en Authentication > Email.',
        );
      }

      if (error.context.status === 502 && payload?.error === 'INVITE_EMAIL_FAILED') {
        throw new Error(
          'Supabase Auth no pudo enviar la invitación inicial. Revisá SMTP y el template de Invite user en Authentication > Email.',
        );
      }

      throw new Error(
        action === 'resend'
          ? 'No pudimos reenviar el acceso a Pulse desde el backend.'
          : 'No pudimos habilitar el acceso a Pulse desde el backend.',
      );
    }

    if (error instanceof FunctionsRelayError) {
      throw new Error('El relay de Supabase rechazó la solicitud para habilitar Pulse.');
    }

    if (error instanceof FunctionsFetchError) {
      throw new Error(
        action === 'resend'
          ? 'No pudimos conectarnos con la función que reenvía acceso a Pulse.'
          : 'No pudimos conectarnos con la función que habilita acceso a Pulse.',
      );
    }

    throw new Error(
      action === 'resend'
        ? 'No pudimos reenviar el acceso a Pulse.'
        : 'No pudimos habilitar el acceso a Pulse.',
    );
  }

  const normalizedResponse = normalizeEnablePulseAccessResponse(data);

  if (!normalizedResponse) {
    throw new Error('La respuesta para habilitar Pulse vino incompleta.');
  }

  return normalizedResponse;
}
