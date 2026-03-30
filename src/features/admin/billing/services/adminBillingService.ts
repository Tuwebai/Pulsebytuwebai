import { updateAdminPaymentRecordStatus } from '@/api/admin/adminBilling.api';
import { notificationService } from '@/lib/services/notificationService';
import { getAdminPaymentStatusLabel } from '../adminPayments.utils';

export async function updateAdminPaymentStatus(
  paymentId: string,
  newStatus: string,
  actorUserId: string,
) {
  await updateAdminPaymentRecordStatus(paymentId, newStatus);

  await notificationService.createNotification({
    title: 'Estado de pago actualizado',
    message: `El pago ahora figura como ${getAdminPaymentStatusLabel(newStatus).toLowerCase()}.`,
    type: 'info',
    user_id: actorUserId,
    category: 'payment',
  });
}
