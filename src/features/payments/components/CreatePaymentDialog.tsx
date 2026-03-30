import { ArrowRight, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PAYMENT_TYPES, formatCurrency } from '@/lib/mercadopago';

interface CreatePaymentDialogProps {
  onClose: () => void;
  onCreatePayment: (paymentType: string) => Promise<void>;
  open: boolean;
  processingPayment: boolean;
}

export default function CreatePaymentDialog({
  onClose,
  onCreatePayment,
  open,
  processingPayment,
}: CreatePaymentDialogProps) {
  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="max-w-5xl rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-0 text-[var(--text-primary)]">
        <DialogHeader className="border-b border-[var(--border-subtle)] px-6 py-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--signal)]">Planes TuWebAI</p>
          <DialogTitle className="mt-2 text-[28px] font-semibold leading-tight text-[var(--text-primary)]">
            Elegí qué querés pagar hoy
          </DialogTitle>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            Te llevamos a un checkout seguro de Mercado Pago. Si necesitás otra etapa o un alcance distinto, lo revisamos con vos desde Soporte.
          </p>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-6">
          <div className="grid gap-4 xl:grid-cols-3">
            {Object.entries(PAYMENT_TYPES).map(([key, value]) => (
              <button
                className={`rounded-[22px] border p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                  value.badge
                    ? 'border-[var(--signal)] bg-[linear-gradient(180deg,rgba(16,24,40,0.98)_0%,rgba(20,27,45,0.96)_100%)] shadow-[0_0_0_1px_rgba(60,188,252,0.08)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]'
                }`}
                disabled={processingPayment}
                key={key}
                onClick={() => void onCreatePayment(key)}
                type="button"
              >
                <div className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[rgba(8,14,24,0.72)]">
                      <CreditCard className="h-4 w-4 text-[var(--signal)]" strokeWidth={1.6} />
                    </div>
                    {value.badge ? (
                      <span className="rounded-full border border-[rgba(60,188,252,0.35)] bg-[rgba(60,188,252,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--signal)]">
                        {value.badge}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-[22px] font-semibold leading-tight text-[var(--text-primary)]">{value.name}</p>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{value.description}</p>
                  </div>

                  <div>
                    <p className="text-[30px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                      {value.pricePrefix ? `${value.pricePrefix} ` : ''}
                      {formatCurrency(value.price, value.currency)}
                    </p>
                    <div className="mt-4 rounded-[14px] border border-[var(--border-default)] bg-[rgba(8,14,24,0.55)] px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--signal)]">Entrega estimada</p>
                      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{value.timeline}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {value.features.slice(0, 5).map((feature) => (
                      <p key={feature}>• {feature}</p>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between rounded-[14px] border border-[var(--border-default)] bg-[rgba(8,14,24,0.45)] px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{value.cta}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                        Pago con Mercado Pago
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--signal)]" strokeWidth={1.6} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Cada pago queda registrado en tu historial para que puedas revisar estado, factura y seguimiento desde Pulse.
            </p>
            <Button
              className="rounded-[10px] border border-[var(--border-default)] bg-transparent px-4 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
