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

function isGeneratedAvatarUrl(url: string) {
  return (
    url.includes('ui-avatars.com') ||
    url.includes('gravatar.com/avatar') ||
    url.includes('dicebear.com')
  );
}

function normalizeAvatarUrl(url?: string | null) {
  if (typeof url !== 'string') {
    return undefined;
  }

  const trimmed = url.trim();
  if (trimmed.length === 0 || isGeneratedAvatarUrl(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function getDisplayName(
  profile: IdentityProfile | null | undefined,
  user: IdentityUser | null | undefined,
  fallback: string,
) {
  return profile?.full_name || user?.full_name || fallback;
}

export function getDisplayEmail(
  profile: IdentityProfile | null | undefined,
  user: IdentityUser | null | undefined,
  fallback = 'sin email',
) {
  return profile?.email || user?.email || fallback;
}

export function getDisplayAvatar(
  profile: IdentityProfile | null | undefined,
  user: IdentityUser | null | undefined,
) {
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
