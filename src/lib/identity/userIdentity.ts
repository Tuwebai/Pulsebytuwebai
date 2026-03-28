import type { ProfileRow } from '@/data/types/profile';
import type { User } from '@/contexts/appContext.types';

type IdentityProfile = Pick<ProfileRow, 'avatar_url' | 'email' | 'full_name'> | null | undefined;
type IdentityUser = Pick<User, 'avatar' | 'avatar_url' | 'email' | 'full_name'> | null | undefined;

export function getDisplayName(profile: IdentityProfile, user: IdentityUser, fallback: string) {
  return profile?.full_name || user?.full_name || fallback;
}

export function getDisplayEmail(profile: IdentityProfile, user: IdentityUser, fallback = 'sin email') {
  return profile?.email || user?.email || fallback;
}

export function getDisplayAvatar(profile: IdentityProfile, user: IdentityUser) {
  return profile?.avatar_url || user?.avatar || user?.avatar_url || undefined;
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
