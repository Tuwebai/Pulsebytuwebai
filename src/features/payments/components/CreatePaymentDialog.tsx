import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PAYMENT_TYPES } from '@/lib/mercadopago';

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
      <DialogContent className="max-w-2xl rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-[var(--text-primary)]">Crear nuevo pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(PAYMENT_TYPES).map(([key, value]) => (
              <button
                className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-5 text-left transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={processingPayment}
                key={key}
                onClick={() => void onCreatePayment(key)}
                type="button"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--bg-surface)]">
                    <CreditCard className="h-4 w-4 text-[var(--signal)]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{value.name}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{value.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
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
