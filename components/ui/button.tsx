import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * SpendWise Design System — Button
 * Replaces the default shadcn button with a cohesive fintech style.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap font-semibold border",
    "transition-all duration-150 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Primary — blue CTA */
        default: [
          "bg-blue-600 text-white border-transparent",
          "hover:bg-blue-700 hover:shadow-[0_4px_14px_rgb(37,99,235,0.28)]",
          "shadow-sm",
        ].join(" "),

        /* Destructive */
        destructive: [
          "bg-red-50 text-red-600 border-red-200",
          "hover:bg-red-100 hover:border-red-300",
        ].join(" "),

        /* Outlined secondary */
        outline: [
          "bg-white text-slate-700 border-slate-200",
          "hover:bg-slate-50 hover:border-slate-300",
          "shadow-sm",
        ].join(" "),

        /* Subtle secondary */
        secondary: [
          "bg-slate-100 text-slate-700 border-transparent",
          "hover:bg-slate-200",
        ].join(" "),

        /* Ghost */
        ghost: [
          "bg-transparent text-slate-600 border-transparent",
          "hover:bg-slate-100 hover:text-slate-900",
        ].join(" "),

        /* Text link */
        link: [
          "bg-transparent text-blue-600 border-transparent underline-offset-4",
          "hover:underline hover:text-blue-700",
          "shadow-none",
          "active:scale-100",
        ].join(" "),

        /* Success */
        success: [
          "bg-emerald-600 text-white border-transparent",
          "hover:bg-emerald-700 shadow-sm",
        ].join(" "),
      },

      size: {
        xs:   "h-7  px-2.5 text-xs   rounded-lg",
        sm:   "h-8  px-3   text-xs   rounded-[10px]",
        default: "h-9  px-4   text-[13px] rounded-xl",
        lg:   "h-11 px-6   text-[15px] rounded-xl",
        icon: "h-9  w-9    text-sm  rounded-xl",
        "icon-sm": "h-7 w-7 text-xs rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };