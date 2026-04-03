import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { assertProjectAllowed, assertUserAllowed } from './auth.js';
import { type PulsePeriod } from './date-ranges.js';
import {
  fetchLatestProjectForUser,
  fetchNotifications,
  fetchProjectSummary,
  fetchPulseMetrics,
  fetchSupportTickets,
  resolveProjectIdentifier,
  resolveUserIdentifier,
} from './pulse-data.js';

const periodSchema = z.enum(['this_month', 'last_month', 'last_7_days', 'last_30_days', 'this_year']);
const topPageSchema = z.object({
  label: z.string().nullable(),
  path: z.string(),
  visits: z.number(),
  percentage: z.number(),
});

function asToolResult<T>(payload: T) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

function asToolError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Pulse MCP no pudo completar la consulta.';
  return {
    content: [{ type: 'text' as const, text: message }],
    isError: true,
  };
}

async function resolveUserFromInput(userIdentifier: string) {
  const user = await resolveUserIdentifier(userIdentifier);
  assertUserAllowed(user.id);
  return user;
}

async function resolveProjectFromInput(projectIdentifier: string) {
  const project = await resolveProjectIdentifier(projectIdentifier);
  assertProjectAllowed(project.id);
  return project;
}

export function createPulseMcpServer() {
  const server = new McpServer(
    { name: 'pulse-mcp', version: '0.1.0' },
    { capabilities: { logging: {} } },
  );

  server.registerResource(
    'pulse-business-language',
    'pulse://context/language',
    {
      title: 'Guia de lenguaje Pulse',
      description: 'Cómo explicar metricas de Pulse en lenguaje de negocio.',
      mimeType: 'text/plain',
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: [
          'Pulse habla en lenguaje de negocio para usuarios no tecnicos.',
          'Evitar siglas crudas, lenguaje antifraude o copy interno.',
          'Traducir metricas a impacto: visitas, consultas, paginas con mejor rendimiento y variacion del periodo.',
          'Si no hay datos, explicarlo con claridad y proponer el siguiente paso operativo.',
        ].join('\n'),
      }],
    }),
  );

  server.registerTool('get_project_summary', {
    title: 'Resumen de proyecto',
    description: 'Trae contexto ejecutivo del proyecto y su actividad reciente usando UUID, nombre o dominio.',
    inputSchema: {
      projectIdentifier: z.string().min(1).describe('UUID, nombre o dominio del proyecto'),
    },
    outputSchema: z.object({
      resolvedProject: z.object({
        id: z.string(),
        matchedBy: z.string(),
      }),
      project: z.object({
        id: z.string(),
        name: z.string().nullable(),
        status: z.string().nullable(),
        domain: z.string().nullable(),
        ga4_property_id: z.string().nullable(),
        completion_percentage: z.number().nullable(),
        updated_at: z.string().nullable(),
      }),
      latestMetric: z.object({ date: z.string(), visits: z.number(), contacts: z.number() }).nullable(),
      recentTotals: z.object({ visits: z.number(), contacts: z.number(), topPages: z.array(topPageSchema) }),
    }),
  }, async ({ projectIdentifier }) => {
    try {
      const project = await resolveProjectFromInput(projectIdentifier);
      const summary = await fetchProjectSummary(project.id);

      return asToolResult({
        resolvedProject: {
          id: project.id,
          matchedBy: projectIdentifier,
        },
        ...summary,
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('get_pulse_metrics', {
    title: 'Metricas Pulse',
    description: 'Resume metricas historicas por periodo usando un proyecto o un usuario. Acepta UUID, email, nombre o dominio.',
    inputSchema: {
      projectIdentifier: z.string().min(1).optional().describe('UUID, nombre o dominio del proyecto'),
      userIdentifier: z.string().min(1).optional().describe('UUID, email, nombre o telefono del usuario'),
      period: periodSchema.default('last_30_days'),
    },
    outputSchema: z.object({
      resolvedProject: z.object({
        id: z.string(),
        matchedBy: z.string(),
      }),
      resolvedUser: z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
      }).nullable(),
      period: periodSchema,
      dateRange: z.object({ from: z.string(), to: z.string() }),
      totals: z.object({
        visits: z.number(),
        contacts: z.number(),
        avgSessionSec: z.number(),
        consultationRate: z.number().nullable(),
      }),
      comparison: z.object({ visitsDelta: z.number().nullable(), contactsDelta: z.number().nullable() }),
      series: z.array(z.object({ date: z.string(), visits: z.number(), contacts: z.number() })),
      topPages: z.array(topPageSchema),
      hasData: z.boolean(),
      lastUpdatedAt: z.string().nullable(),
    }),
  }, async ({ projectIdentifier, userIdentifier, period }) => {
    try {
      if (!projectIdentifier && !userIdentifier) {
        throw new Error('Necesitamos projectIdentifier o userIdentifier para buscar metricas.');
      }

      let resolvedUser: { id: string; email: string | null; full_name: string | null } | null = null;
      let project;

      if (projectIdentifier) {
        project = await resolveProjectFromInput(projectIdentifier);
      } else {
        const user = await resolveUserFromInput(userIdentifier as string);
        resolvedUser = {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        };
        project = await fetchLatestProjectForUser(user.id);
        assertProjectAllowed(project.id);
      }

      const metrics = await fetchPulseMetrics(project.id, period as PulsePeriod);

      return asToolResult({
        resolvedProject: {
          id: project.id,
          matchedBy: projectIdentifier || userIdentifier || project.id,
        },
        resolvedUser,
        ...metrics,
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
      const notifications = await fetchNotifications(user.id, limit, unreadOnly);

      return asToolResult({
        resolvedUser: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
        ...notifications,
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
      const tickets = await fetchSupportTickets(user.id, limit);

      return asToolResult({
        resolvedUser: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
        ...tickets,
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  return server;
}
