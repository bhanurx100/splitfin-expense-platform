"use client";

/**
 * app/(dashboard)/transactions/page.tsx
 *
 * Premium Transactions Page — "Ledger Precision"
 * - Desktop: sticky-header table with inline filters, bulk actions, pagination
 * - Mobile:  grouped transaction cards with swipe-friendly layout
 * - Import:  full CSV import flow preserved
 * - All hooks / mutations / CRUD unchanged
 */

import { useState, useMemo, memo } from "react";
import {
  Plus,
  Search,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
  X,
  FileText,
  CheckSquare,
  Edit,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { categoryColor, categoryIcon, formatINR } from "@/lib/mobile-utils";
import { cn } from "@/lib/utils";
import { ImportCard } from "./import-card";
import { UploadButton } from "./upload-button";

/* ─── types ──────────────────────────────────────────────────────────────── */
type Tx = {
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
type SortKey = "date" | "payee" | "category" | "amount" | "account";
type SortDir = "asc" | "desc";

enum VIEW {
  LIST = "LIST",
  IMPORT = "IMPORT",
}
const INITIAL_IMPORT = { data: [], errors: [], meta: [] };
const PAGE_SIZE = 20;

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return format(date, "dd MMM yyyy");
}
function fmtAmt(n: number) {
  return formatINR(Math.abs(n), 2);
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
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

  const onUpload = (r: typeof INITIAL_IMPORT) => {
    setImportData(r);
    setView(VIEW.IMPORT);
  };
  const onCancelImport = () => {
    setImportData(INITIAL_IMPORT);
    setView(VIEW.LIST);
  };
  const onSubmitImport = async (
    values: (typeof transactionSchema.$inferInsert)[]
  ) => {
    const accountId = await confirmAccount();
    if (!accountId) return toast.error("Please select an account to continue.");
    bulkCreate.mutate(
      values.map((v) => ({ ...v, accountId: accountId as string })),
      { onSuccess: onCancelImport }
    );
  };

  /* ── Import view ── */
  if (view === VIEW.IMPORT)
    return (
      <>
        <AccountDialog />
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <ImportCard
            data={importData.data}
            onCancel={onCancelImport}
            onSubmit={onSubmitImport}
          />
        </div>
      </>
    );

  /* ── Loading ── */
  if (txQuery.isLoading) return <TransactionsSkeleton />;

  /* ── Main ── */
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
  transactions,
  onUpload,
  onNewTx,
  onBulkDelete,
  isDisabled,
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
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all"
  );

  /* derived stats */
  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.amount > 0)
        .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.amount < 0)
        .reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions]
  );

  /* filter + sort */
  const filtered = useMemo(() => {
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
    if (typeFilter === "income") out = out.filter((t) => t.amount > 0);
    if (typeFilter === "expense") out = out.filter((t) => t.amount < 0);
    out = [...out].sort((a, b) => {
      let av: any, bv: any;
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
      if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return out;
  }, [transactions, search, typeFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

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
    onBulkDelete([...selected]);
    setSelected(new Set());
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k)
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
    );
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 xl:px-10">
      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 py-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Transactions
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            {transactions.length.toLocaleString()} total ·{" "}
            {filtered.length !== transactions.length &&
              `${filtered.length} filtered · `}
            <span className="text-emerald-600">+{fmtAmt(totalIncome)}</span> ·{" "}
            <span className="text-red-500">−{fmtAmt(totalExpense)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UploadButton onUpload={onUpload} />
          <Button onClick={onNewTx} className="gap-2 rounded-xl text-[13px]">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* ── STAT CHIPS ───────────────────────────────────────────────── */}
      <div className="mt-4 flex items-center gap-3">
        {[
          { label: "All", value: "all", count: transactions.length },
          {
            label: "Income",
            value: "income",
            count: transactions.filter((t) => t.amount > 0).length,
            color: "text-emerald-600",
          },
          {
            label: "Expense",
            value: "expense",
            count: transactions.filter((t) => t.amount < 0).length,
            color: "text-red-500",
          },
        ].map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => {
              setTypeFilter(chip.value as any);
              setPage(1);
              setSelected(new Set());
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-150",
              typeFilter === chip.value
                ? "border-slate-300 bg-slate-900 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
            )}
          >
            {chip.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                typeFilter === chip.value
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              )}
            >
              {chip.count}
            </span>
          </button>
        ))}

        {/* Search — pushed right */}
        <div className="ml-auto flex items-center gap-2">
          {/* Bulk delete bar — appears when selected */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5">
              <CheckSquare className="h-3.5 w-3.5 text-red-500" />
              <span className="text-[12px] font-semibold text-red-600">
                {selected.size} selected
              </span>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isDisabled}
                className="ml-1 flex items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="ml-0.5 text-red-400 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setSelected(new Set());
              }}
              placeholder="Search payee, category, account…"
              className="h-9 w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgb(59,130,246,0.1)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── TABLE ────────────────────────────────────────────────────── */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState
            search={search}
            onClear={() => setSearch("")}
            onAdd={onNewTx}
            onImport={() => {}}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Sticky thead */}
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {/* Checkbox */}
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={
                          paginated.length > 0 &&
                          selected.size === paginated.length
                        }
                        ref={(el) => {
                          if (el)
                            el.indeterminate =
                              selected.size > 0 &&
                              selected.size < paginated.length;
                        }}
                        onChange={toggleAll}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600"
                      />
                    </th>
                    {(
                      [
                        { key: "date", label: "Date", w: "w-28" },
                        { key: "payee", label: "Payee", w: "min-w-[160px]" },
                        { key: "category", label: "Category", w: "w-32" },
                        { key: "account", label: "Account", w: "w-36" },
                        {
                          key: "amount",
                          label: "Amount",
                          w: "w-28 text-right",
                        },
                      ] as { key: SortKey; label: string; w: string }[]
                    ).map((col) => (
                      <th
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider",
                          col.key === "amount" ? "text-right" : "",
                          col.w
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={cn(
                            "inline-flex items-center gap-1.5 transition-colors hover:text-slate-900",
                            sortKey === col.key
                              ? "text-blue-600"
                              : "text-slate-400"
                          )}
                        >
                          {col.label}
                          <SortIcon k={col.key} />
                        </button>
                      </th>
                    ))}
                    {/* Actions col */}
                    <th className="w-16 px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {paginated.map((tx, i) => (
                    <TableRow
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
            <div className="flex items-center justify-between border-t border-slate-50 px-5 py-3">
              <p className="text-[12px] text-slate-400">
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-semibold transition",
                        page === p
                          ? "bg-slate-900 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 7 && (
                  <span className="px-1 text-slate-400">…</span>
                )}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom spacer */}
      <div className="h-10" />
    </div>
  );
}

