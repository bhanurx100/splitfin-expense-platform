import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * SpendWise Design System — Badge
 * Dark-mode aware with semantic CSS variable tokens.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-[11px] font-semibold px-2.5 py-0.5 transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--border-brand)]",
        secondary:   "bg-[var(--surface-overlay)] text-[var(--text-secondary)]",
        destructive: "bg-[var(--color-expense-bg)] text-[var(--color-expense)] border border-[var(--color-expense-border)]",
        outline:     "border border-[var(--border-default)] text-[var(--text-secondary)] bg-[var(--surface-card)]",
        /* Finance-specific */
        primary:     "bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--border-brand)]",
        income:      "bg-[var(--color-income-bg)] text-[var(--color-income)] border border-[var(--color-income-border)]",
        expense:     "bg-[var(--color-expense-bg)] text-[var(--color-expense)] border border-[var(--color-expense-border)]",
        warning:     "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
        purple:      "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
        slate:       "bg-[var(--surface-overlay)] text-[var(--text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };