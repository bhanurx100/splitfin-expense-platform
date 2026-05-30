"use client";

/**
 * features/dashboard/components/SplitPayCard.tsx
 *
 * Reads SplitPay store — zero network, zero lag.
 * Extracted from app/(dashboard)/page.tsx.
 */

import { memo, useMemo } from "react";
import { useGroupStore }       from "@/hooks/splitpay/useGroupStore";
import { computeGroupBalances } from "@/features/splitpay/lib/calculations";

export const SplitPayCard = memo(function SplitPayCard() {
  const groups = useGroupStore((s) => s.groups);

  const pendingCount = useMemo(() => {
    let count = 0;
    groups.forEach((g) => {
      const balances = computeGroupBalances(g);
      balances.forEach((b) => { if (b.netBalance < -0.01) count++; });
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
          <p className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Split &amp; Pay
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
            {totalGroups} group{totalGroups !== 1 ? "s" : ""} · {totalExpenses} expense{totalExpenses !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {pendingCount > 0 ? (
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: "var(--color-expense-bg)", color: "var(--color-expense)" }}
          >
            {pendingCount} owe
          </span>
          <span style={{ color: "var(--text-muted)" }}>→</span>
        </div>
      ) : (
        <span className="text-[12px] font-medium" style={{ color: "var(--color-splitpay)" }}>
          All settled →
        </span>
      )}
    </a>
  );
});