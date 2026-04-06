import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { createUserNotification, sendNotificationBulk } from '../pulse-data.js';
import { asConfirmationResult, asToolError, asToolResult, assertMutationsEnabled, resolveUserFromInput, runIdempotentMutation } from './shared.js';

const notificationCategorySchema = z.enum(['system', 'project', 'ticket', 'payment', 'security', 'user']);
const notificationTypeSchema = z.enum(['info', 'success', 'warning', 'error', 'critical']);
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

export function registerNotificationSendTools(server: McpServer) {
  server.registerTool('send_notification', {
    title: 'Enviar notificacion',
    description: 'Crea una notificacion visible en Pulse para un cliente usando email, nombre, telefono o UUID.',
    inputSchema: {
      userIdentifier: z.string().min(1),
      title: z.string().min(1),
      message: z.string().min(1),
      category: notificationCategorySchema.default('system'),
      type: notificationTypeSchema.default('info'),
      actionUrl: z.string().min(1).optional(),
      isUrgent: z.boolean().default(false),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean(),
      requires_confirmation: z.boolean().optional(),
      message: z.string(),
      preview: z.unknown().optional(),
      result: z.unknown().optional(),
    }),
  }, async ({ userIdentifier, title, message, category, type, actionUrl, isUrgent, confirm }) => {
    try {
      assertMutationsEnabled();
      const resolvedUser = await resolveUserFromInput(userIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a crear una notificacion visible para el cliente dentro de Pulse. Reintentá con confirm=true para ejecutarla.', {
          resolvedUser: {
            id: resolvedUser.id,
            email: resolvedUser.email,
            full_name: resolvedUser.full_name,
          },
          notification: {
            title,
            message,
            category,
            type,
            actionUrl: actionUrl ?? null,
            isUrgent,
          },
        });
      }

      const result = await runIdempotentMutation('send_notification', {
        userId: resolvedUser.id,
        title,
        message,
        category,
        type,
        actionUrl: actionUrl ?? null,
        isUrgent,
      }, () => createUserNotification({
        userIdentifier: resolvedUser.id,
        title,
        message,
        category,
        type,
        actionUrl,
        isUrgent,
      }));

      return asToolResult({
        executed: true,
        message: 'Notificacion creada en Pulse.',
        result,
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('send_notification_bulk', {
    title: 'Enviar notificacion en lote',
    description: 'Envía la misma notificación a múltiples clientes de Pulse en una sola llamada.',
    inputSchema: {
      userIdentifiers: z.array(z.string().min(1)).optional(),
      all_users: z.boolean().default(false),
      title: z.string().min(1),
      message: z.string().min(1),
      type: notificationTypeSchema.default('info'),
      category: notificationCategorySchema.default('system'),
      isUrgent: z.boolean().default(false),
      actionUrl: z.string().min(1).optional(),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean().optional(),
      requires_confirmation: z.boolean().optional(),
      message: z.string().optional(),
      preview: z.unknown().optional(),
      total: z.number().optional(),
      succeeded: z.number().optional(),
      failed: z.number().optional(),
      results: z.array(z.object({
        input: z.string(),
        success: z.boolean(),
        resolvedUser: z.object({
          id: z.string(),
          email: z.string().nullable(),
          full_name: z.string().nullable(),
        }).nullable(),
        notification: notificationRecordSchema.optional(),
        error: z.string().optional(),
      })).optional(),
    }),
  }, async ({ userIdentifiers, all_users, title, message, type, category, isUrgent, actionUrl, confirm }) => {
    try {
      assertMutationsEnabled();

      if (!all_users && (!userIdentifiers || userIdentifiers.length === 0)) {
        throw new Error('Necesitamos al menos un userIdentifier o usar all_users=true para enviar notificaciones en lote.');
      }

      if (!confirm) {
        return asConfirmationResult('Esta accion va a crear notificaciones visibles en Pulse para multiples usuarios. Reintentá con confirm=true para ejecutarla.', {
          audience: all_users ? { mode: 'all_users' } : { mode: 'selected_users', userIdentifiers: userIdentifiers ?? [] },
          notification: {
            title,
            message,
            category,
            type,
            actionUrl: actionUrl ?? null,
            isUrgent,
          },
        });
      }

      const result = await runIdempotentMutation('send_notification_bulk', {
        allUsers: all_users,
        userIdentifiers: all_users ? [] : userIdentifiers ?? [],
        title,
        message,
        category,
        type,
        actionUrl: actionUrl ?? null,
        isUrgent,
      }, () => sendNotificationBulk({
        userIdentifiers,
        allUsers: all_users,
        title,
        message,
        category,
        type,
        actionUrl,
        isUrgent,
      }));

      return asToolResult(result);
    } catch (error) {
      return asToolError(error);
    }
  });
}
