import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { AdminPageLoader } from '@/features/admin/components/AdminPageLoader';
import { useAdminAccessGate } from '@/features/admin/hooks/useAdminAccessGate';
import { useAdminDashboardMetrics } from '@/features/admin/hooks/useAdminDashboardMetrics';
import { useAdminDashboardPage } from '@/features/admin/hooks/useAdminDashboardPage';
import { useAdminScreenRegistry } from '@/features/admin/hooks/useAdminScreenRegistry';
import { useAdminSectionNavigation } from '@/features/admin/hooks/useAdminSectionNavigation';
import { AdminShell } from '@/features/admin/layout/AdminShell';
import { AdminUsersDialogs } from '@/features/admin/users/components/AdminUsersDialogs';
import { useAdminUsers } from '@/features/admin/users/hooks/useAdminUsers';

const AdminPage = React.memo(() => {
  const { user } = useApp();
  const navigate = useNavigate();
  const adminUsers = useAdminUsers();
  const dashboardPage = useAdminDashboardPage({ setUsers: adminUsers.setUsers });
  const { activeSection, activeUsersFilter, navigateToSection } = useAdminSectionNavigation();
  const { hasAdminAccess } = useAdminAccessGate({ user, navigate, loadData: dashboardPage.loadData });
  const metrics = useAdminDashboardMetrics({
    users: adminUsers.users,
    projects: dashboardPage.projects,
    tickets: dashboardPage.tickets,
    payments: dashboardPage.payments,
  });

  const screenRegistry = useAdminScreenRegistry({
    user,
    loading: dashboardPage.loading,
    users: adminUsers.users,
    setUsers: adminUsers.setUsers,
    enablingPulseUserId: adminUsers.enablingPulseUserId,
    reviewingDeletionUserId: adminUsers.reviewingDeletionUserId,
    payments: dashboardPage.payments,
    setPayments: dashboardPage.setPayments,
    metrics,
    activeUsersFilter,
    onSectionChange: navigateToSection,
    onUsersFilterChange: (filterId) => navigateToSection('usuarios', { usersFilter: filterId }),
    onRefreshData: dashboardPage.refreshData,
    onLoadData: () => {
      void dashboardPage.loadData();
    },
    onAddUser: () => adminUsers.setShowAddUserModal(true),
    onRoleChange: adminUsers.updateUserRole,
    onPulseAccessAction: (userId, mode) => {
      void adminUsers.handleEnablePulseAccess(userId, mode);
    },
    onReviewAccountDeletion: (targetUser, decision, note) => {
      void adminUsers.handleReviewAccountDeletion(targetUser, decision, note);
    },
    onEditUser: adminUsers.handleEditUser,
    onDeleteUser: adminUsers.handleDeleteUser,
  });

  if (!hasAdminAccess) return null;
  if (dashboardPage.loading) return <AdminPageLoader />;

  return (
    <>
      <AdminShell
        activeSection={activeSection}
        lastUpdate={dashboardPage.lastUpdate}
        onRefresh={dashboardPage.refreshData}
        onSectionChange={navigateToSection}
      >
        {screenRegistry[activeSection]}
      </AdminShell>

      <AdminUsersDialogs
        createOpen={adminUsers.showAddUserModal}
        onCreateOpenChange={adminUsers.setShowAddUserModal}
        createFormData={adminUsers.newUserData}
        onCreateFormDataChange={adminUsers.setNewUserData}
        onCreateSubmit={adminUsers.handleCreateUser}
        editOpen={adminUsers.showEditUserModal}
        onEditOpenChange={adminUsers.setShowEditUserModal}
        editingUser={adminUsers.editingUser}
        onEditingUserChange={adminUsers.setEditingUser}
        onEditSubmit={adminUsers.handleUpdateUser}
        deleteOpen={adminUsers.showDeleteUserModal}
        userToDelete={adminUsers.userToDelete}
        onDeleteClose={adminUsers.cancelDeleteUser}
        onDeleteConfirm={adminUsers.confirmDeleteUser}
      />
    </>
  );
});

AdminPage.displayName = 'AdminPage';

export default AdminPage;
