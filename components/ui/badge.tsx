import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * SpendWise Design System — Badge
 * Used for amounts, status tags, and category labels.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-[11px] font-semibold px-2.5 py-0.5 transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-blue-50 text-blue-700 border border-blue-100",
        secondary:   "bg-slate-100 text-slate-600",
        destructive: "bg-red-50 text-red-600 border border-red-100",
        outline:     "border border-slate-200 text-slate-600 bg-white",
        /* Finance-specific */
        primary:     "bg-blue-50 text-blue-700 border border-blue-100",
        income:      "bg-emerald-50 text-emerald-700 border border-emerald-100",
        expense:     "bg-red-50 text-red-600 border border-red-100",
        warning:     "bg-amber-50 text-amber-700 border border-amber-100",
        purple:      "bg-purple-50 text-purple-700 border border-purple-100",
        slate:       "bg-slate-100 text-slate-600",
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