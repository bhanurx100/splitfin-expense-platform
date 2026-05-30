"use client";

import { useState, useMemo } from "react";
import { LayoutGrid } from "lucide-react";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { formatINR } from "@/features/transactions/lib/formatters";
import {categoryColor, categoryIcon } from "@/features/transactions/lib/categories";

type ApiTx = { amount: number; category: string | null };

type CategoryRow = {
  name: string;
  icon: string;
  color: string;
  value: number;
  count: number;
};

function buildRows(txs: ApiTx[], tab: "Expenses" | "Income"): CategoryRow[] {
  const map: Record<string, { total: number; count: number }> = {};
  for (const tx of txs) {
    const isExpense = tx.amount < 0;
    if (tab === "Expenses" && !isExpense) continue;
    if (tab === "Income" && isExpense) continue;
    const key = tx.category ?? "Uncategorized";
    if (!map[key]) map[key] = { total: 0, count: 0 };
    map[key].total += Math.abs(tx.amount);
    map[key].count += 1;
  }
  return Object.entries(map)
    .map(([name, { total, count }], i) => ({
      name,
      icon: categoryIcon(name),
      color: categoryColor(i),
      value: Math.round(total * 100) / 100,
      count,
    }))
    .sort((a, b) => b.value - a.value);
}

function RowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3">
      <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gray-100" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-4 w-16 rounded bg-gray-200" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100" />
        <div className="h-3 w-20 rounded bg-gray-100" />
      </div>
    </div>
  );
}

export function CategorySummaryList() {
  const [activeTab, setActiveTab] = useState<"Expenses" | "Income">("Expenses");
  const { data: transactions = [], isLoading } = useGetTransactions();

  const rows = useMemo(
    () => buildRows(transactions as ApiTx[], activeTab),
    [transactions, activeTab]
  );

  const max = rows.length > 0 ? rows[0].value : 1;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800">Category Summary</h3>
      </div>

      <div className="mb-4 flex rounded-xl bg-gray-100 p-1">
        {(["Expenses", "Income"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all duration-200 ${
              activeTab === t
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => <RowSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <LayoutGrid className="h-7 w-7 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-500">
            No {activeTab.toLowerCase()} in this period
          </p>
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="space-y-4">
          {rows.map((cat) => {
            const pct = Math.round((cat.value / max) * 100);
            return (
              <div key={cat.name} className="flex items-center gap-3 rounded-xl p-1.5 transition-all duration-200 hover:bg-gray-50">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base"
                  style={{ background: `${cat.color}20` }}
                >
                  {cat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-gray-700">
                      {cat.name}
                    </span>
                    <span className="flex-shrink-0 text-sm font-bold text-gray-800">
                      {formatINR(cat.value)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: cat.color }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {cat.count} {cat.count === 1 ? "transaction" : "transactions"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}