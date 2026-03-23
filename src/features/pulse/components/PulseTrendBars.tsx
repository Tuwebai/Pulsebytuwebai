import { Skeleton } from '@/core/components';

interface PulseTrendBarsProps {
  data: Array<{
    date: string;
    label: string;
    visits: number;
    contacts: number;
  }>;
  loading?: boolean;
  emptyMessage?: string;
}

export default function PulseTrendBars({
  data,
  loading = false,
  emptyMessage = 'Todavia no hay suficientes datos para mostrar la tendencia.'
}: PulseTrendBarsProps) {
  if (loading) {
    return <Skeleton height="160px" rounded="md" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-[14px] border border-dashed border-[var(--border-default)] px-4 text-center text-sm text-[var(--text-tertiary)]">
        {emptyMessage}
      </div>
    );
  }

  const maxVisits = Math.max(...data.map((item) => item.visits), 1);

  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((item) => {
        const height = Math.max(10, Math.round((item.visits / maxVisits) * 100));

        return (
          <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t-[10px] bg-[var(--signal)]/85 transition-opacity hover:opacity-100"
                style={{ height: `${height}%` }}
                title={`${item.label}: ${item.visits} visitas, ${item.contacts} consultas`}
              />
            </div>
            <span className="truncate text-[10px] text-[var(--text-tertiary)]">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
