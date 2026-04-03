import type { AdminProjectTrackingTaskInput } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectTaskDialogOverviewFieldsProps {
  form: AdminProjectTrackingTaskInput;
  onChange: <K extends keyof AdminProjectTrackingTaskInput>(
    field: K,
    value: AdminProjectTrackingTaskInput[K],
  ) => void;
}

export function AdminProjectTaskDialogOverviewFields({
  form,
  onChange,
}: AdminProjectTaskDialogOverviewFieldsProps) {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">Nombre de la tarea</span>
        <input
          type="text"
          value={form.title}
          onChange={(event) => onChange('title', event.target.value)}
          placeholder="Ej: Validar copy final, definir responsable, revisar bloqueo"
          className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-border)] focus:bg-[var(--bg-subtle)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">Contexto operativo</span>
        <textarea
          value={form.description ?? ''}
          onChange={(event) => onChange('description', event.target.value)}
          rows={3}
          placeholder="Qué falta resolver o por qué esta tarea necesita seguimiento."
          className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-border)] focus:bg-[var(--bg-subtle)]"
        />
      </label>
    </>
  );
}
