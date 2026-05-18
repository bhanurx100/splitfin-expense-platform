/**
 * features/transactions/lib/filters.ts
 *
 * Pure filter, sort, and grouping functions for the transaction feed.
 * No React, no Zustand — safe to use in both client and server contexts.
 *
 * Extracted from: app/(dashboard)/transactions/page.tsx (inline useMemo logic)
 */

import { format } from "date-fns";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SortKey = "date" | "payee" | "category" | "amount" | "account";
export type SortDir = "asc" | "desc";
export type TypeFilter = "all" | "income" | "expense";

export type Tx = {
  id: string;
  date: Date | string;
  category: string | null;
  categoryId: string | null;
  payee: string;
  amount: number;
  account: string;
  accountId: string;
  notes?: string | null;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

export const PAGE_SIZE = 20;

// ─── Date helper ───────────────────────────────────────────────────────────────

/**
 * Returns a human-readable date label used as the group header in mobile feed.
 * e.g. "09 May 2025"
 */
export function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return format(date, "dd MMM yyyy");
}

// ─── Filtering ─────────────────────────────────────────────────────────────────

/**
 * Apply text search + income/expense type filter to a transaction list.
 * Search matches payee, category, and account (case-insensitive).
 */
export function filterTransactions(
  transactions: Tx[],
  search: string,
  typeFilter: TypeFilter
): Tx[] {
  let out = transactions;

  if (search.trim()) {
    const q = search.toLowerCase();
    out = out.filter(
      (t) =>
        t.payee.toLowerCase().includes(q) ||
        (t.category ?? "").toLowerCase().includes(q) ||
        t.account.toLowerCase().includes(q)
    );
  }

  if (typeFilter === "income")  out = out.filter((t) => t.amount > 0);
  if (typeFilter === "expense") out = out.filter((t) => t.amount < 0);

  return out;
}

// ─── Sorting ───────────────────────────────────────────────────────────────────

/**
 * Sort a transaction list by a given key and direction.
 * Returns a new array (does not mutate).
 */
export function sortTransactions(
  transactions: Tx[],
  sortKey: SortKey,
  sortDir: SortDir
): Tx[] {
  return [...transactions].sort((a, b) => {
    let av: string | number;
    let bv: string | number;

    switch (sortKey) {
      case "date":
        av = new Date(a.date).getTime();
        bv = new Date(b.date).getTime();
        break;
      case "payee":
        av = a.payee;
        bv = b.payee;
        break;
      case "category":
        av = a.category ?? "";
        bv = b.category ?? "";
        break;
      case "amount":
        av = a.amount;
        bv = b.amount;
        break;
      case "account":
        av = a.account;
        bv = b.account;
        break;
    }

    if (typeof av === "number" && typeof bv === "number") {
      return sortDir === "asc" ? av - bv : bv - av;
    }

    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });
}

// ─── Pagination ────────────────────────────────────────────────────────────────

/**
 * Slice a list to the current page window.
 */
export function paginateTransactions(
  transactions: Tx[],
  page: number,
  pageSize = PAGE_SIZE
): Tx[] {
  return transactions.slice((page - 1) * pageSize, page * pageSize);
}

/**
 * Total page count for a given list length.
 */
export function totalPages(count: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

// ─── Grouping (mobile feed) ────────────────────────────────────────────────────

/**
 * Group transactions by date label for the mobile activity feed.
 * Preserves the original order (transactions should be sorted before grouping).
 * Returns an array of [dateLabel, transactions[]] tuples to preserve insertion order.
 */
export function groupTransactionsByDate(transactions: Tx[]): [string, Tx[]][] {
  const map = new Map<string, Tx[]>();

  for (const tx of transactions) {
    const key = fmtDate(tx.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }

  return Array.from(map.entries());
}

// ─── Aggregate stats ───────────────────────────────────────────────────────────

/**
 * Sum all positive amounts (income) in a list.
 */
export function totalIncome(transactions: Tx[]): number {
  return transactions
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
}

/**
 * Sum of absolute values of all negative amounts (expenses).
 */
export function totalExpense(transactions: Tx[]): number {
  return transactions
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
}