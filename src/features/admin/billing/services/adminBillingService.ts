import { notificationService } from '@/lib/notificationService';
import { supabase } from '@/lib/supabase';

export async function updateAdminPaymentStatus(
  paymentId: string,
  newStatus: string,
  actorUserId: string,
) {
  const { error } = await supabase
    .from('payments')
    .update({ status: newStatus })
    .eq('id', paymentId);

  if (error) {
    throw error;
  }

  await notificationService.createNotification({
    title: 'Estado de Pago Actualizado',
    message: `El pago ha sido marcado como ${newStatus}`,
    type: 'info',
    user_id: actorUserId,
    category: 'payment',
  });
}
