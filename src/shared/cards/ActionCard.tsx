"use client";

/**
 * shared/cards/ActionCard.tsx
 *
 * Tappable card for quick actions, navigation shortcuts, and feature tiles.
 * Supports: icon, label, description, badge, disclosure arrow, disabled state.
 *
 * Usage:
 *   <ActionCard
 *     icon={<Split className="h-5 w-5" />}
 *     label="Split & Pay"
 *     description="3 groups · 2 pending"
 *     accent="violet"
 *     badge="2"
 *     onClick={() => router.push("/split")}
 *   />
 *
 *   // Link variant (renders <a>):
 *   <ActionCard
 *     icon={<ArrowLeftRight className="h-5 w-5" />}
 *     label="All Transactions"
 *     href="/transactions"
 *     accent="blue"
 *     showArrow
 *   />
 */

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

// ── Accent palette (mirrors MetricCard) ───────────────────────────────────────

export type ActionAccent = "violet" | "pink" | "blue" | "emerald" | "amber" | "rose";

const ACCENTS: Record<ActionAccent, {
  glow: string;
  border: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
}> = {
  violet: {
    glow: "rgba(139,92,246,0.16)",
    border: "rgba(139,92,246,0.28)",
    iconBg: "rgba(139,92,246,0.12)",
    iconColor: "#a78bfa",
    badgeBg: "rgba(139,92,246,0.18)",
    badgeText: "#c4b5fd",
  },
  pink: {
    glow: "rgba(236,72,153,0.14)",
    border: "rgba(236,72,153,0.26)",
    iconBg: "rgba(236,72,153,0.10)",
    iconColor: "#f472b6",
    badgeBg: "rgba(236,72,153,0.15)",
    badgeText: "#f9a8d4",
  },
  blue: {
    glow: "rgba(59,130,246,0.14)",
    border: "rgba(59,130,246,0.26)",
    iconBg: "rgba(59,130,246,0.10)",
    iconColor: "#60a5fa",
    badgeBg: "rgba(59,130,246,0.15)",
    badgeText: "#93c5fd",
  },
  emerald: {
    glow: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.24)",
    iconBg: "rgba(16,185,129,0.09)",
    iconColor: "#34d399",
    badgeBg: "rgba(16,185,129,0.14)",
    badgeText: "#6ee7b7",
  },
  amber: {
    glow: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.24)",
    iconBg: "rgba(245,158,11,0.09)",
    iconColor: "#fbbf24",
    badgeBg: "rgba(245,158,11,0.14)",
    badgeText: "#fcd34d",
  },
  rose: {
    glow: "rgba(244,63,94,0.12)",
    border: "rgba(244,63,94,0.24)",
    iconBg: "rgba(244,63,94,0.09)",
    iconColor: "#fb7185",
    badgeBg: "rgba(244,63,94,0.14)",
    badgeText: "#fda4af",
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ActionCardProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  accent?: ActionAccent;
  /** Numeric or string badge displayed in the top-right corner */
  badge?: string | number;
  /** Show a chevron disclosure arrow on the right */
  showArrow?: boolean;
  /** Render as <Link> instead of <button> */
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  /** Stack layout: icon above text (for grid tiles) vs row (for list items) */
  layout?: "row" | "tile";
}

// ── Inner content ──────────────────────────────────────────────────────────────

function ActionCardInner({
  icon,
  label,
  description,
  accent = "violet",
  badge,
  showArrow,
  disabled,
  layout = "row",
}: Pick<ActionCardProps, "icon" | "label" | "description" | "accent" | "badge" | "showArrow" | "disabled" | "layout">) {
  const a = ACCENTS[accent];

  return (
    <>
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -left-4 -top-4 h-20 w-20 rounded-full blur-2xl transition-opacity duration-400 opacity-0 group-hover:opacity-100"
        style={{ background: a.glow }}
      />

      <div className={cn(
        "relative flex min-w-0 items-center gap-3.5",
        layout === "tile" && "flex-col items-start gap-3",
      )}>
        {/* Icon */}
        <div
          className={cn(
            "flex flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
            layout === "tile" ? "h-10 w-10" : "h-9 w-9",
          )}
          style={{ background: a.iconBg, color: a.iconColor }}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p
            className="text-[13px] font-semibold leading-tight truncate"
            style={{ color: disabled ? "var(--text-muted)" : "var(--text-primary)" }}
          >
            {label}
          </p>
          {description && (
            <p
              className="mt-0.5 text-[12px] leading-tight truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Arrow */}
        {showArrow && (
          <ChevronRight
            className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: "var(--text-muted)" }}
          />
        )}
      </div>

      {/* Badge */}
      {badge !== undefined && (
        <span
          className="absolute right-3 top-3 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
          style={{ background: a.badgeBg, color: a.badgeText }}
        >
          {badge}
        </span>
      )}
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ActionCard({
  href,
  onClick,
  disabled = false,
  accent = "violet",
  className,
  layout = "row",
  ...rest
}: ActionCardProps) {
  const a = ACCENTS[accent];

  const baseStyle: React.CSSProperties = {
    background: "var(--surface-card)",
    border: `1px solid var(--border-default)`,
    boxShadow: "var(--shadow-card)",
  };

  const sharedClass = cn(
    "group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200",
    layout === "tile" ? "flex flex-col" : "flex items-center",
    disabled
      ? "pointer-events-none opacity-50"
      : "cursor-pointer hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] active:scale-[0.98]",
    className,
  );

  const motionProps = {
    initial: { opacity: 0, y: 10 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
    whileHover: disabled ? {} : { borderColor: a.border },
  };

  const inner = (
    <ActionCardInner
      icon={rest.icon}
      label={rest.label}
      description={rest.description}
      accent={accent}
      badge={rest.badge}
      showArrow={rest.showArrow}
      disabled={disabled}
      layout={layout}
    />
  );

  if (href && !disabled) {
    return (
      <motion.div {...motionProps} style={baseStyle} className={sharedClass}>
        <Link href={href} className="absolute inset-0" aria-label={rest.label} />
        {inner}
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      {...motionProps}
      style={baseStyle}
      className={sharedClass}
    >
      {inner}
    </motion.button>
  );
}