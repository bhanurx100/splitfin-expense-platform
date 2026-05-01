"use client";

// components/app/InsightsCard.tsx
// Derives 3 smart insights from real summary + transactions data.
// No mock data — all values computed from API responses.

import { Lightbulb, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { AppCard } from "./AppCard";
import { formatINR, categoryIcon } from "@/lib/mobile-utils";

type Tx = { date: string; amount: number; category: string | null; payee: string };
type Summary = {
  incomeAmount: number;
  expensesAmount: number;
  remainingAmount: number;
  categories: { name: string; value: number }[];
};

function computeInsights(summary: Summary | undefined, transactions: Tx[]) {
  const insights: { icon: React.ReactNode; text: string; sub?: string; accent: string }[] = [];

  if (!summary) return insights;

  // 1 — Top spending category
  const top = summary.categories[0];
  if (top) {
    insights.push({
      icon: <span className="text-base">{categoryIcon(top.name)}</span>,
      text: `Top spend: ${top.name}`,
      sub: formatINR(top.value),
      accent: "text-orange-500",
    });
  }

  // 2 — Income vs expenses ratio
  const ratio = summary.expensesAmount !== 0
    ? Math.abs(summary.expensesAmount / Math.max(summary.incomeAmount, 1)) * 100
    : 0;
  if (ratio > 0) {
    const over = ratio > 100;
    insights.push({
      icon: over
        ? <TrendingDown className="h-4 w-4 text-red-500" />
        : <TrendingUp className="h-4 w-4 text-emerald-500" />,
      text: over
        ? `Spent ${Math.round(ratio - 100)}% more than earned`
        : `Saved ${Math.round(100 - ratio)}% of income`,
      accent: over ? "text-red-500" : "text-emerald-600",
    });
  }

  // 3 — Busiest spending day
  if (transactions.length > 0) {
    const dayTotals: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.amount < 0) {
        const day = new Date(tx.date).toLocaleDateString("en-IN", { weekday: "long" });
        dayTotals[day] = (dayTotals[day] ?? 0) + Math.abs(tx.amount);
      }
    }
    const busiestDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];
    if (busiestDay) {
      insights.push({
        icon: <Calendar className="h-4 w-4 text-blue-500" />,
        text: `Most spending on ${busiestDay[0]}`,
        sub: formatINR(busiestDay[1]),
        accent: "text-blue-500",
      });
    }
  }

  return insights;
}

type InsightsCardProps = {
  summary: Summary | undefined;
  transactions: Tx[];
  index?: number;
};

export function InsightsCard({ summary, transactions, index }: InsightsCardProps) {
  const insights = computeInsights(summary, transactions);
  if (insights.length === 0) return null;

  return (
    <AppCard index={index}>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50">
          <Lightbulb className="h-4 w-4 text-amber-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Insights</h3>
      </div>

      <div className="space-y-2.5">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
              {ins.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-gray-700">{ins.text}</p>
            </div>
            {ins.sub && (
              <span className={`text-xs font-bold flex-shrink-0 ${ins.accent}`}>{ins.sub}</span>
            )}
          </div>
        ))}
      </div>
    </AppCard>
  );
}