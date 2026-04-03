import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PulseLogo from '@/core/components/PulseLogo';

interface AdminSidebarFooterProps {
  onLogout: () => void;
}

export function AdminSidebarFooter({ onLogout }: AdminSidebarFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="border-t border-sidebar-border bg-sidebar-background px-4 py-4 dark:border-slate-700">
      <Button
        onClick={onLogout}
        variant="ghost"
        className="group flex w-full items-center justify-center space-x-3 rounded-xl px-3 py-3 text-sidebar-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive dark:text-slate-200 dark:hover:bg-destructive/20 dark:hover:text-red-400"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <LogOut size={18} />
            </TooltipTrigger>
            <TooltipContent>{t('Salir')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span>{t('Cerrar Sesión')}</span>
      </Button>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-sidebar-foreground/70 dark:text-slate-400">
        <PulseLogo size={16} variant="night" />
        <div>
          <span>Pulse by </span>
          <span className="brand-gradient-text">TuWebAI</span>
        </div>
      </div>
    </div>
  );
}
