// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { enforceRateLimit, getRequestIp } from '../_shared/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-tuwebai-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const ALLOWED_FIELDS = ['name', 'status', 'completion_percentage', 'domain', 'ga4_property_id'] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];

interface WebhookBody {
  project_id: string;
  user_email: string;
  fields_changed: Record<string, unknown>;
}

interface SanitizedFields {
  name?: string;
  status?: string;
  completion_percentage?: number;
  domain?: string;
  ga4_property_id?: string;
}

interface PulseUserRow {
  id: string;
  notif_project_update: boolean | null;
}

interface ProjectRow {
  id: string;
  name: string | null;
  status: string | null;
  created_by: string | null;
}

function createSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeFields(fieldsChanged: Record<string, unknown>): SanitizedFields {
  const sanitized: SanitizedFields = {};

  if (typeof fieldsChanged.name === 'string') {
    sanitized.name = fieldsChanged.name.trim();
  }

  if (typeof fieldsChanged.status === 'string') {
    sanitized.status = fieldsChanged.status.trim();
  }

  if (typeof fieldsChanged.domain === 'string') {
    sanitized.domain = fieldsChanged.domain.trim();
  }

  if (typeof fieldsChanged.ga4_property_id === 'string') {
    sanitized.ga4_property_id = fieldsChanged.ga4_property_id.trim();
  }

  if (typeof fieldsChanged.completion_percentage === 'number' && Number.isInteger(fieldsChanged.completion_percentage)) {
    sanitized.completion_percentage = Math.max(0, Math.min(100, fieldsChanged.completion_percentage));
  }

  return sanitized;
}

function getUpdatedFieldsList(fields: SanitizedFields): AllowedField[] {
  return ALLOWED_FIELDS.filter((field) => fields[field] !== undefined);
}

function buildProjectUpdateMessage(projectName: string | null, status: string): string {
  const safeName = projectName?.trim() ? `"${projectName.trim()}"` : 'tu proyecto';
  return `${safeName} ahora figura como ${status}.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const sharedSecret = Deno.env.get('TUWEBAI_WEBHOOK_SECRET');
  if (!sharedSecret) {
    console.error('TUWEBAI_WEBHOOK_SECRET no configurado');
    return jsonResponse(500, { error: 'Webhook secret misconfigured' });
  }

  const providedSecret = req.headers.get('X-TuWebAI-Secret');
  if (providedSecret !== sharedSecret) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  if (!isPlainObject(payload)) {
    return jsonResponse(400, { error: 'Invalid payload structure' });
  }

  const { project_id, user_email, fields_changed } = payload as Partial<WebhookBody>;

  if (typeof project_id !== 'string' || !project_id.trim()) {
    return jsonResponse(400, { error: 'project_id is required' });
  }

  if (typeof user_email !== 'string' || !isValidEmail(user_email)) {
    return jsonResponse(400, { error: 'user_email is invalid' });
  }

  if (!isPlainObject(fields_changed)) {
    return jsonResponse(400, { error: 'fields_changed must be an object' });
  }

  const sanitizedFields = sanitizeFields(fields_changed);
  const updatedFields = getUpdatedFieldsList(sanitizedFields);

  if (updatedFields.length === 0) {
    return jsonResponse(200, {
      ok: true,
      noop: true,
      reason: 'No allowed fields to update',
      allowed_fields: ALLOWED_FIELDS
    });
  }

  const supabase = createSupabaseAdminClient();

  try {
    const rateLimit = await enforceRateLimit({
      action: 'project-update-webhook',
      key: `${project_id.trim()}:${getRequestIp(req)}`,
      limit: 120,
      windowSeconds: 10 * 60,
    });

    if (!rateLimit.allowed) {
      return jsonResponse(429, {
        error: 'Rate limit exceeded'
      });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, notif_project_update')
      .eq('email', user_email.trim().toLowerCase())
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    const pulseUser = user as PulseUserRow | null;

    if (!pulseUser?.id) {
      return jsonResponse(404, {
        ok: false,
        reason: 'Pulse user not found'
      });
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, status, created_by')
      .eq('id', project_id.trim())
      .eq('created_by', pulseUser.id)
      .maybeSingle();

    if (projectError) {
      throw projectError;
    }

    const existingProject = project as ProjectRow | null;

    if (!existingProject?.id) {
      return jsonResponse(404, {
        ok: false,
        reason: 'Project not found for Pulse user'
      });
    }

    const updateData: SanitizedFields & { updated_at: string } = {
      ...sanitizedFields,
      updated_at: new Date().toISOString()
    };

    const previousStatus = existingProject.status;
    const nextStatus = sanitizedFields.status;

    const { error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', existingProject.id)
      .eq('created_by', pulseUser.id);

    if (updateError) {
      throw updateError;
    }

    if (
      nextStatus &&
      nextStatus !== previousStatus &&
      pulseUser.notif_project_update !== false
    ) {
      const { error: notificationError } = await supabase.from('notifications').insert({
        user_id: pulseUser.id,
        type: 'info',
        category: 'project',
        title: 'Actualizamos el estado de tu proyecto',
        message: buildProjectUpdateMessage(sanitizedFields.name ?? existingProject.name, nextStatus),
        is_read: false,
        action_url: '/dashboard/proyecto',
        metadata: {
          project_id: existingProject.id,
          previous_status: previousStatus,
          status: nextStatus,
          source: 'tuwebai_webhook'
        }
      });

      if (notificationError) {
        throw notificationError;
      }
    }

    return jsonResponse(200, {
      ok: true,
      project_id: existingProject.id,
      updated_fields: updatedFields
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error en project-update-webhook:', message);
    return jsonResponse(500, { error: 'Internal Server Error' });
  }
});
