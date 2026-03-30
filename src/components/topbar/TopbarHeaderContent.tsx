import { Menu, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TopbarHeaderContentProps {
  greeting: string;
  isAdminPage: boolean;
  isClientPulseRoute: boolean;
  onMenuClick?: () => void;
  onSearchChange?: (term: string) => void;
  searchTerm: string;
  showMobileMenu: boolean;
}

export function TopbarHeaderContent({
  greeting,
  isAdminPage,
  isClientPulseRoute,
  onMenuClick,
  onSearchChange,
  searchTerm,
  showMobileMenu,
}: TopbarHeaderContentProps) {
  return (
    <div className="flex items-center gap-6">
      {showMobileMenu ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuClick}
                className="rounded-lg text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-slate-900 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Menú</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}

      {isAdminPage || isClientPulseRoute ? (
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              {greeting}
            </span>
          </h1>
        </div>
      ) : (
        <div className="relative w-full max-w-xs sm:max-w-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Buscar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(event) => onSearchChange?.(event.target.value)}
            className="rounded-lg border-border bg-muted pl-12 text-sm text-foreground transition-all duration-300 placeholder:text-muted-foreground hover:bg-muted/80 focus:border-border focus:ring-2 focus:ring-primary/50 sm:text-base"
          />
        </div>
      )}
    </div>
  );
}
