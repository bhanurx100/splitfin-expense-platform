"use client";

/**
 * shared/charts/ChartContainer.tsx
 *
 * Universal wrapper for any Recharts chart.
 * Handles: title row, legend, loading shimmer, empty state, and
 * consistent responsive height behaviour across breakpoints.
 *
 * Usage:
 *   <ChartContainer
 *     title="Cash Flow"
 *     height={220}
 *     loading={isLoading}
 *     empty={data.length === 0}
 *     legend={[
 *       { label: "Income",   color: "#34d399" },
 *       { label: "Expenses", color: "#f87171" },
 *     ]}
 *   >
 *     <ResponsiveContainer width="100%" height="100%">
 *       …your chart…
 *     </ResponsiveContainer>
 *   </ChartContainer>
 */

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LegendItem {
  label: string;
  color: string;
  /** Optional: override dot shape */
  shape?: "circle" | "line" | "square";
}

export interface ChartContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  /** Right-side slot: buttons, pills, etc. */
  headerAction?: React.ReactNode;
  legend?: LegendItem[];
  /** Chart canvas height in px (default 220) */
  height?: number;
  loading?: boolean;
  /** When true renders empty state instead of children */
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
  /** Remove all padding so the chart bleeds to the card edge */
  flush?: boolean;
}

// ── Legend ────────────────────────────────────────────────────────────────────

function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          {item.shape === "line" ? (
            <div className="h-[2px] w-4 rounded-full" style={{ background: item.color }} />
          ) : item.shape === "square" ? (
            <div className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
          ) : (
            <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
          )}
          <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Loading shimmer ────────────────────────────────────────────────────────────

function ChartLoadingShimmer({ height }: { height: number }) {
  return (
    <div className="relative overflow-hidden" style={{ height }}>
      {/* Fake chart bars */}
      <div className="absolute inset-x-0 bottom-0 flex items-end gap-1 px-2">
        {[0.45, 0.70, 0.55, 0.85, 0.60, 0.90, 0.50, 0.75, 0.65, 0.80, 0.55, 0.70].map((h, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-t-md"
            style={{
              height: `${h * (height - 20)}px`,
              background: "var(--surface-sunken)",
              animationDelay: `${i * 60}ms`,
            }}
          />
        ))}
      </div>
      {/* Shimmer sweep */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, var(--surface-hover) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ── Empty state (chart-specific, minimal) ─────────────────────────────────────

function ChartEmpty({ height, message }: { height: number; message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2"
      style={{ height }}
    >
      {/* Ghost chart lines */}
      <svg
        width="80"
        height="40"
        viewBox="0 0 80 40"
        fill="none"
        className="opacity-20"
        style={{ color: "var(--text-muted)" }}
      >
        <polyline
          points="0,35 15,22 30,28 45,12 60,18 80,5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 3"
        />
      </svg>
      <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
        {message}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ChartContainer({
  children,
  title,
  subtitle,
  headerAction,
  legend,
  height = 220,
  loading = false,
  empty = false,
  emptyMessage = "No data for this period",
  className,
  flush = false,
}: ChartContainerProps) {
  const hasHeader = title || subtitle || headerAction;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full", className)}
    >
      {/* Header */}
      {hasHeader && (
        <div className={cn(
          "mb-3 flex items-start justify-between",
          flush && "px-0",
        )}>
          <div className="min-w-0">
            {title && (
              <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                {title}
              </p>
            )}
            {subtitle && (
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="flex-shrink-0 ml-2">{headerAction}</div>}
        </div>
      )}

      {/* Chart canvas */}
      <div
        className={cn("w-full", !flush && "overflow-hidden")}
        style={{ height }}
      >
        {loading ? (
          <ChartLoadingShimmer height={height} />
        ) : empty ? (
          <ChartEmpty height={height} message={emptyMessage} />
        ) : (
          children
        )}
      </div>

      {/* Legend */}
      {legend && legend.length > 0 && !loading && !empty && (
        <div className={cn("mt-3", flush && "px-0")}>
          <ChartLegend items={legend} />
        </div>
      )}
    </motion.div>
  );
}