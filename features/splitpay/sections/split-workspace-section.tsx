"use client";

/**
 * features/splitpay/sections/split-workspace-section.tsx
 *
 * The right-hand workspace column. Extracted from split/page.tsx.
 *
 * Contains:
 *   SplitWorkspaceSection  — tab host + layout shell (was GroupDetail)
 *   ExpensesTab            — expense list composition (stateless)
 *   WorkspaceSidebar       — desktop settlement sidebar (was SettlementSidebar)
 *   TipsCard               — static desktop tips panel
 *
 * Stays in page.tsx: AddExpenseForm, ExpenseCard (both carry inline logic).
 * Settlement calculations: untouched — SplitSettlementSection handles the tab view.
 */

import { useState } from "react";
import { ChevronLeft, Plus, Receipt, Sparkles, ArrowRight } from "lucide-react";

import { useGroupSettlement } from "@/hooks/splitpay/useGroupStore";
import { SplitSettlementSection } from "@/features/splitpay/sections/split-settlement-section";
import { MemberList } from "@/features/splitpay/components/MemberPanel";
import {
  EmptyBlock,
  SectionLabel,
  inr,
  Avatar,
} from "@/features/splitpay/components/ui";
import { cn } from "@/lib/utils";
import type { Group } from "@/types/splitpay";

// ── Tab types ─────────────────────────────────────────────────────────────────

type DetailTab = "members" | "expenses" | "settle";

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY EXPORT — workspace shell (was GroupDetail)
// ─────────────────────────────────────────────────────────────────────────────

type WorkspaceProps = {
  group: Group;
  onBack: () => void;
  /** Whether we're in the mobile drill-down state */
  showBackButton: boolean;
  /** Slot: rendered inside the expenses tab for adding/listing expenses */
  expenseSlot: React.ReactNode;
};

