"use client";
/**
 * shared/ui/primitives.tsx
 *
 * Atom-level UI primitives for the SplitFin design system.
 * These wrap or extend existing shadcn/ui components with brand tokens.
 * Import from here instead of @/components/ui/* for brand-consistent styling.
 */

import { cn } from "@/src/lib/utils";
import React from "react";

// ── Amount display ─────────────────────────────────────────────────────────────

type AmountProps = {
  value: number;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSign?: boolean;
  className?: string;
};

export function Amount({
  value,
  currency = "₹",
  size = "md",
  showSign = false,
  className,
}: AmountProps) {
  const isPositive = value >= 0;
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-IN").format(abs);

  const sizeClass = {
    sm: "text-[13px] font-semibold",
    md: "text-[16px] font-bold",
    lg: "text-[22px] font-bold",
    xl: "text-[32px] font-bold tracking-tight",
  }[size];

  return (
    <span
      className={cn(
        sizeClass,
        "tabular-nums",
        isPositive
          ? "text-[var(--sf-income)]"
          : "text-[var(--sf-expense)]",
        className,
      )}
    >
      {showSign && (isPositive ? "+" : "−")}
      {currency}
      {formatted}
    </span>
  );
}

// ── Avatar / Initials ──────────────────────────────────────────────────────────

type AvatarProps = {
  name: string;
  color?: string;
  size?: number;
  src?: string;
  className?: string;
};

const BRAND_COLORS = [
  "#6C5CE7", "#A29BFE", "#FD79A8", "#00B894",
  "#FDCB6E", "#E17055", "#0984E3", "#00CEC9",
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return BRAND_COLORS[Math.abs(hash) % BRAND_COLORS.length];
}

function initials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0] ?? "").slice(0, 2).join("").toUpperCase() || "?";
}

export function SFAvatar({ name, color, size = 36, src, className }: AvatarProps) {
  const bg = color ?? colorForName(name);
  const fs = Math.round(size * 0.36);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-full object-cover flex-shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn("flex flex-shrink-0 items-center justify-center rounded-full font-bold select-none", className)}
      style={{ width: size, height: size, background: bg, fontSize: fs, color: "#fff" }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

// ── Badge / Pill ───────────────────────────────────────────────────────────────

type BadgeVariant = "income" | "expense" | "brand" | "warning" | "neutral" | "info";

type SFBadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const BADGE_STYLES: Record<BadgeVariant, string> = {
  income: "bg-[var(--sf-income-bg)] text-[var(--sf-income)]",
  expense: "bg-[var(--sf-expense-bg)] text-[var(--sf-expense)]",
  brand: "bg-[var(--sf-info-bg)] text-[var(--sf-info)]",
  warning: "bg-[var(--sf-warning-bg)] text-[var(--sf-warning)]",
  neutral: "bg-[var(--sf-sunken)] text-[var(--sf-text-muted)]",
  info: "bg-[var(--sf-info-bg)] text-[var(--sf-info)]",
};

export function SFBadge({ variant = "neutral", children, className }: SFBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
        "text-[11px] font-semibold leading-none",
        BADGE_STYLES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ── Section label ──────────────────────────────────────────────────────────────

type SectionLabelProps = {
  title: string;
  action?: { label: string; onClick: () => void };
  className?: string;
};

export function SFSectionLabel({ title, action, className }: SectionLabelProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      <p className="text-[13px] font-semibold text-[var(--sf-text-primary)]">
        {title}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-[12px] font-semibold text-[var(--brand)] hover:opacity-80 transition-opacity"
        >
          {action.label} →
        </button>
      )}
    </div>
  );
}

// ── Stat pill ──────────────────────────────────────────────────────────────────

type StatPillProps = {
  label: string;
  value: string;
  variant?: "income" | "expense" | "neutral";
  className?: string;
};

export function StatPill({ label, value, variant = "neutral", className }: StatPillProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 rounded-2xl px-4 py-3",
        variant === "income" && "bg-[var(--sf-income-bg)]",
        variant === "expense" && "bg-[var(--sf-expense-bg)]",
        variant === "neutral" && "bg-[var(--sf-sunken)]",
        className,
      )}
    >
      <p className="text-[11px] font-medium text-[var(--sf-text-muted)]">{label}</p>
      <p
        className={cn(
          "text-[16px] font-bold tabular-nums",
          variant === "income" && "text-[var(--sf-income)]",
          variant === "expense" && "text-[var(--sf-expense)]",
          variant === "neutral" && "text-[var(--sf-text-primary)]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────

export function SFDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px w-full", className)}
      style={{ background: "var(--sf-border-subtle)" }}
    />
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function SFEmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "var(--sf-sunken)" }}
      >
        {icon}
      </div>
      <p className="mb-1 text-[15px] font-semibold" style={{ color: "var(--sf-text-primary)" }}>
        {title}
      </p>
      {description && (
        <p className="mb-5 max-w-[220px] text-[13px] leading-relaxed" style={{ color: "var(--sf-text-muted)" }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}