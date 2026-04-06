import { LoaderCircle, Save, ShieldCheck } from 'lucide-react';
import { Button } from '@/core/ui/button';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';
import { cn } from '@/lib/utils';

interface SettingsSaveActionsProps {
  dirty: boolean;
  loading: boolean;
  onSave: () => Promise<void>;
}

export function SettingsSaveActions({ dirty, loading, onSave }: SettingsSaveActionsProps) {
  const prefersReducedMotion = useReducedMotionPreference();
  const stateKey = dirty ? 'pending' : 'idle';

  return (
    <div
      className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:items-center sm:justify-between"
      data-tour={`settings-save-actions-${stateKey}`}
    >
      <p className="text-[12px] text-[var(--text-secondary)]">
        {dirty
          ? 'Tenes cambios pendientes en esta seccion.'
          : 'No hay cambios pendientes en esta seccion.'}
      </p>

      <Button
        onClick={onSave}
        disabled={loading || !dirty}
        className={cn(
          'bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)] shadow-[0_12px_30px_var(--signal-glow)] disabled:cursor-not-allowed disabled:opacity-60',
          prefersReducedMotion && 'transition-none hover:shadow-[0_12px_30px_var(--signal-glow)] active:scale-100',
        )}
      >
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : dirty ? <Save className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
        {loading ? 'Guardando...' : dirty ? 'Guardar cambios' : 'Sin cambios'}
      </Button>
    </div>
  );
}
