"use client";
/**
 * features/transactions/sections/TransactionFiltersSection.tsx
 *
 * The toolbar row: type-filter pills · bulk-delete bar · search input.
 * Extracted from DesktopTransactions toolbar (lines ~175–260 of page.tsx).
 *
 * Fully controlled — all state lives in the parent page.
 * Memo'd — only rerenders when filter values actually change.
 */

import { memo } from "react";
import { Search, Trash2, CheckSquare, X } from "lucide-react";
import type { TypeFilter } from "@/src/features/transactions/lib/filters";

type Props = {
  // Type filter
  typeFilter: TypeFilter;
  onTypeFilter: (f: TypeFilter) => void;
  allCount: number;
  incomeCount: number;
  expenseCount: number;

  // Search
  search: string;
  onSearch: (s: string) => void;

  // Bulk delete (desktop only — pass null to hide)
  selectedCount?: number;
  onBulkDelete?: () => void;
  onClearSelect?: () => void;
  isDisabled?: boolean;
};

const CHIPS = [
  { value: "all" as TypeFilter, label: "All" },
  { value: "income" as TypeFilter, label: "Income" },
  { value: "expense" as TypeFilter, label: "Expense" },
] as const;

export const TransactionFiltersSection = memo(function TransactionFiltersSection({
  typeFilter, onTypeFilter,
  allCount, incomeCount, expenseCount,
  search, onSearch,
  selectedCount = 0, onBulkDelete, onClearSelect,
  isDisabled,
}: Props) {
  const countFor = (v: TypeFilter) =>
    v === "all" ? allCount : v === "income" ? incomeCount : expenseCount;

  return (
    <div className="flex flex-wrap items-center gap-2.5">

      {/* Type filter pills */}
      <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "var(--surface-sunken)" }}>
        {CHIPS.map(({ value, label }) => {
          const active = typeFilter === value;
          const chipColor =
            value === "income" ? "var(--color-income)" :
              value === "expense" ? "var(--color-expense)" : "var(--text-primary)";
          const chipBg =
            value === "income" ? "var(--color-income-bg)" :
              value === "expense" ? "var(--color-expense-bg)" : "var(--surface-card)";

          return (
            <button
              key={value}
              type="button"
              onClick={() => onTypeFilter(value)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-150"
              style={{
                background: active ? chipBg : "transparent",
                color: active ? chipColor : "var(--text-tertiary)",
                boxShadow: active ? "var(--shadow-sm)" : "none",
              }}
            >
              {label}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none"
                style={{
                  background: active ? chipBg : "transparent",
                  color: active ? chipColor : "var(--text-muted)",
                }}
              >
                {countFor(value)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bulk delete bar */}
      {selectedCount > 0 && onBulkDelete && onClearSelect && (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-1.5"
          style={{ background: "var(--color-expense-bg)", border: "1px solid var(--color-expense-border)" }}
        >
          <CheckSquare className="h-3.5 w-3.5" style={{ color: "var(--color-expense)" }} />
          <span className="text-[12px] font-semibold" style={{ color: "var(--color-expense)" }}>
            {selectedCount} selected
          </span>
          <button
            type="button"
            onClick={onBulkDelete}
            disabled={isDisabled}
            className="ml-1 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white transition"
            style={{ background: "var(--color-expense-mid)" }}
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
          <button
            type="button"
            onClick={onClearSelect}
            className="transition hover:opacity-70"
            style={{ color: "var(--color-expense)" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search payee, category…"
          className="h-9 w-56 rounded-xl pl-9 pr-8 text-[13px] outline-none transition xl:w-64"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-xs)",
          }}
          onFocus={(e) => {
            (e.target as HTMLElement).style.borderColor = "var(--border-focus)";
            (e.target as HTMLElement).style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)";
          }}
          onBlur={(e) => {
            (e.target as HTMLElement).style.borderColor = "var(--border-default)";
            (e.target as HTMLElement).style.boxShadow = "var(--shadow-xs)";
          }}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 transition hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});