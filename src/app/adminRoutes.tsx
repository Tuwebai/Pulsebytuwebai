import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';
import { Navigate, Route } from 'react-router-dom';
import LegacyDashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

type LazyPage = LazyExoticComponent<ComponentType>;

interface AdminRoutesComponents {
  Admin: LazyPage;
  AdminProjectAlertsPage: LazyPage;
  AdminProjectCriticalTaskDetailPage: LazyPage;
  AdminProjectCriticalTasksPage: LazyPage;
  AdminProjectPhaseDetailPage: LazyPage;
  AdminProjectPhasesPage: LazyPage;
  AdminProjectTrackingPage: LazyPage;
  ProjectsPage: LazyPage;
  UserProfileView: LazyPage;
}

export function renderAdminRoutes({
  Admin,
  AdminProjectAlertsPage,
  AdminProjectCriticalTaskDetailPage,
  AdminProjectCriticalTasksPage,
  AdminProjectPhaseDetailPage,
  AdminProjectPhasesPage,
  AdminProjectTrackingPage,
  ProjectsPage,
  UserProfileView,
}: AdminRoutesComponents): ReactNode {
  return (
    <>
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/:sectionId"
        element={
          <ProtectedRoute requiredRole="admin">
            <Admin />
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
        path="/admin/proyectos/:projectId/seguimiento/alertas"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminProjectAlertsPage />
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
            <LegacyDashboardLayout key="proyectos-user">
              <ProjectsPage key="proyectos-user-content" />
            </LegacyDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil/:userId"
        element={
          <ProtectedRoute requiredRole="admin">
            <LegacyDashboardLayout key="user-profile">
              <UserProfileView key="user-profile-content" />
            </LegacyDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute requiredRole="admin">
            <Navigate replace to="/admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute requiredRole="admin">
            <Navigate replace to="/admin/usuarios" />
          </ProtectedRoute>
        }
      />
    </>
  );
}
