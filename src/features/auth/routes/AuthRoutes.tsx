import type { ComponentType, ReactNode } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import OnboardingGate from '@/features/onboarding/components/OnboardingGate';

interface AuthRoutesProps {
  AuthCallback: ComponentType;
  GitHubCallback: ComponentType;
  InvitationPage: ComponentType;
  Login: ComponentType;
  Onboarding: ComponentType;
  PulseAccessPendingPage: ComponentType;
  Register: ComponentType;
  SSOPage: ComponentType;
}

export function renderAuthRoutes({
  AuthCallback,
  GitHubCallback,
  InvitationPage,
  Login,
  Onboarding,
  PulseAccessPendingPage,
  Register,
  SSOPage
}: AuthRoutesProps): ReactNode {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute clientOnly>
            <OnboardingGate allowIncomplete>
              <Onboarding />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route path="/register" element={<Register />} />
      <Route
        path="/pulse-access"
        element={
          <ProtectedRoute allowWithoutPulseAccess clientOnly>
            <PulseAccessPendingPage />
          </ProtectedRoute>
        }
      />
      <Route path="/invite" element={<InvitationPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/github/callback" element={<GitHubCallback />} />
      <Route path="/auth/sso" element={<SSOPage />} />
    </>
  );
}
