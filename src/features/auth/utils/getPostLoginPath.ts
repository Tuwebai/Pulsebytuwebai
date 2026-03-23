export interface AuthRedirectUser {
  role?: string | null;
  onboarding_completed?: boolean | null;
}

export function getPostLoginPath(user?: AuthRedirectUser | null): string {
  if (!user) {
    return '/login';
  }

  if (user.role === 'admin') {
    return '/admin';
  }

  return user.onboarding_completed ? '/dashboard' : '/onboarding';
}
