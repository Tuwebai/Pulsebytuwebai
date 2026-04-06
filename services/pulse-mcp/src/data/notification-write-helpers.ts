import { canReadUser } from '../auth.js';
import { supabase } from './client.js';
import type { UserRow } from './types.js';

export const NOTIFICATION_RETURNING = [
  'id',
  'user_id',
  'title',
  'message',
  'type',
  'category',
  'is_read',
  'is_urgent',
  'action_url',
  'metadata',
  'expires_at',
  'created_at',
  'updated_at',
].join(', ');

export interface NotificationRecord {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  category: string;
  is_read: boolean | null;
  is_urgent: boolean | null;
  action_url: string | null;
  metadata: Record<string, unknown> | null;
  expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface NotificationWriteInput {
  title: string;
  message: string;
  category?: string;
  type?: string;
  actionUrl?: string;
  isUrgent?: boolean;
}

type NotificationRecipient = Pick<UserRow, 'id' | 'email' | 'full_name'>;

type ActiveNotificationUserRow = NotificationRecipient & {
  onboarding_completed?: boolean | null;
  pulse_access_status?: string | null;
  role?: string | null;
};

function buildNotificationPayload(userId: string, input: NotificationWriteInput) {
  const title = input.title.trim();
  const message = input.message.trim();

  if (!title) {
    throw new Error('Necesitamos un titulo para enviar la notificacion.');
  }

  if (!message) {
    throw new Error('Necesitamos un mensaje para enviar la notificacion.');
  }

  const now = new Date().toISOString();

  return {
    user_id: userId,
    title,
    message,
    type: input.type ?? 'info',
    category: input.category ?? 'system',
    is_read: false,
    is_urgent: input.isUrgent ?? false,
    action_url: input.actionUrl?.trim() || null,
    metadata: {
      source: 'pulse_mcp',
    },
    created_at: now,
    updated_at: now,
  };
}

async function findRecentNotification(input: {
  userId: string;
  title: string;
  message: string;
  category: string;
  type: string;
  actionUrl: string | null;
  isUrgent: boolean;
  windowMs?: number;
}) {
  const createdAfter = new Date(Date.now() - (input.windowMs ?? 30_000)).toISOString();
  let query = supabase
    .from('notifications')
    .select(NOTIFICATION_RETURNING)
    .eq('user_id', input.userId)
    .eq('title', input.title)
    .eq('message', input.message)
    .eq('type', input.type)
    .eq('category', input.category)
    .eq('is_urgent', input.isUrgent)
    .gte('created_at', createdAfter)
    .order('created_at', { ascending: false })
    .limit(1);

  query = input.actionUrl
    ? query.eq('action_url', input.actionUrl)
    : query.is('action_url', null);

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as NotificationRecord | null;
}

export async function insertNotificationForUser(user: NotificationRecipient, input: NotificationWriteInput) {
  const payload = buildNotificationPayload(user.id, input);
  const recentDuplicate = await findRecentNotification({
    userId: user.id,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    category: payload.category,
    actionUrl: payload.action_url,
    isUrgent: payload.is_urgent,
  });

  if (recentDuplicate) {
    return {
      resolvedUser: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      notification: recentDuplicate,
    };
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert(payload)
    .select(NOTIFICATION_RETURNING)
    .single();

  if (error) {
    throw error;
  }

  return {
    resolvedUser: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
    },
    notification: data as unknown as NotificationRecord,
  };
}

export async function fetchNotificationById(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_RETURNING)
    .eq('id', notificationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as NotificationRecord | null;
}

export async function fetchOwnedNotification(notificationId: string, userId: string) {
  const notification = await fetchNotificationById(notificationId);

  if (!notification) {
    throw new Error(`No encontramos la notificacion ${notificationId} en Pulse.`);
  }

  if (notification.user_id !== userId) {
    throw new Error('La notificacion no pertenece al usuario indicado.');
  }

  return notification;
}

export async function listActiveNotificationRecipients() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, onboarding_completed, pulse_access_status')
    .eq('role', 'user')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ActiveNotificationUserRow[]).filter((user) => {
    if (!canReadUser(user.id)) {
      return false;
    }

    const accessStatus = user.pulse_access_status ?? (user.onboarding_completed ? 'active' : 'pending');
    return accessStatus === 'active';
  });
}
