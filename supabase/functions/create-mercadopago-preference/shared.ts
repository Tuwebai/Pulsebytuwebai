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
    description: 'Para el negocio que necesita presencia profesional en Google y empezar a recibir consultas.',
    features: [
      'Sitio institucional a medida',
      'Diseño responsive para mobile y desktop',
      'Formulario de contacto o WhatsApp',
      'SEO base para aparecer en Google',
      'Analytics configurado desde el día 1',
    ],
    name: 'Presencia Profesional',
    price: 42000000,
  },
  ECOMMERCE: {
    currency: 'ARS',
    description: 'Para el negocio que quiere que su web genere consultas de forma consistente.',
    features: [
      'Arquitectura pensada para convertir',
      'Formularios y automatizaciones',
      'SEO técnico y estructura optimizada',
      'Analytics y seguimiento de conversión',
      'Hosting y dominio profesional por 1 año',
    ],
    name: 'Web Comercial',
    price: 78000000,
  },
  CUSTOM: {
    currency: 'ARS',
    description: 'Para el negocio que necesita algo que no existe todavía: paneles, flujos e integraciones propias.',
    features: [
      'Paneles o módulos personalizados',
      'Integraciones con sistemas externos',
      'Arquitectura escalable',
      'Desarrollo orientado al crecimiento',
      'Diagnóstico técnico incluido antes de arrancar',
    ],
    name: 'Sistema a Medida',
    price: 140000000,
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
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || Deno.env.get('VITE_MERCADOPAGO_ACCESS_TOKEN') || '';
  const environment = Deno.env.get('MERCADOPAGO_ENVIRONMENT') || Deno.env.get('VITE_MERCADOPAGO_ENVIRONMENT') || 'production';
  const appUrl = Deno.env.get('PULSE_PUBLIC_URL') || Deno.env.get('VITE_PUBLIC_URL') || 'http://127.0.0.1:8083';
  const webhookUrl =
    Deno.env.get('MERCADOPAGO_WEBHOOK_URL') ||
    Deno.env.get('VITE_MERCADOPAGO_WEBHOOK_URL') ||
    `${appUrl.replace(/\/$/, '')}/api/webhooks/mercadopago`;

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
