import type { CSSProperties } from 'react';
import { cn } from '@/core/utils/cn';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundedClassMap: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  sm: 'rounded-[6px]',
  md: 'rounded-[10px]',
  lg: 'rounded-[14px]',
  full: 'rounded-full'
};

export default function Skeleton({
  width = '100%',
  height = '1rem',
  className,
  rounded = 'md'
}: SkeletonProps) {
  const style: CSSProperties = {
    width,
    height
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-[shimmer_1.5s_linear_infinite] bg-[length:200%_auto] bg-[linear-gradient(90deg,var(--bg-elevated),var(--bg-subtle),var(--bg-elevated))]',
        roundedClassMap[rounded],
        className
      )}
      style={style}
    />
  );
}
