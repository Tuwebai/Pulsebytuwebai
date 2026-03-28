import { CheckCircle2, FolderOpen, PauseCircle, Plus, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminProjectsHeaderProps {
  total: number;
  inProgress: number;
  inProduction: number;
  paused: number;
  onCreate: () => void;
}

export function AdminProjectsHeader({
  total,
  inProgress,
  inProduction,
  paused,
  onCreate,
}: AdminProjectsHeaderProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-signal/20 bg-signal/12 text-signal shadow-[0_0_0_1px_rgba(59,158,245,0.12)]">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                Proyectos
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Seguimiento operativo de entregas, bloqueos y estado real de cada proyecto.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <Sparkles className="h-3.5 w-3.5 text-signal" />
              {total} proyectos registrados
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <FolderOpen className="h-3.5 w-3.5" />
              {inProgress} en seguimiento
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {inProduction} en produccion
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/15 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
              <PauseCircle className="h-3.5 w-3.5" />
              {paused} pausados
            </div>
          </div>
        </div>

        <Button
          onClick={onCreate}
          className="w-full rounded-xl border border-signal/20 bg-signal text-white shadow-[0_12px_30px_rgba(59,158,245,0.2)] hover:bg-signal/90 sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo proyecto
        </Button>
      </div>
    </section>
  );
}
