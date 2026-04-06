import { useEffect, useState } from 'react';

export function useResponsiveTutorial() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'landscape',
  );

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setOrientation(width > height ? 'landscape' : 'portrait');
      setScreenSize({ width, height });
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    orientation,
    screenSize,
  };
}
