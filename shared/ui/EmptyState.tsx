"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// ── Variants ──────────────────────────────────────────────────────────────────

type Variant = "default" | "search" | "error" | "offline";

const ICON_CONTAINER: Record<Variant, string> = {
  default: "bg-[var(--sf-sunken,var(--surface-sunken))]",
  search:  "bg-[rgba(108,92,231,0.08)]",
  error:   "bg-[rgba(232,67,147,0.08)]",
  offline: "bg-[rgba(253,203,110,0.10)]",
};

const TITLE_COLOR: Record<Variant, string> = {
  default: "var(--sf-text-secondary,var(--text-secondary))",
  search:  "var(--sf-text-primary,var(--text-primary))",
  error:   "var(--sf-text-expense,var(--color-expense))",
  offline: "var(--sf-text-primary,var(--text-primary))",
};

// ── Props ─────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  icon:         ReactNode;
  title:        string;
  description?: string;
  action?:      ReactNode;
  variant?:     Variant;
  /** Remove outer vertical padding (e.g. inside a card) */
  compact?:     boolean;
  className?:   string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 px-4" : "py-14 px-6",
        className,
      )}
    >
      {/* Icon bubble */}
      <div
        className={cn(
          "mb-4 flex items-center justify-center rounded-2xl",
          compact ? "h-12 w-12" : "h-14 w-14",
          ICON_CONTAINER[variant],
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center",
            compact ? "[&>svg]:h-5 [&>svg]:w-5" : "[&>svg]:h-6 [&>svg]:w-6",
          )}
          style={{ color: "var(--sf-text-muted,var(--text-muted))" }}
        >
          {icon}
        </span>
      </div>

      {/* Title */}
      <p
        className={cn(
          "font-semibold",
          compact ? "text-[13px]" : "text-[15px]",
        )}
        style={{ color: TITLE_COLOR[variant] }}
      >
        {title}
      </p>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "mt-1 leading-relaxed",
            compact ? "max-w-[200px] text-[12px]" : "max-w-[260px] text-[13px]",
            action ? "mb-5" : "mb-0",
          )}
          style={{ color: "var(--sf-text-muted,var(--text-muted))" }}
        >
          {description}
        </p>
      )}

      {/* Action slot */}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}