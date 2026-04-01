import { Inbox } from 'lucide-react';

export function AdminInboxEventDetailEmpty() {
  return (
    <section className="sticky top-0 rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-6 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
      <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 text-center">
        <Inbox className="h-10 w-10 text-slate-500" />
        <div>
          <p className="text-sm font-medium text-slate-100">
            Seleccioná un evento para ver el detalle
          </p>
          <p className="mt-1 text-sm text-slate-400">
            La bandeja operativa muestra contexto, owner y próximas acciones.
          </p>
        </div>
      </div>
    </section>
  );
}
