import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';
import './button.css';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,140,66,0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'gradient-button',
        destructive: 'bg-[linear-gradient(90deg,#d93b16,#ff5a36)] text-white border border-[rgba(255,120,50,0.18)] hover:brightness-110',
        outline: 'border border-[rgba(255,120,50,0.2)] bg-[rgba(255,255,255,0.02)] text-[#ededed] hover:bg-[rgba(255,80,0,0.08)] hover:text-white',
        secondary: 'gradient-button-secondary',
        ghost: 'bg-transparent text-[rgba(237,237,237,0.82)] hover:bg-[rgba(255,80,0,0.08)] hover:text-white',
        link: 'text-[#FF8C42] underline-offset-4 hover:underline',
        gradient: 'gradient-primary',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-12 rounded-xl px-8',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
