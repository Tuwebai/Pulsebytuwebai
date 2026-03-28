import type { ReactNode } from 'react';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AdminProjectTrackingSidebar } from '@/features/admin/projects-tracking/components/AdminProjectTrackingSidebar';
import { cn } from '@/lib/utils';

interface AdminProjectTrackingLayoutProps {
  collapsed: boolean;
  mobileSidebarOpen: boolean;
  onToggleCollapse: () => void;
  onOpenMobileSidebar: () => void;
  onCloseMobileSidebar: () => void;
  onBack: () => void;
  children: ReactNode;
}

export function AdminProjectTrackingLayout({
  collapsed,
  mobileSidebarOpen,
  onToggleCollapse,
  onOpenMobileSidebar,
  onCloseMobileSidebar,
  onBack,
  children,
}: AdminProjectTrackingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <AdminProjectTrackingSidebar
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          onBack={onBack}
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
          <div className="flex items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/90 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenMobileSidebar}
              className="h-10 w-10 rounded-2xl border border-white/10 bg-white/[0.03] p-0 text-[var(--text-primary)] hover:bg-white/[0.06]"
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
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={onCloseMobileSidebar}
          />
          <div className="absolute inset-y-0 left-0 w-[min(84vw,320px)]">
            <AdminProjectTrackingSidebar
              collapsed={false}
              onToggleCollapse={onCloseMobileSidebar}
              onBack={onBack}
              className="h-screen rounded-none rounded-r-[28px] border-l-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}
