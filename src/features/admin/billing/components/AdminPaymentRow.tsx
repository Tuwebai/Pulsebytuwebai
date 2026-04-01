import { CalendarDays, Mail, Wallet } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/core/components';
import type { AdminPaymentRecord } from '@/api/admin/adminDashboard.api';
import {
  getAdminPaymentCustomerEmail,
  getAdminPaymentCustomerLabel,
  getAdminPaymentDisplayName,
} from '@/features/admin/billing/adminPayments.helpers';
import {
  formatAdminPaymentAmount,
  getAdminPaymentStatusLabel,
  getAdminPaymentStatusVariant,
  normalizeAdminPaymentStatus,
} from '@/features/admin/billing/adminPayments.utils';

interface AdminPaymentRowProps {
  payment: AdminPaymentRecord;
  onUpdatePaymentStatus: (paymentId: string, newStatus: string) => Promise<void>;
}

export function AdminPaymentRow({ payment, onUpdatePaymentStatus }: AdminPaymentRowProps) {
  const customerEmail = getAdminPaymentCustomerEmail(payment);

  return (
    <article className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(8,15,30,0.88))] px-4 py-4 shadow-[0_12px_26px_rgba(2,6,23,0.18)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-slate-50">
              {getAdminPaymentDisplayName(payment)}
            </p>
            <Badge variant={getAdminPaymentStatusVariant(payment.status)}>
              {getAdminPaymentStatusLabel(payment.status)}
            </Badge>
          </div>

          <div className="flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="inline-flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5 text-slate-500" />
              {formatAdminPaymentAmount(payment.amount)}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
              {new Date(payment.created_at).toLocaleDateString('es-AR')}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-slate-200">{getAdminPaymentCustomerLabel(payment)}</p>
            {customerEmail ? (
              <p className="inline-flex items-center gap-2 text-xs text-slate-400">
                <Mail className="h-3.5 w-3.5" />
                {customerEmail}
              </p>
            ) : null}
          </div>
        </div>

        <div className="w-full max-w-full rounded-2xl border border-white/10 bg-white/[0.03] p-3 lg:w-[220px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Actualizar estado
          </p>
          <Select
            value={normalizeAdminPaymentStatus(payment.status)}
            onValueChange={(value) => void onUpdatePaymentStatus(payment.id, value)}
          >
            <SelectTrigger className="mt-3 h-10 w-full border-white/10 bg-[var(--bg-base)] text-sm text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[var(--bg-elevated)] text-slate-100">
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="approved">Acreditado</SelectItem>
              <SelectItem value="in_process">En revisión</SelectItem>
              <SelectItem value="rejected">Rechazado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </article>
  );
}
