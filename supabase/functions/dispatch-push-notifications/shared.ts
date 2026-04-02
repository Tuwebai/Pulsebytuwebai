// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-push-dispatch-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
} as const;

export function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export function createSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getPushConfig() {
  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY') || '';
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY') || '';
  const subject = Deno.env.get('VAPID_SUBJECT') || '';
  const dispatchSecret = Deno.env.get('PUSH_DISPATCH_SECRET') || '';
  const appUrl = (Deno.env.get('PULSE_PUBLIC_URL') || Deno.env.get('VITE_PUBLIC_URL') || 'https://pulse.tuweb-ai.com').replace(/\/$/, '');

  if (!publicKey || !privateKey || !subject || !dispatchSecret) {
    throw new Error('PUSH_CONFIG_MISSING');
  }

  return { publicKey, privateKey, subject, dispatchSecret, appUrl };
}
