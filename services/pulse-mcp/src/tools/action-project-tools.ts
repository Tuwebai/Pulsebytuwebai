import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { assignProjectGa4, fetchLatestProjectForUser, updateProjectDetails } from '../pulse-data.js';
import { asConfirmationResult, asToolError, asToolResult, assertMutationsEnabled, resolveProjectFromInput, resolveUserFromInput } from './shared.js';

async function resolveProjectPreview(projectIdentifier?: string, userIdentifier?: string) {
  if (projectIdentifier?.trim()) {
    return resolveProjectFromInput(projectIdentifier);
  }

  if (userIdentifier?.trim()) {
    const user = await resolveUserFromInput(userIdentifier);
    return {
      resolvedUser: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      project: await fetchLatestProjectForUser(user.id),
    };
  }

  throw new Error('Necesitamos un projectIdentifier o userIdentifier para ubicar el proyecto.');
}

export function registerProjectActionTools(server: McpServer) {
  server.registerTool('update_project', {
    title: 'Actualizar proyecto',
    description: 'Actualiza nombre, estado, progreso, dominio o GA4 de un proyecto real de Pulse.',
    inputSchema: {
      projectIdentifier: z.string().min(1).optional(),
      userIdentifier: z.string().min(1).optional(),
      name: z.string().min(1).optional(),
      status: z.string().min(1).optional(),
      completion_percentage: z.number().int().min(0).max(100).optional(),
      domain: z.string().min(1).optional(),
      ga4_property_id: z.string().min(1).optional(),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean(),
      requires_confirmation: z.boolean().optional(),
      message: z.string(),
      preview: z.unknown().optional(),
      result: z.unknown().optional(),
    }),
  }, async (input) => {
    try {
      assertMutationsEnabled();
      const previewTarget = await resolveProjectPreview(input.projectIdentifier, input.userIdentifier);

      if (!input.confirm) {
        return asConfirmationResult('Esta accion va a actualizar un proyecto real de Pulse. Reintentá con confirm=true para ejecutarla.', {
          target: previewTarget,
          changes: {
            name: input.name ?? null,
            status: input.status ?? null,
            completion_percentage: input.completion_percentage ?? null,
            domain: input.domain ?? null,
            ga4_property_id: input.ga4_property_id ?? null,
          },
        });
      }

      return asToolResult({
        executed: true,
        message: 'Proyecto actualizado en Pulse.',
        result: await updateProjectDetails(input),
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('assign_ga4', {
    title: 'Vincular medicion GA4',
    description: 'Asigna o corrige el GA4 property id de un proyecto usando proyecto o usuario como entrada.',
    inputSchema: {
      projectIdentifier: z.string().min(1).optional(),
      userIdentifier: z.string().min(1).optional(),
      ga4_property_id: z.string().min(1),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean(),
      requires_confirmation: z.boolean().optional(),
      message: z.string(),
      preview: z.unknown().optional(),
      result: z.unknown().optional(),
    }),
  }, async ({ projectIdentifier, userIdentifier, ga4_property_id, confirm }) => {
    try {
      assertMutationsEnabled();
      const previewTarget = await resolveProjectPreview(projectIdentifier, userIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a vincular la medicion GA4 del proyecto. Reintentá con confirm=true para ejecutarla.', {
          target: previewTarget,
          ga4_property_id,
        });
      }

      return asToolResult({
        executed: true,
        message: 'GA4 vinculado en Pulse.',
        result: await assignProjectGa4({ projectIdentifier, userIdentifier, ga4_property_id }),
      });
    } catch (error) {
      return asToolError(error);
    }
  });
}
