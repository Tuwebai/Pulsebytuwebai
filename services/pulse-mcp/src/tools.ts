import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { assertProjectAllowed, assertUserAllowed } from './auth.js';
import { type PulsePeriod } from './date-ranges.js';
import { fetchNotifications, fetchProjectSummary, fetchPulseMetrics, fetchSupportTickets } from './pulse-data.js';

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
    description: 'Trae contexto ejecutivo del proyecto y su actividad reciente.',
    inputSchema: { projectId: z.string().min(1) },
    outputSchema: z.object({
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
  }, async ({ projectId }) => {
    try {
      assertProjectAllowed(projectId);
      return asToolResult(await fetchProjectSummary(projectId));
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('get_pulse_metrics', {
    title: 'Metricas Pulse',
    description: 'Resume metricas historicas de Pulse por periodo.',
    inputSchema: { projectId: z.string().min(1), period: periodSchema.default('last_30_days') },
    outputSchema: z.object({
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
  }, async ({ projectId, period }) => {
    try {
      assertProjectAllowed(projectId);
      return asToolResult(await fetchPulseMetrics(projectId, period as PulsePeriod));
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('get_notifications', {
    title: 'Notificaciones',
    description: 'Lista notificaciones de un usuario Pulse.',
    inputSchema: {
      userId: z.string().min(1),
      limit: z.number().int().positive().max(50).default(10),
      unreadOnly: z.boolean().default(false),
    },
    outputSchema: z.object({
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
  }, async ({ userId, limit, unreadOnly }) => {
    try {
      assertUserAllowed(userId);
      return asToolResult(await fetchNotifications(userId, limit, unreadOnly));
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('get_support_tickets', {
    title: 'Tickets de soporte',
    description: 'Trae tickets y ultimo mensaje visible del usuario.',
    inputSchema: {
      userId: z.string().min(1),
      limit: z.number().int().positive().max(30).default(10),
    },
    outputSchema: z.object({
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
  }, async ({ userId, limit }) => {
    try {
      assertUserAllowed(userId);
      return asToolResult(await fetchSupportTickets(userId, limit));
    } catch (error) {
      return asToolError(error);
    }
  });

  return server;
}
