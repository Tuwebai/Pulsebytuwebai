import { PAYMENT_TYPES } from '@/lib/mercadopago';
import type { AdminPaymentRecord } from '@/api/admin/adminDashboard.api';

export function getAdminPaymentDisplayName(payment: AdminPaymentRecord): string {
  const paymentType = PAYMENT_TYPES[payment.payment_type as keyof typeof PAYMENT_TYPES];
  return paymentType?.name || payment.description || 'Pago sin descripción';
}
