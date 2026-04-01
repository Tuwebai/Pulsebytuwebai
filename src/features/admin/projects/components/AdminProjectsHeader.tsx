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
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(59,158,245,0.12),rgba(123,76,212,0.08)_48%,rgba(17,24,39,0.96)_100%)] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.35)] sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-sky-400 via-violet-400/70 to-transparent" />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-signal/15 text-signal">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
                Pulse admin · proyectos
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
                Proyectos
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Seguimiento operativo de entregas, bloqueos y estado real de cada proyecto.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-100">
              <Sparkles className="h-3.5 w-3.5 text-signal" />
              {total} proyectos registrados
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <FolderOpen className="h-3.5 w-3.5" />
              {inProgress} en seguimiento
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {inProduction} en producción
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/15 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
              <PauseCircle className="h-3.5 w-3.5" />
              {paused} pausados
            </div>
          </div>
        </div>

        <Button
          onClick={onCreate}
          className="w-full rounded-xl bg-sky-500 text-slate-950 hover:bg-sky-400 sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo proyecto
        </Button>
      </div>
    </section>
  );
}
