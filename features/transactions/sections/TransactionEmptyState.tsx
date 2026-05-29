"use client";
/**
 * features/transactions/sections/TransactionEmptyState.tsx
 *
 * Reusable empty state for both desktop table and mobile feed.
 * Extracted from inline JSX in transactions/page.tsx.
 */

import { Plus, FileText } from "lucide-react";

type Props = {
  search:   string;
  onClear:  () => void;
  onAdd:    () => void;
};

export function TransactionEmptyState({ search, onClear, onAdd }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "var(--surface-sunken)", border: "1px solid var(--border-default)" }}
      >
        <FileText className="h-7 w-7" style={{ color: "var(--text-muted)" }} />
      </div>

      {search ? (
        <>
          <p className="mb-1 text-[15px] font-semibold" style={{ color: "var(--text-secondary)" }}>
            No results for &quot;{search}&quot;
          </p>
          <p className="mb-5 text-[13px]" style={{ color: "var(--text-muted)" }}>
            Try a different payee, category, or account name
          </p>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl px-4 py-2 text-[13px] font-semibold transition"
            style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
          >
            Clear search
          </button>
        </>
      ) : (
        <>
          <p className="mb-1 text-[15px] font-semibold" style={{ color: "var(--text-secondary)" }}>
            No transactions yet
          </p>
          <p className="mb-6 max-w-[280px] text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Add a transaction manually or import from a CSV file
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition"
            style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 2px 8px rgba(37,99,235,0.28)" }}
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>
        </>
      )}
    </div>
  );
}