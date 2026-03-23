import { cn } from '@/lib/utils';
import Skeleton from './Skeleton';

export interface MetricCardProps {
  label: string;
  value: number | string | null;
  delta?: number;
  period?: string;
  unit?: string;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

function formatValue(value: number | string, unit?: string) {
  if (typeof value === 'number') {
    return unit ? `${value} ${unit}` : value.toLocaleString('es-AR');
  }

  return value;
}

function renderDelta(delta?: number) {
  if (delta === undefined) {
    return null;
  }

  if (delta > 0) {
    return <span className="text-[13px] font-medium text-[var(--success)]">▲ {delta}%</span>;
  }

  if (delta < 0) {
    return <span className="text-[13px] font-medium text-[var(--danger)]">▼ {Math.abs(delta)}%</span>;
  }

  return <span className="text-[13px] font-medium text-[var(--text-tertiary)]">— sin cambios</span>;
}

export default function MetricCard({
  label,
  value,
  delta,
  period,
  unit,
  loading = false,
  onClick,
  className
}: MetricCardProps) {
  const isEmpty = value === null && !loading;
  const displayPeriod = isEmpty ? 'sin datos disponibles' : period;
  const clickable = typeof onClick === 'function';

  return (
    <article
      className={cn(
        'rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 transition-[border-color,transform] duration-150',
        clickable && 'cursor-pointer hover:border-[var(--border-strong)]',
        className
      )}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
        {label}
      </p>

      <div className="mt-5 flex items-start justify-between gap-4">
        {loading ? (
          <Skeleton height="40px" width="60%" rounded="sm" />
        ) : (
          <p
            className={cn(
              'font-data text-[40px] font-light leading-none text-[var(--text-primary)]',
              isEmpty && 'text-[var(--text-tertiary)]'
            )}
            style={{ fontFamily: 'var(--font-data)' }}
          >
            {isEmpty ? '—' : formatValue(value, unit)}
          </p>
        )}

        <div className="pt-2">
          {loading ? <Skeleton height="12px" width="72px" rounded="sm" /> : renderDelta(delta)}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[var(--text-tertiary)]">{loading ? '\u00A0' : displayPeriod}</p>
    </article>
  );
}
