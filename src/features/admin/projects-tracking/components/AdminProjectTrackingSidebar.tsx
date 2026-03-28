import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  KanbanSquare,
  ListTodo,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const trackingNavItems = [
  { id: 'resumen', label: 'Resumen', icon: ClipboardList, iconClassName: 'text-signal border-signal/20 bg-signal/12' },
  { id: 'fases', label: 'Fases', icon: KanbanSquare, iconClassName: 'text-emerald-300 border-emerald-400/20 bg-emerald-500/12' },
  { id: 'tareas-criticas', label: 'Tareas críticas', icon: ListTodo, iconClassName: 'text-amber-300 border-amber-400/20 bg-amber-500/12' },
  { id: 'alertas', label: 'Alertas', icon: AlertTriangle, iconClassName: 'text-rose-300 border-rose-400/20 bg-rose-500/12' },
] as const;

interface AdminProjectTrackingSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onBack: () => void;
  className?: string;
}

export function AdminProjectTrackingSidebar({
  collapsed,
  onToggleCollapse,
  onBack,
  className,
}: AdminProjectTrackingSidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col rounded-[28px] border border-white/10 bg-[var(--bg-surface)]/95 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur transition-all duration-300',
        collapsed ? 'w-[92px]' : 'w-full max-w-[280px]',
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
          className="h-10 w-10 shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] p-0 text-[var(--text-primary)] hover:bg-white/[0.06]"
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-2">
        {trackingNavItems.map(({ id, label, icon: Icon, iconClassName }) => (
          <a
            key={id}
            href={`#${id}`}
            className={cn(
              'flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm text-[var(--text-secondary)] transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-[var(--text-primary)]',
              collapsed && 'justify-center px-0',
            )}
            title={collapsed ? label : undefined}
          >
            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border', iconClassName)}>
              <Icon className="h-4 w-4 shrink-0" />
            </span>
            {!collapsed && <span>{label}</span>}
          </a>
        ))}
      </nav>

      <div className="pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className={cn(
            'h-11 w-full rounded-2xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-white/15 hover:bg-white/[0.06]',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Volver a proyectos' : undefined}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-signal">
            <ArrowLeft className="h-4 w-4 shrink-0" />
          </span>
          {!collapsed && <span>Volver a proyectos</span>}
        </Button>
      </div>
    </aside>
  );
}
