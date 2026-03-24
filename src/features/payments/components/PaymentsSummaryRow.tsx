import { AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';
import { AccentIcon, MetricCard } from '@/core/components';
import { formatCurrency } from '@/lib/mercadopago';
import type { Payment } from '@/types';
import {
  getApprovedPaymentsTotal,
  getCompletedPaymentsCount,
  getPendingPaymentsCount
} from '../payments.utils';

interface PaymentsSummaryRowProps {
  payments: Payment[];
}

export default function PaymentsSummaryRow({ payments }: PaymentsSummaryRowProps) {
  const totalSpent = getApprovedPaymentsTotal(payments);
  const completedPayments = getCompletedPaymentsCount(payments);
  const pendingPayments = getPendingPaymentsCount(payments);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="relative">
        <MetricCard
          className="pr-16"
          label="Total gastado"
          period={`${completedPayments} pago${completedPayments === 1 ? '' : 's'} acreditado${completedPayments === 1 ? '' : 's'}`}
          value={formatCurrency(totalSpent, 'ARS')}
        />
        <div className="pointer-events-none absolute right-5 top-5">
          <AccentIcon tone="signal">
            <CreditCard size={18} strokeWidth={1.75} />
          </AccentIcon>
        </div>
      </div>

      <div className="relative">
        <MetricCard
          className="pr-16"
          label="Pagos completados"
          period="historial acreditado"
          value={completedPayments}
        />
        <div className="pointer-events-none absolute right-5 top-5">
          <AccentIcon tone="success">
            <CheckCircle2 size={18} strokeWidth={1.75} />
          </AccentIcon>
        </div>
      </div>

      <div className="relative">
        <MetricCard
          className="pr-16"
          label="Pagos pendientes"
          period="pendientes de confirmacion"
          value={pendingPayments}
        />
        <div className="pointer-events-none absolute right-5 top-5">
          <AccentIcon tone="warning">
            <AlertCircle size={18} strokeWidth={1.75} />
          </AccentIcon>
        </div>
      </div>
    </div>
  );
}
