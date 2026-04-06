import { Menu, X } from 'lucide-react';

import { Button } from '@/core/ui/button';
import { cn } from '@/core/utils/cn';

interface HelpCenterContentHeaderProps {
  activeTab: string;
  articleCount: number;
  isArticleDetail: boolean;
  isMobile: boolean;
  onClose: () => void;
  onShowSidebar: () => void;
  showSidebar: boolean;
  tutorialCount: number;
}

export function HelpCenterContentHeader({
  activeTab,
  articleCount,
  isArticleDetail,
  isMobile,
  onClose,
  onShowSidebar,
  showSidebar,
  tutorialCount,
}: HelpCenterContentHeaderProps) {
  const title =
    activeTab === 'search'
      ? isArticleDetail && isMobile
        ? 'Guía Pulse'
        : 'Artículos de ayuda'
      : 'Recorridos disponibles';
  const description =
    activeTab === 'search'
      ? isArticleDetail && isMobile
        ? 'Respuesta rápida para seguir avanzando'
        : `${articleCount} artículos para resolver dudas puntuales`
      : `${tutorialCount} recorridos breves dentro de Pulse`;

  return (
    <div
      className={cn(
        'flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/88 backdrop-blur',
        isMobile ? 'px-4 py-2.5' : 'px-6 py-4',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {isMobile && !showSidebar ? (
          <Button
            aria-label="Mostrar panel de ayuda"
            variant="ghost"
            size="sm"
            onClick={onShowSidebar}
            className="h-9 w-9 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] p-0 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            <Menu className="h-4 w-4" />
          </Button>
        ) : null}

        <div className="min-w-0 flex-1">
          <h3 className={cn('truncate font-medium text-[var(--text-primary)]', isMobile ? 'text-[15px]' : 'text-lg')}>
            {title}
          </h3>
          <p className={cn('text-[var(--text-secondary)]', isMobile ? 'text-[11px]' : 'text-sm')}>
            {description}
          </p>
        </div>
      </div>

      <Button
        aria-label="Cerrar ayuda Pulse"
        variant="outline"
        size="sm"
        onClick={onClose}
        className={cn(
          'rounded-full border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
          isMobile ? 'h-9 w-9 p-0' : 'h-10',
        )}
      >
        <X className={cn('h-4 w-4', isMobile ? '' : 'mr-1.5')} />
        <span className={isMobile ? 'hidden' : 'inline'}>Cerrar</span>
      </Button>
    </div>
  );
}
