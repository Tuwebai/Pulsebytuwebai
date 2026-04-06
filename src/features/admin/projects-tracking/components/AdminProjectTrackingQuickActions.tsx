import { AlertTriangle, CalendarClock, KanbanSquare, UserRound } from 'lucide-react';

import { Button } from '@/core/ui/button';
import type { AdminProjectTrackingResolutionAction } from '@/features/admin/projects-tracking/components/AdminProjectTrackingResolutionPanel';

interface AdminProjectTrackingQuickActionsProps {
  actions: AdminProjectTrackingResolutionAction[];
}

const iconMap = {
  owner: UserRound,
  date: CalendarClock,
  status: KanbanSquare,
  priority: AlertTriangle,
} as const;

export function AdminProjectTrackingQuickActions({
  actions,
}: AdminProjectTrackingQuickActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => {
        const ActionIcon = iconMap[action.icon];

        return (
          <Button
            key={action.id}
            type="button"
            variant="outline"
            onClick={action.onClick}
            disabled={action.disabled}
            className="h-9 rounded-xl border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 text-[13px] font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]"
          >
            <ActionIcon className="mr-2 h-4 w-4 text-[var(--text-secondary)]" />
            {action.ctaLabel}
          </Button>
        );
      })}
    </div>
  );
}
