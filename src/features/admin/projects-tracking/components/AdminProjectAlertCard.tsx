import { AlertTriangle, ArrowRight, FolderKanban, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import type { AdminProjectAlertItem } from '@/features/admin/projects-tracking/components/adminProjectAlerts.utils';

interface AdminProjectAlertCardProps {
  item: AdminProjectAlertItem;
}

const severityStyles = {
  high: 'border-[var(--danger)]/20 bg-[var(--danger-dim)] text-[var(--danger)]',
  medium: 'border-[var(--warning)]/20 bg-[var(--warning-dim)] text-[var(--warning)]',
} as const;

export function AdminProjectAlertCard({ item }: AdminProjectAlertCardProps) {
  const navigate = useNavigate();
  const AccentIcon = item.targetType === 'phase' ? FolderKanban : ListTodo;

  return (
    <article className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-5 shadow-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]">
              <AccentIcon className="h-4 w-4" />
            </span>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${severityStyles[item.severity]}`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {item.severity === 'high' ? 'Alerta alta' : 'Alerta media'}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</h2>
            <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(`${item.to}?from=alertas&edit=1`)}
          className="rounded-xl border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]"
        >
          {item.ctaLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
