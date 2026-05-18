"use client";

/**
 * app/(dashboard)/transactions/page.tsx
 *
 * Premium fintech activity-feed redesign.
 *
 * Key decisions:
 *  - ONE Add Transaction CTA per layout (toolbar on desktop, header on mobile)
 *  - NO floating FAB (belongs only on home page)
 *  - NO duplicate sticky add bar on mobile
 *  - Desktop: full activity table with micro-elevation rows
 *  - Mobile: grouped date-feed with swipe-friendly cards
 *  - Import flow preserved, triggered from toolbar only
 *  - All colors via semantic CSS tokens
 *
 * Architecture:
 *  - Pure filter/sort/grouping logic → @/features/transactions/lib/filters
 *  - Format helpers               → @/features/transactions/lib/formatters
 *  - Category color/icon          → @/features/transactions/lib/categories
 *  - Constants                    → @/features/transactions/constants
 */

import { useState, useMemo, memo, useCallback } from "react";
import {
  Plus, Search, Trash2, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, TriangleAlert, X, FileText,
  CheckSquare, Edit, Loader2, Upload,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { useCSVReader } from "react-papaparse";

// ── Feature-scoped imports (new locations) ─────────────────────────────────────
import {
  filterTransactions,
  sortTransactions,
  paginateTransactions,
  totalPages as calcTotalPages,
  groupTransactionsByDate,
  totalIncome,
  totalExpense,
  fmtDate,
  type Tx,
  type SortKey,
  type SortDir,
  type TypeFilter,
} from "@/features/transactions/lib/filters";

import {
  formatAbsINR,
} from "@/features/transactions/lib/formatters";

import {
  categoryColor,
  categoryIcon,
} from "@/features/transactions/lib/categories";

import {
  TX_PAGE_SIZE,
  INITIAL_IMPORT,
} from "@/features/transactions/constants";

// ── App-level imports (unchanged) ──────────────────────────────────────────────
import { transactions as transactionSchema } from "@/db/schema";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { useDeleteTransaction } from "@/features/transactions/api/use-delete-transaction";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { useOpenCategory } from "@/features/categories/hooks/use-open-category";
import { cn } from "@/lib/utils";
import { ImportCard } from "./import-card";

/* ─── helpers (local) ────────────────────────────────────────────────────────── */
function fmtAmt(n: number) { return formatAbsINR(Math.abs(n), 2); }

enum VIEW { LIST = "LIST", IMPORT = "IMPORT" }

/* ─── Inline Upload Button ───────────────────────────────────────────────────── */
function UploadButton({ onUpload }: { onUpload: (results: any) => void }) {
  const { CSVReader } = useCSVReader();
  return (
    <CSVReader onUploadAccepted={onUpload}>
      {({ getRootProps }: any) => (
        <button
          type="button"
          {...getRootProps()}
          className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-all"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <Upload className="h-3.5 w-3.5" />
          Import CSV
        </button>
      )}
    </CSVReader>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE ROOT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function TransactionsPage() {
  const [view, setView] = useState<VIEW>(VIEW.LIST);
  const [importData, setImportData] = useState(INITIAL_IMPORT);
  const [AccountDialog, confirmAccount] = useSelectAccount();
  const newTx = useNewTransaction();
  const bulkCreate = useBulkCreateTransactions();
  const bulkDelete = useBulkDeleteTransactions();
  const txQuery = useGetTransactions();
  const transactions = (txQuery.data ?? []) as Tx[];
  const isDisabled = txQuery.isLoading || bulkDelete.isPending;

  const onUpload = useCallback((r: typeof INITIAL_IMPORT) => {
    setImportData(r);
    setView(VIEW.IMPORT);
  }, []);

  const onCancelImport = useCallback(() => {
    setImportData(INITIAL_IMPORT);
    setView(VIEW.LIST);
  }, []);

  const onSubmitImport = useCallback(
    async (values: (typeof transactionSchema.$inferInsert)[]) => {
      const accountId = await confirmAccount();
      if (!accountId) return toast.error("Please select an account to continue.");
      bulkCreate.mutate(
        values.map((v) => ({ ...v, accountId: accountId as string })),
        { onSuccess: onCancelImport }
      );
    },
    [confirmAccount, bulkCreate, onCancelImport]
  );

  if (view === VIEW.IMPORT) {
    return (
      <>
        <AccountDialog />
        <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <ImportCard data={importData.data} onCancel={onCancelImport} onSubmit={onSubmitImport} />
        </div>
      </>
    );
  }

  if (txQuery.isLoading) return <TransactionsSkeleton />;

  return (
    <>
      <AccountDialog />
      {/* Desktop */}
      <div className="hidden lg:block">
        <DesktopTransactions
          transactions={transactions}
          onUpload={onUpload}
          onNewTx={newTx.onOpen}
          onBulkDelete={(ids) => bulkDelete.mutate({ ids })}
          isDisabled={isDisabled}
        />
      </div>
      {/* Mobile */}
      <div className="lg:hidden">
        <MobileTransactions
          transactions={transactions}
          onUpload={onUpload}
          onNewTx={newTx.onOpen}
        />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DESKTOP TRANSACTIONS
   ═══════════════════════════════════════════════════════════════════════════ */
function DesktopTransactions({
  transactions, onUpload, onNewTx, onBulkDelete, isDisabled,
}: {
  transactions: Tx[];
  onUpload: (r: any) => void;
  onNewTx: () => void;
  onBulkDelete: (ids: string[]) => void;
  isDisabled: boolean;
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  // ── Aggregate stats ──────────────────────────────────────────────────────────
  const incomeTotal  = useMemo(() => totalIncome(transactions),  [transactions]);
  const expenseTotal = useMemo(() => totalExpense(transactions), [transactions]);

  // ── Filter → sort → paginate pipeline (pure functions from lib/filters) ───────
  const filtered = useMemo(() => {
    const f = filterTransactions(transactions, search, typeFilter);
    return sortTransactions(f, sortKey, sortDir);
  }, [transactions, search, typeFilter, sortKey, sortDir]);

  const numPages  = useMemo(() => calcTotalPages(filtered.length, TX_PAGE_SIZE), [filtered.length]);
  const paginated = useMemo(() => paginateTransactions(filtered, page, TX_PAGE_SIZE), [filtered, page]);

  // ── Sort helpers ─────────────────────────────────────────────────────────────
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  // ── Selection helpers ────────────────────────────────────────────────────────
  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((t) => t.id)));
  };

  const toggleOne = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const handleBulkDelete = () => {
    if (!selected.size) return;
    onBulkDelete(Array.from(selected));
    setSelected(new Set());
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3" style={{ color: "var(--text-brand)" }} />
      : <ArrowDown className="h-3 w-3" style={{ color: "var(--text-brand)" }} />;
  };

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Activity
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              {transactions.length.toLocaleString()} transactions
            </span>
            <span className="h-3 w-px" style={{ background: "var(--border-default)" }} />
            <span className="flex items-center gap-1 text-[13px] font-medium" style={{ color: "var(--color-income)" }}>
              <TrendingUp className="h-3 w-3" />
              +{fmtAmt(incomeTotal)}
            </span>
            <span className="flex items-center gap-1 text-[13px] font-medium" style={{ color: "var(--color-expense)" }}>
              <TrendingDown className="h-3 w-3" />
              −{fmtAmt(expenseTotal)}
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
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(37,99,235,0.40)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(37,99,235,0.30)"; }}
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">

        {/* Type filter pills */}
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "var(--surface-sunken)" }}>
          {([
            { value: "all",     label: "All",     count: transactions.length },
            { value: "income",  label: "Income",  count: transactions.filter((t) => t.amount > 0).length },
            { value: "expense", label: "Expense", count: transactions.filter((t) => t.amount < 0).length },
          ] as { value: TypeFilter; label: string; count: number }[]).map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => { setTypeFilter(chip.value); setPage(1); setSelected(new Set()); }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-150"
              style={{
                background: typeFilter === chip.value ? "var(--surface-card)" : "transparent",
                color: typeFilter === chip.value ? "var(--text-primary)" : "var(--text-tertiary)",
                boxShadow: typeFilter === chip.value ? "var(--shadow-sm)" : "none",
              }}
            >
              {chip.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none"
                style={{
                  background: typeFilter === chip.value
                    ? (chip.value === "income" ? "var(--color-income-bg)" : chip.value === "expense" ? "var(--color-expense-bg)" : "var(--surface-sunken)")
                    : "transparent",
                  color: typeFilter === chip.value
                    ? (chip.value === "income" ? "var(--color-income)" : chip.value === "expense" ? "var(--color-expense)" : "var(--text-muted)")
                    : "var(--text-muted)",
                }}
              >
                {chip.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bulk delete bar */}
        {selected.size > 0 && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-1.5"
            style={{ background: "var(--color-expense-bg)", border: "1px solid var(--color-expense-border)" }}
          >
            <CheckSquare className="h-3.5 w-3.5" style={{ color: "var(--color-expense)" }} />
            <span className="text-[12px] font-semibold" style={{ color: "var(--color-expense)" }}>
              {selected.size} selected
            </span>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={isDisabled}
              className="ml-1 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white transition"
              style={{ background: "var(--color-expense-mid)" }}
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="ml-0.5 transition hover:opacity-70"
              style={{ color: "var(--color-expense)" }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); setSelected(new Set()); }}
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
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 transition hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Activity table ────────────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {filtered.length === 0 ? (
          <EmptyState search={search} onClear={() => setSearch("")} onAdd={onNewTx} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--border-subtle)" }}>
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={paginated.length > 0 && selected.size === paginated.length}
                        ref={(el) => { if (el) el.indeterminate = selected.size > 0 && selected.size < paginated.length; }}
                        onChange={toggleAll}
                        className="h-4 w-4 cursor-pointer rounded"
                        style={{ accentColor: "var(--color-info-mid)" }}
                      />
                    </th>
                    {([
                      { key: "date",     label: "Date",     cls: "w-28" },
                      { key: "payee",    label: "Payee",    cls: "min-w-[160px]" },
                      { key: "category", label: "Category", cls: "w-36" },
                      { key: "account",  label: "Account",  cls: "w-36" },
                      { key: "amount",   label: "Amount",   cls: "w-32 text-right" },
                    ] as { key: SortKey; label: string; cls: string }[]).map((col) => (
                      <th key={col.key} className={cn("px-4 py-3 text-left", col.cls)}>
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:opacity-80"
                          style={{ color: sortKey === col.key ? "var(--text-brand)" : "var(--text-muted)" }}
                        >
                          {col.label}
                          <SortIcon k={col.key} />
                        </button>
                      </th>
                    ))}
                    <th className="w-16 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tx, i) => (
                    <DesktopTxRow
                      key={tx.id}
                      tx={tx}
                      index={i}
                      selected={selected.has(tx.id)}
                      onToggle={() => toggleOne(tx.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                {(page - 1) * TX_PAGE_SIZE + 1}–{Math.min(page * TX_PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <PaginationBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </PaginationBtn>

                {Array.from({ length: Math.min(numPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <PaginationBtn key={p} onClick={() => setPage(p)} active={page === p}>
                      {p}
                    </PaginationBtn>
                  );
                })}

                {numPages > 7 && (
                  <span className="px-1 text-[12px]" style={{ color: "var(--text-muted)" }}>…</span>
                )}

                <PaginationBtn onClick={() => setPage((p) => Math.min(numPages, p + 1))} disabled={page === numPages}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </PaginationBtn>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Pagination button ───────────────────────────────────────────────────── */
function PaginationBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-semibold transition disabled:opacity-40"
      style={{
        background: active ? "var(--text-primary)" : "var(--surface-card)",
        color: active ? "var(--surface-card)" : "var(--text-tertiary)",
        border: active ? "none" : "1px solid var(--border-default)",
        boxShadow: active ? "none" : "var(--shadow-xs)",
      }}
    >
      {children}
    </button>
  );
}

/* ─── Desktop table row ───────────────────────────────────────────────────── */
const DesktopTxRow = memo(function DesktopTxRow({
  tx, index, selected, onToggle,
}: { tx: Tx; index: number; selected: boolean; onToggle: () => void }) {
  const { onOpen } = useOpenTransaction();
  const { onOpen: openAccount } = useOpenAccount();
  const { onOpen: openCategory } = useOpenCategory();
  const deleteMutation = useDeleteTransaction(tx.id);
  const isIncome = tx.amount >= 0;
  const catColor = categoryColor(index % 10);

  return (
    <tr
      className="group relative transition-colors"
      style={{
        background: selected ? "var(--surface-active)" : undefined,
        borderBottom: "1px solid var(--border-subtle)",
      }}
      onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"; }}
      onMouseLeave={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.background = ""; }}
    >
      {/* Accent bar */}
      <td className="relative w-10 px-4 py-3.5">
        <div
          className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full opacity-0 transition-opacity group-hover:opacity-100"
          style={{ background: isIncome ? "var(--color-income-light)" : "var(--color-expense-light)" }}
        />
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 cursor-pointer rounded"
          style={{ accentColor: "var(--color-info-mid)" }}
        />
      </td>

      {/* Date */}
      <td className="px-4 py-3.5">
        <span className="text-[13px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
          {fmtDate(tx.date)}
        </span>
      </td>

      {/* Payee */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm"
            style={{ background: `${catColor}18` }}
          >
            {categoryIcon(tx.category ?? "")}
          </div>
          <span className="max-w-[180px] truncate text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {tx.payee}
          </span>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3.5">
        {tx.category ? (
          <button
            type="button"
            onClick={() => tx.categoryId && openCategory(tx.categoryId)}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition hover:opacity-80"
            style={{ background: `${catColor}14`, color: "var(--text-secondary)", border: `1px solid ${catColor}28` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: catColor }} />
            {tx.category}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpen(tx.id)}
            className="inline-flex items-center gap-1 text-[11px] font-medium transition hover:opacity-80"
            style={{ color: "var(--color-warning)" }}
          >
            <TriangleAlert className="h-3 w-3" />
            Uncategorized
          </button>
        )}
      </td>

      {/* Account */}
      <td className="px-4 py-3.5">
        <button
          type="button"
          onClick={() => openAccount(tx.accountId)}
          className="text-[13px] transition hover:underline"
          style={{ color: "var(--text-tertiary)" }}
        >
          {tx.account}
        </button>
      </td>

      {/* Amount */}
      <td className="px-4 py-3.5 text-right">
        <span className="text-[14px] font-bold tabular-nums" style={{ color: isIncome ? "var(--color-income)" : "var(--color-expense)" }}>
          {isIncome ? "+" : "−"}{fmtAmt(tx.amount)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <ActionBtn onClick={() => onOpen(tx.id)} title="Edit">
            <Edit className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} danger title="Delete">
            {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </ActionBtn>
        </div>
      </td>
    </tr>
  );
});

function ActionBtn({ children, onClick, disabled, danger, title }: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-lg transition disabled:opacity-40"
      style={{ color: "var(--text-muted)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = danger ? "var(--color-expense-bg)" : "var(--surface-hover)";
        (e.currentTarget as HTMLElement).style.color = danger ? "var(--color-expense)" : "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "";
        (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
      }}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOBILE TRANSACTIONS
   ═══════════════════════════════════════════════════════════════════════════ */
function MobileTransactions({
  transactions, onUpload, onNewTx,
}: { transactions: Tx[]; onUpload: (r: any) => void; onNewTx: () => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [showSearch, setShowSearch] = useState(false);

  const incomeTotal  = useMemo(() => totalIncome(transactions),  [transactions]);
  const expenseTotal = useMemo(() => totalExpense(transactions), [transactions]);

  const filtered = useMemo(
    () => filterTransactions(transactions, search, filter),
    [transactions, search, filter]
  );

  const grouped = useMemo(
    () => groupTransactionsByDate(filtered),
    [filtered]
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--surface-bg)" }}>

      {/* ── Sticky header ─────────────────────────────────────────────── */}
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
            <h1 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>Activity</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-medium" style={{ color: "var(--color-income)" }}>
                +{fmtAmt(incomeTotal)}
              </span>
              <span className="text-[11px]" style={{ color: "var(--border-strong)" }}>·</span>
              <span className="text-[11px] font-medium" style={{ color: "var(--color-expense)" }}>
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
                background: showSearch ? "var(--color-info-bg)" : "var(--surface-card)",
                border: showSearch ? "1px solid var(--color-info-border)" : "1px solid var(--border-default)",
                color: showSearch ? "var(--color-info)" : "var(--text-muted)",
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
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
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
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
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
                onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border-focus)"; }}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border-default)"; }}
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
          {([
            { v: "all",     l: "All",     n: transactions.length },
            { v: "income",  l: "Income",  n: transactions.filter((t) => t.amount > 0).length },
            { v: "expense", l: "Expense", n: transactions.filter((t) => t.amount < 0).length },
          ] as { v: TypeFilter; l: string; n: number }[]).map((chip) => (
            <button
              key={chip.v}
              type="button"
              onClick={() => setFilter(chip.v)}
              className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition"
              style={{
                background: filter === chip.v
                  ? (chip.v === "income" ? "var(--color-income-bg)" : chip.v === "expense" ? "var(--color-expense-bg)" : "var(--text-primary)")
                  : "var(--surface-card)",
                border: filter === chip.v
                  ? (chip.v === "income" ? "1px solid var(--color-income-border)" : chip.v === "expense" ? "1px solid var(--color-expense-border)" : "1px solid var(--text-primary)")
                  : "1px solid var(--border-default)",
                color: filter === chip.v
                  ? (chip.v === "income" ? "var(--color-income)" : chip.v === "expense" ? "var(--color-expense)" : "var(--surface-card)")
                  : "var(--text-tertiary)",
              }}
            >
              {chip.l}
              <span className="opacity-60">{chip.n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Transaction feed ───────────────────────────────────────────── */}
      <div className="pb-24">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--surface-sunken)" }}>
              <FileText className="h-6 w-6" style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              {search ? "No matching transactions" : "No transactions yet"}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              {search ? "Try a different search term" : "Tap Add to record your first one"}
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
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {date}
                </span>
                <div className="flex-1" style={{ height: "1px", background: "var(--border-subtle)" }} />
                <span
                  className="text-[11px] font-bold tabular-nums"
                  style={{
                    color: txs.reduce((s, t) => s + t.amount, 0) >= 0
                      ? "var(--color-income)"
                      : "var(--color-expense)",
                  }}
                >
                  {txs.reduce((s, t) => s + t.amount, 0) >= 0 ? "+" : "−"}
                  {fmtAmt(Math.abs(txs.reduce((s, t) => s + t.amount, 0)))}
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
                  <MobileTxCard key={tx.id} tx={tx} index={i} isLast={i === txs.length - 1} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const MobileTxCard = memo(function MobileTxCard({
  tx, index, isLast,
}: { tx: Tx; index: number; isLast: boolean }) {
  const { onOpen } = useOpenTransaction();
  const isIncome = tx.amount >= 0;
  const catColor = categoryColor(index % 10);

  return (
    <button
      type="button"
      onClick={() => onOpen(tx.id)}
      className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors active:scale-[0.99]"
      style={{ borderBottom: isLast ? "none" : "1px solid var(--border-subtle)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
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
          <p className="truncate text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {tx.payee}
          </p>
          {!tx.category && (
            <TriangleAlert className="h-3 w-3 flex-shrink-0" style={{ color: "var(--color-warning)" }} />
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
          {tx.category ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: catColor }} />
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
        <p className="text-[14px] font-bold tabular-nums" style={{ color: isIncome ? "var(--color-income)" : "var(--color-expense)" }}>
          {isIncome ? "+" : "−"}{fmtAmt(tx.amount)}
        </p>
      </div>
    </button>
  );
});

/* ─── Empty state ─────────────────────────────────────────────────────────── */
function EmptyState({ search, onClear, onAdd }: { search: string; onClear: () => void; onAdd: () => void }) {
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
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
              boxShadow: "var(--shadow-xs)",
            }}
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
            Start by adding a transaction manually or import from a CSV file
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              boxShadow: "0 2px 8px rgba(37,99,235,0.28)",
            }}
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>
        </>
      )}
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function TransactionsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex items-start justify-between pb-5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="space-y-2">
          <div className="h-5 w-24 animate-pulse rounded-xl" style={{ background: "var(--surface-sunken)" }} />
          <div className="h-4 w-48 animate-pulse rounded-xl" style={{ background: "var(--surface-sunken)" }} />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 animate-pulse rounded-xl" style={{ background: "var(--surface-sunken)" }} />
          <div className="h-9 w-36 animate-pulse rounded-xl" style={{ background: "var(--surface-sunken)" }} />
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2.5">
        <div className="h-9 w-52 animate-pulse rounded-xl" style={{ background: "var(--surface-sunken)" }} />
        <div className="ml-auto h-9 w-56 animate-pulse rounded-xl" style={{ background: "var(--surface-sunken)" }} />
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-md)" }}
      >
        <div className="flex items-center gap-4 px-4 py-3" style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="h-4 w-4 animate-pulse rounded" style={{ background: "var(--border-default)" }} />
          {[16, 28, 20, 20, 16].map((w, i) => (
            <div key={i} className="h-3 animate-pulse rounded" style={{ width: `${w}%`, background: "var(--border-default)" }} />
          ))}
        </div>

        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="h-4 w-4 animate-pulse rounded" style={{ background: "var(--surface-sunken)" }} />
            <div className="h-3.5 w-20 animate-pulse rounded" style={{ background: "var(--surface-sunken)" }} />
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 animate-pulse rounded-lg" style={{ background: "var(--surface-sunken)" }} />
              <div className="h-3.5 w-28 animate-pulse rounded" style={{ background: "var(--surface-sunken)" }} />
            </div>
            <div className="h-5 w-20 animate-pulse rounded-full" style={{ background: "var(--surface-sunken)" }} />
            <div className="h-3.5 w-24 animate-pulse rounded" style={{ background: "var(--surface-sunken)" }} />
            <div className="ml-auto h-3.5 w-16 animate-pulse rounded" style={{ background: "var(--surface-sunken)" }} />
          </div>
        ))}

        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="h-3.5 w-24 animate-pulse rounded" style={{ background: "var(--surface-sunken)" }} />
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-7 w-7 animate-pulse rounded-lg" style={{ background: "var(--surface-sunken)" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}