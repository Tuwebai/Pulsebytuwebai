import { cn } from '@/lib/utils';

export interface PeriodSelectorProps {
  value: 'this_month' | 'last_month' | 'last_7_days' | 'last_30_days' | 'this_year';
  onChange: (period: string) => void;
  disabled?: boolean;
}

const periods = [
  { value: 'last_7_days', desktop: '7d', mobile: '7d' },
  { value: 'last_30_days', desktop: '30d', mobile: '30d' },
  { value: 'this_month', desktop: 'Este mes', mobile: 'Mes' },
  { value: 'last_month', desktop: 'Mes ant.', mobile: null },
  { value: 'this_year', desktop: 'Este año', mobile: null }
] as const;

export default function PeriodSelector({ value, onChange, disabled = false }: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {periods.map((period) => {
        const isActive = value === period.value;
        return (
          <button
            key={period.value}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs transition-colors',
              isActive
                ? 'border-[var(--signal-border)] bg-[var(--signal-glow)] text-[var(--signal)]'
                : 'border-[var(--border-default)] bg-transparent text-[var(--text-tertiary)]',
              !period.mobile && 'hidden md:inline-flex'
            )}
            disabled={disabled}
            onClick={() => onChange(period.value)}
            type="button"
          >
            <span className="md:hidden">{period.mobile ?? period.desktop}</span>
            <span className="hidden md:inline">{period.desktop}</span>
          </button>
        );
      })}
    </div>
  );
}
