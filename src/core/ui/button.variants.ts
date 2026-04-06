import { cn } from '@/core/utils/cn';

import type { ButtonProps } from '@/core/ui/button';

export const buttonVariantStyles = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary shadow-sm hover:shadow-md active:scale-95",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary shadow-sm hover:shadow-md active:scale-95",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary shadow-sm hover:shadow-md active:scale-95",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive shadow-sm hover:shadow-md active:scale-95",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring shadow-sm hover:shadow-md active:scale-95",
  ghost: "hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring active:scale-95",
  link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary"
} as const;

export const buttonSizeStyles = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
  xl: "h-14 px-8 text-xl"
} as const;

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
} = {}) {
  return cn(buttonVariantStyles[variant], buttonSizeStyles[size], className);
}

export const buttonSizes = buttonSizeStyles;
