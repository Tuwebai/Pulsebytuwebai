import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/core/components';
import { formatCurrency } from '@/lib/mercadopago';
import type { Payment } from '@/types';
import { getPaymentStatusLabel, getPaymentStatusVariant } from '../payments.utils';

interface PaymentDetailDialogProps {
  onClose: () => void;
  onDownloadInvoice: (payment: Payment) => void;
  open: boolean;
  payment: Payment | null;
}

export default function PaymentDetailDialog({
  onClose,
  onDownloadInvoice,
  open,
  payment,
}: PaymentDetailDialogProps) {
  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="max-w-2xl rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
        {payment ? (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-medium text-[var(--text-primary)]">Detalle del pago</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="ID" value={payment.id} />
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">Estado</p>
                <div className="mt-2">
                  <Badge variant={getPaymentStatusVariant(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge>
                </div>
              </div>
              <DetailItem label="Monto" monospace value={formatCurrency(payment.amount, payment.currency)} />
              <DetailItem label="Fecha" value={new Date(payment.createdAt).toLocaleDateString('es-AR')} />
              <div className="md:col-span-2">
                <DetailItem label="Descripción" value={payment.description} />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <Button
                className="rounded-[10px] border border-[var(--border-default)] bg-transparent px-4 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                onClick={onClose}
                type="button"
                variant="outline"
              >
                Cerrar
              </Button>
              <Button
                className="rounded-[10px] bg-[var(--signal)] px-4 text-white hover:bg-[var(--signal-dim)]"
                onClick={() => onDownloadInvoice(payment)}
                type="button"
              >
                <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Descargar factura
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({
  label,
  monospace = false,
  value,
}: {
  label: string;
  monospace?: boolean;
  value: string;
}) {
  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{label}</p>
      <p className={`mt-2 text-sm text-[var(--text-primary)] ${monospace ? 'font-data' : ''}`}>{value}</p>
    </div>
  );
}
