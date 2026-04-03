import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { createUserNotification } from '../pulse-data.js';
import { asConfirmationResult, asToolError, asToolResult, assertMutationsEnabled, resolveUserFromInput } from './shared.js';

export function registerNotificationActionTools(server: McpServer) {
  server.registerTool('send_notification', {
    title: 'Enviar notificacion',
    description: 'Crea una notificacion visible en Pulse para un cliente usando email, nombre, telefono o UUID.',
    inputSchema: {
      userIdentifier: z.string().min(1),
      title: z.string().min(1),
      message: z.string().min(1),
      category: z.enum(['system', 'project', 'ticket', 'payment', 'security', 'user']).default('system'),
      type: z.enum(['info', 'success', 'warning', 'error', 'critical']).default('info'),
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

      return asToolResult({
        executed: true,
        message: 'Notificacion creada en Pulse.',
        result: await createUserNotification({
          userIdentifier: resolvedUser.id,
          title,
          message,
          category,
          type,
          actionUrl,
          isUrgent,
        }),
      });
    } catch (error) {
      return asToolError(error);
    }
  });
}
