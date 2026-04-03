import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/core/components';
import { formatCurrency } from '@/lib/mercadopago';
import type { Payment } from '@/types';
import {
  getPaymentPlanName,
  getPaymentStatusLabel,
  getPaymentStatusVariant,
} from '../payments.utils';

interface PaymentsTableDesktopProps {
  onDownloadInvoice: (payment: Payment) => void;
  onSelectPayment: (payment: Payment) => void;
  payments: Payment[];
}

export default function PaymentsTableDesktop({
  onDownloadInvoice,
  onSelectPayment,
  payments,
}: PaymentsTableDesktopProps) {
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full min-w-[760px]">
        <thead>
          <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-[0.08em] text-slate-500">
            <th className="px-6 py-3 font-medium">Movimiento</th>
            <th className="px-6 py-3 font-medium">Fecha</th>
            <th className="px-6 py-3 font-medium">Estado</th>
            <th className="px-6 py-3 font-medium">Monto</th>
            <th className="px-6 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr
              className="cursor-pointer border-b border-white/10 transition-colors hover:bg-[var(--bg-elevated)]/35 last:border-b-0"
              key={payment.id}
              onClick={() => onSelectPayment(payment)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-elevated)] text-signal">
                    <FileText className="h-4 w-4" strokeWidth={1.6} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{getPaymentPlanName(payment)}</p>
                    <p className="mt-1 text-xs text-slate-500">Comprobante {payment.id.slice(0, 8)}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-400">
                {new Date(payment.createdAt).toLocaleDateString('es-AR')}
              </td>
              <td className="px-6 py-4">
                <Badge variant={getPaymentStatusVariant(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge>
              </td>
              <td className="px-6 py-4 font-data text-sm text-slate-50">
                {formatCurrency(payment.amount, payment.currency)}
              </td>
              <td className="px-6 py-4 text-right">
                <Button
                  className="rounded-[12px] border border-white/10 bg-transparent px-3 text-slate-400 hover:border-white/15 hover:bg-[var(--bg-elevated)] hover:text-slate-100"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDownloadInvoice(payment);
                  }}
                  type="button"
                  variant="outline"
                >
                  <Download className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
