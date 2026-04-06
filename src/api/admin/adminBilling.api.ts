import { supabase } from '@/data/supabase/client';

export async function updateAdminPaymentRecordStatus(
  paymentId: string,
  newStatus: string,
): Promise<void> {
  const { error } = await supabase
    .from('payments')
    .update({ status: newStatus })
    .eq('id', paymentId);

  if (error) {
    throw error;
  }
}
