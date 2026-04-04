import { HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpButtonMinimalProps {
  className?: string;
  onOpen: () => void;
}

export function HelpButtonMinimal({
  className,
  onOpen,
}: HelpButtonMinimalProps) {
  return (
    <div className={cn('relative', className)}>
      <Button
        aria-label="Abrir ayuda Pulse"
        variant="ghost"
        size="sm"
        onClick={onOpen}
        title="Abrir ayuda Pulse"
        className="h-9 w-9 rounded-full border border-[var(--signal-border)] bg-[linear-gradient(180deg,rgba(20,28,46,0.98),rgba(15,21,35,0.96))] p-0 text-[var(--signal)] shadow-[0_0_0_1px_rgba(59,158,245,0.12),0_10px_24px_rgba(0,0,0,0.22)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    </div>
  );
}
