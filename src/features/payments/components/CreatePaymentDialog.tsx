import { ArrowRight, Clock3, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <DialogContent
        className="max-h-[92vh] !w-[96vw] !max-w-[1480px] overflow-y-auto overscroll-contain rounded-[30px] border border-[var(--border-default)] bg-[linear-gradient(180deg,rgba(11,15,30,0.98)_0%,rgba(20,18,42,0.98)_100%)] p-0 text-[var(--text-primary)] shadow-[0_36px_110px_rgba(0,0,0,0.62)] backdrop-blur"
        hideCloseButton
        style={{ WebkitOverflowScrolling: 'touch', maxHeight: '92vh', maxWidth: '1480px', width: 'min(96vw, 1480px)' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(59,158,245,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(123,76,212,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%)]" />

        <div className="relative px-5 pb-8 pt-6 sm:px-6 lg:px-10 lg:pb-10 xl:px-12">
          <Button
            className="absolute right-5 top-5 rounded-full border border-[var(--border-default)] bg-[rgba(34,45,66,0.92)] px-4 text-[var(--text-primary)] hover:border-[rgba(59,158,245,0.32)] hover:bg-[rgba(39,51,74,0.98)]"
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cerrar
          </Button>

          <DialogHeader className="mx-auto max-w-[860px] items-center px-2 pb-5 pt-8 text-center sm:pt-9">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--signal)]">Planes TuWebAI</p>
            <DialogTitle className="mt-3 text-balance text-[30px] font-semibold leading-[1.08] text-[var(--text-primary)] sm:text-[38px]">
              Tres planes. Precios claros.
              <span className="mt-1 block bg-[linear-gradient(90deg,#39b4ff_0%,#7b4cd4_56%,#a855f7_100%)] bg-clip-text text-transparent">
                Sin sorpresas al final del proyecto.
              </span>
            </DialogTitle>
            <DialogDescription className="mt-4 max-w-[520px] text-sm leading-6 text-[var(--text-secondary)]">
              Elegí el punto de partida para tu negocio. La consulta inicial siempre es sin cargo y el pago se abre en un checkout
              seguro de Mercado Pago.
            </DialogDescription>
          </DialogHeader>

          <div className="mx-auto grid w-full max-w-[1360px] gap-5 pt-3 md:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {Object.entries(PAYMENT_TYPES).map(([key, value]) => (
              <button
                className={`group relative flex min-h-0 min-w-0 flex-col overflow-visible rounded-[24px] border p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 sm:p-6 ${
                  value.badge
                    ? 'border-[rgba(59,158,245,0.55)] bg-[linear-gradient(180deg,rgba(19,25,44,0.98)_0%,rgba(25,22,50,0.98)_100%)] shadow-[0_0_0_1px_rgba(59,158,245,0.12),0_0_28px_rgba(59,158,245,0.18)]'
                    : 'border-[rgba(123,135,173,0.22)] bg-[linear-gradient(180deg,rgba(19,24,40,0.96)_0%,rgba(23,20,44,0.96)_100%)] hover:border-[rgba(59,158,245,0.28)]'
                }`}
                disabled={processingPayment}
                key={key}
                onClick={() => void onCreatePayment(key)}
                type="button"
              >
                {value.badge ? (
                  <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[60%] rounded-full border border-[rgba(59,158,245,0.42)] bg-[rgba(15,23,42,0.98)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--signal)] shadow-[0_10px_24px_rgba(8,12,24,0.36)]">
                    {value.badge}
                  </span>
                ) : null}

                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[rgba(59,158,245,0.18)] bg-[rgba(8,14,24,0.48)]">
                  <CreditCard className="h-4 w-4 text-[var(--signal)]" strokeWidth={1.7} />
                </div>

                <div className="mt-4">
                  <p className="text-[17px] font-semibold leading-tight text-[var(--text-primary)]">{value.name}</p>
                  <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{value.description}</p>
                </div>

                <div className="mt-4 rounded-[18px] border border-[rgba(59,158,245,0.14)] bg-[rgba(7,13,24,0.34)] px-4 py-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--signal)]">Inversión estimada</p>
                  <p className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-[28px]">
                    {value.pricePrefix ? `${value.pricePrefix} ` : ''}
                    {formatCurrency(value.price, value.currency)}
                  </p>
                </div>

                <div className="mt-3 rounded-[14px] border border-[var(--border-default)] bg-[rgba(7,13,24,0.52)] px-4 py-3">
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--signal)]">
                    <Clock3 className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Entrega estimada
                  </div>
                  <p className="mt-2 text-sm font-medium leading-5 text-[var(--text-primary)]">{value.timeline}</p>
                </div>

                <div className="mt-3 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Qué incluye</p>
                  <div className="mt-2.5 space-y-1.5 text-sm leading-5 text-[var(--text-secondary)]">
                    {value.features.slice(0, 4).map((feature) => (
                      <p key={feature}>• {feature}</p>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <div
                    className={`flex items-center justify-between rounded-[16px] border px-4 py-3 transition-all ${
                      value.badge
                        ? 'border-[rgba(59,158,245,0.34)] bg-[linear-gradient(90deg,rgba(40,111,194,0.24)_0%,rgba(123,76,212,0.22)_100%)] shadow-[0_10px_26px_rgba(59,158,245,0.12)]'
                        : 'border-[var(--border-default)] bg-[rgba(10,15,28,0.52)] group-hover:border-[rgba(59,158,245,0.32)]'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{value.cta}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Pago con Mercado Pago</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--signal)]" strokeWidth={1.8} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
