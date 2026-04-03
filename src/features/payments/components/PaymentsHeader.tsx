import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentsHeaderProps {
  onCreatePayment: () => void;
}

export default function PaymentsHeader({ onCreatePayment }: PaymentsHeaderProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Tu inversión
          </p>
          <div>
            <h1 className="text-xl font-medium text-slate-50 sm:text-[22px]">
              Pagos y comprobantes
            </h1>
            <p className="mt-1 max-w-[620px] text-sm text-slate-400">
              Revisá tus pagos, descargá facturas y retomá un checkout pendiente sin salir de Pulse.
            </p>
          </div>
        </div>

        <Button
          className="h-10 rounded-full bg-signal px-5 text-white hover:bg-[var(--signal-dim)]"
          onClick={onCreatePayment}
          type="button"
        >
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.6} />
          Nuevo pago
        </Button>
      </div>
    </section>
  );
}
