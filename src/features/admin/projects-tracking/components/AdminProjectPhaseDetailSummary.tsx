import { CalendarClock, CheckCircle2, ListTodo, UserRound } from 'lucide-react';

import type { AdminProjectTrackingPhase } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectPhaseDetailSummaryProps {
  phase: AdminProjectTrackingPhase;
}

export function AdminProjectPhaseDetailSummary({ phase }: AdminProjectPhaseDetailSummaryProps) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-300" />
        <p className="text-sm text-[var(--text-secondary)]">Estado</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{phase.estado}</p>
      </div>
      <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <UserRound className="mb-3 h-5 w-5 text-sky-300" />
        <p className="text-sm text-[var(--text-secondary)]">Responsable</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{phase.responsable ?? 'Sin responsable'}</p>
      </div>
      <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <CalendarClock className="mb-3 h-5 w-5 text-amber-300" />
        <p className="text-sm text-[var(--text-secondary)]">Fecha objetivo</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
          {phase.fechaEntrega ?? phase.fechaFin ?? 'Sin fecha'}
        </p>
      </div>
      <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <ListTodo className="mb-3 h-5 w-5 text-signal" />
        <p className="text-sm text-[var(--text-secondary)]">Tareas de la fase</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{phase.tareas.length}</p>
      </div>
    </section>
  );
}
