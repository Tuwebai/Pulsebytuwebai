import { supabase } from '@/lib/supabase';

interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
}

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    throw new Error('No pudimos identificar tu sesión para activar notificaciones push.');
  }

  return user.id;
}

export async function fetchActivePushSubscription() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, is_active')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No pudimos consultar tus notificaciones push: ${error.message}`);
  }

  return data?.endpoint ?? null;
}

export async function upsertPushSubscription(payload: PushSubscriptionPayload) {
  const userId = await getCurrentUserId();
  const now = new Date().toISOString();
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      endpoint: payload.endpoint,
      p256dh: payload.p256dh,
      auth: payload.auth,
      user_agent: payload.userAgent,
      user_id: userId,
      is_active: true,
      last_seen_at: now,
      updated_at: now,
    },
    { onConflict: 'endpoint' },
  );

  if (error) {
    throw new Error(`No pudimos registrar este dispositivo para notificaciones push: ${error.message}`);
  }
}

export async function deactivatePushSubscription(endpoint: string) {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from('push_subscriptions')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('endpoint', endpoint);

  if (error) {
    throw new Error(`No pudimos desactivar las notificaciones push en este dispositivo: ${error.message}`);
  }
}
