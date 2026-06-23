"use client";
/**
 * features/transactions/sections/TransactionPageHeader.tsx
 *
 * Section: page title + income/expense summary + toolbar actions.
 * Extracted from the 600-line transactions/page.tsx.
 * Pure presentational — all state lives in page.
 */

import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { UploadButton } from "@/src/app/(dashboard)/transactions/upload-button";

type Props = {
  totalCount: number;
  incomeTotal: number;
  expenseTotal: number;
  onNewTx: () => void;
  onUpload: (r: any) => void;
};

const fmt = (n: number) =>
  "₹" + Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function TransactionPageHeader({ totalCount, incomeTotal, expenseTotal, onNewTx, onUpload }: Props) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Activity
        </h1>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            {totalCount.toLocaleString()} transactions
          </span>
          <span className="h-3 w-px" style={{ background: "var(--border-default)" }} />
          <span className="flex items-center gap-1 text-[13px] font-medium" style={{ color: "var(--color-income)" }}>
            <TrendingUp className="h-3 w-3" />+{fmt(incomeTotal)}
          </span>
          <span className="flex items-center gap-1 text-[13px] font-medium" style={{ color: "var(--color-expense)" }}>
            <TrendingDown className="h-3 w-3" />−{fmt(expenseTotal)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <UploadButton onUpload={onUpload} />
        <button
          type="button"
          onClick={onNewTx}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            boxShadow: "0 2px 8px rgba(37,99,235,0.30)",
          }}
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>
    </div>
  );
}