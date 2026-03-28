import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';
import { Navigate, Route } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

type LazyPage = LazyExoticComponent<ComponentType>;

interface AdminRoutesComponents {
  Admin: LazyPage;
  AdminProjectCriticalTaskDetailPage: LazyPage;
  AdminProjectCriticalTasksPage: LazyPage;
  AdminProjectPhaseDetailPage: LazyPage;
  AdminProjectPhasesPage: LazyPage;
  AdminProjectTrackingPage: LazyPage;
  AdminGitHubProfile: LazyPage;
  AdvancedAnalytics: LazyPage;
  AdvancedUserManagement: LazyPage;
  EnvironmentVariables: LazyPage;
  ProjectsPage: LazyPage;
  UserProfileView: LazyPage;
}

export function renderAdminRoutes({
  Admin,
  AdminProjectCriticalTaskDetailPage,
  AdminProjectCriticalTasksPage,
  AdminProjectPhaseDetailPage,
  AdminProjectPhasesPage,
  AdminProjectTrackingPage,
  AdminGitHubProfile,
  AdvancedAnalytics,
  AdvancedUserManagement,
  EnvironmentVariables,
  ProjectsPage,
  UserProfileView,
}: AdminRoutesComponents): ReactNode {
  return (
    <>
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
        path="/admin/:sectionId"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <Admin />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/proyectos/:projectId/seguimiento"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminProjectTrackingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/proyectos/:projectId/seguimiento/fases"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminProjectPhasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/proyectos/:projectId/seguimiento/fases/:phaseId"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminProjectPhaseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/proyectos/:projectId/seguimiento/tareas"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminProjectCriticalTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/proyectos/:projectId/seguimiento/tareas/:taskId"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminProjectCriticalTaskDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/configuracion"
        element={
          <ProtectedRoute requiredRole="admin">
            <Navigate replace to="/admin/settings" />
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
        path="/profile/:userId/github"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminGitHubProfile />
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
        path="/user-management"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <AdvancedUserManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </>
  );
}
