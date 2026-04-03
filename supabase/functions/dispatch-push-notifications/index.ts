import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import webpush from 'npm:web-push@3.6.7';
import { corsHeaders, createSupabaseAdminClient, getPushConfig, jsonResponse } from './shared.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const config = getPushConfig();
    const internalSecret = req.headers.get('x-push-dispatch-secret');

    if (internalSecret !== config.dispatchSecret) {
      return jsonResponse(401, { error: 'Unauthorized' });
    }

    const body = await req.json().catch(() => null);
    const notificationId = typeof body?.notificationId === 'string' ? body.notificationId : '';

    if (!notificationId) {
      return jsonResponse(400, { error: 'Missing notificationId' });
    }

    const adminClient = createSupabaseAdminClient();
    const { data: notification, error: notificationError } = await adminClient
      .from('notifications')
      .select('id, user_id, title, message, action_url, category, is_urgent, metadata')
      .eq('id', notificationId)
      .maybeSingle();

    if (notificationError) throw notificationError;
    if (!notification?.user_id) return jsonResponse(200, { delivered: 0, inactive: 0 });

    const { data: subscriptions, error: subscriptionsError } = await adminClient
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', notification.user_id)
      .eq('is_active', true);

    if (subscriptionsError) throw subscriptionsError;
    if (!subscriptions?.length) return jsonResponse(200, { delivered: 0, inactive: 0 });

    webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);

    const url = notification.action_url?.startsWith('http')
      ? notification.action_url
      : `${config.appUrl}${notification.action_url || '/dashboard'}`;
    const metadata =
      notification.metadata && typeof notification.metadata === 'object'
        ? (notification.metadata as Record<string, unknown>)
        : {};

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message || 'Tienes una novedad nueva en Pulse.',
      url,
      primaryKey: notification.id,
      category: notification.category,
      urgent: notification.is_urgent ?? false,
      senderName: typeof metadata.sender_name === 'string' ? metadata.sender_name : null,
      ticketId: typeof metadata.ticket_id === 'string' ? metadata.ticket_id : null,
      ticketSubject: typeof metadata.ticket_subject === 'string' ? metadata.ticket_subject : null,
    });

    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { auth: subscription.auth, p256dh: subscription.p256dh },
          },
          payload,
        ),
      ),
    );

    const inactiveEndpoints = results.flatMap((result, index) => {
      if (result.status !== 'rejected') return [];
      const statusCode = Number((result.reason as { statusCode?: number })?.statusCode || 0);
      return statusCode === 404 || statusCode === 410 ? [subscriptions[index].endpoint] : [];
    });

    if (inactiveEndpoints.length > 0) {
      const { error: deactivateError } = await adminClient
        .from('push_subscriptions')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in('endpoint', inactiveEndpoints);

      if (deactivateError) throw deactivateError;
    }

    return jsonResponse(200, {
      delivered: results.filter((result) => result.status === 'fulfilled').length,
      inactive: inactiveEndpoints.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    console.error('Error dispatch-push-notifications:', message);
    return jsonResponse(500, { error: 'No pudimos despachar la notificacion push.' });
  }
});
