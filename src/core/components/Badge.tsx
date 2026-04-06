import type { ReactNode } from 'react';
import { cn } from '@/core/utils/cn';

export interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'signal' | 'default';
  children: ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantClassMap: Record<BadgeProps['variant'], string> = {
  success: 'bg-[var(--success-dim)] text-[var(--success)]',
  warning: 'bg-[var(--warning-dim)] text-[var(--warning)]',
  danger: 'bg-[var(--danger-dim)] text-[var(--danger)]',
  signal: 'bg-[var(--signal-glow)] text-[var(--signal)]',
  default: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
};

const sizeClassMap: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-[12px]'
};

export default function Badge({ variant, children, size = 'md', dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantClassMap[variant],
        sizeClassMap[size]
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
