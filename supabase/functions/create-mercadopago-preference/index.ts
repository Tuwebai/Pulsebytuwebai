import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  corsHeaders,
  ensureAuthenticatedCustomer,
  getMercadoPagoConfig,
  getPaymentTypeConfig,
  isPaymentTypeKey,
  isPlainObject,
  jsonResponse,
} from './shared.ts';

function isValidBody(body: unknown): body is { customAmount?: number; paymentType: string } {
  if (!isPlainObject(body) || !isPaymentTypeKey(body.paymentType)) {
    return false;
  }

  if (typeof body.customAmount === 'undefined') {
    return true;
  }

  return typeof body.customAmount === 'number' && Number.isFinite(body.customAmount) && body.customAmount > 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const authorization = req.headers.get('Authorization');

  if (!authorization) {
    return jsonResponse(401, { error: 'Necesitás una sesión activa para iniciar el pago.' });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'No pudimos leer la solicitud del pago.' });
  }

  if (!isValidBody(body)) {
    return jsonResponse(400, { error: 'El tipo de pago no es válido.' });
  }

  try {
    const { adminClient, user } = await ensureAuthenticatedCustomer(authorization);
    const paymentType = getPaymentTypeConfig(body.paymentType);
    const amount = body.customAmount ?? paymentType.price;
    const config = getMercadoPagoConfig();
    const now = new Date().toISOString();

    const { data: paymentRecord, error: paymentError } = await adminClient
      .from('payments')
      .insert({
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name,
        payment_type: body.paymentType,
        amount,
        currency: paymentType.currency,
        status: 'pending',
        description: paymentType.description,
        features: paymentType.features,
        created_at: now,
        updated_at: now,
        metadata: {
          source: 'pulse_checkout',
        },
      })
      .select('id')
      .single();

    if (paymentError || !paymentRecord?.id) {
      throw paymentError || new Error('PAYMENT_RECORD_NOT_CREATED');
    }

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            title: paymentType.name,
            description: paymentType.description,
            quantity: 1,
            currency_id: paymentType.currency,
            unit_price: amount / 100,
          },
        ],
        payer: {
          email: user.email,
          name: user.full_name ?? user.email,
        },
        back_urls: {
          success: `${config.appUrl}/dashboard/pagos?status=success`,
          pending: `${config.appUrl}/dashboard/pagos?status=pending`,
          failure: `${config.appUrl}/dashboard/pagos?status=failure`,
        },
        auto_return: 'approved',
        external_reference: paymentRecord.id,
        notification_url: config.webhookUrl,
        metadata: {
          payment_id: paymentRecord.id,
          payment_type: body.paymentType,
          pulse_environment: config.environment,
          user_id: user.id,
        },
      }),
    });

    const mercadoPagoPayload = await mercadoPagoResponse.json().catch(() => null);

    if (!mercadoPagoResponse.ok || !mercadoPagoPayload?.id || !mercadoPagoPayload?.init_point) {
      await adminClient
        .from('payments')
        .update({
          metadata: {
            error: mercadoPagoPayload,
            source: 'pulse_checkout',
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentRecord.id);

      return jsonResponse(502, {
        error: 'No pudimos preparar el checkout de Mercado Pago. Revisá la configuración e intentá de nuevo.',
      });
    }

    const { error: updateError } = await adminClient
      .from('payments')
      .update({
        mercadopago_id: mercadoPagoPayload.id,
        metadata: {
          environment: config.environment,
          external_reference: paymentRecord.id,
          mercado_pago_preference: mercadoPagoPayload.id,
          source: 'pulse_checkout',
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRecord.id);

    if (updateError) {
      throw updateError;
    }

    return jsonResponse(200, {
      initPoint: mercadoPagoPayload.init_point,
      paymentId: paymentRecord.id,
      preferenceId: mercadoPagoPayload.id,
      sandboxInitPoint: mercadoPagoPayload.sandbox_init_point ?? mercadoPagoPayload.init_point,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (message === 'UNAUTHORIZED') {
      return jsonResponse(401, { error: 'Necesitás una sesión activa para iniciar el pago.' });
    }

    if (message === 'ADMIN_NOT_ALLOWED') {
      return jsonResponse(403, { error: 'El checkout de Pulse está disponible solo para cuentas cliente.' });
    }

    if (message === 'USER_NOT_FOUND') {
      return jsonResponse(404, { error: 'No encontramos tu cuenta operativa en Pulse.' });
    }

    if (message === 'MERCADOPAGO_CONFIG_MISSING') {
      return jsonResponse(500, { error: 'La configuración de Mercado Pago todavía no está lista.' });
    }

    console.error('Error en create-mercadopago-preference:', message);
    return jsonResponse(500, { error: 'No pudimos iniciar el pago. Intentá nuevamente en unos minutos.' });
  }
});
