import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/supabase';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

interface UpdateAdminUserResponse {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  pulse_access_status: 'pending' | 'invited' | 'active' | 'disabled' | null;
  updated_at: string | null;
}

function isUpdateAdminUserResponse(value: unknown): value is UpdateAdminUserResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.id === 'string' &&
    typeof payload.email === 'string' &&
    (typeof payload.full_name === 'string' || payload.full_name === null) &&
    (payload.role === 'admin' || payload.role === 'user') &&
    (payload.pulse_access_status === 'pending' ||
      payload.pulse_access_status === 'invited' ||
      payload.pulse_access_status === 'active' ||
      payload.pulse_access_status === 'disabled' ||
      payload.pulse_access_status === null) &&
    (typeof payload.updated_at === 'string' || payload.updated_at === null)
  );
}

export async function invokeUpdateAdminUser(
  editingUser: AdminManagedUser,
): Promise<AdminManagedUser> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesión de administrador no está disponible para editar usuarios.');
  }

  const { data, error } = await supabase.functions.invoke('update-admin-user', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: {
      userId: editingUser.id,
      email: editingUser.email,
      full_name: editingUser.full_name,
      role: editingUser.role,
    },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context.json().catch(() => null)) as {
        error?: string;
        reason?: string;
      } | null;

      if (error.context.status === 401) {
        throw new Error('Tu sesión no tiene permisos para editar usuarios.');
      }

      if (error.context.status === 403) {
        throw new Error('Solo un administrador puede editar usuarios.');
      }

      if (error.context.status === 404 && payload?.error === 'USER_NOT_FOUND') {
        throw new Error('El usuario ya no existe en la base operativa.');
      }

      if (error.context.status === 404) {
        throw new Error('La función de edición de usuarios no está desplegada todavía.');
      }

      if (error.context.status === 409 && payload?.error === 'EMAIL_ALREADY_IN_USE') {
        throw new Error('Ese correo ya está siendo usado por otro usuario del panel.');
      }

      if (error.context.status === 500 && payload?.reason) {
        throw new Error(`No pudimos editar el usuario desde el backend: ${payload.reason}.`);
      }

      throw new Error('No pudimos editar el usuario desde el backend.');
    }

    if (error instanceof FunctionsRelayError) {
      throw new Error('El relay de Supabase rechazó la solicitud de edición.');
    }

    if (error instanceof FunctionsFetchError) {
      throw new Error('No pudimos conectarnos con la función que edita usuarios.');
    }

    throw new Error('No pudimos editar el usuario.');
  }

  if (!isUpdateAdminUserResponse(data)) {
    throw new Error('La respuesta para editar el usuario vino incompleta.');
  }

  return {
    ...editingUser,
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    role: data.role === 'admin' ? 'admin' : 'cliente',
    pulse_access_status: data.pulse_access_status,
    updated_at: data.updated_at,
  };
}
