import { Activity, ExternalLink, Radio, Sparkles, Zap } from 'lucide-react';
import { Skeleton } from '@/core/components';
import type { PulseRealtimeSnapshot } from '@/data/types/pulse';

interface PulseRealtimeCardProps {
  data: PulseRealtimeSnapshot | undefined;
  domain: string | null;
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
    <div className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-signal/15 text-signal">
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Vivo</p>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-100">{label}</p>
      <p className="mt-1 font-data text-[clamp(2.2rem,3vw,2.8rem)] font-light leading-none tracking-tight text-slate-50">
        {value}
      </p>
    </div>
  );
}

function buildPageUrl(domain: string, path: string) {
  return `https://${domain}${path === '/' ? '' : path}`;
}

export default function PulseRealtimeCard({ data, domain, error, loading }: PulseRealtimeCardProps) {
  const hasRelevantEvents = Boolean(data && data.topEvents.length > 0);
  const hasRelevantPages = Boolean(data && data.topPages.length > 0);

  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-signal/15 text-signal">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Actividad en vivo</p>
            <h2 className="mt-2 text-sm font-medium text-slate-100">Qué está pasando ahora en tu web</h2>
          </div>
        </div>

        <p className="text-[13px] text-slate-400">
          {data
            ? `Muestra tomada ${new Date(data.sampledAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
            : 'Últimos 30 minutos'}
        </p>
      </div>

      {loading ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-[var(--cliente-grid-gap-mobile)] md:grid-cols-3 md:gap-[var(--cliente-grid-gap)]">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`rt-stat-${index}`} height="132px" rounded="lg" width="100%" />
            ))}
          </div>
          <Skeleton height="220px" rounded="lg" width="100%" />
        </div>
      ) : error ? (
        <div className="mt-4 rounded-[20px] border border-white/10 bg-[var(--bg-elevated)]/60 px-4 py-4 text-sm text-slate-300">
          {error}
        </div>
      ) : data ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-[var(--cliente-grid-gap-mobile)] md:grid-cols-3 md:gap-[var(--cliente-grid-gap)]">
            <RealtimeStat icon={Radio} label="Usuarios activos" value={data.activeUsers} />
            <RealtimeStat icon={Activity} label="Páginas vistas" value={data.pageViews} />
            <RealtimeStat icon={Zap} label="Clics en contacto" value={data.ctaClicks} />
          </div>

          <div className="grid gap-[var(--cliente-grid-gap-mobile)] md:gap-[var(--cliente-grid-gap)] lg:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Páginas en vivo</p>
              <h3 className="mt-2 text-sm font-medium text-slate-100">Páginas con más movimiento</h3>

              {hasRelevantPages ? (
                <div className="mt-4 space-y-3">
                  {data.topPages.map((page) => (
                    <div key={page.label} className="flex items-center gap-3 text-sm">
                      <span className="min-w-0 flex-1 truncate text-slate-300">{page.label}</span>
                      {domain && page.path ? (
                        <a
                          className="inline-flex items-center gap-1 text-[12px] text-signal transition-opacity hover:opacity-80"
                          href={buildPageUrl(domain, page.path)}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Abrir <ExternalLink size={12} strokeWidth={1.5} />
                        </a>
                      ) : null}
                      <span className="font-data text-slate-50">{page.activeUsers}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">
                  Todavía no vemos páginas con movimiento claro en esta muestra en vivo.
                </p>
              )}
            </div>

            <div className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Señales relevantes</p>
              <h3 className="mt-2 text-sm font-medium text-slate-100">Movimientos relevantes</h3>

              {hasRelevantEvents ? (
                <div className="mt-4 space-y-3">
                  {data.topEvents.map((event) => (
                    <div key={event.name} className="flex items-center gap-3 text-sm">
                      <span className="min-w-0 flex-1 truncate text-slate-300">{event.name}</span>
                      <span className="font-data text-slate-50">{event.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">
                  Todavía no vemos movimientos relevantes en esta muestra en vivo.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
