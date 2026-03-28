import { CalendarClock, UserRound } from 'lucide-react';

import type { AdminProjectTrackingPhaseInput } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectPhaseDialogFieldsProps {
  form: AdminProjectTrackingPhaseInput;
  statuses: readonly AdminProjectTrackingPhaseInput['estado'][];
  onChange: <K extends keyof AdminProjectTrackingPhaseInput>(
    field: K,
    value: AdminProjectTrackingPhaseInput[K],
  ) => void;
}

export function AdminProjectPhaseDialogFields({
  form,
  statuses,
  onChange,
}: AdminProjectPhaseDialogFieldsProps) {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">Nombre de la fase</span>
        <input
          type="text"
          value={form.descripcion}
          onChange={(event) => onChange('descripcion', event.target.value)}
          placeholder="Ej: QA final, revisión del cliente, publicación"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-signal/40 focus:bg-white/[0.05]"
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">Estado</span>
          <select
            value={form.estado}
            onChange={(event) => onChange('estado', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-signal/40 focus:bg-white/[0.05]"
          >
            {statuses.map((status) => (
              <option key={status} value={status} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
            <UserRound className="h-4 w-4 text-sky-300" />
            Responsable
          </span>
          <input
            type="text"
            value={form.responsable ?? ''}
            onChange={(event) => onChange('responsable', event.target.value)}
            placeholder="Ej: Juan, equipo de diseño"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-signal/40 focus:bg-white/[0.05]"
          />
        </label>

        <label className="block space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
            <CalendarClock className="h-4 w-4 text-amber-300" />
            Fecha objetivo
          </span>
          <input
            type="date"
            value={form.fechaEntrega ?? ''}
            onChange={(event) => onChange('fechaEntrega', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-signal/40 focus:bg-white/[0.05]"
          />
        </label>
      </div>
    </>
  );
}
