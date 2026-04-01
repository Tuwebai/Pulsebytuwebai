import { BellRing, RefreshCw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AdminNotificationsHeaderProps {
  openTotal: number;
  criticalTotal: number;
  inProgressTotal: number;
  onSync: () => void;
  isSyncing: boolean;
}

export function AdminNotificationsHeader({
  openTotal,
  criticalTotal,
  inProgressTotal,
  onSync,
  isSyncing,
}: AdminNotificationsHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(59,158,245,0.12),rgba(123,76,212,0.08)_48%,rgba(17,24,39,0.96)_100%)] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.35)] sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-sky-400 via-violet-400/70 to-transparent" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-signal/15 text-signal">
              <BellRing className="h-5 w-5" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
                Pulse admin · notificaciones
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
                Bandeja operativa
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Revisá eventos críticos, pagos y soporte con una vista clara de prioridad y próxima acción.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/10 bg-white/[0.05] text-slate-100">
              {openTotal} activos
            </Badge>
            <Badge variant="outline" className="border-red-400/20 bg-red-500/10 text-red-100">
              {criticalTotal} críticos
            </Badge>
            <Badge variant="outline" className="border-amber-400/20 bg-amber-500/10 text-amber-100">
              {inProgressTotal} en curso
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onSync}
            disabled={isSyncing}
            className="w-full border-white/10 bg-slate-950/55 text-slate-100 hover:border-sky-400/25 hover:bg-slate-900 disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Actualizando eventos' : 'Actualizar eventos'}
          </Button>
        </div>
      </div>
    </section>
  );
}
