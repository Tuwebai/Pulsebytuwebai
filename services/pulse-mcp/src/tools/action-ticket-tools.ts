import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { assignTicket, closeTicket, createTicket, reopenTicket, replyToTicket, resolveTicketIdentifier } from '../pulse-data.js';
import { asConfirmationResult, asToolError, asToolResult, assertMutationsEnabled, resolveUserFromInput, runIdempotentMutation } from './shared.js';

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

      const result = await runIdempotentMutation('create_ticket', {
        userId: resolvedUser.id,
        title,
        message,
        priority: priority ?? null,
      }, () => createTicket({ userIdentifier: resolvedUser.id, title, message, priority }));

      return asToolResult({
        executed: true,
        message: 'Ticket creado en Pulse.',
        result,
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('close_ticket', {
    title: 'Cerrar ticket',
    description: 'Cierra un ticket existente usando el UUID real del ticket en Pulse.',
    inputSchema: {
      ticketIdentifier: z.string().min(1),
      resolutionNote: z.string().min(1).optional(),
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
  }, async ({ ticketIdentifier, resolutionNote, operatorUserId, confirm }) => {
    try {
      assertMutationsEnabled();
      const ticket = await resolveTicketIdentifier(ticketIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a cerrar un ticket real de Pulse. Reintentá con confirm=true para ejecutarla.', {
          ticket,
          draft: {
            resolutionNote: resolutionNote ?? null,
            operatorUserId: operatorUserId ?? null,
          },
        });
      }

      const result = await runIdempotentMutation('close_ticket', {
        ticketId: ticket.id,
        resolutionNote: resolutionNote ?? null,
        operatorUserId: operatorUserId ?? null,
      }, () => closeTicket({ ticketIdentifier: ticket.id, resolutionNote, operatorUserId }));

      return asToolResult({
        executed: true,
        message: 'Ticket cerrado en Pulse.',
        result,
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('reopen_ticket', {
    title: 'Reabrir ticket',
    description: 'Reabre un ticket cerrado usando el UUID real del ticket en Pulse.',
    inputSchema: {
      ticketIdentifier: z.string().min(1),
      reason: z.string().min(1).optional(),
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
  }, async ({ ticketIdentifier, reason, operatorUserId, confirm }) => {
    try {
      assertMutationsEnabled();
      const ticket = await resolveTicketIdentifier(ticketIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a reabrir un ticket real de Pulse. Reintentá con confirm=true para ejecutarla.', {
          ticket,
          draft: {
            reason: reason ?? null,
            operatorUserId: operatorUserId ?? null,
          },
        });
      }

      const result = await runIdempotentMutation('reopen_ticket', {
        ticketId: ticket.id,
        reason: reason ?? null,
        operatorUserId: operatorUserId ?? null,
      }, () => reopenTicket({ ticketIdentifier: ticket.id, reason, operatorUserId }));

      return asToolResult({
        executed: true,
        message: 'Ticket reabierto en Pulse.',
        result,
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('assign_ticket', {
    title: 'Asignar ticket',
    description: 'Asigna un ticket existente a un admin usando el UUID del ticket y un identificador natural del usuario.',
    inputSchema: {
      ticketIdentifier: z.string().min(1),
      assigneeIdentifier: z.string().min(1),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean(),
      requires_confirmation: z.boolean().optional(),
      message: z.string(),
      preview: z.unknown().optional(),
      result: z.unknown().optional(),
    }),
  }, async ({ ticketIdentifier, assigneeIdentifier, confirm }) => {
    try {
      assertMutationsEnabled();
      const ticket = await resolveTicketIdentifier(ticketIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a asignar un ticket real de Pulse. Reintentá con confirm=true para ejecutarla.', {
          ticket,
          assigneeIdentifier,
        });
      }

      const resolvedAssignee = await resolveUserFromInput(assigneeIdentifier);
      const result = await runIdempotentMutation('assign_ticket', {
        ticketId: ticket.id,
        assigneeId: resolvedAssignee.id,
      }, () => assignTicket({ ticketIdentifier: ticket.id, assigneeIdentifier: resolvedAssignee.id }));

      return asToolResult({
        executed: true,
        message: 'Ticket asignado en Pulse.',
        result,
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

      const result = await runIdempotentMutation('reply_to_ticket', {
        ticketId: ticket.id,
        message,
        authorRole,
        operatorUserId: operatorUserId ?? null,
      }, () => replyToTicket({ ticketIdentifier: ticket.id, message, authorRole, operatorUserId }));

      return asToolResult({
        executed: true,
        message: 'Respuesta registrada en Pulse.',
        result,
      });
    } catch (error) {
      return asToolError(error);
    }
  });
}
