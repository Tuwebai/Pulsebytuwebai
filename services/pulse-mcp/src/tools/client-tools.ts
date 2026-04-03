import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { fetchClientOverview, fetchNotifications, fetchSupportTickets, listClients, searchEntities } from '../pulse-data.js';
import { asToolError, asToolResult, resolveUserFromInput } from './shared.js';

export function registerClientTools(server: McpServer) {
  server.registerTool('search_entities', {
    title: 'Buscar usuarios y proyectos',
    description: 'Busca usuarios y proyectos por email, nombre, telefono, dominio o texto libre antes de elegir otra tool.',
    inputSchema: {
      query: z.string().min(1).describe('Texto libre: email, nombre, telefono, dominio o nombre de proyecto'),
    },
    outputSchema: z.object({
      query: z.string(),
      users: z.array(z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
        phone: z.string().nullable(),
        role: z.string().nullable(),
      })),
      projects: z.array(z.object({
        id: z.string(),
        name: z.string().nullable(),
        domain: z.string().nullable(),
        status: z.string().nullable(),
        created_by: z.string().nullable(),
      })),
    }),
  }, async ({ query }) => {
    try {
      return asToolResult(await searchEntities(query));
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('list_clients', {
    title: 'Listar clientes',
    description: 'Lista clientes de Pulse con estado operativo resumido: activo, sin onboarding o sin proyecto.',
    inputSchema: {
      status: z.enum(['activo', 'sin_onboarding', 'sin_proyecto', 'todos']).default('todos'),
    },
    outputSchema: z.object({
      status: z.enum(['activo', 'sin_onboarding', 'sin_proyecto', 'todos']),
      clients: z.array(z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
        phone: z.string().nullable(),
        onboarding_completed: z.boolean(),
        pulse_access_status: z.string().nullable(),
        project: z.object({
          id: z.string(),
          name: z.string().nullable(),
          status: z.string().nullable(),
          domain: z.string().nullable(),
          ga4_property_id: z.string().nullable(),
        }).nullable(),
        operational_status: z.enum(['activo', 'sin_onboarding', 'sin_proyecto']),
        created_at: z.string().nullable(),
      })),
    }),
  }, async ({ status }) => {
    try {
      return asToolResult(await listClients(status));
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('get_client', {
    title: 'Detalle de cliente',
    description: 'Trae el detalle operativo de un cliente usando email, nombre, telefono o UUID.',
    inputSchema: {
      userIdentifier: z.string().min(1).describe('UUID, email, nombre o telefono del usuario'),
    },
    outputSchema: z.object({
      resolvedUser: z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
      }),
      user: z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
        phone: z.string().nullable(),
        website: z.string().nullable(),
        onboarding_completed: z.boolean(),
        onboarding_completed_at: z.string().nullable(),
        pulse_access_status: z.string().nullable(),
        pulse_access_granted_at: z.string().nullable(),
        pulse_access_disabled_at: z.string().nullable(),
        created_at: z.string().nullable(),
        updated_at: z.string().nullable(),
      }),
      project: z.object({
        id: z.string(),
        name: z.string().nullable(),
        status: z.string().nullable(),
        domain: z.string().nullable(),
        ga4_property_id: z.string().nullable(),
        completion_percentage: z.number().nullable(),
        updated_at: z.string().nullable(),
        created_by: z.string().nullable().optional(),
      }).nullable(),
      metrics: z.unknown().nullable(),
      notifications: z.object({
        unreadCount: z.number(),
        latest: z.array(z.unknown()),
      }),
      support: z.object({
        openTickets: z.number(),
        latest: z.array(z.unknown()),
      }),
    }),
  }, async ({ userIdentifier }) => {
    try {
      const user = await resolveUserFromInput(userIdentifier);
      return asToolResult({
        resolvedUser: { id: user.id, email: user.email, full_name: user.full_name },
        ...(await fetchClientOverview(user.id)),
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('get_notifications', {
    title: 'Notificaciones',
    description: 'Lista notificaciones de un usuario Pulse usando UUID, email, nombre o telefono.',
    inputSchema: {
      userIdentifier: z.string().min(1).describe('UUID, email, nombre o telefono del usuario'),
      limit: z.number().int().positive().max(50).default(10),
      unreadOnly: z.boolean().default(false),
    },
    outputSchema: z.object({
      resolvedUser: z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
      }),
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
      resolvedUser: z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
      }),
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
}
