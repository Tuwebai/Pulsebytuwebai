import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { PaymentPreference } from '@/types';

interface CreateMercadoPagoPreferenceBody {
  customAmount?: number;
  paymentType: string;
}

export async function requestMercadoPagoPreference(
  body: CreateMercadoPagoPreferenceBody,
): Promise<PaymentPreference> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Necesitás una sesión activa para iniciar el pago.');
  }

  const { data, error } = await supabase.functions.invoke('create-mercadopago-preference', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body,
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error || 'No pudimos preparar el checkout seguro.');
    }

    if (error instanceof FunctionsRelayError) {
      throw new Error('El relay de pagos rechazó la solicitud.');
    }

    if (error instanceof FunctionsFetchError) {
      throw new Error('No pudimos conectarnos con la función de pagos.');
    }

    throw new Error('No pudimos preparar el checkout seguro.');
  }

  return data as PaymentPreference;
}
