import type { ReactNode } from 'react';
import { CheckCircle2, Clock3, MessageSquareMore } from 'lucide-react';

interface SupportSummaryRowProps {
  closedCount: number;
  openCount: number;
  progressCount: number;
}

export default function SupportSummaryRow({
  closedCount,
  openCount,
  progressCount,
}: SupportSummaryRowProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <SummaryCard
        detail="esperando respuesta"
        icon={<Clock3 className="h-4 w-4" strokeWidth={1.7} />}
        iconClassName="bg-[var(--cliente-signal-glow)] text-[var(--cliente-signal)]"
        label="Resumen"
        title="Tickets abiertos"
        value={openCount}
      />
      <SummaryCard
        detail="con intercambio activo"
        icon={<MessageSquareMore className="h-4 w-4" strokeWidth={1.7} />}
        iconClassName="bg-amber-500/15 text-amber-300"
        label="Resumen"
        title="En progreso"
        value={progressCount}
      />
      <SummaryCard
        detail="tickets cerrados"
        icon={<CheckCircle2 className="h-4 w-4" strokeWidth={1.7} />}
        iconClassName="bg-emerald-500/15 text-emerald-300"
        label="Resumen"
        title="Resueltos"
        value={closedCount}
      />
    </div>
  );
}

function SummaryCard({
  detail,
  icon,
  iconClassName,
  label,
  title,
  value,
}: {
  detail: string;
  icon: ReactNode;
  iconClassName: string;
  label: string;
  title: string;
  value: number;
}) {
  return (
    <article className="rounded-[22px] border border-[var(--cliente-border-default)] bg-[var(--cliente-bg-surface)]/92 px-4 py-4 shadow-[var(--cliente-card-shadow)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${iconClassName}`}>{icon}</div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--cliente-text-tertiary)]">
          {label}
        </p>
      </div>

      <p className="mt-4 text-sm font-medium text-[var(--cliente-text-primary)]">{title}</p>
      <p className="mt-1 font-data text-[clamp(2.2rem,3vw,2.8rem)] font-light leading-none tracking-tight text-[var(--cliente-text-primary)]">
        {value.toLocaleString('es-AR')}
      </p>
      <p className="mt-2 text-xs text-[var(--cliente-text-secondary)]">{detail}</p>
    </article>
  );
}
