import type { User } from '@/contexts/appContext.types';

const RESOLVED_USER_PREFIX = 'pulse.auth.resolved-user';

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function buildStorageKey(userId: string) {
  return `${RESOLVED_USER_PREFIX}:${userId}`;
}

export function readPersistedResolvedUser(userId: string): User | null {
  if (!canUseLocalStorage() || !userId) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(buildStorageKey(userId));
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as User;
  } catch {
    return null;
  }
}

export function persistResolvedUser(user: User | null) {
  if (!canUseLocalStorage() || !user?.id) {
    return;
  }

  try {
    window.localStorage.setItem(buildStorageKey(user.id), JSON.stringify(user));
  } catch {
    // Si localStorage falla, no rompemos la sesión.
  }
}

export function clearPersistedResolvedUser(userId: string | null | undefined) {
  if (!canUseLocalStorage() || !userId) {
    return;
  }

  try {
    window.localStorage.removeItem(buildStorageKey(userId));
  } catch {
    // Si localStorage falla, no rompemos el logout.
  }
}
