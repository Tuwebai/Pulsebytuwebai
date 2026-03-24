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
  backgroundColor,
  borderColor,
  children,
  color,
  glowColor
}: {
  backgroundColor: string;
  borderColor: string;
  children: React.ReactNode;
  color: string;
  glowColor: string;
}) {
  return (
    <div className="pointer-events-none absolute right-5 top-5">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full border"
        style={{
          backgroundColor,
          borderColor,
          boxShadow: `0 0 0 1px ${borderColor} inset, 0 10px 24px rgba(0, 0, 0, 0.22), 0 0 18px ${glowColor}`
        }}
      >
        <div style={{ color }}>{children}</div>
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
        <StatIcon
          backgroundColor="rgba(59, 158, 245, 0.16)"
          borderColor="rgba(59, 158, 245, 0.28)"
          color="#3B9EF5"
          glowColor="rgba(59, 158, 245, 0.14)"
        >
          <CreditCard color="#3B9EF5" size={18} strokeWidth={1.75} />
        </StatIcon>
      </div>

      <div className="relative">
        <MetricCard
          className="pr-16"
          label="Pagos completados"
          period="historial acreditado"
          value={completedPayments}
        />
        <StatIcon
          backgroundColor="rgba(34, 197, 94, 0.16)"
          borderColor="rgba(34, 197, 94, 0.28)"
          color="#22C55E"
          glowColor="rgba(34, 197, 94, 0.14)"
        >
          <CheckCircle2 color="#22C55E" size={18} strokeWidth={1.75} />
        </StatIcon>
      </div>

      <div className="relative">
        <MetricCard
          className="pr-16"
          label="Pagos pendientes"
          period="pendientes de confirmacion"
          value={pendingPayments}
        />
        <StatIcon
          backgroundColor="rgba(245, 158, 11, 0.16)"
          borderColor="rgba(245, 158, 11, 0.28)"
          color="#F59E0B"
          glowColor="rgba(245, 158, 11, 0.14)"
        >
          <AlertCircle color="#F59E0B" size={18} strokeWidth={1.75} />
        </StatIcon>
      </div>
    </div>
  );
}
