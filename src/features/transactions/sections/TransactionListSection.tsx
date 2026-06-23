"use client";
/**
 * features/transactions/sections/TransactionListSection.tsx
 *
 * Shell for the desktop activity table — card wrapper, sort header,
 * pagination footer. Row rendering stays as DesktopTxRow in page.tsx
 * (it references too many local hooks to move safely right now).
 *
 * This section owns:
 *   - The outer rounded card
 *   - Column header row + sort buttons
 *   - Pagination controls
 *
 * Page passes: paginated rows as children, sort state, pagination state.
 */

import { memo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { SortKey, SortDir } from "@/src/features/transactions/lib/filters";

// ── Column config ─────────────────────────────────────────────────────────────

const COLUMNS: { key: SortKey; label: string; cls: string }[] = [
  { key: "date", label: "Date", cls: "w-28" },
  { key: "payee", label: "Payee", cls: "min-w-[160px]" },
  { key: "category", label: "Category", cls: "w-36" },
  { key: "account", label: "Account", cls: "w-36" },
  { key: "amount", label: "Amount", cls: "w-32 text-right" },
];

// ── Sort icon ─────────────────────────────────────────────────────────────────

function SortIcon({ colKey, sortKey, sortDir }: { colKey: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== colKey) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
  return sortDir === "asc"
    ? <ArrowUp className="h-3 w-3" style={{ color: "var(--text-brand)" }} />
    : <ArrowDown className="h-3 w-3" style={{ color: "var(--text-brand)" }} />;
}

// ── Pagination button ─────────────────────────────────────────────────────────

function PaginationBtn({
  children, onClick, disabled, active,
}: {
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

// ── Main section ──────────────────────────────────────────────────────────────

type Props = {
  // Sort
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;

  // Select-all checkbox
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;

  // Pagination
  page: number;
  numPages: number;
  totalFiltered: number;
  pageSize: number;
  onPage: (p: number) => void;

  // Rows rendered by parent (DesktopTxRow components)
  children: React.ReactNode;

  // Empty state rendered by parent
  empty?: boolean;
  emptySlot?: React.ReactNode;
};

export const TransactionListSection = memo(function TransactionListSection({
  sortKey, sortDir, onSort,
  allSelected, someSelected, onToggleAll,
  page, numPages, totalFiltered, pageSize, onPage,
  children, empty, emptySlot,
}: Props) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {empty ? (
        emptySlot
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--border-subtle)" }}>
                  {/* Select-all */}
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                      onChange={onToggleAll}
                      className="h-4 w-4 cursor-pointer rounded"
                      style={{ accentColor: "var(--color-info-mid)" }}
                    />
                  </th>

                  {/* Sortable columns */}
                  {COLUMNS.map((col) => (
                    <th key={col.key} className={cn("px-4 py-3 text-left", col.cls)}>
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:opacity-80"
                        style={{ color: sortKey === col.key ? "var(--text-brand)" : "var(--text-muted)" }}
                      >
                        {col.label}
                        <SortIcon colKey={col.key} sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    </th>
                  ))}
                  <th className="w-16 px-4 py-3" />
                </tr>
              </thead>
              <tbody>{children}</tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalFiltered)} of {totalFiltered}
            </p>
            <div className="flex items-center gap-1">
              <PaginationBtn onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </PaginationBtn>

              {Array.from({ length: Math.min(numPages, 7) }, (_, i) => i + 1).map((p) => (
                <PaginationBtn key={p} onClick={() => onPage(p)} active={page === p}>
                  {p}
                </PaginationBtn>
              ))}

              {numPages > 7 && (
                <span className="px-1 text-[12px]" style={{ color: "var(--text-muted)" }}>…</span>
              )}

              <PaginationBtn onClick={() => onPage(Math.min(numPages, page + 1))} disabled={page === numPages}>
                <ChevronRight className="h-3.5 w-3.5" />
              </PaginationBtn>
            </div>
          </div>
        </>
      )}
    </div>
  );
});