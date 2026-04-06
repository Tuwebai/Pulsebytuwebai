import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { deleteNotification, markAllNotificationsRead, markNotificationRead } from '../pulse-data.js';
import { asConfirmationResult, asToolError, asToolResult, assertMutationsEnabled, resolveUserFromInput, runIdempotentMutation } from './shared.js';

const notificationRecordSchema = z.object({
  id: z.string(),
  user_id: z.string().nullable(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  category: z.string(),
  is_read: z.boolean().nullable(),
  is_urgent: z.boolean().nullable(),
  action_url: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  expires_at: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export function registerNotificationStateTools(server: McpServer) {
  server.registerTool('mark_notification_read', {
    title: 'Marcar notificacion como leida',
    description: 'Marca una notificación puntual como leída validando que pertenezca al usuario indicado.',
    inputSchema: {
      notificationId: z.string().uuid(),
      userIdentifier: z.string().min(1),
      confirm: z.boolean().optional(),
    },
    outputSchema: z.object({
      resolvedUser: z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
      }),
      notification: notificationRecordSchema,
      updated: z.boolean(),
    }),
  }, async ({ notificationId, userIdentifier }) => {
    try {
      assertMutationsEnabled();
      const result = await runIdempotentMutation('mark_notification_read', {
        notificationId,
        userIdentifier,
      }, () => markNotificationRead({
        notificationId,
        userIdentifier,
      }));

      return asToolResult(result);
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('mark_all_read', {
    title: 'Marcar todas las notificaciones como leidas',
    description: 'Marca todas las notificaciones no leídas de un usuario como leídas.',
    inputSchema: {
      userIdentifier: z.string().min(1),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean().optional(),
      requires_confirmation: z.boolean().optional(),
      message: z.string().optional(),
      preview: z.unknown().optional(),
      resolvedUser: z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
      }).optional(),
      updated: z.number().optional(),
    }),
  }, async ({ userIdentifier, confirm }) => {
    try {
      assertMutationsEnabled();
      const resolvedUser = await resolveUserFromInput(userIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a marcar como leidas todas las notificaciones pendientes del usuario. Reintentá con confirm=true para ejecutarla.', {
          resolvedUser: {
            id: resolvedUser.id,
            email: resolvedUser.email,
            full_name: resolvedUser.full_name,
          },
        });
      }

      const result = await runIdempotentMutation('mark_all_read', {
        userId: resolvedUser.id,
      }, () => markAllNotificationsRead({
        userIdentifier: resolvedUser.id,
      }));

      return asToolResult(result);
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('delete_notification', {
    title: 'Eliminar notificacion',
    description: 'Elimina una notificación validando que pertenezca al usuario indicado.',
    inputSchema: {
      notificationId: z.string().uuid(),
      userIdentifier: z.string().min(1),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean().optional(),
      requires_confirmation: z.boolean().optional(),
      message: z.string().optional(),
      preview: z.unknown().optional(),
      resolvedUser: z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
      }).optional(),
      deleted: z.boolean().optional(),
      id: z.string().optional(),
    }),
  }, async ({ notificationId, userIdentifier, confirm }) => {
    try {
      assertMutationsEnabled();
      const resolvedUser = await resolveUserFromInput(userIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a eliminar una notificacion de Pulse. Reintentá con confirm=true para ejecutarla.', {
          notificationId,
          resolvedUser: {
            id: resolvedUser.id,
            email: resolvedUser.email,
            full_name: resolvedUser.full_name,
          },
          deleteMode: 'physical_delete',
        });
      }

      const result = await runIdempotentMutation('delete_notification', {
        notificationId,
        userId: resolvedUser.id,
      }, () => deleteNotification({
        notificationId,
        userIdentifier: resolvedUser.id,
      }));

      return asToolResult(result);
    } catch (error) {
      return asToolError(error);
    }
  });
}
