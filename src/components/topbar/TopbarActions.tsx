import { Lightbulb, RefreshCw, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import NotificationBell from '@/components/admin/NotificationBell';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import HelpButton from '@/features/help/components/HelpButton';

interface TopbarActionsProps {
  clientProjectCount: number;
  isAdminPage: boolean;
  isClientDashboardHome: boolean;
  isClientPulseRoute: boolean;
  onClientRefresh?: () => void;
  onClientSearch?: (term: string) => void;
  onRefreshData?: () => void;
  searchTerm: string;
}

export function TopbarActions({
  clientProjectCount,
  isAdminPage,
  isClientDashboardHome,
  isClientPulseRoute,
  onClientRefresh,
  onClientSearch,
  onRefreshData,
  searchTerm,
}: TopbarActionsProps) {
  const { t } = useTranslation();

  if (isAdminPage) {
    return (
      <div className="flex items-center space-x-3">
        <ThemeToggle variant="outline" size="sm" />

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefreshData}
                  className="h-9 px-4 transition-all duration-200 hover:border-primary/50 hover:bg-muted"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Recargar datos desde la base de datos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <NotificationBell />
        </div>
      </div>
    );
  }

  if (isClientPulseRoute) {
    return (
      <div className="flex items-center space-x-3">
        <ThemeToggle variant="outline" size="sm" />

        {isClientDashboardHome ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(event) => onClientSearch?.(event.target.value)}
              className="h-9 w-64 border-border bg-background pl-10 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        ) : null}

        <div className="flex items-center space-x-2">
          <NotificationBell />
          <HelpButton variant="minimal" />

          {isClientDashboardHome && onClientRefresh ? (
            <Button
              onClick={onClientRefresh}
              variant="outline"
              size="sm"
              className="h-9 px-4 transition-all duration-200 hover:border-primary/50 hover:bg-muted"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-4 sm:flex">
      <ThemeToggle variant="outline" size="sm" />

      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
          <Lightbulb className="h-4 w-4 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('Proyectos')}:
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {clientProjectCount}
          </span>
        </div>
      </div>
    </div>
  );
}
