import * as React from "react";
import { cn } from "@/src/lib/utils";

/**
 * SpendWise Design System — Card v3
 * Layered elevation system with semantic intent.
 */

/* ── Base Card ────────────────────────────────────────────────────────────── */

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        /* Surface */
        "bg-[var(--surface-2)]",
        /* Border — subtle in light, more defined in dark */
        "border border-[var(--border-default)]",
        /* Shape */
        "rounded-[1.125rem]",
        /* Elevation */
        "shadow-[var(--shadow-card)]",
        /* Interaction */
        "transition-all duration-200",
        "hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)]",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/* ── Card Header ──────────────────────────────────────────────────────────── */

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1",
        "p-5 pb-0 lg:p-6 lg:pb-0",
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-[15px] font-semibold leading-tight tracking-tight",
        "text-[var(--text-primary)]",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-4 lg:p-6 lg:pt-4", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3",
        "p-5 pt-0 lg:p-6 lg:pt-0",
        "border-t border-[var(--border-subtle)] mt-2 pt-4",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

/* ── Stat Card — for financial KPI metrics ──────────────────────────────── */

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  iconBg?: string;
  delta?: { value: string; positive: boolean };
  accent?: "income" | "expense" | "info" | "analytics" | "neutral";
  className?: string;
}

function StatCard({ label, value, icon, iconBg, delta, accent = "neutral", className }: StatCardProps) {
  const accentMap = {
    income: "hover:border-[var(--color-income-border)] hover:shadow-[var(--shadow-income)]",
    expense: "hover:border-[var(--color-expense-border)] hover:shadow-[var(--shadow-expense)]",
    info: "hover:border-[var(--color-info-border)] hover:shadow-[var(--shadow-brand)]",
    analytics: "hover:border-[var(--color-analytics-border)]",
    neutral: "hover:border-[var(--border-strong)]",
  };

  const deltaColorClass = delta?.positive
    ? "text-[var(--color-income)]"
    : "text-[var(--color-expense)]";

  return (
    <div
      className={cn(
        "bg-[var(--surface-2)] rounded-[1.125rem]",
        "border border-[var(--border-default)]",
        "shadow-[var(--shadow-card)] p-5",
        "transition-all duration-200 cursor-default",
        "hover:shadow-[var(--shadow-md)] hover:-translate-y-px",
        accentMap[accent],
        "slide-up",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
          {label}
        </p>
        {icon && (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl text-sm",
              iconBg ?? "bg-[var(--surface-sunken)]"
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums">
        {value}
      </p>
      {delta && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={cn("text-[11px] font-semibold", deltaColorClass)}>
            {delta.positive ? "↑" : "↓"} {delta.value}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">vs last period</span>
        </div>
      )}
    </div>
  );
}

/* ── Section Card — for grouped content panels ──────────────────────────── */

interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
  /** Visual accent on left edge */
  accent?: "none" | "income" | "expense" | "info" | "analytics";
}

function SectionCard({
  title,
  action,
  subtitle,
  noPadding,
  accent = "none",
  children,
  className,
  ...props
}: SectionCardProps) {
  const accentClasses = {
    none: "",
    income: "border-l-[3px] border-l-[var(--color-income)]",
    expense: "border-l-[3px] border-l-[var(--color-expense)]",
    info: "border-l-[3px] border-l-[var(--color-info)]",
    analytics: "border-l-[3px] border-l-[var(--color-analytics)]",
  };

  return (
    <div
      className={cn(
        "bg-[var(--surface-2)] rounded-[1.125rem]",
        "border border-[var(--border-default)]",
        "shadow-[var(--shadow-card)]",
        "transition-all duration-200",
        "hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)]",
        accentClasses[accent],
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div
          className={cn(
            "flex items-center justify-between",
            "border-b border-[var(--border-subtle)]",
            "px-5 py-4 lg:px-6"
          )}
        >
          <div>
            {title && (
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-5 lg:p-6"}>{children}</div>
    </div>
  );
}

/* ── Empty State Card ───────────────────────────────────────────────────── */

interface EmptyCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyCard({ icon, title, description, action, className }: EmptyCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-14 w-14 items-center justify-center",
          "rounded-2xl",
          "bg-[var(--surface-sunken)]",
          "border border-[var(--border-default)]",
          "text-[var(--text-muted)]",
          "shadow-[var(--shadow-xs)]"
        )}
      >
        {icon}
      </div>
      <p className="mb-1 text-sm font-semibold text-[var(--text-secondary)]">{title}</p>
      {description && (
        <p className="mb-5 max-w-[220px] text-xs leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
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