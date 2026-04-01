import type { AdminPaymentRecord } from '@/api/admin/adminDashboard.api';
import { formatCurrency } from '@/lib/mercadopago';

export function normalizeAdminPaymentStatus(status: string | null | undefined) {
  switch (status) {
    case 'completed':
      return 'approved';
    case 'failed':
      return 'rejected';
    default:
      return status || 'pending';
  }
}

export function getAdminPaymentStatusLabel(status: string | null | undefined) {
  switch (normalizeAdminPaymentStatus(status)) {
    case 'approved':
      return 'Acreditado';
    case 'in_process':
      return 'En revisión';
    case 'rejected':
      return 'Rechazado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Pendiente';
  }
}

export function getAdminPaymentStatusVariant(status: string | null | undefined) {
  switch (normalizeAdminPaymentStatus(status)) {
    case 'approved':
      return 'success' as const;
    case 'in_process':
      return 'warning' as const;
    case 'rejected':
      return 'danger' as const;
    default:
      return 'default' as const;
  }
}

export function formatAdminPaymentAmount(amount: AdminPaymentRecord['amount']) {
  return formatCurrency(Number(amount) || 0, 'ARS');
}

export function getApprovedAdminPaymentsTotal(payments: AdminPaymentRecord[]) {
  return payments
    .filter((payment) => normalizeAdminPaymentStatus(payment.status) === 'approved')
    .reduce((total, payment) => total + (Number(payment.amount) || 0), 0);
}

export function getPendingAdminPaymentsCount(payments: AdminPaymentRecord[]) {
  return payments.filter((payment) => normalizeAdminPaymentStatus(payment.status) === 'pending').length;
}
