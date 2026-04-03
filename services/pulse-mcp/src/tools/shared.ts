import * as z from 'zod/v4';

import { assertProjectAllowed, assertUserAllowed } from '../auth.js';
import { pulseMcpConfig } from '../env.js';
import { resolveProjectIdentifier, resolveUserIdentifier } from '../pulse-data.js';

export const periodSchema = z.enum(['this_month', 'last_month', 'last_7_days', 'last_30_days', 'this_year']);

export const topPageSchema = z.object({
  label: z.string().nullable(),
  path: z.string(),
  visits: z.number(),
  percentage: z.number(),
});

export function asToolResult<T>(payload: T) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

export function asToolError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Pulse MCP no pudo completar la consulta.';
  return {
    content: [{ type: 'text' as const, text: message }],
    isError: true,
  };
}

export function assertMutationsEnabled() {
  if (!pulseMcpConfig.mutationsEnabled) {
    throw new Error('Las acciones de escritura estan deshabilitadas en este servidor MCP. Activá PULSE_MCP_ENABLE_MUTATIONS=true en Render antes de operar Pulse.');
  }
}

export function asConfirmationResult<T>(message: string, preview: T) {
  return asToolResult({
    executed: false,
    requires_confirmation: true,
    message,
    preview,
  });
}

export async function resolveUserFromInput(userIdentifier: string) {
  const user = await resolveUserIdentifier(userIdentifier);
  assertUserAllowed(user.id);
  return user;
}

export async function resolveProjectFromInput(projectIdentifier: string) {
  const project = await resolveProjectIdentifier(projectIdentifier);
  assertProjectAllowed(project.id);
  return project;
}
