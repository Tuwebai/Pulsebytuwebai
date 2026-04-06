import { supabase } from '@/data/supabase/client';
import type { Notification, NotificationCategory, NotificationPreferences, NotificationType } from '@/data/types/notifications';

interface NotificationRow {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  category: string;
  is_read: boolean | null;
  is_urgent?: boolean | null;
  metadata: unknown;
  created_at: string | null;
  action_url?: string | null;
  updated_at?: string | null;
}

interface UserPreferenceRow {
  notif_new_consultation: boolean | null;
  notif_monthly_summary: boolean | null;
  notif_project_update: boolean | null;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  notif_new_consultation: true,
  notif_monthly_summary: true,
  notif_project_update: false
};

function normalizeMetadata(row: NotificationRow): Record<string, unknown> | null {
  const base =
    row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? { ...(row.metadata as Record<string, unknown>) }
      : {};

  if (row.action_url) {
    base.action_url = row.action_url;
  }

  return Object.keys(base).length > 0 ? base : null;
}

function normalizeType(row: NotificationRow): NotificationType {
  if (
    row.type === 'info' ||
    row.type === 'success' ||
    row.type === 'warning' ||
    row.type === 'error' ||
    row.type === 'critical'
  ) {
    return row.type;
  }

  return 'info';
}

function normalizeCategory(row: NotificationRow): NotificationCategory {
  if (
    row.category === 'system' ||
    row.category === 'project' ||
    row.category === 'ticket' ||
    row.category === 'payment' ||
    row.category === 'security' ||
    row.category === 'user'
  ) {
    return row.category;
  }

  return 'system';
}

function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    user_id: row.user_id || '',
    type: normalizeType(row),
    category: normalizeCategory(row),
    title: row.title,
    message: row.message || null,
    is_read: row.is_read ?? false,
    is_urgent: row.is_urgent ?? false,
    action_url: row.action_url ?? null,
    metadata: normalizeMetadata(row),
    created_at: row.created_at || new Date(0).toISOString(),
    updated_at: row.updated_at || null
  };
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    throw new Error('No pudimos identificar tu sesión para consultar notificaciones.');
  }

  return user.id;
}

export async function fetchNotifications(limit = 20): Promise<Notification[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, title, message, type, category, is_read, is_urgent, metadata, created_at, updated_at, action_url')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`No pudimos consultar tus notificaciones: ${error.message}`);
  }

  return ((data || []) as NotificationRow[]).map(mapNotification);
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);

  if (error) {
    throw new Error(`No pudimos marcar la notificación como leída: ${error.message}`);
  }
}

export async function markAllAsRead(): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    throw new Error(`No pudimos marcar todas las notificaciones como leídas: ${error.message}`);
  }
}

export async function fetchUnreadCount(): Promise<number> {
  const userId = await getCurrentUserId();
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    throw new Error(`No pudimos contar tus notificaciones pendientes: ${error.message}`);
  }

  return count || 0;
}

export async function fetchPreferences(): Promise<NotificationPreferences> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('users')
    .select('notif_new_consultation, notif_monthly_summary, notif_project_update')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`No pudimos consultar tus preferencias de notificaciones: ${error.message}`);
  }

  const row = data as UserPreferenceRow | null;

  return {
    notif_new_consultation: row?.notif_new_consultation ?? DEFAULT_PREFERENCES.notif_new_consultation,
    notif_monthly_summary: row?.notif_monthly_summary ?? DEFAULT_PREFERENCES.notif_monthly_summary,
    notif_project_update: row?.notif_project_update ?? DEFAULT_PREFERENCES.notif_project_update
  };
}

export async function updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('users').update(preferences).eq('id', userId);

  if (error) {
    throw new Error(`No pudimos guardar tus preferencias de notificaciones: ${error.message}`);
  }
}
