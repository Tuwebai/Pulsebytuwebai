import { insertNotificationForUser, listActiveNotificationRecipients, type NotificationWriteInput } from './notification-write-helpers.js';
import { resolveUserIdentifier } from './users.js';

interface BulkNotificationResultItem {
  input: string;
  success: boolean;
  resolvedUser: {
    id: string;
    email: string | null;
    full_name: string | null;
  } | null;
  notification?: unknown;
  error?: string;
}

async function sendNotificationToResolvedUser(userId: string, input: NotificationWriteInput) {
  const user = await resolveUserIdentifier(userId);
  return insertNotificationForUser(user, input);
}

export async function createUserNotification(input: NotificationWriteInput & {
  userIdentifier: string;
}) {
  const user = await resolveUserIdentifier(input.userIdentifier);
  return insertNotificationForUser(user, input);
}

export async function sendNotificationBulk(input: NotificationWriteInput & {
  userIdentifiers?: string[];
  allUsers?: boolean;
}) {
  const results: BulkNotificationResultItem[] = [];

  if (input.allUsers) {
    const activeUsers = await listActiveNotificationRecipients();
    const deliveries = await Promise.all(activeUsers.map(async (user) => {
      try {
        const delivery = await insertNotificationForUser(user, input);
        return {
          input: user.id,
          success: true,
          resolvedUser: delivery.resolvedUser,
          notification: delivery.notification,
        } satisfies BulkNotificationResultItem;
      } catch (error) {
        return {
          input: user.id,
          success: false,
          resolvedUser: { id: user.id, email: user.email, full_name: user.full_name },
          error: error instanceof Error ? error.message : 'No pudimos crear la notificacion.',
        } satisfies BulkNotificationResultItem;
      }
    }));

    results.push(...deliveries);
  } else {
    const identifiers = (input.userIdentifiers ?? []).map((item) => item.trim()).filter(Boolean);

    if (identifiers.length === 0) {
      throw new Error('Necesitamos al menos un userIdentifier o usar all_users=true para enviar notificaciones en lote.');
    }

    for (const identifier of identifiers) {
      try {
        const delivery = await sendNotificationToResolvedUser(identifier, input);
        results.push({
          input: identifier,
          success: true,
          resolvedUser: delivery.resolvedUser,
          notification: delivery.notification,
        });
      } catch (error) {
        results.push({
          input: identifier,
          success: false,
          resolvedUser: null,
          error: error instanceof Error ? error.message : 'No pudimos crear la notificacion.',
        });
      }
    }
  }

  return {
    total: results.length,
    succeeded: results.filter((result) => result.success).length,
    failed: results.filter((result) => !result.success).length,
    results,
  };
}
