import { LoaderCircle, Save, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsSaveActionsProps {
  dirty: boolean;
  loading: boolean;
  onSave: () => Promise<void>;
}

export function SettingsSaveActions({ dirty, loading, onSave }: SettingsSaveActionsProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[12px] text-[var(--text-secondary)]">
        {dirty
          ? 'Tenes cambios pendientes en esta seccion.'
          : 'No hay cambios pendientes en esta seccion.'}
      </p>

      <Button
        onClick={onSave}
        disabled={loading || !dirty}
        className="bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)] shadow-[0_12px_30px_var(--signal-glow)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : dirty ? <Save className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
        {loading ? 'Guardando...' : dirty ? 'Guardar cambios' : 'Sin cambios'}
      </Button>
    </div>
  );
}
