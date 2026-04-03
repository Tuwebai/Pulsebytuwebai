import { useEffect, useState } from 'react';
import { ListTodo, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AdminProjectDialogShell } from '@/features/admin/projects/components/AdminProjectDialogShell';
import { AdminProjectTaskDialogFields } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialogFields';
import type {
  AdminProjectTrackingPhase,
  AdminProjectTrackingTask,
  AdminProjectTrackingTaskInput,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectTaskDialogProps {
  open: boolean;
  saving?: boolean;
  task?: AdminProjectTrackingTask | null;
  phases: AdminProjectTrackingPhase[];
  fixedPhaseKey?: string;
  onClose: () => void;
  onSubmit: (input: AdminProjectTrackingTaskInput, currentTaskKey?: string) => Promise<void>;
}

const EMPTY_FORM: AdminProjectTrackingTaskInput = {
  title: '',
  description: '',
  status: 'Pendiente',
  priority: 'alta',
  responsable: '',
  fechaLimite: '',
  phaseKey: '',
};

export function AdminProjectTaskDialog({
  open,
  saving = false,
  task,
  phases,
  fixedPhaseKey,
  onClose,
  onSubmit,
}: AdminProjectTaskDialogProps) {
  const [form, setForm] = useState<AdminProjectTrackingTaskInput>(EMPTY_FORM);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority ?? 'alta',
        responsable: task.responsable ?? task.assigned_to ?? '',
        fechaLimite: task.fechaLimite ?? task.dueDate ?? '',
        phaseKey: fixedPhaseKey ?? task.source.phaseKey ?? '',
      });
      return;
    }

    setForm({
      ...EMPTY_FORM,
      phaseKey: fixedPhaseKey ?? '',
    });
  }, [fixedPhaseKey, open, task]);

  if (!open) {
    return null;
  }

  const handleChange = <K extends keyof AdminProjectTrackingTaskInput>(
    field: K,
    value: AdminProjectTrackingTaskInput[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(
      {
        ...form,
        phaseKey: fixedPhaseKey ?? (form.phaseKey || undefined),
      },
      task?.key,
    );
  };

  return (
    <AdminProjectDialogShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      kicker="Pulse admin · tareas"
      title={task ? 'Editar tarea' : 'Nueva tarea'}
      description="Definí el desvío, el responsable y la fecha objetivo desde una vista operativa Pulse."
      icon={ListTodo}
      maxWidthClassName="sm:max-w-3xl"
      ariaDescribedBy="admin-project-task-dialog-description"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="rounded-xl border border-[var(--signal-border)] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
            onClick={handleSubmit}
            disabled={saving || !form.title.trim()}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {task ? 'Guardar tarea' : 'Crear tarea'}
          </Button>
        </>
      }
    >
      <AdminProjectTaskDialogFields
        form={form}
        phases={phases}
        fixedPhaseKey={fixedPhaseKey}
        onChange={handleChange}
      />
    </AdminProjectDialogShell>
  );
}
