import { requestMercadoPagoPreference } from '@/api/payments/mercadoPago.api';
import { PAYMENT_TYPES, formatCurrency } from '@/features/payments/services/mercadoPago';
import { supabase } from '@/data/supabase/client';
import type { CreatePaymentData } from '@/types';

import { type PaymentRow } from '@/features/payments/services/payment.service.types';

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
