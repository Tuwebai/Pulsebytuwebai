import { AdminSettingsAccountCard } from '@/features/admin/settings/components/AdminSettingsAccountCard';
import { AdminSettingsReferenceCard } from '@/features/admin/settings/components/AdminSettingsReferenceCard';

interface AdminSettingsScreenProps {
  onSaveReference: () => void;
}

export function AdminSettingsScreen({ onSaveReference }: AdminSettingsScreenProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <AdminSettingsAccountCard />
      <AdminSettingsReferenceCard onSaveReference={onSaveReference} />
    </div>
  );
}
