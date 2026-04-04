import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { fetchNotifications, fetchSupportTickets, fetchTicketDetail, resolveTicketIdentifier } from '../pulse-data.js';
import { asToolError, asToolResult, resolveUserFromInput } from './shared.js';

export function registerClientActivityTools(server: McpServer) {
  server.registerTool('get_notifications', {
    title: 'Notificaciones',
    description: 'Lista notificaciones de un usuario Pulse usando UUID, email, nombre o telefono.',
    inputSchema: {
      userIdentifier: z.string().min(1).describe('UUID, email, nombre o telefono del usuario'),
      limit: z.number().int().positive().max(50).default(10),
      unreadOnly: z.boolean().default(false),
    },
    outputSchema: z.object({
      resolvedUser: z.object({ id: z.string(), email: z.string().nullable(), full_name: z.string().nullable() }),
      userId: z.string(),
      unreadCount: z.number(),
      notifications: z.array(z.object({
        id: z.string(),
        title: z.string(),
        message: z.string().nullable(),
        category: z.string().nullable(),
        type: z.string().nullable(),
        is_read: z.boolean().nullable(),
        is_urgent: z.boolean().nullable(),
        created_at: z.string().nullable(),
      })),
    }),
  }, async ({ userIdentifier, limit, unreadOnly }) => {
    try {
      const user = await resolveUserFromInput(userIdentifier);
      return asToolResult({
        resolvedUser: { id: user.id, email: user.email, full_name: user.full_name },
        ...(await fetchNotifications(user.id, limit, unreadOnly)),
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('get_support_tickets', {
    title: 'Tickets de soporte',
    description: 'Trae tickets y ultimo mensaje visible usando UUID, email, nombre o telefono del usuario.',
    inputSchema: {
      userIdentifier: z.string().min(1).describe('UUID, email, nombre o telefono del usuario'),
      limit: z.number().int().positive().max(30).default(10),
    },
    outputSchema: z.object({
      resolvedUser: z.object({ id: z.string(), email: z.string().nullable(), full_name: z.string().nullable() }),
      userId: z.string(),
      tickets: z.array(z.object({
        id: z.string(),
        asunto: z.string().nullable(),
        estado: z.string().nullable(),
        prioridad: z.string().nullable(),
        created_at: z.string().nullable(),
        updated_at: z.string().nullable(),
        lastMessage: z.object({
          ticket_id: z.string(),
          content: z.string(),
          sender_role: z.enum(['client', 'admin']),
          created_at: z.string(),
        }).nullable(),
      })),
    }),
  }, async ({ userIdentifier, limit }) => {
    try {
      const user = await resolveUserFromInput(userIdentifier);
      return asToolResult({
        resolvedUser: { id: user.id, email: user.email, full_name: user.full_name },
        ...(await fetchSupportTickets(user.id, limit)),
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('get_ticket_detail', {
    title: 'Detalle de ticket',
    description: 'Trae el detalle completo de un ticket de Pulse usando su UUID real.',
    inputSchema: {
      ticketIdentifier: z.string().min(1).describe('UUID del ticket'),
    },
    outputSchema: z.object({
      resolvedTicket: z.object({
        id: z.string(),
      }),
      ticket: z.object({
        id: z.string(),
        asunto: z.string().nullable(),
        mensaje: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        estado: z.string().nullable(),
        prioridad: z.string().nullable(),
        status: z.string().nullable().optional(),
        priority: z.string().nullable().optional(),
        canonical_state: z.enum(['open', 'in_conversation', 'closed']).nullable().optional(),
        canonical_priority: z.enum(['low', 'medium', 'high']).nullable().optional(),
        user_id: z.string().nullable().optional(),
        assigned_admin_id: z.string().nullable().optional(),
        created_at: z.string().nullable(),
        updated_at: z.string().nullable(),
      }),
      client: z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
        phone: z.string().nullable(),
        role: z.string().nullable(),
      }).nullable(),
      assignee: z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
        role: z.string().nullable(),
      }).nullable(),
      messages: z.array(z.object({
        id: z.string().nullable(),
        ticket_id: z.string(),
        sender_id: z.string().nullable(),
        sender_role: z.enum(['client', 'admin']),
        content: z.string(),
        is_read: z.boolean().nullable(),
        read_at: z.string().nullable(),
        created_at: z.string(),
      })),
    }),
  }, async ({ ticketIdentifier }) => {
    try {
      const ticket = await resolveTicketIdentifier(ticketIdentifier);
      return asToolResult({
        resolvedTicket: { id: ticket.id },
        ...(await fetchTicketDetail(ticket.id)),
      });
    } catch (error) {
      return asToolError(error);
    }
  });
}
