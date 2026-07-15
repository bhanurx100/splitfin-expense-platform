"use client";
/**
 * features/transactions/sections/DesktopTransactionsSection.tsx
 *
 * Full desktop transactions view: header, toolbar, table, pagination.
 * Extracted from app/(dashboard)/transactions/page.tsx.
 */

import { useState, useMemo, useCallback } from "react";

import {
  filterTransactions,
  sortTransactions,
  paginateTransactions,
  totalPages as calcTotalPages,
  totalIncome,
  totalExpense,
  type Tx,
  type SortKey,
  type SortDir,
  type TypeFilter,
} from "@/src/features/transactions/lib/filters";
import { formatAbsINR } from "@/src/features/transactions/lib/formatters";
import { TX_PAGE_SIZE } from "@/src/features/transactions/constants";

import { TransactionPageHeader } from "./TransactionPageHeader";
import { TransactionFiltersSection } from "./TransactionFiltersSection";
import { TransactionListSection } from "./TransactionListSection";
import { TransactionEmptyState } from "./TransactionEmptyState";
import { DesktopTxRow } from "./DesktopTxRow";

function fmtAmt(n: number) {
  return formatAbsINR(Math.abs(n), 2);
}

type Props = {
  transactions: Tx[];
  onUpload: (r: any) => void;
  onNewTx: () => void;
  onBulkDelete: (ids: string[]) => void;
  isDisabled: boolean;
};

export function DesktopTransactionsSection({
  transactions,
  onUpload,
  onNewTx,
  onBulkDelete,
  isDisabled,
}: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const incomeTotal = useMemo(() => totalIncome(transactions), [transactions]);
  const expenseTotal = useMemo(() => totalExpense(transactions), [transactions]);

  const filtered = useMemo(() => {
    const f = filterTransactions(transactions, search, typeFilter);
    return sortTransactions(f, sortKey, sortDir);
  }, [transactions, search, typeFilter, sortKey, sortDir]);

  const numPages = useMemo(
    () => calcTotalPages(filtered.length, TX_PAGE_SIZE),
    [filtered.length]
  );
  const paginated = useMemo(
    () => paginateTransactions(filtered, page, TX_PAGE_SIZE),
    [filtered, page]
  );

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortKey(key);
        setSortDir("desc");
      }
      setPage(1);
    },
    [sortKey]
  );

  const toggleAll = useCallback(() => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((t) => t.id)));
  }, [selected.size, paginated]);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (!selected.size) return;
    onBulkDelete(Array.from(selected));
    setSelected(new Set());
  }, [selected, onBulkDelete]);

  const handleSearch = useCallback((s: string) => {
    setSearch(s);
    setPage(1);
    setSelected(new Set());
  }, []);

  const handleTypeFilter = useCallback((f: TypeFilter) => {
    setTypeFilter(f);
    setPage(1);
    setSelected(new Set());
  }, []);

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TransactionPageHeader
        totalCount={transactions.length}
        incomeTotal={incomeTotal}
        expenseTotal={expenseTotal}
        onNewTx={onNewTx}
        onUpload={onUpload}
      />

      <div className="mb-4">
        <TransactionFiltersSection
          typeFilter={typeFilter}
          onTypeFilter={handleTypeFilter}
          allCount={transactions.length}
          incomeCount={transactions.filter((t) => t.amount > 0).length}
          expenseCount={transactions.filter((t) => t.amount < 0).length}
          search={search}
          onSearch={handleSearch}
          selectedCount={selected.size}
          onBulkDelete={handleBulkDelete}
          onClearSelect={() => setSelected(new Set())}
          isDisabled={isDisabled}
        />
      </div>

      <TransactionListSection
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggleSort}
        allSelected={paginated.length > 0 && selected.size === paginated.length}
        someSelected={selected.size > 0 && selected.size < paginated.length}
        onToggleAll={toggleAll}
        page={page}
        numPages={numPages}
        totalFiltered={filtered.length}
        pageSize={TX_PAGE_SIZE}
        onPage={setPage}
        empty={filtered.length === 0}
        emptySlot={
          <TransactionEmptyState
            search={search}
            onClear={() => handleSearch("")}
            onAdd={onNewTx}
          />
        }
      >
        {paginated.map((tx, i) => (
          <DesktopTxRow
            key={tx.id}
            tx={tx}
            index={i}
            selected={selected.has(tx.id)}
            onToggle={() => toggleOne(tx.id)}
          />
        ))}
      </TransactionListSection>
    </div>
  );
}