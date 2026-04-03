import type { Payment } from '@/types';

export interface PaymentRow {
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

export function normalizePayment(row: PaymentRow): Payment {
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
