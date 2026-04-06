import { HelpCircle } from 'lucide-react';

import { Button } from '@/core/ui/button';
import { cn } from '@/core/utils/cn';

interface HelpButtonDefaultProps {
  className?: string;
  isMobile: boolean;
  onOpen: () => void;
}

export function HelpButtonDefault({
  className,
  isMobile,
  onOpen,
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
      </Button>
    </div>
  );
}
