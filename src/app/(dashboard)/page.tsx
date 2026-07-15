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

import { useNewTransaction } from "@/src/features/transactions/hooks/use-new-transaction";
import { transactions } from "@/src/features/dashboard/lib/store";
import { createAuroraOverviewModel } from "@/src/features/dashboard/aurora/adapter";
import { AuroraOverview } from "@/src/features/dashboard/aurora/overview";

// ─────────────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const { onOpen: openNewTx } = useNewTransaction();
  return <AuroraOverview data={createAuroraOverviewModel(transactions)} onAddTransaction={openNewTx} />;
}
