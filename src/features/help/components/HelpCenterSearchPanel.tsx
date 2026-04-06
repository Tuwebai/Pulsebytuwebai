import {
  CreditCard,
  FolderKanban,
  LifeBuoy,
  PlayCircle,
  Search,
  Settings,
  Target,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/core/ui/button';
import { cn } from '@/core/utils/cn';

import {
  getCategoryIcon,
  getHelpCategoryLabel,
  HELP_CENTER_CATEGORIES,
} from '@/features/help/utils/helpCenter.utils';

interface HelpCenterSearchPanelProps {
  isMobile: boolean;
  onActiveTabChange: (value: string) => void;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onSearchChange: (query: string) => void;
  onSelectedCategoryChange: (category: string) => void;
  onStartTutorial: (flowId: string) => void;
  searchInput: string;
  selectedCategory: string;
}

export function HelpCenterSearchPanel({
  isMobile,
  onActiveTabChange,
  onClose,
  onNavigate,
  onSearchChange,
  onSelectedCategoryChange,
  onStartTutorial,
  searchInput,
  selectedCategory,
}: HelpCenterSearchPanelProps) {
  return (
    <div className={cn(isMobile ? 'space-y-4' : 'space-y-5')}>
      <div className="relative">
        <Search
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]',
            isMobile ? 'left-3 h-3.5 w-3.5' : 'left-4 h-4 w-4',
          )}
        />
        <input
          placeholder="Buscar en Ayuda Pulse..."
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          className={cn(
            'h-11 w-full rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal-glow)]',
            isMobile ? 'pl-9 pr-3 text-sm' : 'pl-11 pr-4 text-sm',
          )}
        />
      </div>

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/55 p-3">
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          Categorías
        </h3>
        <div className="space-y-1">
          {HELP_CENTER_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => onSelectedCategoryChange(category)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'border-[var(--signal-border)] bg-[var(--signal-glow)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
                )}
              >
                <span className={cn(isActive ? 'text-[var(--signal)]' : 'text-[var(--text-secondary)]')}>
                  {getCategoryIcon(category)}
                </span>
                <span className="truncate">{getHelpCategoryLabel(category)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/55 p-3">
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          Acciones rápidas
        </h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-full justify-start rounded-xl border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            onClick={() => {
              onStartTutorial('welcome-tour');
              onClose();
            }}
          >
            <Target className="mr-2 h-4 w-4 text-[var(--signal)]" />
            Recorrido inicial
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-10 w-full justify-start rounded-xl border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            onClick={() => onActiveTabChange('tutorials')}
          >
            <PlayCircle className="mr-2 h-4 w-4 text-[var(--signal)]" />
            Ver tutoriales
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/55 p-3">
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          Ir directo a
        </h3>
        <div className="space-y-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-full justify-start rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            onClick={() => onNavigate('/dashboard')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Resumen principal
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-full justify-start rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            onClick={() => onNavigate('/dashboard/pulse')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Pulse
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-full justify-start rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            onClick={() => onNavigate('/dashboard/google')}
          >
            <Search className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-full justify-start rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            onClick={() => onNavigate('/dashboard/proyecto')}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            Mi Proyecto
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-full justify-start rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            onClick={() => onNavigate('/dashboard/pagos')}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Pagos
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-full justify-start rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            onClick={() => onNavigate('/dashboard/soporte')}
          >
            <LifeBuoy className="mr-2 h-4 w-4" />
            Soporte
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-full justify-start rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            onClick={() => onNavigate('/dashboard/configuracion')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Button>
        </div>
      </div>
    </div>
  );
}
