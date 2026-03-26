import type { ReactNode } from 'react';

import type { AdminPaymentRecord } from '@/api/admin/adminDashboard.api';
import type { User } from '@/contexts/appContext.types';
import { AdminPaymentsSection } from '@/features/admin/billing/components/AdminPaymentsSection';
import type { AdminSectionId } from '@/features/admin/constants/adminSections';
import { AdminOverviewScreen } from '@/features/admin/overview/components/AdminOverviewScreen';
import { AdminSettingsScreen } from '@/features/admin/settings/components/AdminSettingsScreen';
import { AdminUsersScreen } from '@/features/admin/users/components/AdminUsersScreen';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';
import ProjectApprovalManager from '@/components/ProjectApprovalManager';
import AdvancedTicketManager from '@/components/AdvancedTicketManager';
import { ProjectsManagement } from '@/components/admin/ProjectsManagement';
import AdminNotifications from '@/pages/AdminNotifications';

interface AdminDomainUpdateResult {
  website?: string | null;
  website_status?: string | null;
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
  onSectionChange: (sectionId: AdminSectionId) => void;
  onRefreshData: () => void;
  onLoadData: () => void;
  onAddUser: () => void;
  onRoleChange: (userId: string, newRole: string) => void;
  onEnablePulseAccess: (userId: string) => void;
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
        pagosCount={context.payments.length}
        onSectionChange={context.onSectionChange}
      />
    ),
    usuarios: (
      <AdminUsersScreen
        loading={context.loading}
        users={context.users}
        enablingPulseUserId={context.enablingPulseUserId}
        onRefresh={context.onRefreshData}
        onAddUser={context.onAddUser}
        onRoleChange={context.onRoleChange}
        onEnablePulseAccess={context.onEnablePulseAccess}
        onEdit={context.onEditUser}
        onDelete={context.onDeleteUser}
        onDomainUpdated={context.onDomainUpdated}
      />
    ),
    proyectos: <ProjectsManagement />,
    'aprobar-proyectos': (
      <ProjectApprovalManager
        user={context.user}
        onRefresh={() => {
          context.onLoadData();
        }}
      />
    ),
    tickets: <AdvancedTicketManager />,
    pagos: (
      <AdminPaymentsSection
        payments={context.payments}
        onUpdatePaymentStatus={context.onUpdatePaymentStatus}
      />
    ),
    notifications: <AdminNotifications />,
    settings: <AdminSettingsScreen onSaveReference={context.onSaveSettingsReference} />,
  };
}
