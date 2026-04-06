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
  "group pointer-events-auto relative grid w-full grid-cols-[auto_1fr_auto] items-start gap-4 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(11,15,30,0.98)_0%,rgba(26,34,52,0.98)_100%)] px-4 py-4 shadow-[0_18px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl transition-all duration-200 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-3 data-[state=open]:sm:slide-in-from-bottom-3 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,#38BDF8_0%,rgba(167,139,250,0.75)_45%,transparent_100%)]",
  {
    variants: {
      variant: {
        default: "text-slate-50",
        destructive:
          "border-red-500/25 bg-[linear-gradient(135deg,rgba(11,15,30,0.98)_0%,rgba(52,26,34,0.98)_100%)] text-red-50 before:bg-[linear-gradient(90deg,#FB7185_0%,rgba(251,113,133,0.38)_55%,transparent_100%)]",
        success: "border-emerald-400/20 text-emerald-50 before:bg-[linear-gradient(90deg,#22C55E_0%,rgba(34,197,94,0.34)_55%,transparent_100%)]",
        warning: "border-amber-400/20 text-amber-50 before:bg-[linear-gradient(90deg,#F59E0B_0%,rgba(245,158,11,0.34)_55%,transparent_100%)]",
        info: "border-sky-400/20 text-sky-50 before:bg-[linear-gradient(90deg,#38BDF8_0%,rgba(56,189,248,0.34)_55%,transparent_100%)]",
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
      "mt-1 inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 px-3 text-xs font-medium text-slate-100 transition-colors hover:border-sky-400/35 hover:bg-sky-400/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
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
      "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-950/35 text-slate-200 opacity-100 transition-colors hover:border-sky-400/30 hover:bg-sky-400/12 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:ring-offset-0 group-[.destructive]:hover:border-red-400/35 group-[.destructive]:hover:bg-red-400/12",
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
    className={cn("text-sm leading-5 text-slate-300", className)}
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
        "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sky-300",
        variant === "destructive" && "border-red-400/18 bg-red-400/10 text-red-300",
        variant === "success" && "border-emerald-400/18 bg-emerald-400/10 text-emerald-300",
        variant === "warning" && "border-amber-400/18 bg-amber-400/10 text-amber-300",
        variant === "info" && "border-sky-400/18 bg-sky-400/10 text-sky-300",
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
