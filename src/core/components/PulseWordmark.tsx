import type { ReactNode } from 'react';

interface PulseWordmarkProps {
  className?: string;
  tuWebAIClassName?: string;
  pulseClassName?: string;
  children?: ReactNode;
}

export default function PulseWordmark({
  className,
  tuWebAIClassName,
  pulseClassName,
  children,
}: PulseWordmarkProps) {
  return (
    <span className={className}>
      <span className={pulseClassName}>Pulse by </span>
      <span className={['brand-gradient-text', tuWebAIClassName].filter(Boolean).join(' ')}>TuWebAI</span>
      {children}
    </span>
  );
}
