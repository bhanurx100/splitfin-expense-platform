"use client";

/**
 * app/(dashboard)/page.tsx  — SplitFin Overview/Home Page
 *
 * Production-quality implementation with:
 * - Hero Balance Card with CSV data
 * - Quick Actions (3 buttons)
 * - Cash Flow Section with dynamic wave chart
 * - Spending Overview with donut chart
 * - Goals & Progress section (Upcoming Feature)
 *
 * All data comes from data.csv - no hardcoded values.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";

import { HeroCard } from "@/features/dashboard/sections/HeroCard";
import { QuickActions } from "@/features/dashboard/sections/QuickActions";
import { CashFlow } from "@/features/dashboard/sections/CashFlow";
import { SpendingOverview } from "@/features/dashboard/sections/SpendingOverview";
import { GoalsCard } from "@/features/dashboard/sections/GoalsCard";

import { loadTransactions } from "@/features/dashboard/lib/csvParser";
import { calculateOverviewData } from "@/features/dashboard/lib/overviewSelectors";

// ─────────────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const [overviewData, setOverviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { onOpen: openNewTx } = useNewTransaction();

  useEffect(() => {
    async function loadData() {
      try {
        const transactions = await loadTransactions();
        const data = calculateOverviewData(transactions);
        setOverviewData(data);
      } catch (error) {
        console.error("Error loading overview data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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