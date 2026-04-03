import { CalendarClock, KanbanSquare, UserRound } from 'lucide-react';

import type {
  AdminProjectTrackingPhase,
  AdminProjectTrackingTaskInput,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectTaskDialogMetaFieldsProps {
  form: AdminProjectTrackingTaskInput;
  phases: AdminProjectTrackingPhase[];
  fixedPhaseKey?: string;
  statuses: readonly AdminProjectTrackingTaskInput['status'][];
  priorities: readonly NonNullable<AdminProjectTrackingTaskInput['priority']>[];
  onChange: <K extends keyof AdminProjectTrackingTaskInput>(
    field: K,
    value: AdminProjectTrackingTaskInput[K],
  ) => void;
}

export function AdminProjectTaskDialogMetaFields({
  form,
  phases,
  fixedPhaseKey,
  statuses,
  priorities,
  onChange,
}: AdminProjectTaskDialogMetaFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
            <KanbanSquare className="h-4 w-4 text-[var(--success)]" />
            Estado
          </span>
          <select
            value={form.status}
            onChange={(event) => onChange('status', event.target.value)}
            className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--signal-border)] focus:bg-[var(--bg-subtle)]"
          >
            {statuses.map((status) => (
              <option key={status} value={status} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">Prioridad</span>
          <select
            value={form.priority ?? 'alta'}
            onChange={(event) => onChange('priority', event.target.value)}
            className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--signal-border)] focus:bg-[var(--bg-subtle)]"
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                {priority}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
            <UserRound className="h-4 w-4 text-[var(--signal)]" />
            Responsable
          </span>
          <input
            type="text"
            value={form.responsable ?? ''}
            onChange={(event) => onChange('responsable', event.target.value)}
            placeholder="Equipo, persona o área"
            className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-border)] focus:bg-[var(--bg-subtle)]"
          />
        </label>

        <label className="block space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
            <CalendarClock className="h-4 w-4 text-[var(--warning)]" />
            Fecha objetivo
          </span>
          <input
            type="date"
            value={form.fechaLimite ?? ''}
            onChange={(event) => onChange('fechaLimite', event.target.value)}
            className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--signal-border)] focus:bg-[var(--bg-subtle)]"
          />
        </label>
      </div>

      {!fixedPhaseKey ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">Ubicación operativa</span>
          <select
            value={form.phaseKey ?? ''}
            onChange={(event) => onChange('phaseKey', event.target.value)}
            className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--signal-border)] focus:bg-[var(--bg-subtle)]"
          >
            <option value="" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
              Sin fase específica
            </option>
            {phases.map((phase) => (
              <option key={phase.key} value={phase.key} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                {phase.descripcion ?? phase.key}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </>
  );
}
