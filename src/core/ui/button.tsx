import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';
import { buttonSizeStyles, buttonVariantStyles } from '@/core/ui/button.variants';
import { cn } from '@/core/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

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
    const baseStyles = "relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";
    
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

export { Button };
