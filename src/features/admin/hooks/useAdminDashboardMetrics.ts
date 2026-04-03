import type { AdminPaymentRecord, AdminProjectRecord } from '@/api/admin/adminDashboard.api';
import type { AdminDashboardTicket } from '@/features/admin/services/adminDashboardService';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';
import { normalizeAdminPaymentStatus } from '@/features/admin/billing/adminPayments.utils';

interface UseAdminDashboardMetricsParams {
  users: AdminManagedUser[];
  projects: AdminProjectRecord[];
  tickets: AdminDashboardTicket[];
  payments: AdminPaymentRecord[];
}

export function useAdminDashboardMetrics({
  users,
  projects,
  tickets,
  payments,
}: UseAdminDashboardMetricsParams) {
  const usuariosActivos = users.length;
  const usuariosNuevos = users.filter((user) => {
    const userDate = new Date(user.created_at);
    const currentDate = new Date();

    return (
      userDate.getMonth() === currentDate.getMonth() &&
      userDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  const proyectosTotales = projects.length;
  const proyectosNuevos = projects.filter((project) => {
    const projectDate = new Date(project.created_at);
    const currentDate = new Date();

    return (
      projectDate.getMonth() === currentDate.getMonth() &&
      projectDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  const proyectosEnCurso = projects.filter((project) => project.status !== 'completed').length;
  const proyectosCompletados = projects.filter((project) => project.status === 'completed').length;

  const approvedPayments = payments.filter(
    (payment) => normalizeAdminPaymentStatus(payment.status) === 'approved',
  );

  const ingresosTotales = approvedPayments.reduce((accumulator, payment) => {
    return accumulator + (Number(payment.amount) || 0);
  }, 0);

  const ingresosEsteMes = approvedPayments
    .filter((payment) => {
      const paymentDate = new Date(payment.created_at);
      const currentDate = new Date();

      return (
        paymentDate.getMonth() === currentDate.getMonth() &&
        paymentDate.getFullYear() === currentDate.getFullYear()
      );
    })
    .reduce((accumulator, payment) => {
      return accumulator + (Number(payment.amount) || 0);
    }, 0);

  const ticketsAbiertos = tickets.filter((ticket) => ticket.status !== 'closed').length;
  const ticketsUrgentes = tickets.filter(
    (ticket) => ticket.priority === 'high' && ticket.status !== 'closed',
  ).length;
  const ticketsEnProgreso = tickets.filter((ticket) => ticket.status === 'in_progress').length;

  const tasaCompletacionProyectos =
    projects.length > 0 ? Math.round((proyectosCompletados / projects.length) * 100) : 0;
  const crecimientoUsuarios =
    users.length > 0 ? Math.round((usuariosNuevos / users.length) * 100) : 0;

  return {
    usuariosActivos,
    usuariosNuevos,
    proyectosTotales,
    proyectosNuevos,
    proyectosEnCurso,
    ingresosTotales,
    ingresosEsteMes,
    ticketsAbiertos,
    ticketsUrgentes,
    ticketsEnProgreso,
    tasaCompletacionProyectos,
    crecimientoUsuarios,
  };
}
