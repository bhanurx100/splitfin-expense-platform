"use client";

// components/app/BudgetsCard.tsx
// Derives per-category budgets from real category spending.
// Limits are estimated as 1.5× the top spend (no backend budget table yet).
// When a budget API exists, swap the limit calculation only.

import { AppCard } from "./AppCard";
import { formatINR } from "@/features/transactions/lib/formatters";
import { categoryColor, categoryIcon } from "@/features/transactions/lib/categories";
type Category = { name: string; value: number };

function computeBudgets(categories: Category[]) {
  if (categories.length === 0) return [];
  const top = categories[0].value;

  return categories.slice(0, 4).map((cat, i) => {
    // Estimated limit: top category gets 1.5× its spend, others scale down
    const limit = i === 0 ? Math.round(top * 1.5 / 100) * 100 : Math.round(cat.value * 1.4 / 50) * 50;
    const spent = Math.round(cat.value);
    const pct   = Math.min(Math.round((spent / limit) * 100), 100);
    const rem   = Math.max(limit - spent, 0);

    return {
      name:  cat.name,
      icon:  categoryIcon(cat.name),
      color: categoryColor(i),
      limit,
      spent,
      remaining: rem,
      pct,
    };
  });
}

type BudgetsCardProps = {
  categories: Category[];
  index?: number;
};

export function BudgetsCard({ categories, index }: BudgetsCardProps) {
  const budgets = computeBudgets(categories);
  if (budgets.length === 0) return null;

  return (
    <AppCard index={index}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Budgets</h3>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600">
          This month
        </span>
      </div>

      <div className="space-y-4">
        {budgets.map(b => {
          const isOver = b.pct >= 90;
          return (
            <div key={b.name}>
              {/* Row header */}
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl text-sm"
                    style={{ background: `${b.color}18` }}
                  >
                    {b.icon}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{b.name}</span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold ${isOver ? "text-red-500" : "text-gray-800"}`}>
                    {formatINR(b.remaining)}
                  </span>
                  <span className="ml-1 text-[10px] text-gray-400">left</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${b.pct}%`,
                    background: isOver ? "#EF4444" : b.color,
                  }}
                />
              </div>

              {/* Sub label */}
              <div className="mt-1 flex justify-between">
                <span className="text-[10px] text-gray-400">
                  {formatINR(b.spent)} spent
                </span>
                <span className="text-[10px] text-gray-400">
                  of {formatINR(b.limit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AppCard>
  );
}