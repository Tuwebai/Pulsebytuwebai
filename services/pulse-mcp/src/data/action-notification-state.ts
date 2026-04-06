import { supabase } from './client.js';
import { fetchOwnedNotification, NOTIFICATION_RETURNING } from './notification-write-helpers.js';
import { resolveUserIdentifier } from './users.js';

export async function markNotificationRead(input: {
  notificationId: string;
  userIdentifier: string;
}) {
  const user = await resolveUserIdentifier(input.userIdentifier);
  const ownedNotification = await fetchOwnedNotification(input.notificationId, user.id);

  if (ownedNotification.is_read === true) {
    return {
      resolvedUser: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      notification: ownedNotification,
      updated: false,
    };
  }

  const { data, error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ownedNotification.id)
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
    notification: data,
    updated: true,
  };
}

export async function markAllNotificationsRead(input: {
  userIdentifier: string;
}) {
  const user = await resolveUserIdentifier(input.userIdentifier);
  const { data, error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('is_read', false)
    .select('id');

  if (error) {
    throw error;
  }

  return {
    resolvedUser: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
    },
    updated: data?.length ?? 0,
  };
}

export async function deleteNotification(input: {
  notificationId: string;
  userIdentifier: string;
}) {
  const user = await resolveUserIdentifier(input.userIdentifier);
  await fetchOwnedNotification(input.notificationId, user.id);

  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', input.notificationId)
    .select('id')
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
    deleted: true,
    id: data.id,
  };
}
