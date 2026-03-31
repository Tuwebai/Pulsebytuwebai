import type { LucideIcon } from 'lucide-react';

interface AdminUserRoleSummaryProps {
  icon: LucideIcon;
  label: string;
  help: string;
}

export function AdminUserRoleSummary({
  icon: Icon,
  label,
  help,
}: AdminUserRoleSummaryProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--bg-base)] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-signal/15 text-signal">
          <Icon className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-100">{label}</p>
          <p className="text-xs leading-5 text-slate-400">{help}</p>
        </div>
      </div>
    </div>
  );
}
