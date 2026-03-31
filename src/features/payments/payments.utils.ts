import type { BadgeProps } from '@/core/components';
import { PAYMENT_TYPES } from '@/lib/mercadopago';
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

export function getPaymentPlanName(payment: Pick<Payment, 'paymentType' | 'description'>): string {
  const paymentType = PAYMENT_TYPES[payment.paymentType as keyof typeof PAYMENT_TYPES];
  return paymentType?.name || payment.description;
}

export function getPaymentPlanFeatures(payment: Pick<Payment, 'paymentType' | 'features'>): string[] {
  const paymentType = PAYMENT_TYPES[payment.paymentType as keyof typeof PAYMENT_TYPES];
  return payment.features.length > 0 ? payment.features : [...(paymentType?.features ?? [])];
}

export function isPaymentRetryable(status: string): boolean {
  return status === 'pending' || status === 'rejected' || status === 'cancelled';
}

export function getPaymentStatusMessage(status: string): string {
  switch (status) {
    case 'approved':
      return 'Tu pago ya quedó acreditado y el comprobante está listo para descargar.';
    case 'pending':
      return 'Estamos esperando la confirmación del cobro. Si lo necesitas, puedes volver a intentarlo.';
    case 'rejected':
      return 'El intento de cobro no se pudo confirmar. Puedes abrir un nuevo checkout cuando quieras.';
    case 'cancelled':
      return 'Este intento se cerró antes de completarse. Puedes iniciar otro pago en segundos.';
    default:
      return 'Estamos revisando el estado de este movimiento.';
  }
}
