import { supabase } from '@/lib/supabase/supabase';
import type { Payment } from '@/types';

import { normalizePayment, type PaymentRow } from '@/features/payments/services/payment.service.types';

async function fetchUserPayments(userId: string, userEmail: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .or(`user_id.eq.${userId},user_email.eq.${userEmail}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as PaymentRow[]).map(normalizePayment);
}

export function getUserPayments(
  userId: string,
  userEmail: string,
  callback: (payments: Payment[]) => void,
) {
  const loadPayments = async () => {
    try {
      const payments = await fetchUserPayments(userId, userEmail);
      callback(payments);
    } catch (error) {
      console.warn('Error cargando pagos del usuario:', error);
      callback([]);
    }
  };

  const subscription = supabase
    .channel(`user_payments_changes_${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'payments' },
      () => {
        void loadPayments();
      },
    )
    .subscribe();

  void loadPayments();

  return () => subscription.unsubscribe();
}

export function getAllPayments(callback: (payments: Payment[]) => void) {
  const loadPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error cargando todos los pagos:', error);
      callback([]);
      return;
    }

    callback(((data ?? []) as PaymentRow[]).map(normalizePayment));
  };

  const subscription = supabase
    .channel('all_payments_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
      void loadPayments();
    })
    .subscribe();

  void loadPayments();

  return () => subscription.unsubscribe();
}
