import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

/**
 * SpendWise Design System — Button
 * Dark-mode aware, premium fintech style.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap font-semibold border",
    "transition-all duration-150 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-card)]",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.97]",
    "letter-spacing-[-0.01em]",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Primary — blue CTA */
        default: [
          "bg-blue-600 text-white border-transparent",
          "hover:bg-blue-700 hover:shadow-[0_4px_14px_rgb(37,99,235,0.28)]",
          "dark:bg-blue-500 dark:hover:bg-blue-600",
          "shadow-[var(--shadow-sm)]",
        ].join(" "),

        /* Destructive */
        destructive: [
          "bg-[var(--color-expense-bg)] text-[var(--color-expense)] border-[var(--color-expense-border)]",
          "hover:opacity-80",
        ].join(" "),

        /* Outlined secondary */
        outline: [
          "bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--border-default)]",
          "hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]",
          "shadow-[var(--shadow-xs)]",
        ].join(" "),

        /* Subtle secondary */
        secondary: [
          "bg-[var(--surface-overlay)] text-[var(--text-secondary)] border-transparent",
          "hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
        ].join(" "),

        /* Ghost */
        ghost: [
          "bg-transparent text-[var(--text-secondary)] border-transparent",
          "hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
        ].join(" "),

        /* Text link */
        link: [
          "bg-transparent text-[var(--text-brand)] border-transparent underline-offset-4",
          "hover:underline",
          "shadow-none",
          "active:scale-100",
        ].join(" "),

        /* Success */
        success: [
          "bg-emerald-600 text-white border-transparent",
          "hover:bg-emerald-700",
          "dark:bg-emerald-500 dark:hover:bg-emerald-600",
          "shadow-[var(--shadow-sm)]",
        ].join(" "),
      },

      size: {
        xs: "h-7  px-2.5 text-xs    rounded-lg",
        sm: "h-8  px-3   text-xs    rounded-[10px]",
        default: "h-9  px-4   text-[13px] rounded-xl",
        lg: "h-11 px-6   text-[15px] rounded-xl",
        icon: "h-9  w-9    text-sm    rounded-xl",
        "icon-sm": "h-7 w-7  text-xs   rounded-lg",
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