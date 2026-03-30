import { useCountUp } from '@/core/hooks/useCountUp';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';
import { cn } from '@/lib/utils';
import FadeIn from './FadeIn';
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

const numberFormatter = new Intl.NumberFormat('es-AR');

function formatValue(value: number | string, unit?: string) {
  if (typeof value === 'number') {
    const formattedValue = numberFormatter.format(value);
    return unit ? `${formattedValue} ${unit}` : formattedValue;
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

  return <span className="text-[13px] font-medium text-[var(--text-tertiary)]">Sin cambios</span>;
}

export default function MetricCard({
  label,
  value,
  delta,
  period,
  unit,
  loading = false,
  onClick,
  className,
}: MetricCardProps) {
  const prefersReducedMotion = useReducedMotionPreference();
  const isEmpty = value === null && !loading;
  const displayPeriod = isEmpty ? 'Todavía no hay datos para mostrar' : period;
  const clickable = typeof onClick === 'function';
  const numericTarget = typeof value === 'number' && !loading ? value : 0;
  const animatedValue = useCountUp({
    target: numericTarget,
    enabled: !prefersReducedMotion && !loading && typeof value === 'number',
  });
  const displayValue = typeof value === 'number' && !loading ? animatedValue : value;

  return (
    <article
      className={cn(
        'min-h-[152px] rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 transition-[border-color,transform] duration-150',
        clickable && 'cursor-pointer hover:border-[var(--border-strong)]',
        className,
      )}
      onClick={onClick}
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
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{label}</p>

      <div className="mt-5 flex items-start justify-between gap-4">
        {loading ? (
          <div className="transition-opacity duration-150 ease-out">
            <Skeleton height="40px" rounded="sm" width="60%" />
          </div>
        ) : (
          <FadeIn>
            <p
              className={cn(
                'font-data text-[40px] font-light leading-none text-[var(--text-primary)]',
                isEmpty && 'text-[var(--text-tertiary)]',
              )}
              style={{ fontFamily: 'var(--font-data)' }}
            >
              {isEmpty || displayValue === null ? '—' : formatValue(displayValue, unit)}
            </p>
          </FadeIn>
        )}

        <div className="pt-2">
          {loading ? (
            <div className="transition-opacity duration-150 ease-out">
              <Skeleton height="12px" rounded="sm" width="72px" />
            </div>
          ) : (
            <FadeIn>{renderDelta(delta)}</FadeIn>
          )}
        </div>
      </div>

      <div className="mt-4 min-h-[20px] text-[12px] leading-5 text-[var(--text-secondary)]">
        {loading ? '\u00A0' : <FadeIn>{displayPeriod}</FadeIn>}
      </div>
    </article>
  );
}
