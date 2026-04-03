import { supabase } from '@/lib/supabase/supabase';
import type { CreateNotificationData, Notification } from '@/types';

export async function createAdminNotification(notificationData: CreateNotificationData): Promise<Notification> {
  const { data, error } = await supabase.from('notifications').insert([notificationData]).select().single();

  if (error) {
    throw new Error(`No pudimos crear la notificación interna: ${error.message}`);
  }

  return data as Notification;
}
