import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

const buttonVariantStyles = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary shadow-sm hover:shadow-md active:scale-95",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary shadow-sm hover:shadow-md active:scale-95",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary shadow-sm hover:shadow-md active:scale-95",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive shadow-sm hover:shadow-md active:scale-95",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring shadow-sm hover:shadow-md active:scale-95",
  ghost: "hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring active:scale-95",
  link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary"
} as const;

const buttonSizeStyles = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
  xl: "h-14 px-8 text-xl"
} as const;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    asChild = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const prefersReducedMotion = useReducedMotionPreference();
    const Comp = asChild ? Slot : 'button';
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden";
    
    const widthStyles = fullWidth ? "w-full" : "";

    return (
      <Comp
        className={cn(
          baseStyles,
          buttonVariantStyles[variant],
          buttonSizeStyles[size],
          widthStyles,
          prefersReducedMotion && "transition-none active:scale-100",
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        
        {/* Content */}
        <div className={cn("flex items-center gap-2", loading && "opacity-0")}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </div>

        {/* Ripple Effect */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-lg">
          <div
            className={cn(
              "absolute inset-0 bg-white/20 scale-0 transition-transform duration-300 group-hover:scale-100",
              prefersReducedMotion && "hidden",
            )}
          />
        </div>
      </Comp>
    );
  }
);

Button.displayName = "Button";

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

export { Button };
