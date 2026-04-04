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

const RECENT_MUTATION_TTL_MS = 30_000;
const inFlightMutations = new Map<string, Promise<unknown>>();
const recentMutations = new Map<string, { expiresAt: number; value: unknown }>();

function stableSerialize(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  const valueType = typeof value;
  if (valueType === 'string') return JSON.stringify(value);
  if (valueType === 'number' || valueType === 'boolean') return String(value);

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }

  if (valueType === 'object') {
    const objectValue = value as Record<string, unknown>;
    const keys = Object.keys(objectValue).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableSerialize(objectValue[key])}`).join(',')}}`;
  }

  return JSON.stringify(String(value));
}

function pruneExpiredMutationCache(now: number) {
  for (const [key, entry] of recentMutations.entries()) {
    if (entry.expiresAt <= now) {
      recentMutations.delete(key);
    }
  }
}

export async function runIdempotentMutation<T>(
  toolName: string,
  mutationInput: unknown,
  execute: () => Promise<T>,
) {
  const now = Date.now();
  pruneExpiredMutationCache(now);

  const cacheKey = `${toolName}:${stableSerialize(mutationInput)}`;
  const cached = recentMutations.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  const active = inFlightMutations.get(cacheKey);
  if (active) {
    return active as Promise<T>;
  }

  const execution = execute()
    .then((result) => {
      recentMutations.set(cacheKey, {
        expiresAt: Date.now() + RECENT_MUTATION_TTL_MS,
        value: result,
      });
      return result;
    })
    .finally(() => {
      inFlightMutations.delete(cacheKey);
    });

  inFlightMutations.set(cacheKey, execution);
  return execution;
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
