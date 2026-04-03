import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/mercadopago';
import type { Payment } from '@/types';
import {
  getApprovedPaymentsTotal,
  getCompletedPaymentsCount,
  getPendingPaymentsCount,
} from '../payments.utils';

interface PaymentsSummaryRowProps {
  payments: Payment[];
}

export default function PaymentsSummaryRow({ payments }: PaymentsSummaryRowProps) {
  const totalSpent = getApprovedPaymentsTotal(payments);
  const completedPayments = getCompletedPaymentsCount(payments);
  const pendingPayments = getPendingPaymentsCount(payments);

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <SummaryCard
        helper={`${completedPayments} pago${completedPayments === 1 ? '' : 's'} acreditado${completedPayments === 1 ? '' : 's'}`}
        icon={<CreditCard className="h-4 w-4" strokeWidth={1.7} />}
        label="Resumen"
        title="Total invertido"
        tone="signal"
        value={formatCurrency(totalSpent, 'ARS')}
      />
      <SummaryCard
        helper="Historial acreditado"
        icon={<CheckCircle2 className="h-4 w-4" strokeWidth={1.7} />}
        label="Resumen"
        title="Pagos completados"
        tone="success"
        value={completedPayments}
      />
      <SummaryCard
        helper="Pendientes de confirmación"
        icon={<AlertCircle className="h-4 w-4" strokeWidth={1.7} />}
        label="Resumen"
        title="Pagos pendientes"
        tone="warning"
        value={pendingPayments}
      />
    </section>
  );
}

function SummaryCard({
  helper,
  icon,
  label,
  title,
  tone,
  value,
}: {
  helper: string;
  icon: ReactNode;
  label: string;
  title: string;
  tone: 'signal' | 'success' | 'warning';
  value: number | string;
}) {
  const toneClasses = {
    signal: 'bg-signal/15 text-signal',
    success: 'bg-emerald-500/15 text-emerald-300',
    warning: 'bg-amber-500/15 text-amber-300',
  };

  return (
    <article className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <div>
            <p className="text-sm font-medium text-slate-100">{title}</p>
            <p className="mt-1 font-data text-[clamp(2.2rem,3vw,2.8rem)] font-light leading-none tracking-tight text-slate-50">
              {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
            </p>
          </div>
        </div>

        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>{icon}</div>
      </div>

      <p className="mt-2 text-xs text-slate-400">{helper}</p>
    </article>
  );
}
