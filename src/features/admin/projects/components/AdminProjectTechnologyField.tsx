import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminProjectTechnologyFieldProps {
  value: string[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (technology: string) => void;
}

export function AdminProjectTechnologyField({
  value,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
}: AdminProjectTechnologyFieldProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Agregar tecnología"
          className="border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onAdd();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((technology) => (
            <span
              key={technology}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--signal-border)] bg-[var(--signal-glow)] px-3 py-1 text-xs font-medium text-[var(--signal)]"
            >
              {technology}
              <button
                type="button"
                onClick={() => onRemove(technology)}
                className="text-[var(--signal)]/80 transition-colors hover:text-[var(--signal)]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
