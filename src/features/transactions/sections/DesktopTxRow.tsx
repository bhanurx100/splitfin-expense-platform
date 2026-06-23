"use client";
/**
 * features/transactions/sections/DesktopTxRow.tsx
 *
 * Single row in the desktop activity table.
 * Extracted from app/(dashboard)/transactions/page.tsx.
 */

import { memo } from "react";
import { Edit, Loader2, Trash2, TriangleAlert } from "lucide-react";

import { useOpenTransaction } from "@/src/features/transactions/hooks/use-open-transaction";
import { useDeleteTransaction } from "@/src/features/transactions/api/use-delete-transaction";
import { useOpenAccount } from "@/src/features/accounts/hooks/use-open-account";
import { useOpenCategory } from "@/src/features/categories/hooks/use-open-category";
import { categoryColor, categoryIcon } from "@/src/features/transactions/lib/categories";
import { fmtDate, type Tx } from "@/src/features/transactions/lib/filters";
import { formatAbsINR } from "@/src/features/transactions/lib/formatters";

function fmtAmt(n: number) {
  return formatAbsINR(Math.abs(n), 2);
}

function ActionBtn({
  children,
  onClick,
  disabled,
  danger,
  title,
}: {
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
        (e.currentTarget as HTMLElement).style.background = danger
          ? "var(--color-expense-bg)"
          : "var(--surface-hover)";
        (e.currentTarget as HTMLElement).style.color = danger
          ? "var(--color-expense)"
          : "var(--text-primary)";
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

type Props = {
  tx: Tx;
  index: number;
  selected: boolean;
  onToggle: () => void;
};

export const DesktopTxRow = memo(function DesktopTxRow({
  tx,
  index,
  selected,
  onToggle,
}: Props) {
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
      onMouseEnter={(e) => {
        if (!selected)
          (e.currentTarget as HTMLElement).style.background =
            "var(--surface-hover)";
      }}
      onMouseLeave={(e) => {
        if (!selected) (e.currentTarget as HTMLElement).style.background = "";
      }}
    >
      {/* Accent bar */}
      <td className="relative w-10 px-4 py-3.5">
        <div
          className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background: isIncome
              ? "var(--color-income-light)"
              : "var(--color-expense-light)",
          }}
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
        <span
          className="text-[13px] tabular-nums"
          style={{ color: "var(--text-tertiary)" }}
        >
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
          <span
            className="max-w-[180px] truncate text-[13px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
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
            style={{
              background: `${catColor}14`,
              color: "var(--text-secondary)",
              border: `1px solid ${catColor}28`,
            }}
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
        <span
          className="text-[14px] font-bold tabular-nums"
          style={{
            color: isIncome
              ? "var(--color-income)"
              : "var(--color-expense)",
          }}
        >
          {isIncome ? "+" : "−"}
          {fmtAmt(tx.amount)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <ActionBtn onClick={() => onOpen(tx.id)} title="Edit">
            <Edit className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            danger
            title="Delete"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </ActionBtn>
        </div>
      </td>
    </tr>
  );
});