"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  PiggyBank,
  CreditCard,
  Star,
  Activity,
} from "lucide-react";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatINR(value: number, opts: { decimals?: number; compact?: boolean } = {}) {
  const { decimals = 0, compact = false } = opts;
  const abs = Math.abs(value);
  if (compact) {
    if (abs >= 100_000) return `₹${(abs / 100_000).toFixed(1)}L`;
    if (abs >= 1_000)   return `₹${(abs / 1_000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(abs);
}

function pctOfIncome(part: number, income: number) {
  if (!income) return 0;
  return Math.round(Math.abs((part / income) * 100));
}

// ── Types ─────────────────────────────────────────────────────────────────────

type InsightCardProps = {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  delay?: number;
};

// ── Insight card atom ─────────────────────────────────────────────────────────

function InsightCard({
  label, value, sub, icon: Icon, iconColor, iconBg, trend, trendLabel, delay = 0,
}: InsightCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl",
        "bg-[var(--surface-card)]",
        "border border-[var(--border-default)]",
        "p-4 shadow-[var(--shadow-card)]",
        "transition-all duration-200",
        "hover:-translate-y-px hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]",
        "slide-up",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-xl",
        iconBg,
        "transition-transform duration-200 group-hover:scale-105",
      )}>
        <Icon className={cn("h-4 w-4", iconColor)} strokeWidth={2} />
      </div>

      {/* Value */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-[var(--text-muted)] mb-1">
          {label}
        </p>
        <p className="text-[18px] font-bold text-[var(--text-primary)] tabular-nums leading-none">
          {value}
        </p>
        {sub && (
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">{sub}</p>
        )}
      </div>

      {/* Trend badge */}
      {trend && trendLabel && (
        <div className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold w-fit",
          trend === "up"
            ? "bg-[var(--color-income-bg)] text-[var(--color-income)]"
            : trend === "down"
            ? "bg-[var(--color-expense-bg)] text-[var(--color-expense)]"
            : "bg-[var(--surface-overlay)] text-[var(--text-muted)]",
        )}>
          {trend === "up"   && <TrendingUp  className="h-2.5 w-2.5" />}
          {trend === "down" && <TrendingDown className="h-2.5 w-2.5" />}
          {trendLabel}
        </div>
      )}
    </div>
  );
}

// ── Recent activity row ────────────────────────────────────────────────────────

function ActivityRow({
  payee, amount, date, account, isIncome
}: {
  payee: string; amount: number; date: string | Date; account: string; isIncome: boolean;
}) {
  const d = typeof date === "string" ? new Date(date) : date;
  const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0">
      <div className={cn(
        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
        isIncome
          ? "bg-[var(--color-income-bg)] text-[var(--color-income)]"
          : "bg-[var(--color-expense-bg)] text-[var(--color-expense)]",
      )}>
        {isIncome ? "+" : "−"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{payee}</p>
        <p className="text-[11px] text-[var(--text-muted)]">{label} · {account}</p>
      </div>
      <span className={cn(
        "text-[13px] font-bold tabular-nums flex-shrink-0",
        isIncome ? "text-[var(--color-income)]" : "text-[var(--color-expense)]",
      )}>
        {isIncome ? "+" : "−"}{formatINR(amount, { compact: true })}
      </span>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export function AccountInsights() {
  const { data: summary } = useGetSummary();
  const { data: rawTxs = [] } = useGetTransactions();
  const { data: accounts = [] } = useGetAccounts();

  const txs = rawTxs as Array<{
    id: string; date: string | Date; category: string | null;
    payee: string; amount: number; account: string; accountId: string;
  }>;

  // ── Derived insight data ────────────────────────────────────────────────────
  const insights = useMemo(() => {
    const income    = summary?.incomeAmount    ?? 0;
    const expenses  = Math.abs(summary?.expensesAmount ?? 0);
    const remaining = summary?.remainingAmount ?? 0;
    const savings   = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

    // Per-account spending
    const acctSpend: Record<string, { name: string; total: number }> = {};
    txs.filter(t => t.amount < 0).forEach(t => {
      if (!acctSpend[t.accountId]) acctSpend[t.accountId] = { name: t.account, total: 0 };
      acctSpend[t.accountId].total += Math.abs(t.amount);
    });
    const topAccEntry = Object.entries(acctSpend).sort((a, b) => b[1].total - a[1].total)[0];
    const topAcc = topAccEntry ? topAccEntry[1].name : accounts[0]?.name ?? "—";

    // Monthly spending (last 30 days)
    const monthSpend = txs
      .filter(t => t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    // Recent 5 transactions
    const recent = [...txs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Credit usage: expense / (income || 1)
    const creditUsage = income > 0 ? Math.min(Math.round((expenses / income) * 100), 100) : 0;

    return { income, expenses, remaining, savings, topAcc, monthSpend, recent, creditUsage };
  }, [summary, txs, accounts]);

  // ── Insight cards config ────────────────────────────────────────────────────
  const cards: InsightCardProps[] = [
    {
      label:      "Total Balance",
      value:      formatINR(insights.remaining, { compact: true }),
      sub:        "Net across all accounts",
      icon:       Wallet,
      iconColor:  "text-blue-600 dark:text-blue-400",
      iconBg:     "bg-blue-50 dark:bg-blue-950",
      trend:      insights.remaining >= 0 ? "up" : "down",
      trendLabel: insights.remaining >= 0 ? "Positive" : "Deficit",
      delay: 0,
    },
    {
      label:      "Monthly Spending",
      value:      formatINR(insights.expenses, { compact: true }),
      sub:        `${pctOfIncome(insights.expenses, insights.income)}% of income`,
      icon:       BarChart3,
      iconColor:  "text-rose-600 dark:text-rose-400",
      iconBg:     "bg-rose-50 dark:bg-rose-950",
      trend:      "neutral",
      trendLabel: "This period",
      delay: 60,
    },
    {
      label:      "Savings Ratio",
      value:      `${Math.max(0, insights.savings)}%`,
      sub:        insights.savings >= 20 ? "On track" : "Below target",
      icon:       PiggyBank,
      iconColor:  insights.savings >= 20 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
      iconBg:     insights.savings >= 20 ? "bg-emerald-50 dark:bg-emerald-950" : "bg-amber-50 dark:bg-amber-950",
      trend:      insights.savings >= 20 ? "up" : "down",
      trendLabel: insights.savings >= 20 ? "Healthy" : "Low",
      delay: 120,
    },
    {
      label:      "Credit Usage",
      value:      `${insights.creditUsage}%`,
      sub:        "Expenses vs income",
      icon:       CreditCard,
      iconColor:  insights.creditUsage > 80 ? "text-rose-600 dark:text-rose-400" : "text-violet-600 dark:text-violet-400",
      iconBg:     insights.creditUsage > 80 ? "bg-rose-50 dark:bg-rose-950" : "bg-violet-50 dark:bg-violet-950",
      trend:      insights.creditUsage > 80 ? "down" : "up",
      trendLabel: insights.creditUsage > 80 ? "High" : "Healthy",
      delay: 180,
    },
    {
      label:      "Top Account",
      value:      insights.topAcc,
      sub:        "Most active this period",
      icon:       Star,
      iconColor:  "text-amber-600 dark:text-amber-400",
      iconBg:     "bg-amber-50 dark:bg-amber-950",
      delay: 240,
    },
    {
      label:      "Total Income",
      value:      formatINR(insights.income, { compact: true }),
      sub:        "This period",
      icon:       TrendingUp,
      iconColor:  "text-emerald-600 dark:text-emerald-400",
      iconBg:     "bg-emerald-50 dark:bg-emerald-950",
      trend:      "up",
      trendLabel: "Received",
      delay: 300,
    },
  ];

  if (accounts.length === 0) return null;

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Account Insights</h2>
          <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Based on current period activity</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[var(--surface-overlay)] px-3 py-1">
          <Activity className="h-3 w-3 text-[var(--text-muted)]" />
          <span className="text-[11px] font-medium text-[var(--text-muted)]">Live</span>
        </div>
      </div>

      {/* Insight cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <InsightCard key={card.label} {...card} />
        ))}
      </div>

      {/* Recent activity strip */}
      {insights.recent.length > 0 && (
        <div className={cn(
          "rounded-2xl bg-[var(--surface-card)]",
          "border border-[var(--border-default)]",
          "shadow-[var(--shadow-card)]",
          "overflow-hidden",
        )}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--text-muted)]" />
              <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">
                Recent Activity
              </h3>
            </div>
            <a
              href="/transactions"
              className="text-[12px] font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all →
            </a>
          </div>
          {/* Rows */}
          <div className="px-4 py-1">
            {insights.recent.map((tx) => (
              <ActivityRow
                key={tx.id}
                payee={tx.payee}
                amount={tx.amount}
                date={tx.date}
                account={tx.account}
                isIncome={tx.amount >= 0}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}