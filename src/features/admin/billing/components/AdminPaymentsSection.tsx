import { CreditCard } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminPaymentRecord } from '@/api/admin/adminDashboard.api';
import { Badge, MetricCard, PulseFeedbackState } from '@/core/components';
import { getAdminPaymentDisplayName } from '../adminPayments.helpers';
import {
  formatAdminPaymentAmount,
  getAdminPaymentStatusLabel,
  getAdminPaymentStatusVariant,
  getApprovedAdminPaymentsTotal,
  getPendingAdminPaymentsCount,
  normalizeAdminPaymentStatus,
} from '../adminPayments.utils';

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
    <section className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[var(--bg-elevated)]">
          <CreditCard className="h-5 w-5 text-[var(--signal)]" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Pagos del sistema</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Revisa el estado real de los cobros y actualiza el seguimiento cuando haga falta.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard label="Pagos registrados" period="base total" value={payments.length} />
        <MetricCard label="Monto acreditado" period="solo pagos aprobados" value={formatAdminPaymentAmount(approvedTotal)} />
        <MetricCard label="Pendientes" period="requieren seguimiento" value={pendingPayments} />
      </div>

      <div className="overflow-hidden rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(120px,0.8fr)_minmax(120px,0.9fr)] gap-4 border-b border-[var(--border-subtle)] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          <span>Movimiento</span>
          <span>Estado</span>
          <span>Actualizar</span>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {payments.map((payment) => (
            <div
              className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-[minmax(0,1.6fr)_minmax(120px,0.8fr)_minmax(120px,0.9fr)]"
              key={payment.id}
            >
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{getAdminPaymentDisplayName(payment)}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {formatAdminPaymentAmount(payment.amount)} · {new Date(payment.created_at).toLocaleDateString('es-AR')}
                </p>
              </div>

              <div className="flex items-center">
                <Badge variant={getAdminPaymentStatusVariant(payment.status)}>{getAdminPaymentStatusLabel(payment.status)}</Badge>
              </div>

              <Select
                value={normalizeAdminPaymentStatus(payment.status)}
                onValueChange={(value) => void onUpdatePaymentStatus(payment.id, value)}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Acreditado</SelectItem>
                  <SelectItem value="in_process">En revisión</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
