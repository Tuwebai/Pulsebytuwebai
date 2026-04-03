import { supabase } from '@/lib/supabase';

interface PushSubscriptionPayload {
  auth: string;
  endpoint: string;
  p256dh: string;
  userId: string;
  userAgent: string;
}

interface PushSubscriptionScope {
  endpoint?: string | null;
  userId: string;
}

export async function fetchActivePushSubscription(scope: PushSubscriptionScope) {
  if (!scope.endpoint) {
    return null;
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint')
    .eq('user_id', scope.userId)
    .eq('endpoint', scope.endpoint)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'No pudimos leer la configuracion push de este dispositivo.');
  }

  return data?.endpoint ?? null;
}

export async function upsertPushSubscription(payload: PushSubscriptionPayload) {
  const { error } = await supabase.rpc('register_push_subscription', {
    p_auth: payload.auth,
    p_endpoint: payload.endpoint,
    p_p256dh: payload.p256dh,
    p_user_agent: payload.userAgent,
  });

  if (error) {
    throw new Error(error.message || 'No pudimos registrar este dispositivo para notificaciones push.');
  }
}

export async function deactivatePushSubscription(scope: PushSubscriptionScope & { endpoint?: string | null }) {
  if (!scope.endpoint) {
    return;
  }

  const query = supabase
    .from('push_subscriptions')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', scope.userId)
    .eq('endpoint', scope.endpoint);

  const { error } = await query;

  if (error) {
    throw new Error(error.message || 'No pudimos desactivar las notificaciones push en este dispositivo.');
  }
}
