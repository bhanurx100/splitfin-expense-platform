"use client";

/**
 * features/dashboard/sections/dashboard-charts.tsx
 *
 * MIGRATED: now consumes shared design system.
 *   ChartContainer  ← wraps CashFlowChart (replaces inline card shell)
 *   AreaTrendChart  ← replaces inline AreaChart + defs + axes
 *   CategoryRingChart ← replaces inline PieChart in CategoryPieCard
 *   AnalyticsCard   ← replaces inline TopSpendingCard card shell
 *
 * Data flow, memo boundaries, and props are unchanged.
 */

import { memo, useRef, useEffect, useState } from "react";
import { ChartContainer } from "@/src/shared/charts";
import { AreaTrendChart } from "@/src/shared/charts";
import { CategoryRingChart } from "@/src/shared/charts";
import { AnalyticsCard } from "@/src/shared/cards";
import { formatINRCompact } from "@/src/shared/lib/currency";
import { categoryColor, categoryIcon } from "@/src/features/transactions/lib/categories";

// ── Types ─────────────────────────────────────────────────────────────────────

type ChartPoint = { label: string; income: number; expenses: number };
type Category = { name: string; value: number };
type ChartPeriod = "W" | "M" | "Y";

const PERIOD_LABELS: Record<ChartPeriod, string> = { W: "Week", M: "Month", Y: "Year" };

// ── CashFlowChart ─────────────────────────────────────────────────────────────

type CashFlowChartProps = {
  data: ChartPoint[];
  period: ChartPeriod;
  onPeriod: (p: ChartPeriod) => void;
};

export const CashFlowChart = memo(function CashFlowChart({
  data, period, onPeriod,
}: CashFlowChartProps) {
  // Defer canvas until idle — preserves original perf optimisation
  const [ready, setReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") { setReady(true); return; }
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => setReady(true), { timeout: 300 });
    } else {
      timerRef.current = setTimeout(() => setReady(true), 0);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const periodSelector = (
    <div
      className="flex items-center gap-1 rounded-xl p-1"
      style={{ background: "var(--surface-sunken)" }}
    >
      {(["W", "M", "Y"] as ChartPeriod[]).map((p) => (
        <button
          key={p} type="button" onClick={() => onPeriod(p)}
          className="rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-150"
          style={{
            background: period === p ? "var(--surface-card)" : "transparent",
            color: period === p ? "var(--text-primary)" : "var(--text-tertiary)",
            boxShadow: period === p ? "var(--shadow-xs)" : "none",
          }}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );

  return (
    <ChartContainer
      title="Cash Flow"
      subtitle="Income vs Expenses"
      headerAction={periodSelector}
      height={ready ? undefined : 208}
    >
      {!ready ? (
        <div
          className="h-48 w-full animate-pulse rounded-xl lg:h-56"
          style={{ background: "var(--surface-sunken)" }}
        />
      ) : (
        <AreaTrendChart
          data={data.map(d => ({
            label: d.label,
            primary: d.income,
            secondary: d.expenses,
          }))}
          primaryLabel="Income"
          secondaryLabel="Expenses"
          primaryColor="#3b82f6"
          secondaryColor="#f43f5e"
          height={200}
          formatValue={formatINRCompact}
        />
      )}
    </ChartContainer>
  );
});

// ── CategoryPieCard ───────────────────────────────────────────────────────────

export const CategoryPieCard = memo(function CategoryPieCard({
  categories,
}: { categories: Category[] }) {
  const top = categories.slice(0, 6);
  const total = top.reduce((s, c) => s + c.value, 0);

  const ringData = top.map((cat, i) => ({
    name: cat.name,
    value: cat.value,
    color: categoryColor(i),
  }));

  return (
    <ChartContainer title="By Category" height={200}>
      {!top.length ? (
        <div
          className="flex h-40 items-center justify-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          No data for this period
        </div>
      ) : (
        <CategoryRingChart
          data={ringData}
          centreValue={formatINRCompact(total)}
          formatValue={formatINRCompact}
        />
      )}
    </ChartContainer>
  );
});

// ── TopSpendingCard — AnalyticsCard with CSS bars ─────────────────────────────

export const TopSpendingCard = memo(function TopSpendingCard({
  categories,
}: { categories: Category[] }) {
  const max = categories[0]?.value ?? 1;

  const rows = categories.slice(0, 4).map((cat, i) => ({
    label: cat.name,
    value: cat.value,
    icon: categoryIcon(cat.name),
    color: categoryColor(i),
    pct: Math.min(Math.round((cat.value / max) * 100), 100),
    high: Math.round((cat.value / max) * 100) > 80,
  }));

  return (
    <AnalyticsCard title="Top Spending">
      {!categories.length ? (
        <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          No expense data
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{row.icon}</span>
                  <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                    {row.label}
                  </span>
                </div>
                <span
                  className="text-[13px] font-bold tabular-nums"
                  style={{ color: row.high ? "var(--color-expense)" : "var(--text-primary)" }}
                >
                  {formatINRCompact(row.value)}
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full"
                style={{ background: "var(--surface-sunken)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${row.pct}%`,
                    background: row.high ? "var(--color-expense)" : row.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </AnalyticsCard>
  );
});