export function SplitWorkspaceSection({
  group,
  onBack,
  showBackButton,
  expenseSlot,
}: WorkspaceProps) {
  const [tab, setTab] = useState<DetailTab>("expenses");
  const settlement = useGroupSettlement(group.id);

  const totalSpend = group.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="w-full min-w-0 lg:grid lg:grid-cols-[1fr_300px] lg:gap-6 xl:grid-cols-[1fr_320px] xl:gap-8">
      {/* ── Main column ──────────────────────────────────────────────────── */}
      <div className="min-w-0 space-y-3 lg:space-y-4">
        {/* Group header */}
        <div className="flex items-center gap-3">
          {/* Mobile back button */}
          {showBackButton && (
            <button
              type="button"
              onClick={onBack}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-xl border px-2.5 py-1.5",
                "text-[12px] font-semibold transition lg:hidden",
                "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}

          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 text-2xl">{group.emoji ?? "💰"}</span>
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-bold text-slate-900 dark:text-slate-100">
                {group.name}
              </h2>
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                {group.members.length} members · {group.expenses.length}{" "}
                expenses
                {group.expenses.length > 0 && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {inr(totalSpend, 0)}
                    </span>{" "}
                    total
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tab strip */}
        <div
          className={cn(
            "flex gap-1 rounded-2xl p-1",
            "bg-slate-100/80 dark:bg-slate-800/80"
          )}
        >
          {(["members", "expenses", "settle"] as DetailTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2",
                "text-[13px] font-semibold capitalize transition-all duration-150",
                tab === t
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              )}
            >
              {t}
              {/* Pending settlement badge */}
              {t === "settle" &&
                settlement &&
                settlement.settlements.length > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none text-white",
                      tab === "settle" ? "bg-red-400" : "bg-red-500"
                    )}
                  >
                    {settlement.settlements.length}
                  </span>
                )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-0">
          {tab === "members" && <MemberList group={group} />}

          {tab === "expenses" && expenseSlot}

          {tab === "settle" && settlement && (
            <SplitSettlementSection group={group} settlement={settlement} />
          )}
        </div>

        {/* Mobile: pending settlement nudge (not on settle tab) */}
        {tab !== "settle" &&
          settlement &&
          settlement.settlements.length > 0 && (
            <div
              className={cn(
                "rounded-2xl border px-4 py-3 lg:hidden",
                "border-red-100 bg-red-50/80 dark:border-red-900/40 dark:bg-red-950/30"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-red-700 dark:text-red-400">
                  {settlement.settlements.length} settlement
                  {settlement.settlements.length !== 1 ? "s" : ""} pending
                </p>
                <button
                  type="button"
                  onClick={() => setTab("settle")}
                  className="text-[12px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  View →
                </button>
              </div>
            </div>
          )}
      </div>

      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <div className="hidden lg:block lg:min-w-0">
        {settlement && settlement.settlements.length > 0 ? (
          <WorkspaceSidebar group={group} settlement={settlement} />
        ) : (
          <TipsCard />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSES TAB  (stateless composition, AddExpenseForm/ExpenseCard from page)
// ─────────────────────────────────────────────────────────────────────────────

type ExpensesTabProps = {
  group: Group;
  showAddExpense: boolean;
  onToggleAdd: (v: boolean) => void;
  /** Slot rendered when showAddExpense is true — AddExpenseForm stays in page */
  addFormSlot: React.ReactNode;
  /** Expense card list — ExpenseCard stays in page */
  listSlot: React.ReactNode;
};

export function ExpensesTab({
  group,
  showAddExpense,
  onToggleAdd,
  addFormSlot,
  listSlot,
}: ExpensesTabProps) {
  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <SectionLabel>Expenses</SectionLabel>
        <button
          type="button"
          onClick={() => onToggleAdd(true)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-1.5",
            "text-[12px] font-bold text-white shadow-sm transition",
            "bg-blue-600 hover:bg-blue-700",
            "active:scale-[0.97]"
          )}
        >
          <Plus className="h-3.5 w-3.5" /> Add Expense
        </button>
      </div>

      {/* Inline add form slot */}
      {showAddExpense && addFormSlot}

      {/* Empty state */}
      {group.expenses.length === 0 && !showAddExpense && (
        <EmptyBlock
          icon={<Receipt className="h-6 w-6" />}
          title="No expenses yet"
          description="Add your first expense to start splitting"
          action={
            <button
              type="button"
              onClick={() => onToggleAdd(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Add Expense
            </button>
          }
        />
      )}

      {/* Expense cards slot */}
      {group.expenses.length > 0 && <div className="space-y-2">{listSlot}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP SETTLEMENT SIDEBAR (was SettlementSidebar)
// ─────────────────────────────────────────────────────────────────────────────

type SidebarProps = {
  group: Group;
  settlement: ReturnType<typeof useGroupSettlement>;
};

function WorkspaceSidebar({ group, settlement }: SidebarProps) {
  if (!settlement) return null;

  const totalSpend = group.expenses.reduce((s, e) => s + e.amount, 0);
  const memberMap = Object.fromEntries(group.members.map((m) => [m.id, m]));

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border",
        "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/80",
        "shadow-sm"
      )}
    >
      {/* Header */}
      <div className={cn("px-5 py-4", "bg-slate-900 dark:bg-slate-900/90")}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Total Spend
        </p>
        <p className="text-[22px] font-bold text-white">{inr(totalSpend, 0)}</p>
        <p className="mt-1 text-[12px] text-slate-400">
          {settlement.settlements.length} settlement
          {settlement.settlements.length !== 1 ? "s" : ""} needed
        </p>
      </div>

      {/* Settlement rows */}
      <div className="divide-y divide-slate-50 p-1.5 dark:divide-slate-700/60">
        {settlement.settlements.map((s, i) => {
          const from = memberMap[s.fromId];
          const to = memberMap[s.toId];
          if (!from || !to) return null;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-3 transition",
                "hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
            >
              <Avatar name={from.name} color={from.color} size={28} />
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
              <Avatar name={to.name} color={to.color} size={28} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                  {from.name} → {to.name}
                </p>
              </div>
              <span className="shrink-0 text-[13px] font-bold text-red-500 dark:text-red-400">
                {inr(s.amount, 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TIPS CARD (static, desktop only)
// ─────────────────────────────────────────────────────────────────────────────

function TipsCard() {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 lg:p-5",
        "border-slate-100 bg-slate-50/60 dark:border-slate-700/60 dark:bg-slate-800/40"
      )}
    >
      <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        Tips
      </h3>
      <div className="space-y-2.5 text-[12px] text-slate-400 dark:text-slate-500">
        <p>
          · Hover any expense or member to reveal{" "}
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            Edit
          </span>{" "}
          and Delete
        </p>
        <p>
          · UPI links use{" "}
          <span className="rounded bg-slate-100 px-1 font-mono text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            phone@upi
          </span>{" "}
          — works with GPay, PhonePe
        </p>
        <p>
          ·{" "}
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            Shares
          </span>{" "}
          mode: assign weights for unequal splits (2× = pays double)
        </p>
        <p>
          · Switch to{" "}
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            Settle
          </span>{" "}
          tab for minimum transactions
        </p>
        <p>· Member name/color edits reflect instantly across all expenses</p>
      </div>
    </div>
  );
}
