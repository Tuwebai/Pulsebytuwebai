import { updateAdminPaymentRecordStatus } from '@/api/admin/adminBilling.api';
import { notificationService } from '@/lib/notificationService';

export async function updateAdminPaymentStatus(
  paymentId: string,
  newStatus: string,
  actorUserId: string,
) {
  await updateAdminPaymentRecordStatus(paymentId, newStatus);

  await notificationService.createNotification({
    title: 'Estado de Pago Actualizado',
    message: `El pago ha sido marcado como ${newStatus}`,
    type: 'info',
    user_id: actorUserId,
    category: 'payment',
  });
}
