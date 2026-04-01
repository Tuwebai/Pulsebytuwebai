import { Button } from '@/components/ui/button';
import { AdminPageActionsBar } from '@/features/admin/components/AdminPageActionsBar';
import { AdminSettingsAccountCard } from '@/features/admin/settings/components/AdminSettingsAccountCard';
import { AdminSettingsReferenceCard } from '@/features/admin/settings/components/AdminSettingsReferenceCard';
import { AdminSettingsStatusCard } from '@/features/admin/settings/components/AdminSettingsStatusCard';

interface AdminSettingsScreenProps {
  onSaveReference: () => void;
}

export function AdminSettingsScreen({ onSaveReference }: AdminSettingsScreenProps) {
  return (
    <div className="space-y-4 text-slate-100">
      <AdminPageActionsBar
        actions={(
          <Button onClick={onSaveReference} className="bg-sky-500 text-slate-950 hover:bg-sky-400">
            Guardar referencia
          </Button>
        )}
      >
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Ajustes del panel
          </p>
          <p className="text-sm text-slate-300">
            Ordená identidad, referencia interna y criterios base del equipo sin agrandar la pantalla.
          </p>
        </div>
      </AdminPageActionsBar>

      <AdminSettingsStatusCard />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <AdminSettingsAccountCard />
        <AdminSettingsReferenceCard />
      </div>
    </div>
  );
}
