import type { ReactNode } from 'react';

import { RefreshCw, Shield } from 'lucide-react';

import NotificationBell from '@/components/admin/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminSectionNav } from '@/features/admin/components/AdminSectionNav';
import { getAdminSectionLabel, type AdminSectionId } from '@/features/admin/constants/adminSections';

interface AdminShellProps {
  activeSection: AdminSectionId;
  lastUpdate: Date;
  onRefresh: () => void;
  onSectionChange: (sectionId: AdminSectionId) => void;
  children: ReactNode;
}

export function AdminShell({
  activeSection,
  lastUpdate,
  onRefresh,
  onSectionChange,
  children,
}: AdminShellProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-background/90 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-300">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300">
                  <Shield className="mr-1 h-3.5 w-3.5" />
                  Pulse Admin
                </Badge>
                <Badge variant="secondary">
                  {getAdminSectionLabel(activeSection)}
                </Badge>
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Centro operativo de Pulse</h1>
                <p className="text-sm text-muted-foreground">
                  El shell principal muestra solo operaciones de Pulse; el tooling interno legacy queda fuera de esta navegacion.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Ultima actualizacion: {lastUpdate.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start">
              <Button type="button" variant="outline" onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
              <NotificationBell />
              <ThemeToggle />
            </div>
          </div>

          <div className="mt-4 border-t border-border/60 pt-4">
            <AdminSectionNav activeSection={activeSection} onSectionChange={onSectionChange} />
          </div>
        </div>

        <div className="min-h-[calc(100vh-240px)] space-y-3 sm:space-y-4 lg:space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
