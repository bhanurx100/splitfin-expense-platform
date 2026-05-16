"use client";

/**
 * components/layout/PageShell.tsx
 *
 * Drop-in wrapper for every dashboard page.
 * Handles: max-width, horizontal padding, vertical rhythm, mobile safe area.
 *
 * Usage:
 *   <PageShell>
 *     <PageHeader title="Accounts" subtitle="Manage your financial accounts">
 *       <Button>Add Account</Button>
 *     </PageHeader>
 *     {children}
 *   </PageShell>
 */

import { cn } from "@/lib/utils";
//import { mobilePadding } from "@/lib/layout";

// ─── PageShell ────────────────────────────────────────────────────────────────

type PageShellProps = {
  children: React.ReactNode;
  /** Override width variant */
  width?: "default" | "narrow" | "wide";
  /** Extra class names merged onto the outer container */
  className?: string;
};

export function PageShell({
  children,
  width = "default",
  className,
}: PageShellProps) {
  const widthClasses = {
    default: "mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 lg:py-8 xl:py-10",
    narrow:  "mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8",
    wide:    "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8",
  };

  return (
    <div className={cn(widthClasses[width], className)}>
      {children}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** Right-side actions: buttons, filters, etc. */
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 lg:mb-8",
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm leading-snug text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-shrink-0 items-center gap-2">{children}</div>
      )}
    </div>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

type SectionLabelProps = {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function SectionLabel({ children, action, className }: SectionLabelProps) {
  return (
    <div className={cn("mb-3 flex items-center justify-between", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {children}
      </p>
      {action}
    </div>
  );
}

// ─── ContentCard ──────────────────────────────────────────────────────────────

type ContentCardProps = {
  children: React.ReactNode;
  /** Card header — title + optional action */
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Padding size inside the card */
  padding?: "sm" | "md" | "lg" | "none";
  /** Remove hover shadow lift */
  static?: boolean;
  className?: string;
};

export function ContentCard({
  children,
  title,
  subtitle,
  action,
  padding = "md",
  static: isStatic = false,
  className,
}: ContentCardProps) {
  const padMap = {
    none: "",
    sm:   "p-4 lg:p-5",
    md:   "p-5 lg:p-6",
    lg:   "p-6 lg:p-8",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white shadow-sm",
        !isStatic && "transition-all duration-200 hover:border-slate-200 hover:shadow-md",
        className
      )}
    >
      {(title || action) && (
        <div
          className={cn(
            "flex items-center justify-between",
            padMap[padding],
            "pb-0"
          )}
        >
          <div>
            {title && (
              <h2 className="text-[15px] font-semibold text-slate-800">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={padMap[padding]}>{children}</div>
    </div>
  );
}

// ─── EmptyCard ────────────────────────────────────────────────────────────────

type EmptyCardProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyCard({
  icon,
  title,
  description,
  action,
  className,
}: EmptyCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "rounded-2xl border border-dashed border-slate-200 bg-white",
        "px-8 py-20 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
        {icon}
      </div>
      <p className="mb-1 text-sm font-semibold text-slate-600">{title}</p>
      {description && (
        <p className="mb-5 max-w-[220px] text-xs leading-relaxed text-slate-400">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ─── StatRow ──────────────────────────────────────────────────────────────────

/**
 * Utility: horizontal stat strip (income / expense / remaining).
 * Used inside cards as a secondary metric row.
 */
type StatRowProps = {
  stats: Array<{
    label: string;
    value: React.ReactNode;
    color?: "default" | "green" | "red" | "blue";
  }>;
  className?: string;
};

export function StatRow({ stats, className }: StatRowProps) {
  const colorMap = {
    default: "text-slate-800",
    green:   "text-emerald-600",
    red:     "text-red-500",
    blue:    "text-blue-600",
  };

  return (
    <div className={cn("flex items-center gap-4 divide-x divide-slate-100", className)}>
      {stats.map((s, i) => (
        <div key={i} className={cn("flex flex-col", i > 0 && "pl-4")}>
          <span className="text-[11px] text-slate-400">{s.label}</span>
          <span
            className={cn(
              "text-[13px] font-bold tabular-nums",
              colorMap[s.color ?? "default"]
            )}
          >
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}