import React from 'react';
import type { ComponentType } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import PulseDashboardLayout from './core/layout/DashboardLayout';
import OnboardingGate from './features/onboarding/components/OnboardingGate';
import { AppProviders } from './app/providers';
import { serviceWorkerManager } from './utils/serviceWorker';
import TouchGestureProvider from './components/TouchGestureProvider';

type LazyComponentModule = {
  default: ComponentType;
};

const LazyLoadErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
    <div className="text-center">
      <div className="mb-4 text-6xl text-red-500">!</div>
      <h2 className="mb-2 text-2xl font-bold text-red-800">Error de Carga</h2>
      <p className="mb-4 text-red-600">No se pudo cargar el componente</p>
      <button
        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        onClick={() => window.location.reload()}
      >
        Recargar pagina
      </button>
    </div>
  </div>
);

const createLazyComponent = (importFn: () => Promise<LazyComponentModule>) => {
  return lazy(() =>
    importFn().catch((error): Promise<LazyComponentModule> => {
      console.error('Error loading component:', error);
      return Promise.resolve({
        default: LazyLoadErrorFallback
      });
    })
  );
};

const Index = createLazyComponent(() => import('./pages/Index'));
const Login = createLazyComponent(() => import('./pages/Login'));
const Onboarding = createLazyComponent(() => import('./pages/Onboarding'));
const Register = createLazyComponent(() => import('./pages/Register'));
const PoliticaPrivacidad = createLazyComponent(() => import('./pages/PoliticaPrivacidad'));
const TerminosCondiciones = createLazyComponent(() => import('./pages/TerminosCondiciones'));
const HomePage = createLazyComponent(() => import('./features/dashboard/pages/HomePage'));
const PulsePage = createLazyComponent(() => import('./features/pulse/pages/PulsePage'));
const Admin = createLazyComponent(() => import('./pages/Admin'));
const WebsyAI = createLazyComponent(() => import('./pages/WebsyAI'));
const ProjectsPage = createLazyComponent(() => import('./pages/ProjectsPage'));
const ProyectosNuevo = createLazyComponent(() => import('./pages/ProyectosNuevo'));
const CollaborationPage = createLazyComponent(() => import('./pages/CollaborationPage'));
const ClientCollaborationPage = createLazyComponent(() => import('./pages/ClientCollaborationPage'));
const AdminCollaborationPage = createLazyComponent(() => import('./pages/AdminCollaborationPage'));
const PhasesAndTasksPage = createLazyComponent(() => import('./pages/PhasesAndTasksPage'));
const AdminPhasesAndTasksPage = createLazyComponent(() => import('./pages/AdminPhasesAndTasksPage'));
const WorkspacePage = createLazyComponent(() => import('./pages/WorkspacePage'));
const Perfil = createLazyComponent(() => import('./pages/Perfil'));
const UserProfileView = createLazyComponent(() => import('./pages/UserProfileView'));
const Configuracion = createLazyComponent(() => import('./pages/Configuracion'));
const Facturacion = createLazyComponent(() => import('./pages/Facturacion'));
const Soporte = createLazyComponent(() => import('./pages/Soporte'));
const Team = createLazyComponent(() => import('./pages/Team'));
const NotFound = createLazyComponent(() => import('./pages/NotFound'));
const AdvancedAnalytics = createLazyComponent(() => import('./components/AdvancedAnalytics'));
const CustomizableDashboard = createLazyComponent(() => import('./components/CustomizableDashboard'));
const AdvancedUserManagement = createLazyComponent(() => import('./components/AdvancedUserManagement'));
const InvitationPage = createLazyComponent(() => import('./pages/InvitationPage'));
const AuthCallback = createLazyComponent(() => import('./pages/AuthCallback'));
const GitHubCallback = createLazyComponent(() => import('./pages/GitHubCallback'));
import { GitHubDashboard } from './pages/GitHubDashboard';
const AdminGitHubProfile = createLazyComponent(() => import('./pages/AdminGitHubProfile'));
const EnvironmentVariables = createLazyComponent(() => import('./pages/EnvironmentVariables'));

const PageLoader = () => {
  const [showRetry, setShowRetry] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowRetry(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setShowRetry(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Cargando...</p>
        {showRetry ? (
          <div className="mt-4">
            <p className="mb-2 text-sm text-gray-500">¿Tarda mucho en cargar?</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
              onClick={handleRetry}
            >
              Reintentar
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ServiceWorkerInitializer = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      serviceWorkerManager.register().then((registration) => {
        if (registration) {
          return registration;
        }

        return null;
      });
    }
  }, []);

  return null;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingGate allowIncomplete>
              <Onboarding />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
      <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
      <Route path="/invite" element={<InvitationPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/github/callback" element={<GitHubCallback />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <PulseDashboardLayout>
                <HomePage />
              </PulseDashboardLayout>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/pulse"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <PulseDashboardLayout>
                <PulsePage />
              </PulseDashboardLayout>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/proyecto"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <PulseDashboardLayout>
                <ProjectsPage />
              </PulseDashboardLayout>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/pagos"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <PulseDashboardLayout>
                <Facturacion />
              </PulseDashboardLayout>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/soporte"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <PulseDashboardLayout>
                <Soporte />
              </PulseDashboardLayout>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/configuracion"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <PulseDashboardLayout>
                <Configuracion />
              </PulseDashboardLayout>
            </OnboardingGate>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Admin />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/websy-ai"
        element={
          <ProtectedRoute>
            <WebsyAI />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fases-tareas"
        element={
          <ProtectedRoute>
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
          <ProtectedRoute>
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
            <DashboardLayout key="perfil">
              <Perfil key="perfil-content" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil/:userId"
        element={
          <ProtectedRoute>
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
          <ProtectedRoute>
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
            <DashboardLayout>
              <ClientCollaborationPage />
            </DashboardLayout>
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
          <ProtectedRoute>
            <DashboardLayout>
              <Team />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/environment"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EnvironmentVariables />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
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
          <ProtectedRoute>
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

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Router
          basename={import.meta.env.BASE_URL || '/'}
          future={{
            v7_startTransition: false,
            v7_relativeSplatPath: false
          }}
        >
          <TouchGestureProvider enableGlobalGestures={true} enableNavigationGestures={true}>
            <ServiceWorkerInitializer />
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
          </TouchGestureProvider>
        </Router>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
