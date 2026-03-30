// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
} as const;

const PAYMENT_TYPES = {
  WEBSITE: {
    currency: 'ARS',
    description: 'Sitio web profesional con diseño personalizado',
    features: [
      'Diseño responsive',
      'SEO optimizado',
      'Panel de administración',
      'Hosting incluido (1 año)',
      'Dominio incluido (1 año)',
      'Soporte técnico (3 meses)',
    ],
    name: 'Desarrollo de Sitio Web',
    price: 99900,
  },
  ECOMMERCE: {
    currency: 'ARS',
    description: 'Tienda virtual completa con pasarela de pagos',
    features: [
      'Todo lo del sitio web',
      'Catálogo de productos',
      'Carrito de compras',
      'Pasarela de pagos',
      'Gestión de inventario',
      'Reportes de ventas',
      'Soporte técnico (6 meses)',
    ],
    name: 'Tienda Online',
    price: 199900,
  },
  CUSTOM: {
    currency: 'ARS',
    description: 'Solución a medida según tus necesidades',
    features: [
      'Análisis de requerimientos',
      'Diseño personalizado',
      'Desarrollo a medida',
      'Integraciones especiales',
      'Capacitación del equipo',
      'Soporte técnico (12 meses)',
    ],
    name: 'Proyecto Personalizado',
    price: 299900,
  },
} as const;

interface RequestUserRow {
  email: string;
  full_name: string | null;
  id: string;
  role: string | null;
}

export type PaymentTypeKey = keyof typeof PAYMENT_TYPES;

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isPaymentTypeKey(value: unknown): value is PaymentTypeKey {
  return typeof value === 'string' && value in PAYMENT_TYPES;
}

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

function createSupabaseUserClient(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

  return createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });
}

export async function ensureAuthenticatedCustomer(authorization: string) {
  const adminClient = createSupabaseAdminClient();
  const userClient = createSupabaseUserClient(authorization);
  const {
    data: { user: authUser },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !authUser?.id) {
    throw new Error('UNAUTHORIZED');
  }

  const { data, error } = await adminClient
    .from('users')
    .select('id, email, full_name, role')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const user = data as RequestUserRow | null;

  if (!user?.id || !user.email) {
    throw new Error('USER_NOT_FOUND');
  }

  if (user.role === 'admin') {
    throw new Error('ADMIN_NOT_ALLOWED');
  }

  return { adminClient, user };
}

export function getPaymentTypeConfig(paymentType: PaymentTypeKey) {
  return PAYMENT_TYPES[paymentType];
}

export function getMercadoPagoConfig() {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || '';
  const environment = Deno.env.get('MERCADOPAGO_ENVIRONMENT') || 'production';
  const appUrl = Deno.env.get('PULSE_PUBLIC_URL') || Deno.env.get('VITE_PUBLIC_URL') || 'http://127.0.0.1:8083';
  const webhookUrl =
    Deno.env.get('MERCADOPAGO_WEBHOOK_URL') || `${appUrl.replace(/\/$/, '')}/api/webhooks/mercadopago`;

  if (!accessToken) {
    throw new Error('MERCADOPAGO_CONFIG_MISSING');
  }

  return {
    accessToken,
    appUrl: appUrl.replace(/\/$/, ''),
    environment,
    webhookUrl,
  };
}
