"use client";
/**
 * features/transactions/sections/MobileTxCard.tsx
 *
 * Single card in the mobile activity feed.
 * Extracted from app/(dashboard)/transactions/page.tsx.
 */

import { memo } from "react";
import { TriangleAlert } from "lucide-react";

import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { categoryColor, categoryIcon } from "@/features/transactions/lib/categories";
import { formatAbsINR } from "@/features/transactions/lib/formatters";
import type { Tx } from "@/features/transactions/lib/filters";

function fmtAmt(n: number) {
  return formatAbsINR(Math.abs(n), 2);
}

type Props = {
  tx: Tx;
  index: number;
  isLast: boolean;
};

export const MobileTxCard = memo(function MobileTxCard({
  tx,
  index,
  isLast,
}: Props) {
  const { onOpen } = useOpenTransaction();
  const isIncome = tx.amount >= 0;
  const catColor = categoryColor(index % 10);

  return (
    <button
      type="button"
      onClick={() => onOpen(tx.id)}
      className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors active:scale-[0.99]"
      style={{ borderBottom: isLast ? "none" : "1px solid var(--border-subtle)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "";
      }}
    >
      {/* Category icon */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base"
        style={{ background: `${catColor}18` }}
      >
        {categoryIcon(tx.category ?? "")}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className="truncate text-[14px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {tx.payee}
          </p>
          {!tx.category && (
            <TriangleAlert
              className="h-3 w-3 flex-shrink-0"
              style={{ color: "var(--color-warning)" }}
            />
          )}
        </div>
        <p
          className="mt-0.5 flex items-center gap-1.5 text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          {tx.category ? (
            <>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: catColor }}
              />
              {tx.category}
            </>
          ) : (
            <span style={{ color: "var(--color-warning)" }}>Uncategorized</span>
          )}
          <span style={{ color: "var(--border-strong)" }}>·</span>
          {tx.account}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p
          className="text-[14px] font-bold tabular-nums"
          style={{
            color: isIncome ? "var(--color-income)" : "var(--color-expense)",
          }}
        >
          {isIncome ? "+" : "−"}
          {fmtAmt(tx.amount)}
        </p>
      </div>
    </button>
  );
});