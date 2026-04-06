import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, CheckCircle2, BellRing, Info, X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-6 sm:right-6 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative grid w-full grid-cols-[auto_1fr_auto] items-start gap-4 overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[linear-gradient(180deg,var(--gradient-subtle),var(--bg-surface)_58%)] px-4 py-4 text-[var(--text-primary)] shadow-2xl backdrop-blur-xl transition-all duration-200 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-3 data-[state=open]:sm:slide-in-from-bottom-3 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[var(--gradient-brand)]",
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "border-[var(--danger)]/30 bg-[linear-gradient(180deg,var(--danger-dim),var(--bg-surface)_62%)] before:bg-[linear-gradient(90deg,var(--danger)_0%,transparent_100%)]",
        success: "border-[var(--success)]/30 bg-[linear-gradient(180deg,var(--success-dim),var(--bg-surface)_62%)] before:bg-[linear-gradient(90deg,var(--success)_0%,transparent_100%)]",
        warning: "border-[var(--warning)]/30 bg-[linear-gradient(180deg,var(--warning-dim),var(--bg-surface)_62%)] before:bg-[linear-gradient(90deg,var(--warning)_0%,transparent_100%)]",
        info: "border-[var(--signal)]/30 bg-[linear-gradient(180deg,var(--signal-glow),var(--bg-surface)_62%)] before:bg-[linear-gradient(90deg,var(--signal)_0%,transparent_100%)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "mt-1 inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--signal-border)] hover:bg-[var(--signal-glow)] focus:outline-none focus:ring-2 focus:ring-[var(--signal-glow)] focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] opacity-100 transition-colors hover:border-[var(--signal-border)] hover:bg-[var(--signal-glow)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--signal-glow)] focus:ring-offset-0",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("pr-10 text-sm font-semibold tracking-[-0.01em] text-current", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm leading-5 text-[var(--text-secondary)]", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

const ToastIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof toastVariants>
>(({ className, variant = "default", ...props }, ref) => {
  const Icon =
    variant === "destructive"
      ? AlertTriangle
      : variant === "success"
        ? CheckCircle2
        : variant === "warning"
          ? BellRing
          : variant === "info"
            ? Info
            : BellRing

  return (
    <div
      ref={ref}
      className={cn(
        "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--signal-border)] bg-[var(--signal-glow)] text-[var(--signal)]",
        variant === "destructive" && "border-[var(--danger)]/30 bg-[var(--danger-dim)] text-[var(--danger)]",
        variant === "success" && "border-[var(--success)]/30 bg-[var(--success-dim)] text-[var(--success)]",
        variant === "warning" && "border-[var(--warning)]/30 bg-[var(--warning-dim)] text-[var(--warning)]",
        variant === "info" && "border-[var(--signal)]/30 bg-[var(--signal-glow)] text-[var(--signal)]",
        className
      )}
      {...props}
    >
      <Icon className="h-[18px] w-[18px] stroke-[1.75]" />
    </div>
  )
})
ToastIcon.displayName = "ToastIcon"

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
}
