"use client";
/**
 * features/transactions/sections/MobileTransactionsSection.tsx
 *
 * Full mobile transactions feed: sticky header, search, type filter, grouped cards.
 * Extracted from app/(dashboard)/transactions/page.tsx.
 */

import { useState, useMemo } from "react";
import { Search, X, FileText, Plus } from "lucide-react";

import {
  filterTransactions,
  groupTransactionsByDate,
  totalIncome,
  totalExpense,
  fmtDate,
  type Tx,
  type TypeFilter,
} from "@/src/features/transactions/lib/filters";
import { formatAbsINR } from "@/src/features/transactions/lib/formatters";

import { MobileTxCard } from "./MobileTxCard";
import { UploadButton } from "@/src/app/(dashboard)/transactions/upload-button";

function fmtAmt(n: number) {
  return formatAbsINR(Math.abs(n), 2);
}

type Props = {
  transactions: Tx[];
  onUpload: (r: any) => void;
  onNewTx: () => void;
};

export function MobileTransactionsSection({
  transactions,
  onUpload,
  onNewTx,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [showSearch, setShowSearch] = useState(false);

  const incomeTotal = useMemo(() => totalIncome(transactions), [transactions]);
  const expenseTotal = useMemo(() => totalExpense(transactions), [transactions]);

  const filtered = useMemo(
    () => filterTransactions(transactions, search, filter),
    [transactions, search, filter]
  );

  const grouped = useMemo(() => groupTransactionsByDate(filtered), [filtered]);

  const chips = [
    { v: "all" as TypeFilter, l: "All", n: transactions.length },
    {
      v: "income" as TypeFilter,
      l: "Income",
      n: transactions.filter((t) => t.amount > 0).length,
    },
    {
      v: "expense" as TypeFilter,
      l: "Expense",
      n: transactions.filter((t) => t.amount < 0).length,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--surface-bg)" }}>
      {/* Sticky header */}
      <div
        className="sticky top-14 z-20"
        style={{
          background: "var(--surface-card)",
          borderBottom: "1px solid var(--border-default)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Row 1: title + summary + actions */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <h1
              className="text-[15px] font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Activity
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[11px] font-medium"
                style={{ color: "var(--color-income)" }}
              >
                +{fmtAmt(incomeTotal)}
              </span>
              <span
                className="text-[11px]"
                style={{ color: "var(--border-strong)" }}
              >
                ·
              </span>
              <span
                className="text-[11px] font-medium"
                style={{ color: "var(--color-expense)" }}
              >
                −{fmtAmt(expenseTotal)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSearch((s) => !s)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border transition"
              style={{
                background: showSearch
                  ? "var(--color-info-bg)"
                  : "var(--surface-card)",
                border: showSearch
                  ? "1px solid var(--color-info-border)"
                  : "1px solid var(--border-default)",
                color: showSearch
                  ? "var(--color-info)"
                  : "var(--text-muted)",
              }}
            >
              <Search className="h-4 w-4" />
            </button>

            <UploadButton onUpload={onUpload} />

            <button
              type="button"
              onClick={onNewTx}
              className="flex h-8 items-center gap-1.5 rounded-xl px-3 text-[12px] font-semibold text-white transition active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 2px 8px rgba(37,99,235,0.30)",
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Search input (collapsible) */}
        {showSearch && (
          <div className="px-4 pb-2.5">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions…"
                className="h-9 w-full rounded-xl pl-9 pr-3 text-[13px] outline-none"
                style={{
                  background: "var(--surface-sunken)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.borderColor =
                    "var(--border-focus)";
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.borderColor =
                    "var(--border-default)";
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Row 2: type filter pills */}
        <div className="flex gap-1.5 px-4 pb-2.5">
          {chips.map((chip) => (
            <button
              key={chip.v}
              type="button"
              onClick={() => setFilter(chip.v)}
              className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition"
              style={{
                background:
                  filter === chip.v
                    ? chip.v === "income"
                      ? "var(--color-income-bg)"
                      : chip.v === "expense"
                        ? "var(--color-expense-bg)"
                        : "var(--text-primary)"
                    : "var(--surface-card)",
                border:
                  filter === chip.v
                    ? chip.v === "income"
                      ? "1px solid var(--color-income-border)"
                      : chip.v === "expense"
                        ? "1px solid var(--color-expense-border)"
                        : "1px solid var(--text-primary)"
                    : "1px solid var(--border-default)",
                color:
                  filter === chip.v
                    ? chip.v === "income"
                      ? "var(--color-income)"
                      : chip.v === "expense"
                        ? "var(--color-expense)"
                        : "var(--surface-card)"
                    : "var(--text-tertiary)",
              }}
            >
              {chip.l}
              <span className="opacity-60">{chip.n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Transaction feed */}
      <div className="pb-24">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-20 text-center">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "var(--surface-sunken)" }}
            >
              <FileText
                className="h-6 w-6"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              {search ? "No matching transactions" : "No transactions yet"}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              {search
                ? "Try a different search term"
                : "Tap Add to record your first one"}
            </p>
          </div>
        ) : (
          grouped.map(([date, txs]) => (
            <div key={date}>
              {/* Date header */}
              <div
                className="sticky top-[calc(var(--mobile-header-h,130px))] z-10 flex items-center gap-3 px-4 py-2"
                style={{ background: "var(--surface-bg)" }}
              >
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  {date}
                </span>
                <div
                  className="flex-1"
                  style={{ height: "1px", background: "var(--border-subtle)" }}
                />
                <span
                  className="text-[11px] font-bold tabular-nums"
                  style={{
                    color:
                      txs.reduce((s, t) => s + t.amount, 0) >= 0
                        ? "var(--color-income)"
                        : "var(--color-expense)",
                  }}
                >
                  {txs.reduce((s, t) => s + t.amount, 0) >= 0 ? "+" : "−"}
                  {fmtAmt(
                    Math.abs(txs.reduce((s, t) => s + t.amount, 0))
                  )}
                </span>
              </div>

              {/* Cards */}
              <div
                className="mx-4 mb-3 overflow-hidden rounded-2xl"
                style={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--border-default)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {txs.map((tx, i) => (
                  <MobileTxCard
                    key={tx.id}
                    tx={tx}
                    index={i}
                    isLast={i === txs.length - 1}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}