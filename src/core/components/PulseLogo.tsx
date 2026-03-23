import React, { useId } from 'react';

type PulseLogoVariant = 'day' | 'night' | 'signal';

interface PulseLogoProps {
  size?: number;
  variant?: PulseLogoVariant;
  animated?: boolean;
  className?: string;
}

const variantColorMap: Record<PulseLogoVariant, string> = {
  day: '#0B0F1E',
  night: '#FFFFFF',
  signal: '#3B9EF5',
};

export function PulseLogo({
  size = 32,
  variant = 'night',
  animated = false,
  className = '',
}: PulseLogoProps) {
  const clipPathId = useId();
  const strokeColor = variantColorMap[variant];
  const ringOpacity = variant === 'night' ? 0.15 : 0.18;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      role="img"
      aria-label="Pulse by TuWebAI"
      width={size}
      height={size}
      className={className}
    >
      <title>Pulse</title>
      <defs>
        <clipPath id={clipPathId}>
          <circle cx="50" cy="50" r="37" />
        </clipPath>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.2"
        opacity={ringOpacity}
      />
      <g clipPath={`url(#${clipPathId})`}>
        <path
          d="M12 50 L26 50 L34 26 L44 74 L52 38 L60 50 L88 50"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <circle
        cx="60"
        cy="50"
        r="2.5"
        fill="#3B9EF5"
        className={animated ? 'pulse-logo-dot' : undefined}
      />
    </svg>
  );
}

export default PulseLogo;
