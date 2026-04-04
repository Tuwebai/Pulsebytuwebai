import { useState } from 'react';
import { PRODUCT_TOUR_CLOSE_EVENT } from '@/features/product-tour/services/productTour.service';

import HelpCenter from '@/features/help/components/HelpCenter';
import { useHelpCenterState } from '@/features/help/hooks/useHelpCenterState';
import { useResponsiveHelpButton } from '@/features/help/hooks/useResponsiveHelpButton';
import type { HelpButtonProps } from '@/features/help/types/help.types';

import { HelpButtonDefault } from './HelpButtonDefault';
import { HelpButtonFloating } from './HelpButtonFloating';
import { HelpButtonMinimal } from './HelpButtonMinimal';
import { HelpSettings } from './HelpSettings';

export default function HelpButton({
  variant = 'default',
  className,
}: HelpButtonProps) {
  const { isMobile } = useResponsiveHelpButton();
  const { completedFlows, startTutorial } = useHelpCenterState();
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const openHelpCenter = () => {
    window.dispatchEvent(new CustomEvent(PRODUCT_TOUR_CLOSE_EVENT));
    setIsHelpCenterOpen(true);
  };

  return (
    <>
      {variant === 'minimal' ? (
        <HelpButtonMinimal
          className={className}
          onOpen={openHelpCenter}
        />
      ) : null}

      {variant === 'floating' ? (
        <HelpButtonFloating
          className={className}
          completedFlows={completedFlows}
          isMobile={isMobile}
          onOpen={openHelpCenter}
          onStartTutorial={startTutorial}
        />
      ) : null}

      {variant === 'default' ? (
        <HelpButtonDefault
          className={className}
          isMobile={isMobile}
          onOpen={openHelpCenter}
        />
      ) : null}

      <HelpCenter isOpen={isHelpCenterOpen} onClose={() => setIsHelpCenterOpen(false)} />
    </>
  );
}

export { HelpSettings };
