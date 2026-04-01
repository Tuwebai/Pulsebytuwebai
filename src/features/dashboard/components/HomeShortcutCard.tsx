import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/core/components';
import type { BadgeProps } from '@/core/components/Badge';

interface HomeShortcutCardProps {
  badgeLabel: string;
  badgeVariant: BadgeProps['variant'];
  ctaLabel: string;
  dataTour: string;
  detail: string;
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  onClick: () => void;
}

export default function HomeShortcutCard({
  badgeLabel,
  badgeVariant,
  ctaLabel,
  dataTour,
  detail,
  icon: Icon,
  iconClassName,
  label,
  onClick,
}: HomeShortcutCardProps) {
  return (
    <button
      className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 text-left shadow-[0_14px_30px_rgba(2,6,23,0.22)] transition-colors hover:border-white/15"
      data-tour={dataTour}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${iconClassName}`}>
          <Icon className="h-4 w-4" />
        </div>
        <Badge size="sm" variant={badgeVariant}>
          {badgeLabel}
        </Badge>
      </div>

      <p className="mt-4 text-base font-medium text-slate-100">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
      <p className="mt-4 text-sm text-signal">{ctaLabel}</p>
    </button>
  );
}
