import { Edit3, ExternalLink, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminProjectCardActionsProps {
  projectId: string;
  onOpenTracking: (projectId: string) => void;
  onViewProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function AdminProjectCardActions({
  projectId,
  onOpenTracking,
  onViewProject,
  onEditProject,
  onDeleteProject,
}: AdminProjectCardActionsProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--border-default)] pt-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-[var(--signal-border)] bg-[var(--signal-glow)] text-[var(--signal)] hover:bg-[var(--signal-glow)]"
          onClick={() => onOpenTracking(projectId)}
        >
          Seguimiento
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--signal-border)] hover:bg-[var(--signal-glow)] hover:text-[var(--signal)]"
          onClick={() => onViewProject(projectId)}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Ver detalle
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--signal-border)] hover:bg-[var(--signal-glow)] hover:text-[var(--signal)]"
          onClick={() => onEditProject(projectId)}
        >
          <Edit3 className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="self-start rounded-xl border-danger/20 bg-danger/10 text-danger hover:border-danger/30 hover:bg-danger/15"
        onClick={() => onDeleteProject(projectId)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Eliminar
      </Button>
    </div>
  );
}
