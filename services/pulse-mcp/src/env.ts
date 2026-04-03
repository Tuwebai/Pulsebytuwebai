import { config as loadDotenv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { z } from 'zod/v4';

const currentDir = dirname(fileURLToPath(import.meta.url));
const serviceDir = resolve(currentDir, '..');
const rootDir = resolve(serviceDir, '..', '..');

loadDotenv({ path: resolve(rootDir, '.env') });
loadDotenv({ path: resolve(rootDir, '.env.local'), override: true });

const envSchema = z.object({
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3333),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PULSE_MCP_AUTH_TOKEN: z.string().optional(),
  PULSE_MCP_REQUIRE_AUTH: z.enum(['true', 'false']).default('true'),
  PULSE_MCP_ALLOWED_HOSTS: z.string().optional(),
  PULSE_MCP_ALLOWED_PROJECT_IDS: z.string().optional(),
  PULSE_MCP_ALLOWED_USER_IDS: z.string().optional(),
  PULSE_MCP_PUBLIC_URL: z.string().url().optional(),
});

const env = envSchema.parse(process.env);

function parseCsv(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export const pulseMcpConfig = {
  host: env.HOST,
  port: env.PORT,
  publicUrl: env.PULSE_MCP_PUBLIC_URL ?? `http://${env.HOST}:${env.PORT}/mcp`,
  requireAuth: env.PULSE_MCP_REQUIRE_AUTH === 'true',
  authToken: env.PULSE_MCP_AUTH_TOKEN,
  allowedHosts: parseCsv(env.PULSE_MCP_ALLOWED_HOSTS),
  allowedProjectIds: parseCsv(env.PULSE_MCP_ALLOWED_PROJECT_IDS),
  allowedUserIds: parseCsv(env.PULSE_MCP_ALLOWED_USER_IDS),
  supabaseUrl: env.SUPABASE_URL,
  supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
};

if (pulseMcpConfig.requireAuth && !pulseMcpConfig.authToken) {
  throw new Error('Falta PULSE_MCP_AUTH_TOKEN para iniciar Pulse MCP con autenticacion obligatoria.');
}
