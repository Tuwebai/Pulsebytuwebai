import { Activity, Radio, Zap } from 'lucide-react';
import { Skeleton } from '@/core/components';
import type { PulseRealtimeSnapshot } from '@/data/types/pulse';

interface PulseRealtimeCardProps {
  data: PulseRealtimeSnapshot | undefined;
  error: string | null;
  loading: boolean;
}

function RealtimeStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 p-4">
      <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
        <Icon size={14} strokeWidth={1.5} />
        <span>{label}</span>
      </div>
      <p className="mt-3 font-data text-3xl font-light text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

export default function PulseRealtimeCard({ data, error, loading }: PulseRealtimeCardProps) {
  return (
    <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--signal)]">Actividad en vivo</p>
          <h2 className="mt-1 text-lg font-medium text-[var(--text-primary)]">Qué está pasando ahora en tu web</h2>
        </div>
        <p className="text-[13px] text-[var(--text-secondary)]">
          {data ? `Muestra tomada ${new Date(data.sampledAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : 'Últimos 30 minutos'}
        </p>
      </div>

      {loading ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`rt-stat-${index}`} height="104px" rounded="lg" width="100%" />
            ))}
          </div>
          <Skeleton height="180px" rounded="lg" width="100%" />
        </div>
      ) : error ? (
        <div className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 p-4 text-sm text-[var(--text-secondary)]">
          {error}
        </div>
      ) : data ? (
        <div className="mt-5 space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <RealtimeStat icon={Radio} label="Usuarios activos" value={data.activeUsers} />
            <RealtimeStat icon={Activity} label="Eventos" value={data.eventCount} />
            <RealtimeStat icon={Zap} label="Eventos clave" value={data.keyEvents} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 p-4">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">Páginas con más movimiento</h3>
              <div className="mt-4 space-y-3">
                {data.topPages.map((page) => (
                  <div key={page.label} className="flex items-center gap-3 text-sm">
                    <span className="min-w-0 flex-1 truncate text-[var(--text-secondary)]">{page.label}</span>
                    <span className="font-data text-[var(--text-primary)]">{page.activeUsers} activos</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 p-4">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">Eventos más frecuentes</h3>
              <div className="mt-4 space-y-3">
                {data.topEvents.map((event) => (
                  <div key={event.name} className="flex items-center gap-3 text-sm">
                    <span className="min-w-0 flex-1 truncate text-[var(--text-secondary)]">{event.name}</span>
                    <span className="font-data text-[var(--text-primary)]">{event.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
