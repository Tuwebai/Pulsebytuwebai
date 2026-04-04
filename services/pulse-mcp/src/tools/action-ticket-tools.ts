import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { createTicket, replyToTicket, resolveTicketIdentifier } from '../pulse-data.js';
import { asConfirmationResult, asToolError, asToolResult, assertMutationsEnabled, resolveUserFromInput } from './shared.js';

export function registerTicketActionTools(server: McpServer) {
  server.registerTool('create_ticket', {
    title: 'Crear ticket de soporte',
    description: 'Crea un ticket de soporte para un cliente existente usando UUID, email, nombre o telefono.',
    inputSchema: {
      userIdentifier: z.string().min(1),
      title: z.string().min(1),
      message: z.string().min(1),
      priority: z.string().min(1).optional(),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean(),
      requires_confirmation: z.boolean().optional(),
      message: z.string(),
      preview: z.unknown().optional(),
      result: z.unknown().optional(),
    }),
  }, async ({ userIdentifier, title, message, priority, confirm }) => {
    try {
      assertMutationsEnabled();
      const resolvedUser = await resolveUserFromInput(userIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a crear un ticket real de soporte en Pulse. Reintentá con confirm=true para ejecutarla.', {
          resolvedUser: {
            id: resolvedUser.id,
            email: resolvedUser.email,
            full_name: resolvedUser.full_name,
          },
          draft: {
            title,
            message,
            priority: priority ?? null,
          },
        });
      }

      return asToolResult({
        executed: true,
        message: 'Ticket creado en Pulse.',
        result: await createTicket({ userIdentifier: resolvedUser.id, title, message, priority }),
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('reply_to_ticket', {
    title: 'Responder ticket',
    description: 'Agrega un mensaje a un ticket existente usando el UUID real del ticket en Pulse.',
    inputSchema: {
      ticketIdentifier: z.string().min(1),
      message: z.string().min(1),
      authorRole: z.enum(['admin', 'client']).default('admin'),
      operatorUserId: z.string().uuid().optional(),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean(),
      requires_confirmation: z.boolean().optional(),
      message: z.string(),
      preview: z.unknown().optional(),
      result: z.unknown().optional(),
    }),
  }, async ({ ticketIdentifier, message, authorRole, operatorUserId, confirm }) => {
    try {
      assertMutationsEnabled();
      const ticket = await resolveTicketIdentifier(ticketIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a responder un ticket real de Pulse. Reintentá con confirm=true para ejecutarla.', {
          ticket,
          draft: {
            message,
            authorRole,
            operatorUserId: operatorUserId ?? null,
          },
        });
      }

      return asToolResult({
        executed: true,
        message: 'Respuesta registrada en Pulse.',
        result: await replyToTicket({ ticketIdentifier: ticket.id, message, authorRole, operatorUserId }),
      });
    } catch (error) {
      return asToolError(error);
    }
  });
}
