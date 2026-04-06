import { supabase } from '@/data/supabase/client';

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
  let query = supabase
    .from('push_subscriptions')
    .select('endpoint')
    .eq('user_id', scope.userId)
    .eq('is_active', true);

  if (scope.endpoint) {
    query = query.eq('endpoint', scope.endpoint);
  } else {
    query = query.order('updated_at', { ascending: false }).limit(1);
  }

  const { data, error } = await query.maybeSingle();

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
