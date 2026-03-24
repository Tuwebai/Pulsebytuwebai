import React, { Suspense, lazy } from 'react';
import type { ComponentType } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { PulseLoaderScreen } from '@/components/PulseLoaderScreen';
import TouchGestureProvider from '@/components/TouchGestureProvider';
import { useApp } from '@/contexts/AppContext';
import { renderAuthRoutes } from '@/features/auth/routes/AuthRoutes';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import OnboardingGate from '@/features/onboarding/components/OnboardingGate';
import DashboardShell from '@/core/layout/DashboardLayout';
import { GitHubDashboard } from '@/pages/GitHubDashboard';
import { serviceWorkerManager } from '@/utils/serviceWorker';

type LazyComponentModule = {
  default: ComponentType;
};

const LazyLoadErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-6">
    <div className="text-center">
      <div className="mb-4 text-6xl text-[var(--danger)]">!</div>
      <h2 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">Error de carga</h2>
      <p className="mb-4 text-[var(--text-secondary)]">No se pudo cargar el componente</p>
      <button
        className="rounded bg-[var(--danger)] px-4 py-2 text-white hover:opacity-90"
        onClick={() => window.location.reload()}
      >
        Recargar pagina
      </button>
    </div>
  </div>
);

const createLazyComponent = (importFn: () => Promise<LazyComponentModule>) =>
  lazy(() =>
    importFn().catch((error): Promise<LazyComponentModule> => {
      console.error('Error loading component:', error);
      return Promise.resolve({
        default: LazyLoadErrorFallback
      });
    })
  );

const Index = createLazyComponent(() => import('@/pages/Index'));
const Login = createLazyComponent(() => import('@/pages/Login'));
const Onboarding = createLazyComponent(() => import('@/pages/Onboarding'));
const Register = createLazyComponent(() => import('@/pages/Register'));
const PoliticaPrivacidad = createLazyComponent(() => import('@/pages/PoliticaPrivacidad'));
const TerminosCondiciones = createLazyComponent(() => import('@/pages/TerminosCondiciones'));
const HomePage = createLazyComponent(() => import('@/features/dashboard/pages/HomePage'));
const PulsePage = createLazyComponent(() => import('@/features/pulse/pages/PulsePage'));
const Admin = createLazyComponent(() => import('@/pages/Admin'));
const WebsyAI = createLazyComponent(() => import('@/pages/WebsyAI'));
const ProjectsPage = createLazyComponent(() => import('@/pages/ProjectsPage'));
const ProyectosNuevo = createLazyComponent(() => import('@/pages/ProyectosNuevo'));
const CollaborationPage = createLazyComponent(() => import('@/pages/CollaborationPage'));
const AdminCollaborationPage = createLazyComponent(() => import('@/pages/AdminCollaborationPage'));
const PhasesAndTasksPage = createLazyComponent(() => import('@/pages/PhasesAndTasksPage'));
const AdminPhasesAndTasksPage = createLazyComponent(() => import('@/pages/AdminPhasesAndTasksPage'));
const WorkspacePage = createLazyComponent(() => import('@/pages/WorkspacePage'));
const ProfilePage = createLazyComponent(() => import('@/features/profile/pages/ProfilePage'));
const UserProfileView = createLazyComponent(() => import('@/pages/UserProfileView'));
const Configuracion = createLazyComponent(() => import('@/pages/Configuracion'));
const Facturacion = createLazyComponent(() => import('@/pages/Facturacion'));
const Soporte = createLazyComponent(() => import('@/pages/Soporte'));
const Team = createLazyComponent(() => import('@/pages/Team'));
const NotFound = createLazyComponent(() => import('@/pages/NotFound'));
const AdvancedAnalytics = createLazyComponent(() => import('@/components/AdvancedAnalytics'));
const CustomizableDashboard = createLazyComponent(() => import('@/components/CustomizableDashboard'));
const AdvancedUserManagement = createLazyComponent(() => import('@/components/AdvancedUserManagement'));
const InvitationPage = createLazyComponent(() => import('@/pages/InvitationPage'));
const AuthCallback = createLazyComponent(() => import('@/pages/AuthCallback'));
const GitHubCallback = createLazyComponent(() => import('@/pages/GitHubCallback'));
const AdminGitHubProfile = createLazyComponent(() => import('@/pages/AdminGitHubProfile'));
const EnvironmentVariables = createLazyComponent(() => import('@/pages/EnvironmentVariables'));
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
        GitHubCallback,
        InvitationPage,
        Login,
        Onboarding,
        Register,
        SSOPage
      })}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
            <OnboardingGate>
              <DashboardShell>
                <ProfilePage />
              </DashboardShell>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <Admin />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/configuracion"
        element={
          <ProtectedRoute requiredRole="admin">
            <Navigate replace to={{ pathname: '/admin', hash: '#settings' }} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/websy-ai"
        element={
          <ProtectedRoute requiredRole="admin">
            <WebsyAI />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fases-tareas"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <AdminPhasesAndTasksPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/proyectos"
        element={
          <ProtectedRoute>
            <DashboardLayout key="proyectos">
              <ProjectsPage key="proyectos-content" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/fases-tareas"
        element={
          <ProtectedRoute>
            <DashboardLayout key="fases-tareas">
              <PhasesAndTasksPage key="fases-tareas-content" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/proyectos/:userId"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout key="proyectos-user">
              <ProjectsPage key="proyectos-user-content" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Navigate replace to="/dashboard/perfil" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil/:userId"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout key="user-profile">
              <UserProfileView key="user-profile-content" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/github-dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout key="github-dashboard">
              <GitHubDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId/github"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminGitHubProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/configuracion"
        element={
          <ProtectedRoute>
            <DashboardLayout key="configuracion">
              <Configuracion key="configuracion-content" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/facturacion"
        element={
          <ProtectedRoute>
            <DashboardLayout key="facturacion">
              <Facturacion key="facturacion-content" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/soporte"
        element={
          <ProtectedRoute>
            <DashboardLayout key="soporte">
              <Soporte key="soporte-content" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/proyectos/nuevo"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProyectosNuevo />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/proyectos/:projectId/colaboracion"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CollaborationPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/proyectos/:projectId/colaboracion-cliente"
        element={
          <ProtectedRoute>
            <Navigate replace to="/dashboard/proyecto" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/proyectos/:projectId/colaboracion-admin"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AdminCollaborationPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <WorkspacePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <Team />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/environment"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <EnvironmentVariables />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <AdvancedAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-custom"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CustomizableDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <AdvancedUserManagement />
            </DashboardLayout>
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
