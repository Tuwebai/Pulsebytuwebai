import { useState } from 'react';

import { motion } from '@/components/OptimizedMotion';
import { Button } from '@/components/ui/button';
import { HelpButtonQuickMenu } from './HelpButtonQuickMenu';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

interface HelpButtonFloatingProps {
  className?: string;
  completedFlows: string[];
  isMobile: boolean;
  onOpen: () => void;
  onStartTutorial: (flowId: string) => void;
}

export function HelpButtonFloating({
  className,
  completedFlows,
  isMobile,
  onOpen,
  onStartTutorial,
}: HelpButtonFloatingProps) {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  return (
    <div
      className={cn(
        'fixed z-50',
        isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6',
        className,
      )}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        whileHover={{ scale: isMobile ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <Button
            onClick={() => setShowQuickMenu((currentValue) => !currentValue)}
            className={cn(
              'rounded-full bg-gradient-to-br from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white shadow-2xl',
              'ring-2 ring-blue-200 ring-opacity-50 hover:ring-opacity-75',
              'transition-all duration-200 hover:scale-105',
              isMobile ? 'h-12 w-12' : 'h-14 w-14',
            )}
          >
            <HelpCircle className={cn(isMobile ? 'w-5 h-5' : 'w-6 h-6')} />
          </Button>
          {showQuickMenu && (
            <HelpButtonQuickMenu
              completedFlows={completedFlows}
              isMobile={isMobile}
              onOpen={onOpen}
              onStartTutorial={onStartTutorial}
              onToggleMenu={setShowQuickMenu}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
