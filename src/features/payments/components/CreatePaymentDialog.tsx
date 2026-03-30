import { CreditCard } from 'lucide-react';
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
      <DialogContent className="max-w-4xl rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-0 text-[var(--text-primary)]">
        <DialogHeader className="border-b border-[var(--border-subtle)] px-6 py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--signal)]">Checkout seguro</p>
          <DialogTitle className="mt-2 text-[24px] font-semibold text-[var(--text-primary)]">Crear nuevo pago</DialogTitle>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Elegí qué querés abonar ahora. Te vamos a llevar a un checkout seguro de Mercado Pago para completar el pago.
          </p>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {Object.entries(PAYMENT_TYPES).map(([key, value]) => (
              <button
                className="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5 text-left transition-all hover:border-[var(--signal)] hover:bg-[var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={processingPayment}
                key={key}
                onClick={() => void onCreatePayment(key)}
                type="button"
              >
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--bg-surface)]">
                      <CreditCard className="h-4 w-4 text-[var(--signal)]" strokeWidth={1.5} />
                    </div>
                    <p className="font-data text-sm text-[var(--text-primary)]">{formatCurrency(value.price, value.currency)}</p>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-[var(--text-primary)]">{value.name}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{value.description}</p>
                  </div>

                  <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                    {value.features.slice(0, 3).map((feature) => (
                      <p key={feature}>• {feature}</p>
                    ))}
                  </div>

                  <div className="pt-2">
                    <p className="text-sm font-medium text-[var(--signal)]">Abrir checkout seguro</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Si necesitás ayuda con un pago puntual, podés escribirnos desde Soporte y lo revisamos con vos.
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
