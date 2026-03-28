import type { Dispatch, SetStateAction } from 'react';

import type { AdminPaymentRecord } from '@/api/admin/adminDashboard.api';
import type { User } from '@/contexts/appContext.types';
import { updateAdminPaymentStatus } from '@/features/admin/billing/services/adminBillingService';
import {
  createAdminScreenRegistry,
  type AdminScreenRegistryContext,
} from '@/features/admin/screens/adminScreenRegistry';
import type { AdminUsersFilterId } from '@/features/admin/users/constants/adminUsersFilters';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';
import { toast } from '@/hooks/use-toast';

interface CalendarUserInfo {
  email: string;
  name: string;
}

interface UseAdminScreenRegistryParams {
  user: User | null;
  loading: boolean;
  users: AdminManagedUser[];
  setUsers: Dispatch<SetStateAction<AdminManagedUser[]>>;
  enablingPulseUserId: string | null;
  payments: AdminPaymentRecord[];
  setPayments: Dispatch<SetStateAction<AdminPaymentRecord[]>>;
  isCalendarAuthenticated: boolean;
  calendarLoading: boolean;
  calendarUserInfo: CalendarUserInfo | null;
  onAuthenticateCalendar: () => Promise<boolean>;
  metrics: AdminScreenRegistryContext['metrics'];
  activeUsersFilter: AdminUsersFilterId;
  onSectionChange: AdminScreenRegistryContext['onSectionChange'];
  onUsersFilterChange: AdminScreenRegistryContext['onUsersFilterChange'];
  onRefreshData: AdminScreenRegistryContext['onRefreshData'];
  onLoadData: AdminScreenRegistryContext['onLoadData'];
  onAddUser: AdminScreenRegistryContext['onAddUser'];
  onRoleChange: AdminScreenRegistryContext['onRoleChange'];
  onPulseAccessAction: AdminScreenRegistryContext['onPulseAccessAction'];
  onEditUser: AdminScreenRegistryContext['onEditUser'];
  onDeleteUser: AdminScreenRegistryContext['onDeleteUser'];
}

export function useAdminScreenRegistry({
  user,
  loading,
  users,
  setUsers,
  enablingPulseUserId,
  payments,
  setPayments,
  isCalendarAuthenticated,
  calendarLoading,
  calendarUserInfo,
  onAuthenticateCalendar,
  metrics,
  activeUsersFilter,
  onSectionChange,
  onUsersFilterChange,
  onRefreshData,
  onLoadData,
  onAddUser,
  onRoleChange,
  onPulseAccessAction,
  onEditUser,
  onDeleteUser,
}: UseAdminScreenRegistryParams) {
  async function handlePaymentStatusUpdate(paymentId: string, newStatus: string) {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'No se pudo identificar al administrador.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateAdminPaymentStatus(paymentId, newStatus, user.id);
      setPayments((currentPayments) =>
        currentPayments.map((payment) =>
          payment.id === paymentId ? { ...payment, status: newStatus } : payment,
        ),
      );
      toast({
        title: 'Exito',
        description: 'Estado del pago actualizado correctamente.',
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pago.',
        variant: 'destructive',
      });
    }
  }

  return createAdminScreenRegistry({
    user,
    loading,
    users,
    enablingPulseUserId,
    payments,
    isCalendarAuthenticated,
    calendarLoading,
    calendarUserLabel: isCalendarAuthenticated
      ? `Agenda conectada como ${calendarUserInfo?.name || calendarUserInfo?.email || 'Usuario'}`
      : calendarLoading
        ? 'Conectando...'
        : 'Agenda no conectada',
    onAuthenticateCalendar,
    metrics,
    activeUsersFilter,
    onSectionChange,
    onUsersFilterChange,
    onRefreshData,
    onLoadData,
    onAddUser,
    onRoleChange,
    onPulseAccessAction,
    onEditUser,
    onDeleteUser,
    onDomainUpdated: (userId, result) => {
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === userId
            ? {
                ...currentUser,
                website: result.website,
                website_status: result.website_status,
                website_submitted_at: result.website_submitted_at,
                website_reviewed_at: result.website_reviewed_at,
                website_reviewed_by: result.website_reviewed_by,
                website_review_notes: result.website_review_notes,
                updated_at: new Date().toISOString(),
              }
            : currentUser,
        ),
      );
    },
    onUpdatePaymentStatus: handlePaymentStatusUpdate,
    onSaveSettingsReference: () => {
      toast({
        title: 'Info',
        description: 'Este panel todavia no persiste cambios.',
      });
    },
  });
}
