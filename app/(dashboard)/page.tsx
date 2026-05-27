"use client";

/**
 * app/(dashboard)/page.tsx  — Premium Finance Home Screen
 *
 * Philosophy: This is a HOME screen, not an admin dashboard.
 * ─ Hero balance card (full-bleed indigo gradient)
 * ─ Quick actions bar
 * ─ 3 stat pills (income / expenses / savings)
 * ─ Cash flow chart (deferred, memo'd)
 * ─ Category breakdown (pie + bars)
 * ─ SplitPay summary stub card
 *
 * REMOVED:
 * ─ RecentTransactionsCard (→ transactions page)
 * ─ InsightsCard (→ transactions page)
 * ─ topMerchant derivation (scanned all txs, expensive)
 * ─ useGetTransactions (no longer needed on home)
 *
 * This cuts mounted components from ~18 → ~8 and eliminates the
 * largest client-side scan (topMerchant memo over all transactions).
 */

import { useMemo, useState, memo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

import { useGetAccounts }    from "@/features/accounts/api/use-get-accounts";
import { useGetSummary }     from "@/features/summary/api/use-get-summary";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { formatMonthYear }   from "@/features/transactions/lib/formatters";

import { DashboardHeader }                              from "@/features/dashboard/sections/dashboard-header";
import { DashboardSummary }                             from "@/features/dashboard/sections/dashboard-summary";
import { CashFlowChart, CategoryPieCard, TopSpendingCard } from "@/features/dashboard/sections/dashboard-charts";

// ── SplitPay summary stub ─────────────────────────────────────────────────────
// Reads from Zustand store — zero network, zero lag.

import { useGroupStore } from "@/hooks/splitpay/useGroupStore";
import { computeGroupBalances } from "@/features/splitpay/lib/calculations";

const SplitPayCard = memo(function SplitPayCard() {
  const groups = useGroupStore(s => s.groups);

  const pendingCount = useMemo(() => {
    let count = 0;
    groups.forEach(g => {
      const balances = computeGroupBalances(g);
      balances.forEach(b => { if (b.netBalance < -0.01) count++; });
    });
    return count;
  }, [groups]);

  const totalGroups   = groups.length;
  const totalExpenses = groups.reduce((s, g) => s + g.expenses.length, 0);

  return (
    <a
      href="/split"
      className="flex items-center justify-between rounded-2xl p-4 transition-all duration-200 active:scale-[0.99]"
      style={{
        background: "var(--color-splitpay-bg)",
        border:     "1px solid var(--color-splitpay-border)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
          style={{ background: "var(--color-analytics-bg)" }}
        >
          ÷
        </div>
        <div>
          <p className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Split &amp; Pay</p>
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
            {totalGroups} group{totalGroups !== 1 ? "s" : ""} · {totalExpenses} expense{totalExpenses !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      {pendingCount > 0 && (
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: "var(--color-expense-bg)", color: "var(--color-expense)" }}
          >
            {pendingCount} owe
          </span>
          <span style={{ color: "var(--text-muted)" }}>→</span>
        </div>
      )}
      {pendingCount === 0 && (
        <span className="text-[12px] font-medium" style={{ color: "var(--color-splitpay)" }}>All settled →</span>
      )}
    </a>
  );
});

// ── Chart data builder ────────────────────────────────────────────────────────

type SummaryDay  = { date: string; income: number; expenses: number };
type ChartPeriod = "W" | "M" | "Y";

function buildChartData(
  days: SummaryDay[],
  period: ChartPeriod,
): { label: string; income: number; expenses: number }[] {
  // Month: use server-aggregated days directly — no client scanning needed
  if (period === "M") {
    return days.map(d => ({
      label:    new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      income:   d.income,
      expenses: d.expenses,
    }));
  }

  // Week / Year: build from summary days only (no useGetTransactions needed)
  const now     = new Date();
  const buckets: Record<string, { label: string; income: number; expenses: number }> = {};

  if (period === "W") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { label: d.toLocaleDateString("en-IN", { weekday: "short" }), income: 0, expenses: 0 };
    }
    days.forEach(d => {
      const key = d.date.slice(0, 10);
      if (buckets[key]) { buckets[key].income += d.income; buckets[key].expenses += d.expenses; }
    });
  } else {
    for (let i = 11; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets[key] = { label: d.toLocaleDateString("en-IN", { month: "short" }), income: 0, expenses: 0 };
    }
    days.forEach(d => {
      const key = d.date.slice(0, 7);
      if (buckets[key]) { buckets[key].income += d.income; buckets[key].expenses += d.expenses; }
    });
  }

  return Object.values(buckets);
}

// ── Chart grid (memo'd — isolated from balance-hide toggle) ──────────────────

const ChartGrid = memo(function ChartGrid({
  chartData, chartPeriod, categories, onPeriod,
}: {
  chartData:   { label: string; income: number; expenses: number }[];
  chartPeriod: ChartPeriod;
  categories:  { name: string; value: number }[];
  onPeriod:    (p: ChartPeriod) => void;
}) {
  return (
    <div className="space-y-4">
      <CashFlowChart data={chartData} period={chartPeriod} onPeriod={onPeriod} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CategoryPieCard  categories={categories} />
        <TopSpendingCard  categories={categories} />
      </div>
    </div>
  );
});

