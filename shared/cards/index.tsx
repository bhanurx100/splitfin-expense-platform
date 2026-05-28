"use client";
/**
 * shared/cards/index.tsx
 *
 * Reusable card shells for the SplitFin design system.
 * These are layout-only; data is passed as props or children.
 *
 * Exported:
 *   SFCard          — base white/dark card with optional hover
 *   SFGlassCard     — brand-gradient hero card (balance hero, etc.)
 *   SFTransactionRow — single transaction list item
 *   SFAccountChip   — small account pill for selectors
 */

import { cn } from "@/lib/utils";
import React from "react";
import { SFAvatar, Amount, SFBadge } from "@/shared/ui/primitives";

// ── Base card ──────────────────────────────────────────────────────────────────

type SFCardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
};

export function SFCard({ children, className, padding = "md", hover = false, onClick }: SFCardProps) {
  const padMap = { none: "", sm: "p-3", md: "p-4 lg:p-5", lg: "p-5 lg:p-6" };
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl",
        "border border-[var(--sf-border-subtle)]",
        "bg-[var(--sf-card)]",
        "shadow-[var(--sf-shadow-card)]",
        "transition-all duration-200",
        hover && "hover:shadow-[var(--sf-shadow-lg)] hover:-translate-y-0.5 cursor-pointer",
        onClick && "text-left active:scale-[0.99]",
        padMap[padding],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ── Glass / gradient hero card ─────────────────────────────────────────────────

type SFGlassCardProps = {
  children: React.ReactNode;
  className?: string;
  /** gradient direction CSS string */
  gradient?: string;
};

export function SFGlassCard({
  children,
  className,
  gradient = "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 60%, #FD79A8 100%)",
}: SFGlassCardProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-3xl p-5 text-white", className)}
      style={{ background: gradient }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/8" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ── Transaction row ────────────────────────────────────────────────────────────

type TxRowProps = {
  payee: string;
  category?: string | null;
  account: string;
  amount: number;
  date: string | Date;
  categoryIcon?: string;
  categoryColor?: string;
  onClick?: () => void;
  className?: string;
};

export function SFTransactionRow({
  payee,
  category,
  account,
  amount,
  date,
  categoryIcon = "💰",
  categoryColor = "#6C5CE7",
  onClick,
  className,
}: TxRowProps) {
  const isIncome = amount >= 0;
  const d = typeof date === "string" ? new Date(date) : date;
  const dateLabel = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left",
        "transition-colors duration-150",
        "hover:bg-[var(--sf-overlay)]",
        "active:scale-[0.99]",
        className,
      )}
    >
      {/* Icon */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base"
        style={{ background: `${categoryColor}18` }}
      >
        {categoryIcon}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold" style={{ color: "var(--sf-text-primary)" }}>
          {payee}
        </p>
        <p className="mt-0.5 text-[11px]" style={{ color: "var(--sf-text-muted)" }}>
          {category ?? "Uncategorized"} · {account}
        </p>
      </div>

      {/* Amount + date */}
      <div className="text-right">
        <p
          className="text-[14px] font-bold tabular-nums"
          style={{ color: isIncome ? "var(--sf-income)" : "var(--sf-expense)" }}
        >
          {isIncome ? "+" : "−"}₹{Math.abs(amount).toLocaleString("en-IN")}
        </p>
        <p className="mt-0.5 text-[11px]" style={{ color: "var(--sf-text-muted)" }}>
          {dateLabel}
        </p>
      </div>
    </button>
  );
}

// ── Account chip ───────────────────────────────────────────────────────────────

type AccountChipProps = {
  name: string;
  balance?: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export function SFAccountChip({ name, balance, active = false, onClick, className }: AccountChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium",
        "transition-all duration-150 active:scale-[0.97]",
        active
          ? "border-[var(--brand)] bg-[var(--brand)] text-white"
          : "border-[var(--sf-border-default)] bg-[var(--sf-card)] text-[var(--sf-text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)]",
        className,
      )}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: active ? "rgba(255,255,255,0.6)" : "var(--brand)" }} />
      <span className="truncate max-w-[100px]">{name}</span>
      {balance !== undefined && (
        <span className={cn("text-[11px] font-bold", active ? "text-white/80" : "text-[var(--sf-text-muted)]")}>
          ₹{Math.abs(balance).toLocaleString("en-IN")}
        </span>
      )}
    </button>
  );
}

// ── Quick action tile ──────────────────────────────────────────────────────────

type QuickActionProps = {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  color?: string;
  onClick?: () => void;
  className?: string;
};

export function SFQuickAction({ icon, label, sublabel, color = "#6C5CE7", onClick, className }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl p-3.5",
        "border border-[var(--sf-border-subtle)] bg-[var(--sf-card)]",
        "transition-all duration-150 active:scale-[0.95]",
        "hover:shadow-[var(--sf-shadow-card)] hover:border-[var(--sf-border-default)]",
        className,
      )}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-2xl"
        style={{ background: `${color}14` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="text-center">
        <p className="text-[12px] font-semibold leading-tight" style={{ color: "var(--sf-text-primary)" }}>
          {label}
        </p>
        {sublabel && (
          <p className="text-[10px] leading-tight mt-0.5" style={{ color: "var(--sf-text-muted)" }}>
            {sublabel}
          </p>
        )}
      </div>
    </button>
  );
}