"use client";

/**
 * app/(dashboard)/page.tsx  — Dashboard Home
 *
 * Composition root only:
 *   - URL search params
 *   - Local state (hidden, chartPeriod)
 *   - Query hooks (summary, accounts)
 *   - Derived values (chartData, savingsRate, etc.)
 *   - Section composition
 *
 * All rendering delegated to features/dashboard/sections/ and components/.
 */

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

import { useGetAccounts }    from "@/features/accounts/api/use-get-accounts";
import { useGetSummary }     from "@/features/summary/api/use-get-summary";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { formatMonthYear }   from "@/features/transactions/lib/formatters";

import { buildChartData }           from "@/features/dashboard/lib/build-chart-data";
import type { ChartPeriod }         from "@/features/dashboard/lib/build-chart-data";
import { DashboardSkeleton }        from "@/features/dashboard/sections/DashboardSkeleton";
import { DashboardHeroSection }     from "@/features/dashboard/sections/DashboardHeroSection";
import { DashboardChartsSection }   from "@/features/dashboard/sections/DashboardChartsSection";
import { DashboardSidebarSection }  from "@/features/dashboard/sections/DashboardSidebarSection";

// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const pathname     = usePathname();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [hidden,      setHidden]      = useState(false);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("M");

  const from          = searchParams.get("from")      || "";
  const to            = searchParams.get("to")        || "";
  const selectedAccId = searchParams.get("accountId") || "";

  const { data: summary,  isLoading: sumLoading } = useGetSummary();
  const { data: accounts = [], isLoading: accLoading } = useGetAccounts();
  const { onOpen: openNewTx } = useNewTransaction();

  const accName = accounts.find((a) => a.id === selectedAccId)?.name ?? "All Accounts";
  const period  = formatMonthYear(new Date());

  const chartData = useMemo(
    () => buildChartData(summary?.days ?? [], chartPeriod),
    [summary?.days, chartPeriod],
  );

  const income      = summary?.incomeAmount    ?? 0;
  const expenses    = summary?.expensesAmount  ?? 0;
  const remaining   = summary?.remainingAmount ?? 0;
  const categories  = summary?.categories      ?? [];
  const savingsRate = income > 0
    ? Math.max(0, Math.round(((income - Math.abs(expenses)) / income) * 100))
    : 0;

  const onAccChange = (acc: { id: string; name: string }) => {
    router.push(
      qs.stringifyUrl(
        { url: pathname, query: { accountId: acc.id, from, to } },
        { skipEmptyString: true, skipNull: true },
      ),
    );
  };

  if (sumLoading || accLoading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen" style={{ background: "var(--surface-bg)" }}>
      <div className="mx-auto w-full max-w-screen-xl px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-7">

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px] lg:gap-6 xl:grid-cols-[1fr_380px]">

          {/* Left column — hero + charts */}
          <div className="space-y-4 lg:space-y-5">
            <DashboardHeroSection
              period={period}
              accounts={accounts}
              selectedId={selectedAccId}
              accName={accName}
              isLoading={accLoading}
              onAccChange={onAccChange}
              income={income}
              expenses={expenses}
              remaining={remaining}
              savingsRate={savingsRate}
              hidden={hidden}
              onHide={() => setHidden((h) => !h)}
              onAddTx={openNewTx}
              summary={summary}
            />

            <DashboardChartsSection
              chartData={chartData}
              chartPeriod={chartPeriod}
              categories={categories}
              onPeriod={setChartPeriod}
            />
          </div>

          {/* Right column — desktop sidebar */}
          <DashboardSidebarSection categories={categories} />
        </div>
      </div>
    </div>
  );
}