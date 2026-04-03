import { useEffect, useState } from 'react';
import { KanbanSquare, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AdminProjectDialogShell } from '@/features/admin/projects/components/AdminProjectDialogShell';
import { AdminProjectPhaseDialogFields } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDialogFields';
import type {
  AdminProjectTrackingPhase,
  AdminProjectTrackingPhaseInput,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectPhaseDialogProps {
  open: boolean;
  saving?: boolean;
  phase?: AdminProjectTrackingPhase | null;
  onClose: () => void;
  onSubmit: (input: AdminProjectTrackingPhaseInput, currentPhaseKey?: string) => Promise<void>;
}

const EMPTY_FORM: AdminProjectTrackingPhaseInput = {
  descripcion: '',
  estado: 'Pendiente',
  responsable: '',
  fechaEntrega: '',
};

const phaseStatuses = ['Pendiente', 'En Progreso', 'Terminado'] as const;

export function AdminProjectPhaseDialog({
  open,
  saving = false,
  phase,
  onClose,
  onSubmit,
}: AdminProjectPhaseDialogProps) {
  const [form, setForm] = useState<AdminProjectTrackingPhaseInput>(EMPTY_FORM);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (phase) {
      setForm({
        descripcion: phase.descripcion ?? phase.key,
        estado: phase.estado,
        responsable: phase.responsable ?? '',
        fechaEntrega: phase.fechaEntrega ?? phase.fechaFin ?? '',
      });
      return;
    }

    setForm(EMPTY_FORM);
  }, [open, phase]);

  if (!open) {
    return null;
  }

  const handleChange = <K extends keyof AdminProjectTrackingPhaseInput>(
    field: K,
    value: AdminProjectTrackingPhaseInput[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(form, phase?.key);
  };

  return (
    <AdminProjectDialogShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      kicker="Pulse admin · fases"
      title={phase ? 'Editar fase' : 'Nueva fase'}
      description="Definí el estado, el responsable y la fecha objetivo para que Pulse pueda seguir esta etapa con claridad."
      icon={KanbanSquare}
      maxWidthClassName="sm:max-w-2xl"
      ariaDescribedBy="admin-project-phase-dialog-description"
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
            disabled={saving || !form.descripcion.trim()}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {phase ? 'Guardar fase' : 'Crear fase'}
          </Button>
        </>
      }
    >
      <AdminProjectPhaseDialogFields form={form} statuses={phaseStatuses} onChange={handleChange} />
    </AdminProjectDialogShell>
  );
}
