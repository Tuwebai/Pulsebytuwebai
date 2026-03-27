import { hasPulseAccess } from './pulseAccess';

export interface AuthRedirectUser {
  role?: string | null;
  onboarding_completed?: boolean | null;
  pulse_access_status?: 'pending' | 'invited' | 'active' | 'disabled' | null;
}

export function getPostLoginPath(user?: AuthRedirectUser | null): string {
  if (!user) {
    return '/login';
  }

  if (user.role === 'admin') {
    return '/admin';
  }

  if (!hasPulseAccess(user.pulse_access_status)) {
    return '/pulse-access';
  }

  return user.onboarding_completed ? '/dashboard' : '/onboarding';
}
