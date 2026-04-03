import { requestMercadoPagoPreference } from '@/api/payments/mercadoPago.api';
import { PAYMENT_TYPES, formatCurrency } from '@/lib/integrations/mercadopago';
import { supabase } from '@/lib/supabase/supabase';
import type { CreatePaymentData, Payment } from '@/types';

interface PaymentRow {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  payment_type: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  mercadopago_id: string | null;
  mercadopago_status: string | null;
  payment_method: string | null;
  installments: number | null;
  description: string | null;
  features: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  paid_at: string | null;
  invoice_url: string | null;
  metadata: Record<string, unknown> | null;
}

function normalizePayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    userId: row.user_id ?? '',
    userEmail: row.user_email ?? '',
    userName: row.user_name ?? '',
    paymentType: row.payment_type ?? '',
    amount: row.amount ?? 0,
    currency: row.currency ?? 'ARS',
    status: row.status ?? 'pending',
    mercadopagoId: row.mercadopago_id ?? undefined,
    mercadopagoStatus: row.mercadopago_status ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
    installments: row.installments ?? undefined,
    description: row.description ?? 'Pago registrado',
    features: row.features ?? [],
    createdAt: row.created_at ?? new Date(0).toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date(0).toISOString(),
    paidAt: row.paid_at ?? undefined,
    invoiceUrl: row.invoice_url ?? undefined,
    metadata: row.metadata ?? undefined,
  };
}

async function fetchUserPayments(userId: string, userEmail: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .or(`user_id.eq.${userId},user_email.eq.${userEmail}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as PaymentRow[]).map(normalizePayment);
}

export async function createMercadoPagoPreference(paymentData: CreatePaymentData) {
  try {
    const paymentType = PAYMENT_TYPES[paymentData.paymentType as keyof typeof PAYMENT_TYPES];

    if (!paymentType) {
      throw new Error('Tipo de pago no valido');
    }

    return requestMercadoPagoPreference({
      customAmount: paymentData.customAmount,
      paymentType: paymentData.paymentType,
    });
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    throw error;
  }
}

export async function processMercadoPagoWebhook(webhookData: unknown) {
  try {
    const payload = webhookData as {
      data?: { id?: string };
      type?: string;
    };

    if (payload.type !== 'payment' || !payload.data?.id) {
      return { success: false, error: 'Payment not found' };
    }

    const paymentInfo = await getMercadoPagoPayment(payload.data.id);
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentInfo.external_reference);

    if (paymentsError) {
      throw paymentsError;
    }

    if (!paymentsData?.length) {
      return { success: false, error: 'Payment not found' };
    }

    const paymentDoc = paymentsData[0] as PaymentRow;

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentInfo.status,
        mercadopago_status: paymentInfo.status,
        payment_method: paymentInfo.payment_method?.type,
        installments: paymentInfo.installments,
        paid_at: paymentInfo.status === 'approved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
        metadata: {
          ...(paymentDoc.metadata ?? {}),
          mercadopagoPayment: paymentInfo,
        },
      })
      .eq('id', paymentDoc.id);

    if (updateError) {
      throw updateError;
    }

    if (paymentInfo.status === 'approved') {
      await generateInvoice(paymentDoc.id, paymentDoc, paymentInfo);
    }

    return {
      success: true,
      paymentId: paymentDoc.id,
      status: paymentInfo.status,
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    throw error;
  }
}

const getMercadoPagoPayment = async (paymentId: string) => {
  return {
    id: paymentId,
    status: 'approved',
    external_reference: `payment_${Date.now()}`,
    payment_method: {
      type: 'credit_card',
      id: 'visa',
    },
    installments: 1,
    transaction_amount: 999,
    currency: 'ARS',
  };
};

const generateInvoice = async (
  paymentId: string,
  paymentData: PaymentRow,
  mercadopagoData: {
    id: string;
    payment_method?: { type?: string };
  },
) => {
  try {
    const invoiceNumber = `INV-${paymentId.slice(-6)}`;
    const invoiceUrl = `https://pulse.tuweb-ai.com/invoices/${invoiceNumber}.pdf`;

    const { error: invoiceError } = await supabase
      .from('payments')
      .update({
        invoice_url: invoiceUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (invoiceError) {
      throw invoiceError;
    }

    return {
      number: invoiceNumber,
      date: new Date().toISOString(),
      customer: {
        name: paymentData.user_name ?? '',
        email: paymentData.user_email ?? '',
      },
      items: [
        {
          description: paymentData.description ?? 'Pago registrado',
          amount: formatCurrency(paymentData.amount ?? 0, paymentData.currency ?? 'ARS'),
          quantity: 1,
        },
      ],
      total: formatCurrency(paymentData.amount ?? 0, paymentData.currency ?? 'ARS'),
      paymentMethod: mercadopagoData.payment_method?.type || 'Mercado Pago',
      mercadopagoId: mercadopagoData.id,
    };
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

export function getUserPayments(
  userId: string,
  userEmail: string,
  callback: (payments: Payment[]) => void,
) {
  const loadPayments = async () => {
    try {
      const payments = await fetchUserPayments(userId, userEmail);
      callback(payments);
    } catch (error) {
      console.warn('Error cargando pagos del usuario:', error);
      callback([]);
    }
  };

  const subscription = supabase
    .channel(`user_payments_changes_${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'payments' },
      () => {
        void loadPayments();
      },
    )
    .subscribe();

  void loadPayments();

  return () => subscription.unsubscribe();
}

export function getAllPayments(callback: (payments: Payment[]) => void) {
  const loadPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error cargando todos los pagos:', error);
      callback([]);
      return;
    }

    callback(((data ?? []) as PaymentRow[]).map(normalizePayment));
  };

  const subscription = supabase
    .channel('all_payments_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
      void loadPayments();
    })
    .subscribe();

  void loadPayments();

  return () => subscription.unsubscribe();
}
