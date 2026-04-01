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
          className="border-white/10 bg-white/[0.03] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
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
          className="rounded-xl border-white/10 bg-white/[0.03] px-3 text-[var(--text-primary)] hover:bg-white/[0.06]"
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
              className="inline-flex items-center gap-2 rounded-full border border-signal/20 bg-signal/10 px-3 py-1 text-xs font-medium text-signal"
            >
              {technology}
              <button
                type="button"
                onClick={() => onRemove(technology)}
                className="text-signal/80 transition-colors hover:text-signal"
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
