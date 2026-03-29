import type { ReactNode } from 'react';

import type { AdminPaymentRecord } from '@/api/admin/adminDashboard.api';
import type { User } from '@/contexts/appContext.types';
import { AdminPaymentsSection } from '@/features/admin/billing/components/AdminPaymentsSection';
import type { AdminSectionId } from '@/features/admin/constants/adminSections';
import { AdminOverviewScreen } from '@/features/admin/overview/components/AdminOverviewScreen';
import { AdminNotificationsInboxScreen } from '@/features/admin/notifications/pages/AdminNotificationsInboxScreen';
import { AdminProjectsScreen } from '@/features/admin/projects/components/AdminProjectsScreen';
import { AdminSettingsScreen } from '@/features/admin/settings/components/AdminSettingsScreen';
import { AdminUsersScreen } from '@/features/admin/users/components/AdminUsersScreen';
import type { AdminUsersFilterId } from '@/features/admin/users/constants/adminUsersFilters';
import type { PulseAccessActionMode } from '@/features/admin/users/hooks/useAdminUsers';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';
import type { WebsiteReviewStatus } from '@/features/admin/services/pulseDomainAdminService';
import type { AdminSectionChangeHandler } from '@/features/admin/types/adminNavigation';
import AdvancedTicketManager from '@/components/AdvancedTicketManager';

interface AdminDomainUpdateResult {
  website?: string | null;
  website_status?: WebsiteReviewStatus | null;
  website_submitted_at?: string | null;
  website_reviewed_at?: string | null;
  website_reviewed_by?: string | null;
  website_review_notes?: string | null;
}

export interface AdminScreenRegistryContext {
  user: User | null;
  loading: boolean;
  users: AdminManagedUser[];
  enablingPulseUserId: string | null;
  reviewingDeletionUserId: string | null;
  payments: AdminPaymentRecord[];
  isCalendarAuthenticated: boolean;
  calendarLoading: boolean;
  calendarUserLabel: string;
  onAuthenticateCalendar: () => void;
  metrics: {
    usuariosActivos: number;
    usuariosNuevos: number;
    crecimientoUsuarios: number;
    proyectosTotales: number;
    proyectosNuevos: number;
    proyectosEnCurso: number;
    tasaCompletacionProyectos: number;
    ticketsAbiertos: number;
    ticketsUrgentes: number;
    ticketsEnProgreso: number;
    ingresosTotales: number;
    ingresosEsteMes: number;
  };
  activeUsersFilter: AdminUsersFilterId;
  onSectionChange: AdminSectionChangeHandler;
  onUsersFilterChange: (filterId: AdminUsersFilterId) => void;
  onRefreshData: () => void;
  onLoadData: () => void;
  onAddUser: () => void;
  onRoleChange: (userId: string, newRole: string) => void;
  onPulseAccessAction: (userId: string, mode: PulseAccessActionMode) => void;
  onReviewAccountDeletion: (
    user: AdminManagedUser,
    decision: 'approve' | 'deny',
    note?: string,
  ) => void;
  onEditUser: (user: AdminManagedUser) => void;
  onDeleteUser: (user: AdminManagedUser) => void;
  onDomainUpdated: (userId: string, result: AdminDomainUpdateResult) => void;
  onUpdatePaymentStatus: (paymentId: string, newStatus: string) => Promise<void>;
  onSaveSettingsReference: () => void;
}

export function createAdminScreenRegistry(
  context: AdminScreenRegistryContext,
): Record<AdminSectionId, ReactNode> {
  return {
    dashboard: (
      <AdminOverviewScreen
        isCalendarAuthenticated={context.isCalendarAuthenticated}
        calendarLoading={context.calendarLoading}
        calendarUserLabel={context.calendarUserLabel}
        onAuthenticateCalendar={context.onAuthenticateCalendar}
        usuariosActivos={context.metrics.usuariosActivos}
        usuariosNuevos={context.metrics.usuariosNuevos}
        crecimientoUsuarios={context.metrics.crecimientoUsuarios}
        proyectosTotales={context.metrics.proyectosTotales}
        proyectosNuevos={context.metrics.proyectosNuevos}
        proyectosEnCurso={context.metrics.proyectosEnCurso}
        tasaCompletacionProyectos={context.metrics.tasaCompletacionProyectos}
        ticketsAbiertos={context.metrics.ticketsAbiertos}
        ticketsUrgentes={context.metrics.ticketsUrgentes}
        ticketsEnProgreso={context.metrics.ticketsEnProgreso}
        ingresosTotales={context.metrics.ingresosTotales}
        ingresosEsteMes={context.metrics.ingresosEsteMes}
        onSectionChange={context.onSectionChange}
      />
    ),
    usuarios: (
      <AdminUsersScreen
        loading={context.loading}
        users={context.users}
        activeFilter={context.activeUsersFilter}
        enablingPulseUserId={context.enablingPulseUserId}
        reviewingDeletionUserId={context.reviewingDeletionUserId}
        onFilterChange={context.onUsersFilterChange}
        onRefresh={context.onRefreshData}
        onAddUser={context.onAddUser}
        onRoleChange={context.onRoleChange}
        onPulseAccessAction={context.onPulseAccessAction}
        onReviewAccountDeletion={context.onReviewAccountDeletion}
        onEdit={context.onEditUser}
        onDelete={context.onDeleteUser}
        onDomainUpdated={context.onDomainUpdated}
      />
    ),
    proyectos: <AdminProjectsScreen />,
    tickets: <AdvancedTicketManager />,
    pagos: (
      <AdminPaymentsSection
        payments={context.payments}
        onUpdatePaymentStatus={context.onUpdatePaymentStatus}
      />
    ),
    notifications: <AdminNotificationsInboxScreen />,
    settings: <AdminSettingsScreen onSaveReference={context.onSaveSettingsReference} />,
  };
}
