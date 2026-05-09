import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SpendWise Design System — Card
 * Replaces the default shadcn card with cohesive fintech variants.
 */

// ── Base Card ─────────────────────────────────────────────────────────────────

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-[18px] border border-slate-100 shadow-sm",
        "transition-all duration-200 hover:shadow-md hover:border-slate-200",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1 p-5 lg:p-6 pb-0", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-[15px] font-semibold leading-tight tracking-tight text-slate-900", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xs text-slate-400 mt-0.5", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 lg:p-6 pt-4", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 p-5 lg:p-6 pt-0 border-t border-slate-50 mt-2",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

// ── Stat Card — for metrics ────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  iconBg?: string;
  delta?: { value: string; positive: boolean };
  className?: string;
}

function StatCard({ label, value, icon, iconBg = "bg-blue-50", delta, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-[18px] border border-slate-100 shadow-sm p-5 lg:p-6",
      "transition-all duration-200 hover:shadow-md hover:border-slate-200 slide-up",
      className
    )}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        {icon && (
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl text-sm", iconBg)}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {delta && (
        <div className="mt-2 flex items-center gap-1">
          <span className={cn(
            "text-xs font-semibold",
            delta.positive ? "text-emerald-600" : "text-red-500"
          )}>
            {delta.positive ? "↑" : "↓"} {delta.value}
          </span>
          <span className="text-xs text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
}

// ── Section Card — for content sections ───────────────────────────────────────

interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}

function SectionCard({ title, action, noPadding, children, className, ...props }: SectionCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-[18px] border border-slate-100 shadow-sm",
        "transition-all duration-200 hover:shadow-md hover:border-slate-200",
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4 lg:px-6">
          {title && <h3 className="text-[15px] font-semibold text-slate-800">{title}</h3>}
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-5 lg:p-6"}>
        {children}
      </div>
    </div>
  );
}

// ── Empty State Card ──────────────────────────────────────────────────────────

interface EmptyCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyCard({ icon, title, description, action, className }: EmptyCardProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 text-center",
      className
    )}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
        {icon}
      </div>
      <p className="mb-1 text-sm font-semibold text-slate-600">{title}</p>
      {description && (
        <p className="mb-5 max-w-[220px] text-xs leading-relaxed text-slate-400">{description}</p>
      )}
      {action}
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  SectionCard,
  EmptyCard,
};