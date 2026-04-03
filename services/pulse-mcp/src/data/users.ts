import { supabase } from './client.js';
import { looksLikeEmail, looksLikeUuid, normalizeIdentifier, normalizeDomain } from './identifiers.js';
import type { UserRow } from './types.js';

const USER_BASE_SELECT = 'id, email, full_name, phone';
const USER_DETAIL_SELECT = ['id', 'email', 'full_name', 'phone', 'role', 'website', 'onboarding_completed', 'onboarding_completed_at', 'pulse_access_status', 'pulse_access_granted_at', 'pulse_access_disabled_at', 'created_at', 'updated_at'].join(', ');

export async function resolveUserIdentifier(userIdentifier: string) {
  const identifier = normalizeIdentifier(userIdentifier);

  if (!identifier) {
    throw new Error('Necesitamos un identificador de usuario valido.');
  }

  if (looksLikeUuid(identifier)) {
    const { data, error } = await supabase.from('users').select(USER_BASE_SELECT).eq('id', identifier).maybeSingle();
    if (error) throw error;
    if (data) return data as UserRow;
  }

  if (looksLikeEmail(identifier)) {
    const { data, error } = await supabase.from('users').select(USER_BASE_SELECT).ilike('email', identifier).maybeSingle();
    if (error) throw error;
    if (data) return data as UserRow;
  }

  const domainQuery = normalizeDomain(identifier);
  const [usersResult, websiteResult] = await Promise.all([
    supabase
      .from('users')
      .select(USER_BASE_SELECT)
      .or(`full_name.ilike.%${identifier}%,phone.ilike.%${identifier}%`)
      .limit(5),
    supabase
      .from('users')
      .select(USER_BASE_SELECT)
      .ilike('website', `%${domainQuery}%`)
      .limit(5),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (websiteResult.error) throw websiteResult.error;

  const combined = [...((usersResult.data ?? []) as UserRow[]), ...((websiteResult.data ?? []) as UserRow[])].filter(
    (user, index, list) => list.findIndex((item) => item.id === user.id) === index,
  );

  if (combined.length === 1) return combined[0];
  if (combined.length > 1) {
    const candidates = combined.map((user) => user.full_name || user.email || user.id).join(', ');
    throw new Error(`Encontramos varios usuarios para "${identifier}". Probá con email o UUID. Coincidencias: ${candidates}.`);
  }

  throw new Error(`No encontramos un usuario en Pulse para "${identifier}".`);
}

export async function fetchUserById(userId: string) {
  const { data, error } = await supabase.from('users').select(USER_DETAIL_SELECT).eq('id', userId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`No encontramos el usuario ${userId}.`);
  return data as unknown as UserRow;
}
