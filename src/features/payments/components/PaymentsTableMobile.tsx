import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/core/components';
import { formatCurrency } from '@/lib/integrations/mercadopago';
import type { Payment } from '@/types';
import {
  getPaymentPlanName,
  getPaymentStatusLabel,
  getPaymentStatusVariant,
} from '../payments.utils';

interface PaymentsTableMobileProps {
  onDownloadInvoice: (payment: Payment) => void;
  onSelectPayment: (payment: Payment) => void;
  payments: Payment[];
}

export default function PaymentsTableMobile({
  onDownloadInvoice,
  onSelectPayment,
  payments,
}: PaymentsTableMobileProps) {
  return (
    <div className="space-y-3 lg:hidden">
      {payments.map((payment) => (
        <button
          className="w-full rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 text-left shadow-[0_14px_30px_rgba(2,6,23,0.22)] transition-colors hover:border-white/15"
          key={payment.id}
          onClick={() => onSelectPayment(payment)}
          type="button"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-elevated)] text-signal">
                <FileText className="h-4 w-4" strokeWidth={1.6} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-100">{getPaymentPlanName(payment)}</p>
                <p className="mt-1 text-xs text-slate-500">Comprobante {payment.id.slice(0, 8)}</p>
              </div>
            </div>
            <Badge variant={getPaymentStatusVariant(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge>
          </div>

          <div className="mt-4 grid gap-3 rounded-[18px] border border-white/10 bg-[var(--bg-elevated)]/55 p-3 sm:grid-cols-2">
            <DetailItem label="Fecha" value={new Date(payment.createdAt).toLocaleDateString('es-AR')} />
            <DetailItem label="Monto" value={formatCurrency(payment.amount, payment.currency)} />
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              className="rounded-[12px] border border-white/10 bg-transparent px-3 text-slate-400 hover:border-white/15 hover:bg-[var(--bg-elevated)] hover:text-slate-100"
              onClick={(event) => {
                event.stopPropagation();
                onDownloadInvoice(payment);
              }}
              type="button"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Factura PDF
            </Button>
          </div>
        </button>
      ))}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}
