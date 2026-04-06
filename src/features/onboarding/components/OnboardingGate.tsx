import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/useApp';

interface OnboardingGateProps {
  children: ReactNode;
  allowIncomplete?: boolean;
}

export default function OnboardingGate({
  children,
  allowIncomplete = false
}: OnboardingGateProps) {
  const { user } = useApp();
  const location = useLocation();
  const forcePreviewInDev = import.meta.env.DEV && location.pathname === '/onboarding' && new URLSearchParams(location.search).get('preview') === '1';

  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  const completed = Boolean(user?.onboarding_completed);

  if (!allowIncomplete && !completed) {
    return <Navigate replace state={{ from: location }} to="/onboarding" />;
  }

  if (allowIncomplete && completed && !forcePreviewInDev) {
    return <Navigate replace to="/dashboard" />;
  }

  return <>{children}</>;
}
