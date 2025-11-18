"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: 
          "border-gray-200/60 bg-white/90 text-gray-900 shadow-xl backdrop-blur-md",
        success: 
          "border-green-200/60 bg-green-50/90 text-green-900 shadow-green-200/50 backdrop-blur-md",
        error: 
          "border-red-200/60 bg-red-50/90 text-red-900 shadow-red-200/50 backdrop-blur-md",
        warning: 
          "border-yellow-200/60 bg-yellow-50/90 text-yellow-900 shadow-yellow-200/50 backdrop-blur-md",
        info: 
          "border-blue-200/60 bg-blue-50/90 text-blue-900 shadow-blue-200/50 backdrop-blur-md",
        loading:
          "border-gray-200/60 bg-white/90 text-gray-900 shadow-xl backdrop-blur-md",
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
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border bg-transparent px-3 text-sm font-medium ring-offset-background transition-all duration-200 hover:bg-gray-100 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive group-[.success]:border-green-300 group-[.success]:hover:bg-green-100 group-[.success]:hover:text-green-700 group-[.success]:focus:ring-green-400 group-[.error]:border-red-300 group-[.error]:hover:bg-red-100 group-[.error]:hover:text-red-700 group-[.error]:focus:ring-red-400 group-[.warning]:border-yellow-300 group-[.warning]:hover:bg-yellow-100 group-[.warning]:hover:text-yellow-700 group-[.warning]:focus:ring-yellow-400 group-[.info]:border-blue-300 group-[.info]:hover:bg-blue-100 group-[.info]:hover:text-blue-700 group-[.info]:focus:ring-blue-400",
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
      "absolute right-2 top-2 rounded-md p-1 text-gray-400/70 opacity-0 transition-all duration-200 hover:text-gray-600 hover:bg-gray-100/50 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 group-hover:opacity-100 group-[.destructive]:text-red-400 group-[.destructive]:hover:text-red-600 group-[.destructive]:hover:bg-red-100/50 group-[.destructive]:focus:ring-red-400 group-[.success]:text-green-600 group-[.success]:hover:text-green-700 group-[.success]:hover:bg-green-100/50 group-[.success]:focus:ring-green-400 group-[.error]:text-red-600 group-[.error]:hover:text-red-700 group-[.error]:hover:bg-red-100/50 group-[.error]:focus:ring-red-400 group-[.warning]:text-yellow-600 group-[.warning]:hover:text-yellow-700 group-[.warning]:hover:bg-yellow-100/50 group-[.warning]:focus:ring-yellow-400 group-[.info]:text-blue-600 group-[.info]:hover:text-blue-700 group-[.info]:hover:bg-blue-100/50 group-[.info]:focus:ring-blue-400",
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
    className={cn("text-sm font-semibold leading-none tracking-tight", className)}
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
    className={cn("text-sm opacity-80 leading-relaxed", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Toast Icons
const ToastIcon = ({ variant }: { variant: VariantProps<typeof toastVariants>["variant"] }) => {
  const iconClass = "h-5 w-5 flex-shrink-0"
  
  switch (variant) {
    case "success":
      return <CheckCircle className={cn(iconClass, "text-green-600")} />
    case "error":
      return <XCircle className={cn(iconClass, "text-red-600")} />
    case "warning":
      return <AlertCircle className={cn(iconClass, "text-yellow-600")} />
    case "info":
      return <Info className={cn(iconClass, "text-blue-600")} />
    case "loading":
      return <Loader2 className={cn(iconClass, "text-gray-600 animate-spin")} />
    default:
      return <Info className={cn(iconClass, "text-gray-600")} />
  }
}

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