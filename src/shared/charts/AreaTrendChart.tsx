"use client";

/**
 * shared/charts/AreaTrendChart.tsx
 *
 * Dual-series area chart for income vs expense (or any two timeseries).
 * Built on Recharts — fully responsive, dark-mode aware.
 *
 * Usage:
 *   <AreaTrendChart
 *     data={[
 *       { label: "Apr 01", primary: 12000, secondary: 8400 },
 *       { label: "Apr 02", primary:  9500, secondary: 6200 },
 *     ]}
 *     primaryLabel="Income"
 *     secondaryLabel="Expenses"
 *     height={220}
 *   />
 *
 *   // Single series:
 *   <AreaTrendChart
 *     data={[{ label: "Jan", primary: 5000 }, …]}
 *     primaryLabel="Balance"
 *     height={180}
 *   />
 */

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/src/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TrendDataPoint {
  /** X-axis label (date string, week label, etc.) */
  label: string;
  primary: number;
  secondary?: number;
}

export interface AreaTrendChartProps {
  data: TrendDataPoint[];
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
  height?: number;
  /** Format Y-axis and tooltip values */
  formatValue?: (v: number) => string;
  /** Hide the Y axis */
  noYAxis?: boolean;
  className?: string;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_PRIMARY_COLOR = "#8b5cf6"; // violet
const DEFAULT_SECONDARY_COLOR = "#f43f5e"; // rose

// ── Custom tooltip ────────────────────────────────────────────────────────────

function TrendTooltip({
  active,
  payload,
  label,
  primaryLabel,
  secondaryLabel,
  formatValue,
  primaryColor,
  secondaryColor,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
  primaryLabel: string;
  secondaryLabel: string;
  formatValue: (v: number) => string;
  primaryColor: string;
  secondaryColor: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="min-w-[130px] overflow-hidden rounded-xl px-3 py-2.5 text-[12px]"
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-xl)",
      }}
    >
      <p
        className="mb-2 font-semibold"
        style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}
      >
        {label}
      </p>
      {payload.map((entry) => {
        const isPrimary = entry.dataKey === "primary";
        return (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: isPrimary ? primaryColor : secondaryColor }}
              />
              <span style={{ color: "var(--text-secondary)" }}>
                {isPrimary ? primaryLabel : secondaryLabel}
              </span>
            </div>
            <span className="font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
              {formatValue(entry.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Gradient defs ──────────────────────────────────────────────────────────────

function GradientDefs({
  primaryColor,
  secondaryColor,
}: {
  primaryColor: string;
  secondaryColor: string;
}) {
  return (
    <defs>
      <linearGradient id="atc-primary" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={primaryColor} stopOpacity={0.22} />
        <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="atc-secondary" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.18} />
        <stop offset="100%" stopColor={secondaryColor} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const defaultFormat = (v: number) =>
  v >= 100_000
    ? `₹${(v / 100_000).toFixed(1)}L`
    : v >= 1_000
      ? `₹${(v / 1_000).toFixed(0)}k`
      : `₹${v}`;

export function AreaTrendChart({
  data,
  primaryLabel = "Primary",
  secondaryLabel = "Secondary",
  primaryColor = DEFAULT_PRIMARY_COLOR,
  secondaryColor = DEFAULT_SECONDARY_COLOR,
  height = 220,
  formatValue = defaultFormat,
  noYAxis = false,
  className,
}: AreaTrendChartProps) {
  const hasSecondary = data.some((d) => d.secondary !== undefined);

  // Memoize — avoids re-creating style objects on every render
  const tickStyle = useMemo(
    () => ({ fontSize: 10, fill: "var(--text-muted)" }),
    [],
  );

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: noYAxis ? -24 : -8, bottom: 0 }}
        >
          <GradientDefs primaryColor={primaryColor} secondaryColor={secondaryColor} />

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-subtle)"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={tickStyle}
            interval="preserveStartEnd"
          />

          {!noYAxis && (
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={tickStyle}
              tickFormatter={formatValue}
              width={48}
            />
          )}

          <Tooltip
            cursor={{ stroke: "var(--border-default)", strokeWidth: 1, strokeDasharray: "4 2" }}
            content={
              <TrendTooltip
                primaryLabel={primaryLabel}
                secondaryLabel={secondaryLabel}
                formatValue={formatValue}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            }
          />

          {/* Secondary series below primary so primary stays visible */}
          {hasSecondary && (
            <Area
              type="monotone"
              dataKey="secondary"
              stroke={secondaryColor}
              strokeWidth={2}
              fill="url(#atc-secondary)"
              dot={false}
              activeDot={{ r: 4, fill: secondaryColor, strokeWidth: 0 }}
            />
          )}

          <Area
            type="monotone"
            dataKey="primary"
            stroke={primaryColor}
            strokeWidth={2.5}
            fill="url(#atc-primary)"
            dot={false}
            activeDot={{ r: 4.5, fill: primaryColor, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}