import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from '@/core/components/OptimizedMotion';
import { useHelpCenterState } from '@/features/help/hooks/useHelpCenterState';
import type { HelpArticle } from '@/features/help/types/helpContent.types';
import type { ContextualHelpProps } from '@/features/help/types/contextualHelp.types';
import {
  getContextualHelpArrowClasses,
  getContextualHelpPositionClasses,
} from '@/features/help/utils/contextualHelp.utils';
import { HelpCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

import { ContextualHelpCard } from './ContextualHelpCard';
import { ContextualHint } from './ContextualHint';
import { FloatingHelpButton } from './FloatingHelpButton';
import HelpCenter from './HelpCenter';

export default function ContextualHelp({
  context,
  position = 'top',
  trigger = 'hover',
  className,
}: ContextualHelpProps) {
  const navigate = useNavigate();
  const { getContextualHelp } = useHelpCenterState();
  const [helpContent, setHelpContent] = useState<HelpArticle[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);

  useEffect(() => {
    setHelpContent(getContextualHelp(context));
  }, [context, getContextualHelp]);

  useEffect(() => {
    if (trigger === 'always') {
      setIsVisible(true);
    }
  }, [trigger]);

  if (helpContent.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={cn('relative inline-block', className)}
        onClick={() => {
          if (trigger === 'click') {
            setIsVisible((currentValue) => !currentValue);
          }
        }}
        onMouseEnter={() => {
          if (trigger === 'hover') {
            setIsVisible(true);
          }
        }}
        onMouseLeave={() => {
          if (trigger === 'hover' && !isExpanded) {
            setIsVisible(false);
          }
        }}
      >
        <div className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-blue-100 transition-colors hover:bg-blue-200">
          <HelpCircle className="h-4 w-4 text-blue-600" />
        </div>

        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.3 }}
              className={cn('absolute z-50 w-80', getContextualHelpPositionClasses(position))}
              onMouseEnter={() => setIsExpanded(true)}
              onMouseLeave={() => {
                setIsExpanded(false);
                if (trigger === 'hover') {
                  setIsVisible(false);
                }
              }}
            >
              <div className={cn('absolute h-0 w-0 border-4', getContextualHelpArrowClasses(position))} />
              <ContextualHelpCard
                helpContent={helpContent}
                isExpanded={isExpanded}
                onClose={() => setIsVisible(false)}
                onExpand={() => setIsExpanded((currentValue) => !currentValue)}
                onOpenHelpCenter={() => setIsHelpCenterOpen(true)}
                onOpenSupport={() => navigate('/dashboard/soporte')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <HelpCenter isOpen={isHelpCenterOpen} onClose={() => setIsHelpCenterOpen(false)} />
    </>
  );
}

export { ContextualHint, FloatingHelpButton };
