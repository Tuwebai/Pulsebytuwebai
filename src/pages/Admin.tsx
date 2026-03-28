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
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

const Admin = React.memo(() => {
  const { user } = useApp();
  const navigate = useNavigate();

  const {
    users: usuarios,
    setUsers: setUsuarios,
    showAddUserModal,
    setShowAddUserModal,
    showEditUserModal,
    setShowEditUserModal,
    enablingPulseUserId,
    editingUser,
    setEditingUser,
    showDeleteUserModal,
    userToDelete,
    newUserData,
    setNewUserData,
    updateUserRole,
    handleEditUser,
    handleDeleteUser,
    confirmDeleteUser,
    cancelDeleteUser,
    handleCreateUser,
    handleUpdateUser,
    handleEnablePulseAccess,
  } = useAdminUsers();

  const {
    loading,
    projects: proyectos,
    tickets,
    payments: pagos,
    setPayments: setPagos,
    lastUpdate,
    loadData,
    refreshData,
  } = useAdminDashboardPage({
    setUsers: setUsuarios,
  });

  const { activeSection, activeUsersFilter, navigateToSection } = useAdminSectionNavigation();
  const {
    isAuthenticated: isCalendarAuthenticated,
    userInfo: calendarUserInfo,
    authenticate: authenticateCalendar,
    isLoading: calendarLoading,
  } = useGoogleCalendar(user);

  const { hasAdminAccess } = useAdminAccessGate({
    user,
    navigate,
    loadData,
  });

  const metrics = useAdminDashboardMetrics({
    users: usuarios,
    projects: proyectos,
    tickets,
    payments: pagos,
  });

  const screenRegistry = useAdminScreenRegistry({
    user,
    loading,
    users: usuarios,
    setUsers: setUsuarios,
    enablingPulseUserId,
    payments: pagos,
    setPayments: setPagos,
    isCalendarAuthenticated,
    calendarLoading,
    calendarUserInfo,
    onAuthenticateCalendar: authenticateCalendar,
    metrics,
    activeUsersFilter,
    onSectionChange: navigateToSection,
    onUsersFilterChange: (filterId) => navigateToSection('usuarios', { usersFilter: filterId }),
    onRefreshData: refreshData,
    onLoadData: () => {
      void loadData();
    },
    onAddUser: () => setShowAddUserModal(true),
    onRoleChange: updateUserRole,
    onPulseAccessAction: (userId, mode) => {
      void handleEnablePulseAccess(userId, mode);
    },
    onEditUser: handleEditUser,
    onDeleteUser: handleDeleteUser,
  });

  if (!hasAdminAccess) {
    return null;
  }

  if (loading) {
    return <AdminPageLoader />;
  }

  return (
    <>
      <AdminShell
        activeSection={activeSection}
        lastUpdate={lastUpdate}
        onRefresh={refreshData}
        onSectionChange={navigateToSection}
      >
        {screenRegistry[activeSection]}
      </AdminShell>

      <AdminUsersDialogs
        createOpen={showAddUserModal}
        onCreateOpenChange={setShowAddUserModal}
        createFormData={newUserData}
        onCreateFormDataChange={setNewUserData}
        onCreateSubmit={handleCreateUser}
        editOpen={showEditUserModal}
        onEditOpenChange={setShowEditUserModal}
        editingUser={editingUser}
        onEditingUserChange={setEditingUser}
        onEditSubmit={handleUpdateUser}
        deleteOpen={showDeleteUserModal}
        userToDelete={userToDelete}
        onDeleteClose={cancelDeleteUser}
        onDeleteConfirm={confirmDeleteUser}
      />
    </>
  );
});

Admin.displayName = 'Admin';

export default Admin;
