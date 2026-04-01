import { Switch } from '@/components/ui/switch';

interface AdminSettingsToggleRowProps {
  checked: boolean;
  description: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

export function AdminSettingsToggleRow({
  checked,
  description,
  label,
  onCheckedChange,
}: AdminSettingsToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[18px] border border-white/10 bg-[var(--bg-elevated)] px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">{description}</p>
      </div>

      <Switch
        checked={checked}
        className="data-[state=checked]:bg-[var(--signal)] data-[state=unchecked]:bg-[var(--bg-subtle)]"
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
