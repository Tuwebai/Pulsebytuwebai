// Tipos de Pago para el Dashboard TuWebAI
// Centralizados desde: lib/services/paymentService.ts

export interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  paymentType: string;
  amount: number;
  currency: string;
  status: string;
  mercadopagoId?: string;
  mercadopagoStatus?: string;
  paymentMethod?: string;
  installments?: number;
  description: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  invoiceUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentData {
  userId: string;
  userEmail: string;
  userName: string;
  paymentType: string;
  description?: string;
  customAmount?: number;
}

export interface PaymentPreference {
  preferenceId: string;
  paymentId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

export interface MercadopagoPaymentInfo {
  id: string;
  status: string;
  external_reference: string;
  payment_method?: {
    type: string;
    id: string;
  };
  installments: number;
  transaction_amount: number;
  currency: string;
}

export interface InvoiceData {
  number: string;
  date: string;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    description: string;
    amount: string;
    quantity: number;
  }>;
  total: string;
  paymentMethod: string;
  mercadopagoId: string;
}

export default Payment;
