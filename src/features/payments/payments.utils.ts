import type { BadgeProps } from '@/core/components';
import type { Payment } from '@/types';

export function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'approved':
      return 'Completado';
    case 'pending':
      return 'Pendiente';
    case 'rejected':
      return 'Fallido';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
}

export function getPaymentStatusVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    case 'cancelled':
    default:
      return 'default';
  }
}

export function getApprovedPaymentsTotal(payments: Payment[]): number {
  return payments
    .filter((payment) => payment.status === 'approved')
    .reduce((total, payment) => total + (payment.amount || 0), 0);
}

export function getCompletedPaymentsCount(payments: Payment[]): number {
  return payments.filter((payment) => payment.status === 'approved').length;
}

export function getPendingPaymentsCount(payments: Payment[]): number {
  return payments.filter((payment) => payment.status === 'pending').length;
}
