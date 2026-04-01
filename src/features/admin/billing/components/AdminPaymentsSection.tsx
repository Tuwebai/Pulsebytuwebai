import type { AdminPaymentRecord } from '@/api/admin/adminDashboard.api';
import { PulseFeedbackState } from '@/core/components';
import { AdminPaymentRow } from '@/features/admin/billing/components/AdminPaymentRow';
import { AdminPaymentsStats } from '@/features/admin/billing/components/AdminPaymentsStats';
import {
  formatAdminPaymentAmount,
  getApprovedAdminPaymentsTotal,
  getPendingAdminPaymentsCount,
} from '@/features/admin/billing/adminPayments.utils';

interface AdminPaymentsSectionProps {
  payments: AdminPaymentRecord[];
  onUpdatePaymentStatus: (paymentId: string, newStatus: string) => Promise<void>;
}

export function AdminPaymentsSection({
  payments,
  onUpdatePaymentStatus,
}: AdminPaymentsSectionProps) {
  const pendingPayments = getPendingAdminPaymentsCount(payments);
  const approvedTotal = getApprovedAdminPaymentsTotal(payments);
  const approvedTotalLabel = formatAdminPaymentAmount(approvedTotal);

  if (payments.length === 0) {
    return (
      <PulseFeedbackState
        description="Los movimientos de pago van a aparecer acá cuando exista actividad real para revisar."
        title="Todavía no hay pagos para revisar"
        variant="empty"
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <AdminPaymentsStats
        totalPayments={payments.length}
        approvedTotalLabel={approvedTotalLabel}
        pendingPayments={pendingPayments}
      />

      <section className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Bandeja activa
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
          Cobros visibles ({payments.length})
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Actualizá el estado de cada cobro sin salir del flujo operativo.
        </p>

        <div className="mt-4 space-y-3">
          {payments.map((payment) => (
            <AdminPaymentRow
              key={payment.id}
              payment={payment}
              onUpdatePaymentStatus={onUpdatePaymentStatus}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
