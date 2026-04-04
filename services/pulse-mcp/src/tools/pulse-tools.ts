import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { type PulsePeriod } from '../date-ranges.js';
import { fetchDashboardSummary, fetchLatestProjectForUser, fetchProjectSummary, fetchPulseMetrics, listProjects } from '../pulse-data.js';
import { asToolError, asToolResult, periodSchema, resolveProjectFromInput, resolveUserFromInput, topPageSchema } from './shared.js';

export function registerPulseTools(server: McpServer) {
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
      return asToolResult({
        resolvedProject: { id: project.id, matchedBy: projectIdentifier },
        ...(await fetchProjectSummary(project.id)),
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('list_projects', {
    title: 'Listar proyectos',
    description: 'Lista proyectos de Pulse y permite filtrar por cliente, estado o completion_percentage menor a un umbral.',
    inputSchema: {
      userIdentifier: z.string().min(1).optional().describe('UUID, email, nombre o telefono del cliente'),
      status: z.string().min(1).optional(),
      completion_percentage_lt: z.number().int().min(0).max(100).optional(),
    },
    outputSchema: z.object({
      filters: z.object({
        userId: z.string().nullable(),
        status: z.string().nullable(),
        completion_percentage_lt: z.number().nullable(),
      }),
      resolvedUser: z.object({
        id: z.string(),
        email: z.string().nullable(),
        full_name: z.string().nullable(),
      }).nullable(),
      projects: z.array(z.object({
        id: z.string(),
        name: z.string().nullable(),
        status: z.string().nullable(),
        domain: z.string().nullable(),
        ga4_property_id: z.string().nullable(),
        completion_percentage: z.number().nullable(),
        created_at: z.string().nullable(),
        updated_at: z.string().nullable(),
        created_by: z.string().nullable(),
        client: z.object({
          id: z.string(),
          email: z.string().nullable(),
          full_name: z.string().nullable(),
          phone: z.string().nullable(),
        }).nullable(),
      })),
    }),
  }, async ({ userIdentifier, status, completion_percentage_lt }) => {
    try {
      const resolvedUser = userIdentifier ? await resolveUserFromInput(userIdentifier) : null;
      const result = await listProjects({
        userId: resolvedUser?.id,
        status,
        completionPercentageLt: completion_percentage_lt,
      });

      return asToolResult({
        ...result,
        resolvedUser: resolvedUser
          ? {
              id: resolvedUser.id,
              email: resolvedUser.email,
              full_name: resolvedUser.full_name,
            }
          : null,
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
        resolvedUser = { id: user.id, email: user.email, full_name: user.full_name };
        project = await fetchLatestProjectForUser(user.id);
      }

      return asToolResult({
        resolvedProject: {
          id: project.id,
          matchedBy: projectIdentifier || userIdentifier || project.id,
        },
        resolvedUser,
        ...(await fetchPulseMetrics(project.id, period as PulsePeriod)),
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('get_dashboard_summary', {
    title: 'Resumen general de Pulse',
    description: 'Trae un panorama ejecutivo de clientes, proyectos y metricas del periodo.',
    inputSchema: {
      period: periodSchema.default('last_30_days'),
    },
    outputSchema: z.object({
      period: periodSchema,
      dateRange: z.object({ from: z.string(), to: z.string() }),
      totals: z.object({
        total_clients: z.number(),
        with_access: z.number(),
        with_project: z.number(),
        with_ga4: z.number(),
        total_visits: z.number(),
        total_contacts: z.number(),
      }),
      active_projects_by_status: z.record(z.string(), z.number()),
    }),
  }, async ({ period }) => {
    try {
      return asToolResult(await fetchDashboardSummary(period as PulsePeriod));
    } catch (error) {
      return asToolError(error);
    }
  });
}
