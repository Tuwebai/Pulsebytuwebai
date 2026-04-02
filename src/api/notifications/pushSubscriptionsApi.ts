import { supabase } from '@/lib/supabase';

interface PushSubscriptionPayload {
  auth: string;
  endpoint: string;
  p256dh: string;
  userAgent: string;
}

interface PushSubscriptionResponse {
  endpoint: string | null;
  error?: string;
  isSubscribed?: boolean;
  success?: boolean;
}

async function invokeManagePushSubscription<T>(payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke<T>('manage-push-subscription', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || 'No pudimos sincronizar este dispositivo para notificaciones push.');
  }

  return data;
}

export async function fetchActivePushSubscription() {
  const data = await invokeManagePushSubscription<PushSubscriptionResponse>({ action: 'get-active' });
  return data?.endpoint ?? null;
}

export async function upsertPushSubscription(payload: PushSubscriptionPayload) {
  const data = await invokeManagePushSubscription<PushSubscriptionResponse>({
    action: 'upsert',
    ...payload,
  });

  if (!data?.isSubscribed) {
    throw new Error(data?.error || 'No pudimos registrar este dispositivo para notificaciones push.');
  }
}

export async function deactivatePushSubscription(endpoint: string) {
  const data = await invokeManagePushSubscription<PushSubscriptionResponse>({
    action: 'deactivate',
    endpoint,
  });

  if (data?.success !== true) {
    throw new Error(data?.error || 'No pudimos desactivar las notificaciones push en este dispositivo.');
  }
}
