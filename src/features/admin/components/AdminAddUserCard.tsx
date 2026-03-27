import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminAddUserCardProps {
  onAddUser: () => void;
}

export function AdminAddUserCard({ onAddUser }: AdminAddUserCardProps) {
  return (
    <div className="mt-6">
      <Button
        variant="outline"
        className="group flex w-full items-center justify-start gap-4 rounded-2xl border border-dashed border-border/70 bg-[var(--bg-elevated)]/40 p-4 text-left shadow-none transition-colors duration-150 hover:border-signal/40 hover:bg-[var(--bg-elevated)]/70 sm:p-5"
        onClick={onAddUser}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-signal/15 text-signal">
          <Plus size={20} />
        </div>
        <div className="space-y-1">
          <span className="block text-base font-semibold text-foreground">
            Agregar cliente o acceso
          </span>
          <span className="block text-sm text-muted-foreground">
            Crea un nuevo registro operativo para administrar permisos y seguimiento.
          </span>
        </div>
      </Button>
    </div>
  );
}