// ── Skeleton ──────────────────────────────────────────────────────────────────

function HomeSkeleton() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 pb-20 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-7 space-y-4">
      {/* Hero */}
      <div className="h-48 animate-pulse rounded-3xl" style={{ background: "var(--surface-sunken)" }} />
      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        {[0,1,2,3].map(i => (
          <div key={i} className="h-16 animate-pulse rounded-2xl" style={{ background: "var(--surface-sunken)", animationDelay: `${i*60}ms` }} />
        ))}
      </div>
      {/* Pills */}
      <div className="grid grid-cols-3 gap-3">
        {[0,1,2].map(i => (
          <div key={i} className="h-24 animate-pulse rounded-2xl" style={{ background: "var(--surface-sunken)", animationDelay: `${i*60}ms` }} />
        ))}
      </div>
      {/* Chart */}
      <div className="h-64 animate-pulse rounded-2xl" style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)" }} />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE ROOT
// ═════════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  const pathname     = usePathname();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [hidden, setHidden]           = useState(false);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("M");

  const from          = searchParams.get("from") || "";
  const to            = searchParams.get("to") || "";
  const selectedAccId = searchParams.get("accountId") || "";

  const { data: summary, isLoading: sumLoading } = useGetSummary();
  const { data: accounts = [], isLoading: accLoading } = useGetAccounts();
  const { onOpen: openNewTx } = useNewTransaction();

  const accName = accounts.find(a => a.id === selectedAccId)?.name ?? "All Accounts";
  const period  = formatMonthYear(new Date());

  // Chart data derived from summary.days only — no useGetTransactions
  const chartData = useMemo(
    () => buildChartData(summary?.days ?? [], chartPeriod),
    [summary?.days, chartPeriod]
  );

  const income      = summary?.incomeAmount    ?? 0;
  const expenses    = summary?.expensesAmount  ?? 0;
  const remaining   = summary?.remainingAmount ?? 0;
  const categories  = summary?.categories ?? [];
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - Math.abs(expenses)) / income) * 100)) : 0;

  const onAccChange = (acc: { id: string; name: string }) => {
    router.push(qs.stringifyUrl(
      { url: pathname, query: { accountId: acc.id, from, to } },
      { skipEmptyString: true, skipNull: true }
    ));
  };

  if (sumLoading || accLoading) return <HomeSkeleton />;

  return (
    <div className="min-h-screen" style={{ background: "var(--surface-bg)" }}>
      <div className="mx-auto w-full max-w-screen-xl px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-7">

        {/* Desktop-only top bar */}
        <div className="hidden lg:block">
          <DashboardHeader
            period={period}
            accounts={accounts}
            selectedId={selectedAccId}
            accName={accName}
            hidden={hidden}
            isLoading={accLoading}
            onHide={() => setHidden(h => !h)}
            onAccChange={onAccChange}
          />
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px] lg:gap-6 xl:grid-cols-[1fr_380px]">

          {/* Left — hero + charts */}
          <div className="space-y-4 lg:space-y-5">
            <DashboardSummary
              income={income} expenses={expenses} remaining={remaining}
              savingsRate={savingsRate} accName={accName} period={period}
              hidden={hidden} onHide={() => setHidden(h => !h)}
              onAddTx={openNewTx}
              summary={summary}
            />

            <ChartGrid
              chartData={chartData}
              chartPeriod={chartPeriod}
              categories={categories}
              onPeriod={setChartPeriod}
            />
          </div>

          {/* Right sidebar (desktop only) */}
          <div className="hidden space-y-4 lg:block lg:space-y-5">
            {/* SplitPay summary */}
            <SplitPayCard />

            {/* Category list — lightweight text, no recharts */}
            {categories.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "var(--surface-card)",
                  border:     "1px solid var(--border-default)",
                  boxShadow:  "var(--shadow-card)",
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Spending</h3>
                  <a href="/transactions" className="text-[12px] font-semibold" style={{ color: "var(--text-brand)" }}>
                    Details →
                  </a>
                </div>
                <div className="space-y-3">
                  {categories.slice(0, 5).map((cat, i) => {
                    const max = categories[0].value;
                    const pct = Math.round((cat.value / max) * 100);
                    const colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981"];
                    const color  = colors[i % colors.length];
                    return (
                      <div key={cat.name}>
                        <div className="mb-1.5 flex justify-between text-[12px]">
                          <span style={{ color: "var(--text-secondary)" }}>{cat.name}</span>
                          <span className="font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cat.value)}
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
              </div>
            )}

            {/* Link to transactions */}
            <a
              href="/transactions"
              className="flex items-center justify-between rounded-2xl p-4 transition-all duration-200 hover:opacity-80"
              style={{
                background: "var(--surface-card)",
                border:     "1px solid var(--border-default)",
                boxShadow:  "var(--shadow-card)",
              }}
            >
              <div>
                <p className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>All Transactions</p>
                <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Search, filter &amp; manage</p>
              </div>
              <span className="text-[20px]">📋</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}