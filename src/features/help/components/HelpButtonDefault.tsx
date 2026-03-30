import { HelpCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpButtonDefaultProps {
  className?: string;
  isMobile: boolean;
  onOpen: () => void;
  showBadge: boolean;
  tutorialsCount: number;
}

export function HelpButtonDefault({
  className,
  isMobile,
  onOpen,
  showBadge,
  tutorialsCount,
}: HelpButtonDefaultProps) {
  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={onOpen}
        className={cn(
          'relative bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400',
          isMobile ? 'h-9 px-3 text-sm' : 'h-10 px-4',
        )}
      >
        <HelpCircle className={cn('mr-2', isMobile ? 'w-3 h-3' : 'w-4 h-4')} />
        <span className={isMobile ? 'hidden sm:inline' : 'inline'}>Ayuda</span>

        {showBadge && tutorialsCount > 0 && (
          <Badge
            variant="destructive"
            className={cn(
              'absolute p-0 flex items-center justify-center text-xs',
              isMobile ? '-top-1 -right-1 h-4 w-4' : '-top-2 -right-2 h-5 w-5',
            )}
          >
            {tutorialsCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}
