import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { enforceRateLimit } from '../_shared/rateLimit.ts';
import {
  corsHeaders,
  ensureAuthenticatedUser,
  jsonResponse,
} from './shared.ts';

type ManagePushAction = 'get-active' | 'upsert' | 'deactivate';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const authorization = req.headers.get('Authorization');

  if (!authorization) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  try {
    const body = await req.json().catch(() => null);
    const action = (body?.action as ManagePushAction | undefined) ?? 'get-active';
    const { adminClient, user } = await ensureAuthenticatedUser(authorization);
    const rateLimit = await enforceRateLimit({
      action: `manage-push-subscription:${action}`,
      key: user.id,
      limit: action === 'get-active' ? 60 : 20,
      windowSeconds: 10 * 60,
    });

    if (!rateLimit.allowed) {
      return jsonResponse(429, {
        error: 'RATE_LIMITED',
        message: 'Demasiadas operaciones seguidas sobre las notificaciones push.',
        retry_after_seconds: rateLimit.retryAfterSeconds,
      });
    }

    if (action === 'get-active') {
      const { data, error } = await adminClient
        .from('push_subscriptions')
        .select('endpoint, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return jsonResponse(200, { endpoint: data?.endpoint ?? null, isSubscribed: Boolean(data?.endpoint) });
    }

    if (action === 'deactivate') {
      const endpoint = typeof body?.endpoint === 'string' ? body.endpoint : '';

      if (endpoint) {
        const { error } = await adminClient
          .from('push_subscriptions')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('endpoint', endpoint);

        if (error) {
          throw error;
        }
      }

      return jsonResponse(200, { success: true });
    }

    if (action === 'upsert') {
      const endpoint = typeof body?.endpoint === 'string' ? body.endpoint : '';
      const p256dh = typeof body?.p256dh === 'string' ? body.p256dh : '';
      const auth = typeof body?.auth === 'string' ? body.auth : '';
      const userAgent = typeof body?.userAgent === 'string' ? body.userAgent : '';

      if (!endpoint || !p256dh || !auth) {
        return jsonResponse(400, { error: 'Missing subscription payload' });
      }

      const now = new Date().toISOString();
      const { error } = await adminClient
        .from('push_subscriptions')
        .upsert(
          {
            endpoint,
            p256dh,
            auth,
            user_agent: userAgent,
            user_id: user.id,
            is_active: true,
            last_seen_at: now,
            updated_at: now,
          },
          { onConflict: 'endpoint' },
        );

      if (error) {
        throw error;
      }

      return jsonResponse(200, { endpoint, isSubscribed: true });
    }

    return jsonResponse(400, { error: 'Unsupported action' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    console.error('Error manage-push-subscription:', message);
    return jsonResponse(500, { error: message });
  }
});
