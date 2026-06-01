"use client";

/**
 * features/dashboard/sections/DashboardSidebarSection.tsx
 *
 * MIGRATED: now consumes shared design system.
 *   AnalyticsCard ← replaces inline CategoryProgressList card shell
 *   ActionCard    ← replaces inline TransactionsShortcutCard
 *
 * SplitPayCard is self-contained (Zustand) — unchanged.
 */

import { memo }              from "react";
import { AnalyticsCard }     from "@/shared/cards";
import { ActionCard }        from "@/shared/cards";
import { SplitPayCard }      from "@/features/dashboard/components/SplitPayCard";
import { formatINRCompact }  from "@/shared/lib/currency";

type Category = { name: string; value: number };

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

const CategoryProgressList = memo(function CategoryProgressList({
  categories,
}: { categories: Category[] }) {
  const max = categories[0]?.value ?? 1;

  return (
    <AnalyticsCard
      title="Spending"
      action={
        <a href="/transactions" className="text-[12px] font-semibold" style={{ color: "var(--text-brand)" }}>
          Details →
        </a>
      }
    >
      <div className="space-y-3">
        {categories.slice(0, 5).map((cat, i) => {
          const pct   = Math.round((cat.value / max) * 100);
          const color = COLORS[i % COLORS.length];
          return (
            <div key={cat.name}>
              <div className="mb-1.5 flex justify-between text-[12px]">
                <span style={{ color: "var(--text-secondary)" }}>{cat.name}</span>
                <span className="font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {formatINRCompact(cat.value)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--surface-sunken)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AnalyticsCard>
  );
});

export function DashboardSidebarSection({ categories }: { categories: Category[] }) {
  return (
    <div className="hidden space-y-4 lg:block lg:space-y-5">
      <SplitPayCard />
      {categories.length > 0 && <CategoryProgressList categories={categories} />}
      <ActionCard
        label="All Transactions"
        description="Search, filter & manage"
        icon={<span className="text-[20px]">📋</span>}
        href="/transactions"
      />
    </div>
  );
}