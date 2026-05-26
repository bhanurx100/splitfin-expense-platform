"use client";

/**
 * features/splitpay/components/expense-card.tsx
 *
 * Displays a single expense with participant shares, edit, and delete.
 * Logic unchanged from split/page.tsx — only rendering extracted + improved.
 */

import { useState, useMemo } from "react";
import { Receipt, Pencil, Trash2 } from "lucide-react";

import { useGroupStore }          from "@/hooks/splitpay/useGroupStore";
import { computeExpenseShares }   from "@/features/splitpay/lib/calculations";
import { EditExpenseModal }        from "@/components/splitpay/EditExpenseModal";
import { Avatar, inr }            from "@/components/splitpay/ui";
import { cn }                     from "@/lib/utils";
import type { Expense, Group, SplitMethod } from "@/types/splitpay";

// ── Constants ─────────────────────────────────────────────────────────────────

const METHOD_LABEL: Record<SplitMethod, string> = {
  equal:   "Equal",
  exact:   "Exact",
  percent: "Percent",
  shares:  "Shares",
};

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  expense: Expense;
  group:   Group;
};

export function ExpenseCard({ expense, group }: Props) {
  const { removeExpense } = useGroupStore();
  const [editing, setEditing] = useState(false);

  const payer  = group.members.find((m) => m.id === expense.paidBy);
  const shares = useMemo(() => computeExpenseShares(expense), [expense]);

  const visibleParticipants = expense.participants.slice(0, 4);
  const overflow            = expense.participants.length - 4;

  return (
    <>
      <div
        className={cn(
          // Layout
          "group relative flex items-start gap-3 overflow-hidden",
          // Shape
          "rounded-2xl border px-4 py-3.5",
          // Light
          "border-slate-100 bg-white",
          // Light hover — lift without shadow jump
          "hover:border-slate-200 hover:bg-slate-50/60",
          // Dark
          "dark:border-slate-700/50 dark:bg-slate-800/50",
          // Dark hover
          "dark:hover:border-slate-600/70 dark:hover:bg-slate-800/80",
          // Motion
          "transition-all duration-150",
        )}
      >
        {/* Icon cell */}
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            "bg-slate-100 dark:bg-slate-700/80",
          )}
        >
          <Receipt className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </div>

        <div className="min-w-0 flex-1">
          {/* Top row: title + amount */}
          <div className="flex items-start justify-between gap-2">

            {/* Left: title + meta */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold leading-snug text-slate-800 dark:text-slate-100">
                {expense.title}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-[12px] text-slate-400 dark:text-slate-500">
                <span>{expense.date}</span>
                {payer && (
                  <>
                    <span>·</span>
                    <span>
                      Paid by{" "}
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {payer.name}
                      </span>
                    </span>
                  </>
                )}
                <span>·</span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-px text-[10px] font-semibold",
                    "bg-slate-100 text-slate-500",
                    "dark:bg-slate-700 dark:text-slate-400",
                  )}
                >
                  {METHOD_LABEL[expense.splitMethod]}
                </span>
              </p>
            </div>

            {/* Right: amount + actions */}
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <p className="text-[15px] font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {inr(expense.amount, 0)}
              </p>

              {/* Actions — always visible mobile, hover-reveal desktop */}
              <div className="flex items-center gap-0.5 opacity-100 transition-opacity duration-150 lg:opacity-0 lg:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-label="Edit expense"
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg transition",
                    "text-slate-400 hover:bg-blue-50 hover:text-blue-500",
                    "dark:text-slate-500 dark:hover:bg-blue-950/40 dark:hover:text-blue-400",
                  )}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeExpense(group.id, expense.id)}
                  aria-label="Delete expense"
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg transition",
                    "text-slate-400 hover:bg-red-50 hover:text-red-400",
                    "dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400",
                  )}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Participant share pills */}
          {visibleParticipants.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {visibleParticipants.map((p) => {
                const member = group.members.find((m) => m.id === p.memberId);
                if (!member) return null;
                return (
                  <div
                    key={p.memberId}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-0.5",
                      "bg-slate-50 text-[11px] text-slate-600",
                      "dark:bg-slate-700/50 dark:text-slate-300",
                    )}
                  >
                    <Avatar name={member.name} color={member.color} size={14} />
                    <span className="font-medium">{member.name}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {inr(shares[p.memberId] ?? 0, 0)}
                    </span>
                  </div>
                );
              })}
              {overflow > 0 && (
                <div
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] text-slate-400",
                    "bg-slate-50 dark:bg-slate-700/50 dark:text-slate-500",
                  )}
                >
                  +{overflow} more
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal — mounted only when open */}
      {editing && (
        <EditExpenseModal
          group={group}
          expense={expense}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}