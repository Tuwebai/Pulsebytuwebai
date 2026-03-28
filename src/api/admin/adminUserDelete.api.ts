import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabase';

export interface UserDeletionBlocker {
  code: string;
  label: string;
  count: number;
}

export interface DeleteAdminUserResponse {
  deleted_user_id: string;
  deleted_email: string;
  deleted_profile: boolean;
  deleted_auth_user: boolean;
}

function isDeleteAdminUserResponse(value: unknown): value is DeleteAdminUserResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.deleted_user_id === 'string' &&
    typeof payload.deleted_email === 'string' &&
    typeof payload.deleted_profile === 'boolean' &&
    typeof payload.deleted_auth_user === 'boolean'
  );
}

function formatBlockers(blockers: UserDeletionBlocker[]) {
  return blockers
    .map((blocker) => `${blocker.count} ${blocker.label}`)
    .join(', ');
}

export async function invokeDeleteAdminUser(userId: string): Promise<DeleteAdminUserResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesión de administrador no está disponible para eliminar usuarios.');
  }

  const { data, error } = await supabase.functions.invoke('delete-admin-user', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: {
      userId,
    },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context.json().catch(() => null)) as {
        error?: string;
        blockers?: UserDeletionBlocker[];
        reason?: string;
      } | null;

      if (error.context.status === 401) {
        throw new Error('Tu sesión no tiene permisos para eliminar usuarios.');
      }

      if (error.context.status === 403) {
        throw new Error('Solo un administrador puede eliminar usuarios.');
      }

      if (error.context.status === 404 && payload?.error === 'USER_NOT_FOUND') {
        throw new Error('El usuario ya no existe en la base operativa.');
      }

      if (error.context.status === 409 && payload?.error === 'CANNOT_DELETE_SELF') {
        throw new Error('No podés eliminar tu propio usuario desde este panel.');
      }

      if (error.context.status === 409 && payload?.error === 'LAST_ADMIN') {
        throw new Error('No podés eliminar al último administrador activo del sistema.');
      }

      if (error.context.status === 409 && payload?.error === 'USER_DELETE_BLOCKED') {
        const blockers = payload.blockers ?? [];
        throw new Error(
          blockers.length > 0
            ? `No se puede eliminar el usuario porque todavía tiene referencias operativas: ${formatBlockers(blockers)}.`
            : 'No se puede eliminar el usuario porque todavía tiene referencias operativas activas.',
        );
      }

      if (error.context.status === 500 && payload?.reason) {
        throw new Error(`No pudimos eliminar el usuario desde el backend: ${payload.reason}.`);
      }

      throw new Error('No pudimos eliminar el usuario desde el backend.');
    }

    if (error instanceof FunctionsRelayError) {
      throw new Error('El relay de Supabase rechazó la solicitud de eliminación.');
    }

    if (error instanceof FunctionsFetchError) {
      throw new Error('No pudimos conectarnos con la función que elimina usuarios.');
    }

    throw new Error('No pudimos eliminar el usuario.');
  }

  if (!isDeleteAdminUserResponse(data)) {
    throw new Error('La respuesta para eliminar el usuario vino incompleta.');
  }

  return data;
}
