import { ChevronLeft, HelpCircle } from 'lucide-react';

import { Button } from '@/core/ui/button';
import { cn } from '@/core/utils/cn';

interface HelpCenterSidebarHeaderProps {
  isMobile: boolean;
  onHideSidebar: () => void;
}

export function HelpCenterSidebarHeader({
  isMobile,
  onHideSidebar,
}: HelpCenterSidebarHeaderProps) {
  return (
    <div
      className={cn(
        'border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/96',
        isMobile ? 'px-4 py-4' : 'px-5 py-5',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center justify-center rounded-2xl border border-[var(--signal-border)] bg-[var(--signal-glow)] shadow-[0_0_0_1px_rgba(59,158,245,0.08)]',
              isMobile ? 'h-10 w-10' : 'h-11 w-11',
            )}
          >
            <HelpCircle className={cn('text-[var(--signal)]', isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
          </div>

          <div>
            <h2 className={cn('font-medium text-[var(--text-primary)]', isMobile ? 'text-lg' : 'text-xl')}>
              Ayuda Pulse
            </h2>
            <p className={cn('text-[var(--text-secondary)]', isMobile ? 'text-sm' : 'text-[13px]')}>
              Respuestas rápidas para seguir avanzando.
            </p>
          </div>
        </div>

        {isMobile ? (
          <Button
            aria-label="Ocultar panel lateral de ayuda"
            variant="ghost"
            size="sm"
            onClick={onHideSidebar}
            className="h-9 w-9 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] p-0 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
