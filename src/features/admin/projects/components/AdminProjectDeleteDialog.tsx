import { Trash2 } from 'lucide-react';

import { Button } from '@/core/ui/button';
import type { Project } from '@/types/project.types';

import { AdminProjectDialogShell } from '@/features/admin/projects/components/AdminProjectDialogShell';

interface AdminProjectDeleteDialogProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminProjectDeleteDialog({
  open,
  project,
  onClose,
  onConfirm,
}: AdminProjectDeleteDialogProps) {
  return (
    <AdminProjectDialogShell
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      kicker="Pulse admin · proyectos"
      title="Eliminar proyecto"
      description={`Vas a eliminar ${project?.name || 'este proyecto'} de la base operativa.`}
      icon={Trash2}
      maxWidthClassName="sm:max-w-xl"
      ariaDescribedBy="project-delete-description"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          >
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90">
            Eliminar proyecto
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger-dim)] px-4 py-3.5">
        <p className="text-sm leading-6 text-[var(--text-primary)]">
          Esta acción borra el proyecto del panel operativo y no se puede deshacer.
        </p>
      </div>
    </AdminProjectDialogShell>
  );
}
