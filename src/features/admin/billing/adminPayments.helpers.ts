import type { AdminPaymentRecord } from '@/api/admin/adminDashboard.api';
import { PAYMENT_TYPES } from '@/features/payments/services/mercadoPago';

export function getAdminPaymentDisplayName(payment: AdminPaymentRecord): string {
  const paymentType = PAYMENT_TYPES[payment.payment_type as keyof typeof PAYMENT_TYPES];
  return paymentType?.name || payment.description || 'Pago sin descripción';
}

export function getAdminPaymentCustomerLabel(payment: AdminPaymentRecord): string {
  return payment.user_name || payment.user_email || 'Cliente sin identificar';
}

export function getAdminPaymentCustomerEmail(payment: AdminPaymentRecord): string | null {
  return payment.user_email || null;
}
