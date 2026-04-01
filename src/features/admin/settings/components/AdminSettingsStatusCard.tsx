import { MoonStar, ShieldCheck, Sparkles } from 'lucide-react';

export function AdminSettingsStatusCard() {
  const items = [
    {
      label: 'Tema operativo',
      value: 'Oscuro definitivo',
      detail: 'identidad visual de Pulse',
      icon: MoonStar,
      iconClassName: 'bg-signal/15 text-signal',
    },
    {
      label: 'Cuenta admin',
      value: 'Separada del cliente',
      detail: 'superficie interna aislada',
      icon: ShieldCheck,
      iconClassName: 'bg-emerald-500/15 text-emerald-300',
    },
    {
      label: 'Referencia activa',
      value: 'Pulse by TuWebAI',
      detail: 'copy base del equipo',
      icon: Sparkles,
      iconClassName: 'bg-violet-500/15 text-violet-300',
    },
  ] as const;

  return (
    <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${item.iconClassName}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Resumen
              </p>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-100">{item.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-50">{item.value}</p>
            <p className="mt-2 text-xs text-slate-400">{item.detail}</p>
          </article>
        );
      })}
    </section>
  );
}
