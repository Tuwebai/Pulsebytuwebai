import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  KanbanSquare,
  ListTodo,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import type { AdminProjectTrackingNavItem } from '@/features/admin/projects-tracking/components/AdminProjectTrackingFrame';
import { cn } from '@/lib/utils';

const trackingNavItems = [
  { id: 'resumen', label: 'Resumen', icon: ClipboardList, iconClassName: 'text-[var(--signal)] border-[var(--signal-border)] bg-[var(--signal-glow)]' },
  { id: 'fases', label: 'Fases', icon: KanbanSquare, iconClassName: 'text-[var(--success)] border-[var(--success)]/20 bg-[var(--success-dim)]' },
  { id: 'tareas-criticas', label: 'Tareas críticas', icon: ListTodo, iconClassName: 'text-[var(--warning)] border-[var(--warning)]/20 bg-[var(--warning-dim)]' },
  { id: 'alertas', label: 'Alertas', icon: AlertTriangle, iconClassName: 'text-[var(--danger)] border-[var(--danger)]/20 bg-[var(--danger-dim)]' },
] as const;

interface AdminProjectTrackingSidebarProps {
  activeItem: AdminProjectTrackingNavItem;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onBack: () => void;
  projectId: string | undefined;
  className?: string;
}

export function AdminProjectTrackingSidebar({
  activeItem,
  collapsed,
  onToggleCollapse,
  onBack,
  projectId,
  className,
}: AdminProjectTrackingSidebarProps) {
  const basePath = projectId ? `/admin/proyectos/${projectId}/seguimiento` : '/admin/proyectos';

  return (
    <aside
      className={cn(
        'flex h-full flex-col rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-2xl transition-all duration-300',
        collapsed ? 'w-[92px]' : 'w-[280px]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-2 pb-3">
        <div className={cn('min-w-0', collapsed && 'sr-only')}>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            Seguimiento
          </p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Proyecto operativo</p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-10 w-10 shrink-0 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-0 text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-2">
        {trackingNavItems.map(({ id, label, icon: Icon, iconClassName }) => {
          const to =
            id === 'resumen'
              ? basePath
              : id === 'fases'
                ? `${basePath}/fases`
                : id === 'tareas-criticas'
                  ? `${basePath}/tareas`
                  : `${basePath}/alertas`;

          return (
            <NavLink
              key={id}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
                activeItem === id && 'border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)]',
                collapsed && 'justify-center px-0',
              )}
              title={collapsed ? label : undefined}
            >
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border', iconClassName)}>
                <Icon className="h-4 w-4 shrink-0" />
              </span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className={cn(
            'h-11 w-full rounded-2xl border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Volver a proyectos' : undefined}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--signal)]">
            <ArrowLeft className="h-4 w-4 shrink-0" />
          </span>
          {!collapsed && <span>Volver a proyectos</span>}
        </Button>
      </div>
    </aside>
  );
}
