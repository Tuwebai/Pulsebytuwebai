import React, { Suspense, lazy } from 'react';
import type { ComponentType } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { PulseLoaderScreen } from '@/components/PulseLoaderScreen';
import TouchGestureProvider from '@/components/TouchGestureProvider';
import RouteLoadErrorState from '@/core/components/RouteLoadErrorState';
import { renderAdminRoutes } from '@/app/adminRoutes';
import { useApp } from '@/contexts/AppContext';
import { renderAuthRoutes } from '@/features/auth/routes/AuthRoutes';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import OnboardingGate from '@/features/onboarding/components/OnboardingGate';
import DashboardShell from '@/core/layout/DashboardLayout';
import { serviceWorkerManager } from '@/utils/serviceWorker';

type LazyComponentModule = {
  default: ComponentType;
};

const createLazyComponent = (importFn: () => Promise<LazyComponentModule>) =>
  lazy(() =>
    importFn().catch((error): Promise<LazyComponentModule> => {
      console.error('Error loading component:', error);
      return Promise.resolve({
        default: RouteLoadErrorState
      });
    })
  );

const Index = createLazyComponent(() => import('@/pages/Index'));
const Login = createLazyComponent(() => import('@/pages/Login'));
const Onboarding = createLazyComponent(() => import('@/pages/Onboarding'));
const Register = createLazyComponent(() => import('@/pages/Register'));
const PulseAccessPendingPage = createLazyComponent(() => import('@/features/auth/pages/PulseAccessPendingPage'));
const PoliticaPrivacidad = createLazyComponent(() => import('@/pages/PoliticaPrivacidad'));
const TerminosCondiciones = createLazyComponent(() => import('@/pages/TerminosCondiciones'));
const HomePage = createLazyComponent(() => import('@/features/dashboard/pages/HomePage'));
const PulsePage = createLazyComponent(() => import('@/features/pulse/pages/PulsePage'));
const Admin = createLazyComponent(() => import('@/pages/Admin'));
const AdminProjectAlertsPage = createLazyComponent(() => import('@/features/admin/projects-tracking/pages/AdminProjectAlertsPage'));
const AdminProjectCriticalTaskDetailPage = createLazyComponent(() => import('@/features/admin/projects-tracking/pages/AdminProjectCriticalTaskDetailPage'));
const AdminProjectCriticalTasksPage = createLazyComponent(() => import('@/features/admin/projects-tracking/pages/AdminProjectCriticalTasksPage'));
const AdminProjectPhaseDetailPage = createLazyComponent(() => import('@/features/admin/projects-tracking/pages/AdminProjectPhaseDetailPage'));
const AdminProjectPhasesPage = createLazyComponent(() => import('@/features/admin/projects-tracking/pages/AdminProjectPhasesPage'));
const AdminProjectTrackingPage = createLazyComponent(() => import('@/features/admin/projects-tracking/pages/AdminProjectTrackingPage'));
const ProjectsPage = createLazyComponent(() => import('@/pages/ProjectsPage'));
const ProfilePage = createLazyComponent(() => import('@/features/profile/pages/ProfilePage'));
const Configuracion = createLazyComponent(() => import('@/pages/Configuracion'));
const Facturacion = createLazyComponent(() => import('@/features/payments/pages/PaymentsPage'));
const Soporte = createLazyComponent(() => import('@/pages/Soporte'));
const NotFound = createLazyComponent(() => import('@/pages/NotFound'));
const AuthCallback = createLazyComponent(() => import('@/pages/AuthCallback'));
const SSOPage = createLazyComponent(() => import('@/features/auth/pages/SSOPage'));

const ServiceWorkerInitializer = () => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      void serviceWorkerManager.register();
    }
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
      <TouchGestureProvider enableGlobalGestures={true} enableNavigationGestures={true}>
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
