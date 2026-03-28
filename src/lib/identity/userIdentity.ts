import type { ProfileRow } from '@/data/types/profile';
import type { User } from '@/contexts/appContext.types';

interface IdentityProfile {
  avatar_url?: string | null;
  email?: string | null;
  full_name?: string | null;
}

interface IdentityUser {
  avatar?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  full_name?: string | null;
}

function normalizeAvatarUrl(url?: string | null) {
  if (typeof url !== 'string') {
    return undefined;
  }

  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getDisplayName(profile: IdentityProfile, user: IdentityUser, fallback: string) {
  return profile?.full_name || user?.full_name || fallback;
}

export function getDisplayEmail(profile: IdentityProfile, user: IdentityUser, fallback = 'sin email') {
  return profile?.email || user?.email || fallback;
}

export function getDisplayAvatar(profile: IdentityProfile, user: IdentityUser) {
  return (
    normalizeAvatarUrl(profile?.avatar_url) ||
    normalizeAvatarUrl(user?.avatar_url) ||
    normalizeAvatarUrl(user?.avatar) ||
    undefined
  );
}

export function getIdentityInitials(name?: string | null, email?: string) {
  if (name?.trim()) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  return email?.slice(0, 2).toUpperCase() || 'PU';
}
