import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

/**
 * SpendWise Design System — Badge v3
 * Semantic financial badges with proper dark mode and hierarchy.
 */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1 rounded-full",
    "text-[11px] font-semibold px-2.5 py-[3px]",
    "border transition-colors duration-150",
    "tracking-[0.015em]",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Info / Brand — default */
        default: [
          "bg-[var(--color-info-bg)] text-[var(--color-info)]",
          "border-[var(--color-info-border)]",
        ].join(" "),

        /* Income / Success */
        primary: [
          "bg-[var(--color-income-bg)] text-[var(--color-income)]",
          "border-[var(--color-income-border)]",
        ].join(" "),

        /* Expense / Danger */
        destructive: [
          "bg-[var(--color-expense-bg)] text-[var(--color-expense)]",
          "border-[var(--color-expense-border)]",
        ].join(" "),

        /* Neutral muted */
        secondary: [
          "bg-[var(--surface-sunken)] text-[var(--text-muted)]",
          "border-[var(--border-subtle)]",
        ].join(" "),

        /* Outlined */
        outline: [
          "bg-transparent text-[var(--text-secondary)]",
          "border-[var(--border-default)]",
        ].join(" "),

        /* Explicit semantic names */
        income: [
          "bg-[var(--color-income-bg)] text-[var(--color-income)]",
          "border-[var(--color-income-border)]",
        ].join(" "),

        expense: [
          "bg-[var(--color-expense-bg)] text-[var(--color-expense)]",
          "border-[var(--color-expense-border)]",
        ].join(" "),

        warning: [
          "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
          "border-[var(--color-warning-border)]",
        ].join(" "),

        info: [
          "bg-[var(--color-info-bg)] text-[var(--color-info)]",
          "border-[var(--color-info-border)]",
        ].join(" "),

        /* Analytics / Purple accent */
        analytics: [
          "bg-[var(--color-analytics-bg)] text-[var(--color-analytics)]",
          "border-[var(--color-analytics-border)]",
        ].join(" "),

        /* SplitPay accent */
        splitpay: [
          "bg-[var(--color-splitpay-bg)] text-[var(--color-splitpay)]",
          "border-[var(--color-splitpay-border)]",
        ].join(" "),

        /* Demo badge (amber) */
        demo: [
          "bg-amber-50 text-amber-700 border-amber-200/60",
          "dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
        ].join(" "),

        /* Purple accent */
        purple: [
          "bg-purple-50 text-purple-700 border-purple-200/60",
          "dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50",
        ].join(" "),

        /* Neutral */
        slate: [
          "bg-slate-100 text-slate-600 border-slate-200/60",
          "dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/50",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };