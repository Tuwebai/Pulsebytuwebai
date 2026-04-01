import { Gauge, ShieldCheck, Sparkles } from 'lucide-react';

interface AdminSettingsMetricsProps {
  guardrails: number;
  liveSignals: number;
  productLabel: string;
}

const items = [
  { icon: Gauge, key: 'liveSignals', label: 'Panel en vivo', suffix: 'señales activas', tone: 'text-[var(--signal)] bg-[var(--signal-glow)]' },
  { icon: ShieldCheck, key: 'guardrails', label: 'Guardrails', suffix: 'criterios activos', tone: 'text-emerald-300 bg-emerald-500/15' },
  { icon: Sparkles, key: 'productLabel', label: 'Referencia visible', suffix: 'marca operativa', tone: 'text-violet-300 bg-violet-500/15' },
] as const;

export function AdminSettingsMetrics({
  guardrails,
  liveSignals,
  productLabel,
}: AdminSettingsMetricsProps) {
  const values = { guardrails, liveSignals, productLabel };

  return (
    <section className="grid gap-3 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        const value = values[item.key];

        return (
          <article key={item.label} className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${item.tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Panel</p>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-100">{item.label}</p>
            <p className="mt-1 truncate text-lg font-semibold text-slate-50">{value}</p>
            <p className="mt-2 text-xs text-slate-400">{item.suffix}</p>
          </article>
        );
      })}
    </section>
  );
}
