"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { formatINR} from "@/features/transactions/lib/formatters";
import {categoryColor,categoryIcon} from "@/features/transactions/lib/categories";

type ChartEntry = { name: string; value: number; color: string; icon: string };

function buildIncomeEntries(
  txs: { amount: number; category: string | null }[]
): ChartEntry[] {
  const map: Record<string, number> = {};
  for (const tx of txs) {
    if (tx.amount <= 0) continue;
    const key = tx.category ?? "Other";
    map[key] = (map[key] ?? 0) + tx.amount;
  }
  return Object.entries(map)
    .map(([name, value], i) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: categoryColor(i + 5),
      icon: categoryIcon(name),
    }))
    .sort((a, b) => b.value - a.value);
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ChartEntry;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-base">{d.icon}</span>
        <span className="text-sm font-semibold text-gray-700">{d.name}</span>
      </div>
      <p className="mt-1 text-sm font-bold" style={{ color: d.color }}>
        {formatINR(d.value, 2)}
      </p>
    </div>
  );
};

export function CategoryChart() {
  const [activeType, setActiveType] = useState<"Expenses" | "Income">("Expenses");
  const { data: summary, isLoading: summaryLoading } = useGetSummary();
  const { data: transactions = [], isLoading: txLoading } = useGetTransactions();
  const isLoading = summaryLoading || txLoading;

  const expenseData: ChartEntry[] = useMemo(
    () =>
      (summary?.categories ?? []).map((cat, i) => ({
        name: cat.name,
        value: Math.round(cat.value * 100) / 100,
        color: categoryColor(i),
        icon: categoryIcon(cat.name),
      })),
    [summary?.categories]
  );

  const incomeData: ChartEntry[] = useMemo(
    () =>
      buildIncomeEntries(
        transactions as { amount: number; category: string | null }[]
      ),
    [transactions]
  );



  const data = activeType === "Expenses" ? expenseData : incomeData;
  const total = data.reduce((s, c) => s + c.value, 0);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">Categories</h3>
        <div className="flex rounded-xl bg-gray-100 p-1">
          {(["Expenses", "Income"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeType === t
                  ? t === "Expenses"
                    ? "bg-red-500 text-white shadow-sm"
                    : "bg-emerald-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <PieIcon className="h-7 w-7 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-500">
            No {activeType.toLowerCase()} for this period
          </p>
        </div>
      )}

      {data.length > 0 && (
        <>
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-800">{formatINR(total)}</p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {data.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: cat.color }} />
                <span className="truncate text-xs text-gray-500">{cat.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}