import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // The shadcn semantic tokens (primary/accent/ring/etc.) are undefined in this
  // app, so each variant uses the explicit GreenEarthX brand-* scale instead.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-gex-sm text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand-700 text-white shadow-gex-sm hover:bg-brand-800 hover:shadow-gex-md active:bg-brand-900",
        destructive: "bg-red-600 text-white shadow-gex-sm hover:bg-red-700 active:bg-red-800",
        outline: "border border-slate-300 bg-white text-slate-700 shadow-gex-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100",
        secondary: "bg-brand-50 text-brand-800 hover:bg-brand-100 active:bg-brand-200",
        ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200",
        link: "text-brand-700 underline-offset-4 hover:underline hover:text-brand-800",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-gex-sm px-3",
        lg: "h-11 rounded-gex-sm px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
