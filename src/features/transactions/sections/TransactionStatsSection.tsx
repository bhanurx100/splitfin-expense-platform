"use client";
/**
 * features/transactions/sections/TransactionStatsSection.tsx
 *
 * The 3-stat summary strip shown at the top of the transactions page.
 * Extracted from inline JSX inside DesktopTransactions + MobileTransactions.
 *
 * Memo'd — only rerenders when totals change (not on search/sort/page).
 */

import { memo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  totalCount:   number;
  incomeTotal:  number;
  expenseTotal: number;
};

const inr = (n: number) =>
  "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const TransactionStatsSection = memo(function TransactionStatsSection({
  totalCount,
  incomeTotal,
  expenseTotal,
}: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>
        {totalCount.toLocaleString()} transactions
      </span>

      <span className="h-3 w-px" style={{ background: "var(--border-default)" }} />

      <span
        className="flex items-center gap-1 text-[13px] font-medium"
        style={{ color: "var(--color-income)" }}
      >
        <TrendingUp className="h-3 w-3" />
        +{inr(incomeTotal)}
      </span>

      <span
        className="flex items-center gap-1 text-[13px] font-medium"
        style={{ color: "var(--color-expense)" }}
      >
        <TrendingDown className="h-3 w-3" />
        −{inr(expenseTotal)}
      </span>
    </div>
  );
});