import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AdminProjectTaskDialogFields } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialogFields';
import { AdminProjectTaskDialogHeader } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialogHeader';
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-[var(--bg-surface)] shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <AdminProjectTaskDialogHeader editing={Boolean(task)} />

            <Button
              type="button"
              variant="ghost"
              className="h-10 w-10 rounded-full p-0 text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <AdminProjectTaskDialogFields
            form={form}
            phases={phases}
            fixedPhaseKey={fixedPhaseKey}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:bg-white/[0.06]"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
            onClick={handleSubmit}
            disabled={saving || !form.title.trim()}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {task ? 'Guardar tarea' : 'Crear tarea'}
          </Button>
        </div>
      </div>
    </div>
  );
}