/* ─── Table row ──────────────────────────────────────────────────────────── */
const TableRow = memo(function TableRow({
  tx,
  index,
  selected,
  onToggle,
}: {
  tx: Tx;
  index: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const { onOpen } = useOpenTransaction();
  const { onOpen: openAccount } = useOpenAccount();
  const { onOpen: openCategory } = useOpenCategory();
  const deleteMutation = useDeleteTransaction(tx.id);

  const isIncome = tx.amount >= 0;
  const catColor = categoryColor(index % 10);
  const catIcon = categoryIcon(tx.category ?? "");

  return (
    <tr
      className={cn(
        "group transition-colors",
        selected ? "bg-blue-50/60" : "hover:bg-slate-50/60"
      )}
    >
      {/* Checkbox */}
      <td className="w-10 px-4 py-3.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600"
        />
      </td>

      {/* Date */}
      <td className="px-4 py-3.5">
        <span
          className="text-[13px] font-medium text-slate-600"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {fmtDate(tx.date)}
        </span>
      </td>

      {/* Payee */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm"
            style={{ background: `${catColor}14` }}
          >
            {catIcon}
          </div>
          <span className="max-w-[180px] truncate text-[13px] font-semibold text-slate-800">
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
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-200 hover:text-slate-800"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: catColor }}
            />
            {tx.category}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpen(tx.id)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 hover:text-amber-700"
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
          className="text-[13px] text-slate-500 transition hover:text-slate-800 hover:underline"
        >
          {tx.account}
        </button>
      </td>

      {/* Amount */}
      <td className="px-4 py-3.5 text-right">
        <span
          className={cn(
            "text-[13px] font-bold",
            isIncome ? "text-emerald-600" : "text-red-500"
          )}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {isIncome ? "+" : "−"}
          {fmtAmt(tx.amount)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onOpen(tx.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   MOBILE TRANSACTIONS
   ═══════════════════════════════════════════════════════════════════════════ */
function MobileTransactions({
  transactions,
  onUpload,
  onNewTx,
}: {
  transactions: Tx[];
  onUpload: (r: any) => void;
  onNewTx: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [showSearch, setShowSearch] = useState(false);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.amount > 0)
        .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.amount < 0)
        .reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions]
  );

  const filtered = useMemo(() => {
    let out = transactions;
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (t) =>
          t.payee.toLowerCase().includes(q) ||
          (t.category ?? "").toLowerCase().includes(q)
      );
    }
    if (filter === "income") out = out.filter((t) => t.amount > 0);
    if (filter === "expense") out = out.filter((t) => t.amount < 0);
    return out;
  }, [transactions, search, filter]);

  /* Group by date */
  const grouped = useMemo(() => {
    const map = new Map<string, Tx[]>();
    filtered.forEach((tx) => {
      const key = fmtDate(tx.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* ── Mobile header ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md">
        <div className="border-b border-slate-100 px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[16px] font-bold text-slate-900">
                Transactions
              </h1>
              <p className="text-[11px] text-slate-400">
                <span className="text-emerald-600">+{fmtAmt(totalIncome)}</span>
                {" · "}
                <span className="text-red-500">−{fmtAmt(totalExpense)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSearch((s) => !s)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl border transition",
                  showSearch
                    ? "border-blue-300 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-500"
                )}
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onNewTx}
                className="flex h-8 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-[12px] font-semibold text-white shadow-sm transition active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search transactions…"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-slate-400 focus:border-blue-400"
                />
              </div>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Filter pills */}
          <div className="mt-2.5 flex gap-1.5">
            {[
              { v: "all", l: "All", n: transactions.length },
              {
                v: "income",
                l: "Income",
                n: transactions.filter((t) => t.amount > 0).length,
              },
              {
                v: "expense",
                l: "Expense",
                n: transactions.filter((t) => t.amount < 0).length,
              },
            ].map((chip) => (
              <button
                key={chip.v}
                type="button"
                onClick={() => setFilter(chip.v as any)}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                  filter === chip.v
                    ? "border-slate-800 bg-slate-800 text-white"
                    : "border-slate-200 bg-white text-slate-500"
                )}
              >
                {chip.l}
                <span
                  className={cn(
                    "rounded-full px-1 text-[10px]",
                    filter === chip.v ? "text-white/70" : "text-slate-400"
                  )}
                >
                  {chip.n}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Transaction list ─────────────────────────────────────── */}
      <div className="space-y-0 pb-28">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <FileText className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              {search ? "No matching transactions" : "No transactions yet"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {search
                ? "Try a different search term"
                : "Tap Add to record your first one"}
            </p>
          </div>
        ) : (
          grouped.map(([date, txs]) => (
            <div key={date}>
              {/* Date header */}
              <div className="sticky top-[130px] z-10 flex items-center gap-3 bg-slate-50/90 px-4 py-2 backdrop-blur-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {date}
                </span>
                <div className="flex-1 border-t border-slate-100" />
                <span
                  className={cn(
                    "text-[11px] font-bold tabular-nums",
                    txs.reduce((s, t) => s + t.amount, 0) >= 0
                      ? "text-emerald-600"
                      : "text-red-500"
                  )}
                >
                  {txs.reduce((s, t) => s + t.amount, 0) >= 0 ? "+" : "−"}
                  {fmtAmt(Math.abs(txs.reduce((s, t) => s + t.amount, 0)))}
                </span>
              </div>

              {/* Cards */}
              <div className="bg-white">
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

      {/* ── Import bar ───────────────────────────────────────────── */}
      <div className="fixed bottom-[72px] left-0 right-0 z-20 px-4 pb-2">
        <div className="shadow-slate-900/8 flex gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl">
          <UploadButton onUpload={onUpload} />
          <button
            type="button"
            onClick={onNewTx}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-[13px] font-semibold text-white transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New Transaction
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile transaction card ────────────────────────────────────────────── */
const MobileTxCard = memo(function MobileTxCard({
  tx,
  index,
  isLast,
}: {
  tx: Tx;
  index: number;
  isLast: boolean;
}) {
  const { onOpen } = useOpenTransaction();
  const isIncome = tx.amount >= 0;
  const catColor = categoryColor(index % 10);

  return (
    <button
      type="button"
      onClick={() => onOpen(tx.id)}
      className={cn(
        "flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors active:bg-slate-50",
        !isLast && "border-b border-slate-50"
      )}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base"
        style={{ background: `${catColor}14` }}
      >
        {categoryIcon(tx.category ?? "")}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[14px] font-semibold text-slate-800">
            {tx.payee}
          </p>
          {!tx.category && (
            <TriangleAlert className="h-3 w-3 flex-shrink-0 text-amber-500" />
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          {tx.category ? (
            <>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: catColor }}
              />
              {tx.category}
            </>
          ) : (
            <span className="text-amber-600">Uncategorized</span>
          )}
          <span className="text-slate-300">·</span>
          {tx.account}
        </p>
      </div>

      <div className="text-right">
        <p
          className={cn(
            "text-[14px] font-bold",
            isIncome ? "text-emerald-600" : "text-red-500"
          )}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {isIncome ? "+" : "−"}
          {fmtAmt(tx.amount)}
        </p>
        {tx.notes && (
          <p className="mt-0.5 max-w-[80px] truncate text-[10px] text-slate-400">
            {tx.notes}
          </p>
        )}
      </div>
    </button>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════════════════ */
function EmptyState({
  search,
  onClear,
  onAdd,
  onImport,
}: {
  search: string;
  onClear: () => void;
  onAdd: () => void;
  onImport: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
        <FileText className="h-7 w-7 text-slate-300" />
      </div>
      {search ? (
        <>
          <p className="mb-1 text-[15px] font-semibold text-slate-700">
            No results for &quot;{search}&quot;
          </p>
          <p className="mb-5 text-[13px] text-slate-400">
            Try a different payee, category, or account name
          </p>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            Clear search
          </button>
        </>
      ) : (
        <>
          <p className="mb-1 text-[15px] font-semibold text-slate-700">
            No transactions yet
          </p>
          <p className="mb-6 max-w-[280px] text-[13px] leading-relaxed text-slate-400">
            Start by adding a transaction manually or import from a CSV file
          </p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING SKELETON
   ═══════════════════════════════════════════════════════════════════════════ */
function TransactionsSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 xl:px-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 py-5">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3.5 w-52" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* Chips */}
      <div className="mt-4 flex gap-2">
        {[80, 70, 80].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-xl" style={{ width: w }} />
        ))}
        <Skeleton className="ml-auto h-9 w-64 rounded-xl" />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Head */}
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          {[10, 20, 35, 20, 25, 15].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-slate-50 px-4 py-3.5"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3.5 w-20" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-3.5 w-28" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="ml-auto h-3.5 w-16" />
          </div>
        ))}
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-50 px-5 py-3">
          <Skeleton className="h-3.5 w-24" />
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-7 w-7 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
