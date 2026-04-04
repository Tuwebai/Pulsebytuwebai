import type { GoogleSearchConsolePeriod } from '@/data/types/google';

interface GoogleFiltersBarProps {
  period: GoogleSearchConsolePeriod;
  onPeriodChange: (period: GoogleSearchConsolePeriod) => void;
}

const periodOptions: Array<{ label: string; value: GoogleSearchConsolePeriod }> = [
  { label: '24 horas', value: 'last_24_hours' },
  { label: '7 días', value: 'last_7_days' },
  { label: '28 días', value: 'last_28_days' },
  { label: '3 meses', value: 'last_3_months' },
];

export default function GoogleFiltersBar({ period, onPeriodChange }: GoogleFiltersBarProps) {
  const canReset = period !== 'last_28_days';

  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {periodOptions.map((option) => {
            const isActive = option.value === period;

            return (
              <button
                key={option.value}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  isActive
                    ? 'border-[var(--signal-border)] bg-[color:var(--signal-glow)] text-[var(--signal)]'
                    : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                }`}
                onClick={() => onPeriodChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/70 px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)]">
            Tipo de búsqueda: Web
          </div>
          <div className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/70 px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)]">
            Agrupar: Día
          </div>
          {canReset ? (
            <button
              className="px-2 py-1 text-[12px] font-medium text-[var(--signal)] transition-colors hover:text-[var(--text-primary)]"
              onClick={() => onPeriodChange('last_28_days')}
              type="button"
            >
              Restablecer filtros
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
