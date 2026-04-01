import { RefreshCw, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ProjectFilterActionsProps {
  hasFilters: boolean;
  onRefresh?: () => void;
  onReset: () => void;
}

export default function ProjectFilterActions({
  hasFilters,
  onRefresh,
  onReset,
}: ProjectFilterActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onRefresh ? (
        <Button
          className="h-11 rounded-[10px] border border-[var(--border-default)] bg-transparent px-4 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          onClick={onRefresh}
          type="button"
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Actualizar
        </Button>
      ) : null}

      {hasFilters ? (
        <Button
          className="h-11 rounded-[10px] border border-[var(--border-default)] bg-transparent px-4 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          onClick={onReset}
          type="button"
          variant="outline"
        >
          <X className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Limpiar
        </Button>
      ) : null}
    </div>
  );
}
