import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { PulseOnboardingSnapshot } from '@/api/pulse/onboardingApi';
import type { User as AppUser } from '@/contexts/appContext.types';
import type { UserRecord as ServiceUser } from '@/features/auth/services/user.service';

function normalizeUserRole(role: string | null | undefined): AppUser['role'] {
  return role === 'admin' ? 'admin' : 'user';
}

export function createFallbackAppUser(supabaseUser: SupabaseUser): AppUser {
  const { email, user_metadata } = supabaseUser;
  const avatar = user_metadata?.avatar_url || user_metadata?.picture || user_metadata?.photoURL || user_metadata?.image;
  const role = normalizeUserRole(typeof user_metadata?.role === 'string' ? user_metadata.role : undefined);
  const pulseAccessStatus =
    user_metadata?.pulse_access_status === 'active' ||
    user_metadata?.pulse_access_status === 'invited' ||
    user_metadata?.pulse_access_status === 'disabled' ||
    user_metadata?.pulse_access_status === 'pending'
      ? user_metadata.pulse_access_status
      : undefined;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    full_name: user_metadata?.full_name || user_metadata?.name || email?.split('@')[0] || '',
    role,
    pulse_access_status: role === 'admin' ? pulseAccessStatus : (pulseAccessStatus ?? 'pending'),
    avatar_url: avatar,
    avatar,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function normalizeAppUser(user: ServiceUser | null): AppUser | null {
  if (!user) {
    return null;
  }

  return {
    ...user,
    role: normalizeUserRole(user.role),
    website: user.website ?? undefined,
    website_status: user.website_status ?? undefined,
    avatar: user.avatar_url,
  };
}

export function mergeOnboardingSnapshot(user: AppUser, snapshot: PulseOnboardingSnapshot): AppUser {
  return {
    ...user,
    onboarding_completed: snapshot.onboarding_completed ?? user.onboarding_completed,
    onboarding_completed_at: snapshot.onboarding_completed_at ?? user.onboarding_completed_at,
    website: snapshot.website ?? user.website,
    website_status: snapshot.website_status ?? user.website_status,
    website_submitted_at: snapshot.website_submitted_at ?? user.website_submitted_at,
    website_reviewed_at: snapshot.website_reviewed_at ?? user.website_reviewed_at,
    website_reviewed_by: snapshot.website_reviewed_by ?? user.website_reviewed_by,
    website_review_notes: snapshot.website_review_notes ?? user.website_review_notes,
  };
}
