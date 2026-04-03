import { Download, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/core/components';
import { formatCurrency } from '@/lib/integrations/mercadopago';
import type { Payment } from '@/types';
import {
  getPaymentPlanFeatures,
  getPaymentPlanName,
  getPaymentStatusLabel,
  getPaymentStatusMessage,
  getPaymentStatusVariant,
  isPaymentRetryable,
} from '../payments.utils';

interface PaymentDetailDialogProps {
  onClose: () => void;
  onDownloadInvoice: (payment: Payment) => Promise<void>;
  onRetryPayment: (payment: Payment) => Promise<void>;
  open: boolean;
  payment: Payment | null;
  processingPayment: boolean;
}

export default function PaymentDetailDialog({
  onClose,
  onDownloadInvoice,
  onRetryPayment,
  open,
  payment,
  processingPayment,
}: PaymentDetailDialogProps) {
  if (!payment) {
    return null;
  }

  const features = getPaymentPlanFeatures(payment);
  const retryable = isPaymentRetryable(payment.status);

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="max-w-[920px] rounded-[28px] border border-[var(--border-default)] bg-[linear-gradient(180deg,rgba(11,15,30,0.98)_0%,rgba(20,18,42,0.98)_100%)] p-0 text-[var(--text-primary)] shadow-[0_30px_80px_rgba(0,0,0,0.52)]">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(59,158,245,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(123,76,212,0.2),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_24%)]" />

          <div className="relative space-y-6 px-5 pb-5 pt-6 sm:px-6 lg:px-7 lg:pb-6">
            <DialogHeader className="space-y-3 text-left">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--signal)]">Detalle del pago</p>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-[540px]">
                  <DialogTitle className="text-[28px] font-semibold leading-[1.05] text-[var(--text-primary)]">
                    {getPaymentPlanName(payment)}
                  </DialogTitle>
                  <DialogDescription className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    {getPaymentStatusMessage(payment.status)}
                  </DialogDescription>
                </div>

                <div className="rounded-[20px] border border-[rgba(59,158,245,0.18)] bg-[rgba(7,13,24,0.38)] px-5 py-4 lg:min-w-[240px]">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--signal)]">Monto del movimiento</p>
                  <p className="mt-3 font-data text-[30px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                  <div className="mt-3">
                    <Badge variant={getPaymentStatusVariant(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
              <div className="rounded-[22px] border border-[var(--border-default)] bg-[rgba(255,255,255,0.03)] p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Qué incluye</p>
                <div className="mt-4 space-y-2.5 text-sm leading-6 text-[var(--text-secondary)]">
                  {features.map((feature) => (
                    <p key={feature}>• {feature}</p>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <DetailCard label="Referencia" value={`FAC-${payment.id.slice(-6).toUpperCase()}`} />
                <DetailCard label="Fecha de creación" value={new Date(payment.createdAt).toLocaleDateString('es-AR')} />
                <DetailCard label="Última actualización" value={new Date(payment.updatedAt).toLocaleDateString('es-AR')} />
                <DetailCard label="Método" value={payment.paymentMethod || 'Mercado Pago'} />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:justify-between">
              <Button
                className="rounded-[12px] border border-[var(--border-default)] bg-transparent px-4 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                onClick={() => void onDownloadInvoice(payment)}
                type="button"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Descargar factura PDF
              </Button>

              <div className="flex flex-col gap-3 sm:flex-row">
                {retryable ? (
                  <Button
                    className="rounded-[12px] border border-[rgba(59,158,245,0.26)] bg-[rgba(59,158,245,0.08)] px-4 text-[var(--text-primary)] hover:border-[rgba(59,158,245,0.4)] hover:bg-[rgba(59,158,245,0.14)]"
                    disabled={processingPayment}
                    onClick={() => void onRetryPayment(payment)}
                    type="button"
                    variant="outline"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    {processingPayment ? 'Abriendo checkout...' : 'Volver a intentar'}
                  </Button>
                ) : null}

                <Button
                  className="rounded-[12px] bg-[var(--signal)] px-4 text-white hover:bg-[var(--signal-dim)]"
                  onClick={onClose}
                  type="button"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--border-default)] bg-[rgba(7,13,24,0.38)] px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-2 text-sm font-medium leading-5 text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
