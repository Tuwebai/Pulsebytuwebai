import type { ReactNode } from 'react';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AdminProjectTrackingSidebar } from '@/features/admin/projects-tracking/components/AdminProjectTrackingSidebar';
import type { AdminProjectTrackingNavItem } from '@/features/admin/projects-tracking/components/AdminProjectTrackingFrame';
import { cn } from '@/lib/utils';

interface AdminProjectTrackingLayoutProps {
  activeItem: AdminProjectTrackingNavItem;
  collapsed: boolean;
  mobileSidebarOpen: boolean;
  onToggleCollapse: () => void;
  onOpenMobileSidebar: () => void;
  onCloseMobileSidebar: () => void;
  onBack: () => void;
  projectId: string | undefined;
  children: ReactNode;
}

export function AdminProjectTrackingLayout({
  activeItem,
  collapsed,
  mobileSidebarOpen,
  onToggleCollapse,
  onOpenMobileSidebar,
  onCloseMobileSidebar,
  onBack,
  projectId,
  children,
}: AdminProjectTrackingLayoutProps) {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      data-surface="admin"
    >
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <AdminProjectTrackingSidebar
          activeItem={activeItem}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          onBack={onBack}
          projectId={projectId}
          className="h-screen rounded-none rounded-r-[28px] border-l-0"
        />
      </div>

      <div
        className={cn(
          'min-h-screen px-3 py-3 transition-all duration-300 sm:px-4 sm:py-4 lg:pr-6 lg:py-6',
          collapsed ? 'lg:pl-[116px]' : 'lg:pl-[304px]',
        )}
      >
        <div className="mx-auto w-full max-w-[1480px] space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 shadow-2xl lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenMobileSidebar}
              className="h-10 w-10 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-0 text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="min-w-0 text-right">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Seguimiento
              </p>
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">Proyecto operativo</p>
            </div>
          </div>

          <div className="min-h-[calc(100vh-24px)]">{children}</div>
        </div>
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar sidebar"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobileSidebar}
          />
          <div className="absolute inset-y-0 left-0 w-[min(84vw,320px)]">
            <AdminProjectTrackingSidebar
              activeItem={activeItem}
              collapsed={false}
              onToggleCollapse={onCloseMobileSidebar}
              onBack={onBack}
              projectId={projectId}
              className="h-screen rounded-none rounded-r-[28px] border-l-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}
