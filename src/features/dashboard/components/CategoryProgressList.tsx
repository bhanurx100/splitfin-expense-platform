"use client";

/**
 * features/dashboard/components/CategoryProgressList.tsx
 *
 * Top-5 spending categories with inline CSS progress bars.
 * No recharts dependency — pure CSS, near-zero JS cost.
 * Extracted from app/(dashboard)/page.tsx right-sidebar block.
 */

import { memo } from "react";

type Category = { name: string; value: number };

type Props = {
  categories: Category[];
};

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

const INR = new Intl.NumberFormat("en-IN", {
  style:                 "currency",
  currency:              "INR",
  maximumFractionDigits: 0,
});

export const CategoryProgressList = memo(function CategoryProgressList({
  categories,
}: Props) {
  if (categories.length === 0) return null;

  const max = categories[0].value;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--surface-card)",
        border:     "1px solid var(--border-default)",
        boxShadow:  "var(--shadow-card)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
          Spending
        </h3>
        <a
          href="/transactions"
          className="text-[12px] font-semibold"
          style={{ color: "var(--text-brand)" }}
        >
          Details →
        </a>
      </div>

      <div className="space-y-3">
        {categories.slice(0, 5).map((cat, i) => {
          const pct   = Math.round((cat.value / max) * 100);
          const color = COLORS[i % COLORS.length];
          return (
            <div key={cat.name}>
              <div className="mb-1.5 flex justify-between text-[12px]">
                <span style={{ color: "var(--text-secondary)" }}>{cat.name}</span>
                <span
                  className="font-semibold tabular-nums"
                  style={{ color: "var(--text-primary)" }}
                >
                  {INR.format(cat.value)}
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full"
                style={{ background: "var(--surface-sunken)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});