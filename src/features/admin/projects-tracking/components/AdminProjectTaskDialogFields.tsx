import { CalendarClock, KanbanSquare, UserRound } from 'lucide-react';

import type {
  AdminProjectTrackingPhase,
  AdminProjectTrackingTaskInput,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectTaskDialogFieldsProps {
  form: AdminProjectTrackingTaskInput;
  phases: AdminProjectTrackingPhase[];
  fixedPhaseKey?: string;
  onChange: <K extends keyof AdminProjectTrackingTaskInput>(
    field: K,
    value: AdminProjectTrackingTaskInput[K],
  ) => void;
}

const taskStatuses = ['Pendiente', 'En Progreso', 'Bloqueada', 'Terminada'] as const;
const taskPriorities = ['alta', 'media', 'baja'] as const;

export function AdminProjectTaskDialogFields({
  form,
  phases,
  fixedPhaseKey,
  onChange,
}: AdminProjectTaskDialogFieldsProps) {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">Nombre de la tarea</span>
        <input
          type="text"
          value={form.title}
          onChange={(event) => onChange('title', event.target.value)}
          placeholder="Ej: Validar copy final, definir responsable, revisar bloqueo"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-signal/40 focus:bg-white/[0.05]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">Contexto operativo</span>
        <textarea
          value={form.description ?? ''}
          onChange={(event) => onChange('description', event.target.value)}
          rows={3}
          placeholder="Qué falta resolver o por qué esta tarea necesita seguimiento."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-signal/40 focus:bg-white/[0.05]"
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
            <KanbanSquare className="h-4 w-4 text-emerald-300" />
            Estado
          </span>
          <select
            value={form.status}
            onChange={(event) => onChange('status', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-signal/40 focus:bg-white/[0.05]"
          >
            {taskStatuses.map((status) => (
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
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-signal/40 focus:bg-white/[0.05]"
          >
            {taskPriorities.map((priority) => (
              <option key={priority} value={priority} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                {priority}
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
            placeholder="Equipo, persona o área"
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
            value={form.fechaLimite ?? ''}
            onChange={(event) => onChange('fechaLimite', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-signal/40 focus:bg-white/[0.05]"
          />
        </label>
      </div>

      {!fixedPhaseKey ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">Ubicación operativa</span>
          <select
            value={form.phaseKey ?? ''}
            onChange={(event) => onChange('phaseKey', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-signal/40 focus:bg-white/[0.05]"
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
