"use client";

/**
 * Container for charts and analytics panels.
 * Provides: header, optional period selector, content slot, and loading state.
 *
 * Usage:
 *   <AnalyticsCard
 *     title="Cash Flow"
 *     subtitle="Income vs Expenses"
 *     periods={["7D", "1M", "3M", "1Y"]}
 *     activePeriod="1M"
 *     onPeriodChange={setPeriod}
 *   >
 *     <CashFlowChart data={data} />
 *   </AnalyticsCard>
 */

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  /** Right-side action slot (button, badge, etc.) */
  action?: React.ReactNode;
  /** Period pills — omit to hide the selector */
  periods?: string[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  children: React.ReactNode;
  loading?: boolean;
  /** Remove inner padding so charts can bleed to edges */
  noPadding?: boolean;
  className?: string;
  /** Min-height for the content area (useful for loading state) */
  contentMinHeight?: number;
}

// ── Period pill ────────────────────────────────────────────────────────────────

function PeriodPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors duration-150"
      style={{
        color: active ? "var(--text-primary)" : "var(--text-muted)",
        background: active ? "var(--surface-raised)" : "transparent",
      }}
    >
      {active && (
        <motion.span
          layoutId="period-indicator"
          className="absolute inset-0 rounded-lg"
          style={{ background: "var(--surface-raised)", boxShadow: "var(--shadow-sm)" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function AnalyticsCardSkeleton({
  minHeight = 200,
  className,
}: {
  minHeight?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("overflow-hidden rounded-2xl", className)}
      style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}
    >
      <div className="flex items-center justify-between border-b px-5 py-4"
        style={{ borderColor: "var(--border-subtle)" }}>
        <div className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded-md" style={{ background: "var(--surface-sunken)" }} />
          <div className="h-3 w-20 animate-pulse rounded-md" style={{ background: "var(--surface-sunken)" }} />
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-7 w-9 animate-pulse rounded-lg"
              style={{ background: "var(--surface-sunken)", animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      </div>
      <div
        className="flex items-center justify-center"
        style={{ minHeight, background: "var(--surface-sunken)", opacity: 0.4 }}
      >
        <div className="h-1 w-32 animate-pulse rounded-full" style={{ background: "var(--border-default)" }} />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AnalyticsCard({
  title,
  subtitle,
  action,
  periods,
  activePeriod,
  onPeriodChange,
  children,
  loading = false,
  noPadding = false,
  className,
  contentMinHeight = 200,
}: AnalyticsCardProps) {
  if (loading) {
    return (
      <AnalyticsCardSkeleton minHeight={contentMinHeight} className={className} />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("overflow-hidden rounded-2xl", className)}
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="min-w-0">
          <h3
            className="text-[14px] font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Period selector */}
          {periods && periods.length > 0 && (
            <div
              className="flex items-center gap-0.5 rounded-xl p-1"
              style={{ background: "var(--surface-sunken)" }}
            >
              {periods.map((p) => (
                <PeriodPill
                  key={p}
                  label={p}
                  active={p === activePeriod}
                  onClick={() => onPeriodChange?.(p)}
                />
              ))}
            </div>
          )}
          {action}
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(!noPadding && "px-5 py-4")}
        style={{ minHeight: contentMinHeight }}
      >
        {children}
      </div>
    </motion.div>
  );
}