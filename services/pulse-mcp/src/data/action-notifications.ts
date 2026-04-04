import { supabase } from './client.js';
import { resolveUserIdentifier } from './users.js';

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
    .select('id, user_id, title, message, type, category, is_read, is_urgent, action_url, created_at')
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
  if (error) throw error;
  return data;
}

export async function createUserNotification(input: {
  userIdentifier: string;
  title: string;
  message: string;
  category?: string;
  type?: string;
  actionUrl?: string;
  isUrgent?: boolean;
}) {
  const user = await resolveUserIdentifier(input.userIdentifier);
  const title = input.title.trim();
  const message = input.message.trim();

  if (!title) {
    throw new Error('Necesitamos un titulo para enviar la notificacion.');
  }

  if (!message) {
    throw new Error('Necesitamos un mensaje para enviar la notificacion.');
  }

  const payload = {
    user_id: user.id,
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const recentDuplicate = await findRecentNotification({
    userId: user.id,
    title,
    message,
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
    .select('id, user_id, title, message, type, category, is_read, is_urgent, action_url, created_at')
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
    notification: data,
  };
}
