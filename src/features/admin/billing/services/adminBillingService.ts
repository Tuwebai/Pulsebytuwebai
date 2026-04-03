import { updateAdminPaymentRecordStatus } from '@/api/admin/adminBilling.api';
import { createAdminNotification } from '@/features/admin/notifications/services/adminNotificationMutations.service';
import { getAdminPaymentStatusLabel } from '../adminPayments.utils';

export async function updateAdminPaymentStatus(
  paymentId: string,
  newStatus: string,
  actorUserId: string,
) {
  await updateAdminPaymentRecordStatus(paymentId, newStatus);

  await createAdminNotification({
    title: 'Estado de pago actualizado',
    message: `El pago ahora figura como ${getAdminPaymentStatusLabel(newStatus).toLowerCase()}.`,
    type: 'info',
    user_id: actorUserId,
    category: 'payment',
  });
}
