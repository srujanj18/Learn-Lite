import { cn } from '@/lib/utils';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import React from 'react';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn('fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]', className)}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-[20px] border p-5 pr-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      variant: {
        default: 'border-[rgba(255,120,50,0.2)] bg-[#111111] text-[#EDEDED]',
        destructive: 'border-[rgba(255,90,54,0.4)] bg-[#1a0d09] text-[#EDEDED]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => (
  <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn('inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-[rgba(255,120,50,0.18)] bg-transparent px-3 text-sm font-medium transition hover:bg-[rgba(255,80,0,0.08)]', className)}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn('absolute right-2 top-2 rounded-md p-1 text-[rgba(237,237,237,0.5)] opacity-0 transition-opacity hover:text-[#FF8C42] focus:opacity-100 focus:outline-none group-hover:opacity-100', className)}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold text-white', className)} {...props} />);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => <ToastPrimitives.Description ref={ref} className={cn('text-sm text-[rgba(237,237,237,0.72)]', className)} {...props} />);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport };
