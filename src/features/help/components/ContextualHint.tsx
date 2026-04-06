import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from '@/core/components/OptimizedMotion';
import { Lightbulb } from 'lucide-react';

import type { ContextualHintProps } from '@/features/help/types/contextualHelp.types';
import { cn } from '@/lib/utils';

function getHintPositionClasses(position: string) {
  switch (position) {
    case 'top':
      return 'bottom-full left-1/2 mb-2 -translate-x-1/2 transform';
    case 'bottom':
      return 'top-full left-1/2 mt-2 -translate-x-1/2 transform';
    case 'left':
      return 'right-full top-1/2 mr-2 -translate-y-1/2 transform';
    case 'right':
      return 'left-full top-1/2 ml-2 -translate-y-1/2 transform';
    default:
      return 'bottom-full left-1/2 mb-2 -translate-x-1/2 transform';
  }
}

export function ContextualHint({
  message,
  position = 'top',
  delay = 3000,
  className,
}: ContextualHintProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [delay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={cn('absolute z-40', getHintPositionClasses(position), className)}
        >
          <div className="max-w-xs rounded-lg bg-slate-800 px-3 py-2 text-sm text-white shadow-lg">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span>{message}</span>
            </div>
            <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 transform border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
