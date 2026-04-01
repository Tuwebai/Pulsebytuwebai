import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.06]"
          >
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="bg-red-500 text-white hover:bg-red-400">
            Eliminar proyecto
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3.5">
        <p className="text-sm leading-6 text-slate-200">
          Esta acción borra el proyecto del panel operativo y no se puede deshacer.
        </p>
      </div>
    </AdminProjectDialogShell>
  );
}
