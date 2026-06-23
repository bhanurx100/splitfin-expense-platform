"use client";

/**
 * shared/charts/CategoryRingChart.tsx
 *
 * Donut/ring chart for categorical breakdowns (spending by category,
 * expense type distribution, group share allocation, etc.)
 *
 * Renders: animated ring, centre total, hover tooltip, scrollable legend list.
 *
 * Usage:
 *   <CategoryRingChart
 *     data={[
 *       { name: "Food",          value: 8400,  color: "#8b5cf6" },
 *       { name: "Travel",        value: 5200,  color: "#ec4899" },
 *       { name: "Utilities",     value: 3100,  color: "#3b82f6" },
 *       { name: "Entertainment", value: 2600,  color: "#f59e0b" },
 *     ]}
 *     centreLabel="Total"
 *     centreValue="₹19.3k"
 *   />
 */

import React, { useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RingCategory {
  name: string;
  value: number;
  color: string;
  /** Optional icon/emoji shown in legend */
  icon?: string;
}

export interface CategoryRingChartProps {
  data: RingCategory[];
  /** Label above centre value */
  centreLabel?: string;
  /** Pre-formatted centre value (e.g. "₹19.3k") */
  centreValue?: string;
  /** Ring diameter in px (default 160 — works on 320px mobile) */
  size?: number;
  /** Inner radius as fraction of size/2 (default 0.58) */
  innerRadius?: number;
  /** Format tooltip value */
  formatValue?: (v: number) => string;
  /** Show percentage next to each legend item */
  showPercent?: boolean;
  className?: string;
}

// ── Default colour palette ─────────────────────────────────────────────────────

export const RING_PALETTE = [
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#10b981", // emerald
  "#f43f5e", // rose
  "#06b6d4", // cyan
  "#84cc16", // lime
];

/** Assign palette colours to data that omits explicit colors */
export function withDefaultColors(data: Omit<RingCategory, "color">[]): RingCategory[] {
  return data.map((d, i) => ({
    ...d,
    color: RING_PALETTE[i % RING_PALETTE.length],
  }));
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function RingTooltip({
  active,
  payload,
  formatValue,
  total,
}: {
  active?: boolean;
  payload?: { payload: RingCategory }[];
  formatValue: (v: number) => string;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;

  return (
    <div
      className="overflow-hidden rounded-xl px-3 py-2.5 text-[12px]"
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-xl)",
        pointerEvents: "none",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
        <span style={{ color: "var(--text-secondary)" }}>{entry.name}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
          {formatValue(entry.value)}
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{pct}%</span>
      </div>
    </div>
  );
}

// ── Legend row ─────────────────────────────────────────────────────────────────

function LegendRow({
  item,
  total,
  showPercent,
  formatValue,
  active,
  onHover,
}: {
  item: RingCategory;
  total: number;
  showPercent: boolean;
  formatValue: (v: number) => string;
  active: boolean;
  onHover: (name: string | null) => void;
}) {
  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;

  return (
    <motion.div
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-150"
      style={{
        background: active ? "var(--surface-hover)" : "transparent",
        opacity: active ? 1 : 0.75,
      }}
      onMouseEnter={() => onHover(item.name)}
      onMouseLeave={() => onHover(null)}
      animate={{ opacity: active ? 1 : 0.75 }}
    >
      {/* Colour dot */}
      <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: item.color }} />

      {/* Icon */}
      {item.icon && (
        <span className="text-[13px] leading-none">{item.icon}</span>
      )}

      {/* Name */}
      <span className="min-w-0 flex-1 truncate text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
        {item.name}
      </span>

      {/* Value + percent */}
      <div className="flex items-baseline gap-1.5 flex-shrink-0">
        <span className="text-[12px] font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
          {formatValue(item.value)}
        </span>
        {showPercent && (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {pct}%
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const defaultFormat = (v: number) =>
  v >= 100_000
    ? `₹${(v / 100_000).toFixed(1)}L`
    : v >= 1_000
      ? `₹${(v / 1_000).toFixed(0)}k`
      : `₹${v}`;

export function CategoryRingChart({
  data,
  centreLabel = "Total",
  centreValue,
  size = 160,
  innerRadius = 0.58,
  formatValue = defaultFormat,
  showPercent = true,
  className,
}: CategoryRingChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const total = data.reduce((s, d) => s + d.value, 0);
  const innerPx = Math.round((size / 2) * innerRadius);
  const outerPx = Math.round(size / 2);
  const displayCentre = centreValue ?? formatValue(total);

  const handlePieEnter = useCallback((_: unknown, index: number) => {
    setHovered(data[index]?.name ?? null);
  }, [data]);

  const handlePieLeave = useCallback(() => setHovered(null), []);

  if (data.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-2xl", className)}
        style={{ height: size + 80, background: "var(--surface-sunken)" }}
      >
        <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
          No category data
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Ring + legend — stack on mobile, side-by-side from sm */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">

        {/* Donut */}
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={innerPx}
                outerRadius={outerPx}
                paddingAngle={2}
                strokeWidth={0}
                onMouseEnter={handlePieEnter}
                onMouseLeave={handlePieLeave}
                animationBegin={0}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={
                      hovered === null || hovered === entry.name ? 1 : 0.35
                    }
                    style={{ transition: "opacity 0.2s" }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={
                  <RingTooltip
                    formatValue={formatValue}
                    total={total}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centre text */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={hovered ?? "__total__"}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.18 }}
                className="text-center"
              >
                {hovered ? (
                  <>
                    <p className="text-[10px] font-medium truncate px-1" style={{ color: "var(--text-muted)", maxWidth: innerPx * 1.6 }}>
                      {hovered}
                    </p>
                    <p className="text-[15px] font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {formatValue(data.find((d) => d.name === hovered)?.value ?? 0)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      {centreLabel}
                    </p>
                    <p className="text-[16px] font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {displayCentre}
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Legend */}
        <div className="min-w-0 flex-1 w-full space-y-0.5">
          {data.map((item) => (
            <LegendRow
              key={item.name}
              item={item}
              total={total}
              showPercent={showPercent}
              formatValue={formatValue}
              active={hovered === null || hovered === item.name}
              onHover={setHovered}
            />
          ))}
        </div>
      </div>
    </div>
  );
}