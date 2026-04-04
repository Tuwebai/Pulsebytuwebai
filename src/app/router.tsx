import React, { Suspense, lazy } from 'react';
import type { ComponentType } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { PulseLoaderScreen } from '@/components/PulseLoaderScreen';
import RouteLoadErrorState from '@/core/components/RouteLoadErrorState';
import TouchGestureProvider from '@/core/components/TouchGestureProvider';
import { renderAdminRoutes } from '@/app/adminRoutes';
import { useApp } from '@/contexts/AppContext';
import { renderAuthRoutes } from '@/features/auth/routes/AuthRoutes';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import OnboardingGate from '@/features/onboarding/components/OnboardingGate';
import DashboardShell from '@/core/layout/DashboardLayout';
import { serviceWorkerManager } from '@/utils/serviceWorker';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import AuthCallback from '@/pages/AuthCallback';
import PoliticaPrivacidad from '@/pages/PoliticaPrivacidad';
import TerminosCondiciones from '@/pages/TerminosCondiciones';
import PulseAccessPendingPage from '@/features/auth/pages/PulseAccessPendingPage';
import SSOPage from '@/features/auth/pages/SSOPage';

type LazyComponentModule = {
  default: ComponentType;
};

const ROUTE_CHUNK_RELOAD_KEY = 'pulse.route.chunk-reload';

function isRecoverableChunkError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('dynamically imported module') ||
    message.includes('chunk')
  );
}

const createLazyComponent = (importFn: () => Promise<LazyComponentModule>) =>
  lazy(() =>
    importFn().catch((error): Promise<LazyComponentModule> => {
      console.error('Error loading component:', error);

      if (typeof window !== 'undefined' && isRecoverableChunkError(error)) {
        const alreadyRetried = window.sessionStorage.getItem(ROUTE_CHUNK_RELOAD_KEY) === '1';

        if (!alreadyRetried) {
          window.sessionStorage.setItem(ROUTE_CHUNK_RELOAD_KEY, '1');
          window.location.reload();
        }
      }

      return Promise.resolve({
        default: RouteLoadErrorState
      });
    })
  );
const Onboarding = createLazyComponent(() => import('@/pages/Onboarding'));
const Register = createLazyComponent(() => import('@/pages/Register'));
const HomePage = createLazyComponent(() => import('@/features/dashboard/pages/HomePage'));
const PulsePage = createLazyComponent(() => import('@/features/pulse/pages/PulsePage'));
const Admin = createLazyComponent(() => import('@/features/admin/pages/AdminPage'));
const AdminProjectAlertsPage = createLazyComponent(() => import('@/features/admin/projects-tracking/pages/AdminProjectAlertsPage'));
const AdminProjectCriticalTaskDetailPage = createLazyComponent(() => import('@/features/admin/projects-tracking/pages/AdminProjectCriticalTaskDetailPage'));
const AdminProjectCriticalTasksPage = createLazyComponent(() => import('@/features/admin/projects-tracking/pages/AdminProjectCriticalTasksPage'));
const AdminProjectPhaseDetailPage = createLazyComponent(() => import('@/features/admin/projects-tracking/pages/AdminProjectPhaseDetailPage'));
const AdminProjectPhasesPage = createLazyComponent(() => import('@/features/admin/projects-tracking/pages/AdminProjectPhasesPage'));
const AdminProjectTrackingPage = createLazyComponent(() => import('@/features/admin/projects-tracking/pages/AdminProjectTrackingPage'));
const ProjectsPage = createLazyComponent(() => import('@/features/project/pages/ProjectOverviewPage'));
const ProfilePage = createLazyComponent(() => import('@/features/profile/pages/ProfilePage'));
const Configuracion = createLazyComponent(() => import('@/features/settings/pages/SettingsPage'));
const Facturacion = createLazyComponent(() => import('@/features/payments/pages/PaymentsPage'));
const Soporte = createLazyComponent(() => import('@/features/support/pages/SupportPage'));
const NotFound = createLazyComponent(() => import('@/pages/NotFound'));

const ServiceWorkerInitializer = () => {
  React.useEffect(() => {
    void serviceWorkerManager.register();
  }, []);

  return null;
};

function PulseLoaderDismissBoundary({ children }: { children: React.ReactNode }) {
  const { authReady } = useApp();

  React.useEffect(() => {
    if (!authReady || !window.__removePulseLoader) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.__removePulseLoader?.();
    });
  }, [authReady]);

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
      <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
      {renderAuthRoutes({
        AuthCallback,
        Login,
        Onboarding,
        PulseAccessPendingPage,
        Register,
        SSOPage
      })}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute clientOnly>
            <OnboardingGate>
              <DashboardShell>
                <HomePage />
              </DashboardShell>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/pulse"
        element={
          <ProtectedRoute clientOnly>
            <OnboardingGate>
              <DashboardShell>
                <PulsePage />
              </DashboardShell>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/proyecto"
        element={
          <ProtectedRoute clientOnly>
            <OnboardingGate>
              <DashboardShell>
                <ProjectsPage />
              </DashboardShell>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/pagos"
        element={
          <ProtectedRoute clientOnly>
            <OnboardingGate>
              <DashboardShell>
                <Facturacion />
              </DashboardShell>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/soporte"
        element={
          <ProtectedRoute clientOnly>
            <OnboardingGate>
              <DashboardShell>
                <Soporte />
              </DashboardShell>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/configuracion"
        element={
          <ProtectedRoute clientOnly>
            <OnboardingGate>
              <DashboardShell>
                <Configuracion />
              </DashboardShell>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/perfil"
        element={
          <ProtectedRoute clientOnly>
            <OnboardingGate>
              <DashboardShell>
                <ProfilePage />
              </DashboardShell>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />

      {renderAdminRoutes({
        Admin,
        AdminProjectAlertsPage,
        AdminProjectCriticalTaskDetailPage,
        AdminProjectCriticalTasksPage,
        AdminProjectPhaseDetailPage,
        AdminProjectPhasesPage,
        AdminProjectTrackingPage
      })}
      <Route
        path="/proyectos"
        element={
          <ProtectedRoute clientOnly>
            <Navigate replace to="/dashboard/proyecto" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fases-tareas"
        element={
          <ProtectedRoute clientOnly>
            <Navigate replace to="/dashboard/proyecto" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute clientOnly>
            <Navigate replace to="/dashboard/perfil" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/configuracion"
        element={
          <ProtectedRoute clientOnly>
            <Navigate replace to="/dashboard/configuracion" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/facturacion"
        element={
          <ProtectedRoute clientOnly>
            <Navigate replace to="/dashboard/pagos" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/facturacion"
        element={
          <ProtectedRoute clientOnly>
            <Navigate replace to="/dashboard/pagos" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/soporte"
        element={
          <ProtectedRoute clientOnly>
            <Navigate replace to="/dashboard/soporte" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/proyectos/nuevo"
        element={
          <ProtectedRoute clientOnly>
            <Navigate replace to="/dashboard/proyecto" />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export function AppRouter() {
  return (
    <Router
      basename={import.meta.env.BASE_URL || '/'}
      future={{
        v7_startTransition: false,
        v7_relativeSplatPath: false
      }}
    >
      <TouchGestureProvider enableGlobalGestures={true}>
        <ServiceWorkerInitializer />
        <Suspense fallback={<PulseLoaderScreen />}>
          <PulseLoaderDismissBoundary>
            <AppRoutes />
          </PulseLoaderDismissBoundary>
        </Suspense>
      </TouchGestureProvider>
    </Router>
  );
}
