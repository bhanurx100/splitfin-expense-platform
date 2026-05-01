"use client";

// components/dashboard/ChartSection.tsx
// Moved from components/mobile/ChartSection.tsx — import path only change.
// ChartSection self-fetches via useGetSummary + useGetTransactions.

import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { formatChartValue, formatINR } from "@/lib/mobile-utils";
import { ChartSkeleton } from "./Skeletons";

type Period = "Week" | "Month" | "Year";
type ChartPoint = { label: string; income: number; expenses: number };

function dayLabel(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
function weekdayLabel(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short" });
}
function monthLabel(d: Date) {
  return d.toLocaleDateString("en-IN", { month: "short" });
}

function bucketTransactions(
  txs: { date: string; amount: number }[],
  period: "Week" | "Year"
): ChartPoint[] {
  const now = new Date();
  const buckets: Record<string, ChartPoint> = {};

  if (period === "Week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { label: weekdayLabel(d), income: 0, expenses: 0 };
    }
    for (const tx of txs) {
      const key = new Date(tx.date).toISOString().slice(0, 10);
      if (!buckets[key]) continue;
      if (tx.amount >= 0) buckets[key].income += tx.amount;
      else buckets[key].expenses += Math.abs(tx.amount);
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets[key] = { label: monthLabel(d), income: 0, expenses: 0 };
    }
    for (const tx of txs) {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!buckets[key]) continue;
      if (tx.amount >= 0) buckets[key].income += tx.amount;
      else buckets[key].expenses += Math.abs(tx.amount);
    }
  }

  return Object.values(buckets).map((p) => ({
    ...p,
    income: Math.round(p.income * 100) / 100,
    expenses: Math.round(p.expenses * 100) / 100,
  }));
}

function summaryDaysToPoints(
  days: { date: string; income: number; expenses: number }[]
): ChartPoint[] {
  return days.map((d) => ({
    label: dayLabel(new Date(d.date)),
    income: Math.round(d.income * 100) / 100,
    expenses: Math.round(d.expenses * 100) / 100,
  }));
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-gray-500">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-xs capitalize text-gray-600">{entry.name}:</span>
          <span className="text-xs font-semibold text-gray-800">
            {formatINR(entry.value, 0)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function ChartSection() {
  const [activePeriod, setActivePeriod] = useState<Period>("Month");
  const { data: summary, isLoading: summaryLoading } = useGetSummary();
  const { data: transactions = [], isLoading: txLoading } = useGetTransactions();
  const isLoading = summaryLoading || txLoading;

  const monthData = useMemo(
    () => summaryDaysToPoints(summary?.days ?? []),
    [summary?.days]
  );
  const weekData = useMemo(
    () => bucketTransactions(transactions as { date: string; amount: number }[], "Week"),
    [transactions]
  );
  const yearData = useMemo(
    () => bucketTransactions(transactions as { date: string; amount: number }[], "Year"),
    [transactions]
  );

  const dataMap: Record<Period, ChartPoint[]> = { Week: weekData, Month: monthData, Year: yearData };
  const data = dataMap[activePeriod];

  if (isLoading) return <ChartSkeleton />;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">Overview</h3>
        <div className="flex rounded-xl bg-gray-100 p-1">
          {(["Week", "Month", "Year"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activePeriod === p
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart height increases on desktop */}
      <div className="h-48 lg:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatChartValue} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="income" stroke="#3B82F6" strokeWidth={2.5} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 5, fill: "#3B82F6", strokeWidth: 0 }} />
            <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2.5} fill="url(#expensesGrad)" dot={false} activeDot={{ r: 5, fill: "#EF4444", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-500">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-xs text-gray-500">Expenses</span>
        </div>
      </div>
    </div>
  );
}