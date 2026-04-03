import { supabase } from './client.js';
import type { NotificationRow } from './types.js';

export async function fetchNotifications(userId: string, limit: number, unreadOnly: boolean) {
  let query = supabase
    .from('notifications')
    .select('id, title, message, category, type, is_read, is_urgent, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const [{ data, error }, { count, error: countError }] = await Promise.all([
    query,
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false),
  ]);

  if (error) throw error;
  if (countError) throw countError;

  return {
    userId,
    unreadCount: count ?? 0,
    notifications: (data ?? []) as NotificationRow[],
  };
}
