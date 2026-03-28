import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { AdminManagedUser, AdminUserFormData } from '@/features/admin/users/types/adminUser';

interface CreateAdminUserResponse {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  pulse_access_status: 'pending';
  created_auth_user: boolean;
  created_profile: boolean;
}

function isCreateAdminUserResponse(value: unknown): value is CreateAdminUserResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.id === 'string' &&
    typeof payload.email === 'string' &&
    (typeof payload.full_name === 'string' || payload.full_name === null) &&
    (payload.role === 'admin' || payload.role === 'user') &&
    payload.pulse_access_status === 'pending' &&
    typeof payload.created_auth_user === 'boolean' &&
    typeof payload.created_profile === 'boolean'
  );
}

export async function invokeCreateAdminUser(
  newUserData: AdminUserFormData,
): Promise<AdminManagedUser> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesión de administrador no está disponible para crear usuarios.');
  }

  const { data, error } = await supabase.functions.invoke('create-admin-user', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: {
      email: newUserData.email,
      full_name: newUserData.full_name,
      role: newUserData.role,
    },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context.json().catch(() => null)) as {
        error?: string;
        reason?: string;
      } | null;

      if (error.context.status === 401) {
        throw new Error('Tu sesión no tiene permisos para crear usuarios.');
      }

      if (error.context.status === 403) {
        throw new Error('Solo un administrador puede crear usuarios.');
      }

      if (error.context.status === 409 && payload?.error === 'USER_ALREADY_EXISTS') {
        throw new Error('Ya existe un perfil operativo con ese correo.');
      }

      if (error.context.status === 409 && payload?.error === 'AUTH_USER_ALREADY_EXISTS') {
        throw new Error(
          'Ese correo ya existe en Auth pero no está alineado al panel. Necesita reparación operativa antes de reutilizarlo.',
        );
      }

      if (error.context.status === 500 && payload?.reason) {
        throw new Error(`No pudimos crear el usuario desde el backend: ${payload.reason}.`);
      }

      throw new Error('No pudimos crear el usuario desde el backend.');
    }

    if (error instanceof FunctionsRelayError) {
      throw new Error('El relay de Supabase rechazó la solicitud de alta de usuario.');
    }

    if (error instanceof FunctionsFetchError) {
      throw new Error('No pudimos conectarnos con la función que crea usuarios.');
    }

    throw new Error('No pudimos crear el usuario.');
  }

  if (!isCreateAdminUserResponse(data)) {
    throw new Error('La respuesta para crear el usuario vino incompleta.');
  }

  return {
    ...data,
    avatar_url: null,
    website: null,
    website_status: 'missing',
    pulse_access_granted_at: null,
    pulse_access_granted_by: null,
    pulse_access_disabled_at: null,
    updated_at: null,
    created_at: new Date().toISOString(),
  };
}
