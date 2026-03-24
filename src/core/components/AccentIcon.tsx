import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const toneClassMap = {
  signal:
    'border-[color:var(--signal-glow)] bg-[color:color-mix(in_srgb,var(--signal)_18%,transparent)] text-[var(--signal)] shadow-[0_0_0_1px_var(--signal-glow),0_8px_24px_color-mix(in_srgb,var(--signal)_18%,transparent)]',
  success:
    'border-[color:var(--success-dim)] bg-[color:color-mix(in_srgb,var(--success)_18%,transparent)] text-[var(--success)] shadow-[0_0_0_1px_var(--success-dim),0_8px_24px_color-mix(in_srgb,var(--success)_18%,transparent)]',
  danger:
    'border-[color:var(--danger-dim)] bg-[color:color-mix(in_srgb,var(--danger)_18%,transparent)] text-[var(--danger)] shadow-[0_0_0_1px_var(--danger-dim),0_8px_24px_color-mix(in_srgb,var(--danger)_18%,transparent)]',
  warning:
    'border-[color:var(--warning-dim)] bg-[color:color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)] shadow-[0_0_0_1px_var(--warning-dim),0_8px_24px_color-mix(in_srgb,var(--warning)_18%,transparent)]',
  default:
    'border-[color:var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-subtle),0_8px_24px_rgba(0,0,0,0.18)]',
} as const;

const sizeClassMap = {
  sm: 'h-10 w-10',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
} as const;

export interface AccentIconProps {
  children: ReactNode;
  tone?: keyof typeof toneClassMap;
  size?: keyof typeof sizeClassMap;
  className?: string;
}

export default function AccentIcon({
  children,
  tone = 'signal',
  size = 'sm',
  className,
}: AccentIconProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border backdrop-blur-sm',
        sizeClassMap[size],
        toneClassMap[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
