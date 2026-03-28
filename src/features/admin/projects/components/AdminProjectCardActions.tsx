import { Edit3, ExternalLink, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminProjectCardActionsProps {
  projectId: string;
  onViewProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function AdminProjectCardActions({
  projectId,
  onViewProject,
  onEditProject,
  onDeleteProject,
}: AdminProjectCardActionsProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-signal/20 hover:bg-signal/10 hover:text-signal"
          onClick={() => onViewProject(projectId)}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Ver detalle
        </Button>

        <Button
          variant="outline"
          className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-signal/20 hover:bg-signal/10 hover:text-signal"
          onClick={() => onEditProject(projectId)}
        >
          <Edit3 className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <Button
        variant="outline"
        className="self-end rounded-xl border-danger/20 bg-danger/10 text-danger hover:border-danger/30 hover:bg-danger/15 sm:self-auto"
        onClick={() => onDeleteProject(projectId)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Eliminar
      </Button>
    </div>
  );
}
