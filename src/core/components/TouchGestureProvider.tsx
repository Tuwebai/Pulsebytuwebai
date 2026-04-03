import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTouchGestures } from '@/core/hooks/useTouchGestures';

interface TouchGestureProviderProps {
  children: React.ReactNode;
  enableGlobalGestures?: boolean;
}

export default function TouchGestureProvider({
  children,
  enableGlobalGestures = true,
}: TouchGestureProviderProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const globalGestures = useTouchGestures({
    onSwipeLeft: () => {
      if (window.history.length > 1) {
        window.history.back();
      }
    },
    onSwipeRight: () => {
      if (window.history.length > 1) {
        window.history.forward();
      }
    },
    onDoubleTap: () => navigate('/'),
    threshold: 50,
  });

  useEffect(() => {
    if (!containerRef.current || !enableGlobalGestures) {
      return;
    }

    return globalGestures.attachGestures(containerRef.current);
  }, [enableGlobalGestures, globalGestures]);

  return (
    <div
      ref={containerRef}
      className="touch-gesture-provider"
      style={{
        touchAction: 'pan-x pan-y',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
}
