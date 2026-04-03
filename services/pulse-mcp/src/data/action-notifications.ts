import { supabase } from './client.js';
import { resolveUserIdentifier } from './users.js';

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
