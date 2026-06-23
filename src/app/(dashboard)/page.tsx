"use client";

/**
 * app/(dashboard)/page.tsx  — SplitFin Overview/Home Page
 *
 * Production-quality implementation with:
 * - Hero Balance Card with Transaction data
 * - Quick Actions (3 buttons)
 * - Cash Flow Section with dynamic wave chart
 * - Spending Overview with donut chart
 * - Goals & Progress section (Upcoming Feature)
 *
 * All data comes from canonical Transaction[] - no hardcoded values.
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useNewTransaction } from "@/src/features/transactions/hooks/use-new-transaction";
import { useTransactions } from "@/src/hooks/use-transactions";

import { HeroCard } from "@/src/features/dashboard/sections/HeroCard";
import { QuickActions } from "@/src/features/dashboard/sections/QuickActions";
import { CashFlow } from "@/src/features/dashboard/sections/CashFlow";
import { SpendingOverview } from "@/src/features/dashboard/sections/SpendingOverview";
import { GoalsCard } from "@/src/features/dashboard/sections/GoalsCard";

import {
  getHeroSummary,
  getSpendingOverview,
  getCashFlow
} from "@/src/lib/transaction-selectors";

// ─────────────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const { onOpen: openNewTx } = useNewTransaction();
  const { data: transactions, isLoading } = useTransactions();

  const overviewData = useMemo(() => {
    if (!transactions || transactions.length === 0) return null;

    const heroSummary = getHeroSummary(transactions);
    const spendingOverview = getSpendingOverview(transactions);
    const cashFlowData = getCashFlow(transactions);

    return {
      totalBalance: heroSummary.totalBalance,
      accountCount: heroSummary.accountCount,
      monthlyChange: heroSummary.monthlyChange,
      categoryBreakdown: spendingOverview,
      cashFlowData,
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 lg:p-8" style={{ background: "var(--surface-bg)" }}>
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-64 animate-pulse rounded-3xl" style={{ background: "var(--surface-card)" }} />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl" style={{ background: "var(--surface-card)" }} />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-3xl" style={{ background: "var(--surface-card)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--surface-bg)" }}>
      <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-4 sm:px-6 md:px-6 lg:px-8 lg:pb-10 lg:pt-8">

        {/* Hero Balance Card */}
        <HeroCard
          totalBalance={overviewData?.totalBalance ?? 0}
          accountCount={overviewData?.accountCount ?? 0}
          monthlyChange={overviewData?.monthlyChange ?? 0}
          isDark={isDark}
        />

        {/* Quick Actions */}
        <QuickActions onOpenNewTransaction={openNewTx} />

        {/* Cash Flow Section */}
        <CashFlow
          cashFlowData={overviewData?.cashFlowData ?? []}
          isDark={isDark}
        />

        <div className="grid grid-cols-1 gap-8 lg:gap-8 lg:grid-cols-2">
          {/* Spending Overview */}
          <SpendingOverview
            categoryBreakdown={overviewData?.categoryBreakdown ?? []}
            isDark={isDark}
          />

          {/* Goals Card */}
          <GoalsCard isDark={isDark} />
        </div>

      </div>
    </div>
  );
}