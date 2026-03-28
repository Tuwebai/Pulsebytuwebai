import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { hasPulseAccess, isPulseAccessDisabled } from '@/features/auth/utils/pulseAccess';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  allowWithoutPulseAccess?: boolean;
  clientOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  allowWithoutPulseAccess = false,
  clientOnly = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, authReady } = useApp();

  if (!authReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (clientOnly && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  if (user?.role !== 'admin' && !allowWithoutPulseAccess && !hasPulseAccess(user?.pulse_access_status)) {
    return <Navigate replace to={isPulseAccessDisabled(user?.pulse_access_status) ? '/pulse-access?state=disabled' : '/pulse-access'} />;
  }

  return <>{children}</>;
}
