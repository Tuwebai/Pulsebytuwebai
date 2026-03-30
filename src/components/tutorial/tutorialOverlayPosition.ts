import { getRouteAwareOverlayPosition } from '@/components/tutorial/tutorialOverlayRouteConfig';

interface TooltipPositionParams {
  currentPosition: 'top' | 'bottom' | 'left' | 'right' | 'center';
  isMobile: boolean;
  isTablet: boolean;
  pathname: string;
  screenSize: { width: number; height: number };
  targetElement: HTMLElement | null;
}

export function getTutorialTooltipPosition({
  currentPosition,
  isMobile,
  isTablet,
  pathname,
  screenSize,
  targetElement,
}: TooltipPositionParams) {
  const getTooltipSize = () => {
    if (isMobile) {
      return { width: Math.min(320, screenSize.width - 20), height: Math.min(400, screenSize.height - 20) };
    }

    if (isTablet) {
      return { width: Math.min(400, screenSize.width - 40), height: Math.min(500, screenSize.height - 40) };
    }

    return { width: Math.min(480, screenSize.width - 60), height: Math.min(600, screenSize.height - 60) };
  };

  const { width: tooltipWidth, height: tooltipHeight } = getTooltipSize();

  if (isMobile || isTablet) {
    return {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${tooltipWidth}px`,
      maxWidth: `${Math.min(tooltipWidth, screenSize.width - 40)}px`,
      maxHeight: `${Math.min(tooltipHeight, screenSize.height - 40)}px`,
    };
  }

  const routeAwarePosition = getRouteAwareOverlayPosition({
    pathname,
    screenHeight: screenSize.height,
    screenWidth: screenSize.width,
    tooltipHeight,
  });

  if (routeAwarePosition) {
    return routeAwarePosition;
  }

  if (currentPosition === 'center' || !targetElement) {
    return {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${tooltipWidth}px`,
      maxHeight: `${tooltipHeight}px`,
    };
  }

  const rect = targetElement.getBoundingClientRect();
  const padding = 30;
  const viewportPadding = 20;

  let left = rect.right + padding;
  let top = rect.top;

  switch (currentPosition) {
    case 'top':
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      top = rect.top - tooltipHeight - padding;
      break;
    case 'bottom':
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      top = rect.bottom + padding;
      break;
    case 'left':
      left = rect.left - tooltipWidth - padding;
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      break;
    case 'right':
      left = rect.right + padding;
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      break;
  }

  if (left < viewportPadding) left = viewportPadding;
  if (left + tooltipWidth > screenSize.width - viewportPadding) {
    left = screenSize.width - tooltipWidth - viewportPadding;
  }
  if (top < viewportPadding) top = viewportPadding;
  if (top + tooltipHeight > screenSize.height - viewportPadding) {
    top = screenSize.height - tooltipHeight - viewportPadding;
  }

  if (
    left < viewportPadding ||
    top < viewportPadding ||
    left + tooltipWidth > screenSize.width - viewportPadding ||
    top + tooltipHeight > screenSize.height - viewportPadding
  ) {
    return {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${tooltipWidth}px`,
      maxHeight: `${tooltipHeight}px`,
    };
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${tooltipWidth}px`,
    maxHeight: `${tooltipHeight}px`,
  };
}
