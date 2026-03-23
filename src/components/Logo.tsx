import React from 'react';
import PulseLogo from '@/core/components/PulseLogo';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  glow?: boolean;
}

export default function Logo({ size = 'md', showText = true, className = '', glow = true }: LogoProps) {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <PulseLogo
        size={sizeClasses[size]}
        variant={theme === 'light' ? 'day' : 'night'}
        animated={glow}
        className="shrink-0"
      />
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold ${theme === 'light' ? 'text-foreground' : 'text-white'} ${textSizes[size]}`}>
            Pulse
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            by TuWebAI
          </span>
        </div>
      )}
    </div>
  );
} 
