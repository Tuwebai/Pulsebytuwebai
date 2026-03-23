import { AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';
import { MetricCard } from '@/core/components';
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

function StatIcon({
  children,
  color
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className="pointer-events-none absolute right-5 top-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-elevated)] ${color}`}>
        {children}
      </div>
    </div>
  );
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
        <StatIcon color="text-[var(--signal)]">
          <CreditCard size={18} strokeWidth={1.5} />
        </StatIcon>
      </div>

      <div className="relative">
        <MetricCard
          className="pr-16"
          label="Pagos completados"
          period="historial acreditado"
          value={completedPayments}
        />
        <StatIcon color="text-[var(--success)]">
          <CheckCircle2 size={18} strokeWidth={1.5} />
        </StatIcon>
      </div>

      <div className="relative">
        <MetricCard
          className="pr-16"
          label="Pagos pendientes"
          period="pendientes de confirmacion"
          value={pendingPayments}
        />
        <StatIcon color="text-[var(--signal)]">
          <AlertCircle size={18} strokeWidth={1.5} />
        </StatIcon>
      </div>
    </div>
  );
}
