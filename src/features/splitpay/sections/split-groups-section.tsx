"use client";

/**
 * features/splitpay/sections/split-groups-section.tsx
 *
 * Renders the scrollable group list column.
 * Extracted from the inline GroupListIntercepted component in split/page.tsx.
 *
 * Responsibilities:
 *  - Display all groups with stats (spend, debtors)
 *  - "New Group" and "Reset Demo" controls
 *  - Calls onSelectGroup so the parent (SplitPage) can handle mobile nav
 *
 * NOT responsible for:
 *  - Mobile view-switching (parent owns that)
 *  - Store patching (parent patches setActiveGroup before calling here)
 */

import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";

import { useGroupStore } from "@/src/features/splitpay/hooks/useGroupStore";
import { computeGroupBalances } from "@/src/features/splitpay/lib/calculations";
import { DEMO_GROUPS } from "@/src/data/splitpay/demo";
import { CreateGroupSheet } from "@/src/features/splitpay/components/GroupPanel";
import {
  EmptyBlock,
  SectionLabel,
  inr,
} from "@/src/features/splitpay/components/ui";
import { cn } from "@/src/lib/utils";
import type { Group, Expense } from "@/src/features/splitpay/types";

const DEMO_IDS = new Set(DEMO_GROUPS.map((g) => g.id));

type Props = {
  onSelectGroup: (id: string) => void;
};

export function SplitGroupsSection({ onSelectGroup }: Props) {
  const { groups, activeGroupId, setActiveGroup, resetToDemo, deleteGroup } =
    useGroupStore();

  const [showCreate, setShowCreate] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function handleSelect(id: string) {
    setActiveGroup(id);
    onSelectGroup(id);
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    resetToDemo();
    setConfirmReset(false);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionLabel>Groups</SectionLabel>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReset}
            title="Restore demo data"
            className={cn(
              "flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition",
              confirmReset
                ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:border-slate-600 dark:hover:text-slate-300"
            )}
          >
            <RefreshCw className="h-3 w-3" />
            {confirmReset ? "Confirm?" : "Demo"}
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-3 w-3" /> New
          </button>
        </div>
      </div>

      {/* Empty state */}
      {groups.length === 0 ? (
        <EmptyBlock
          icon={<Users className="h-6 w-6" />}
          title="No groups yet"
          description="Create a group to start splitting expenses"
          action={
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Create Group
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {groups.map((g: Group) => {
            const active = g.id === activeGroupId;
            const isDemo = DEMO_IDS.has(g.id);
            const totalSpend = g.expenses.reduce(
              (s: number, e: Expense) => s + e.amount,
              0
            );
            const balances = computeGroupBalances(g);
            const debtors = balances.filter((b) => b.netBalance < -0.01).length;

            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleSelect(g.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-150",
                  active
                    ? "border-blue-200 bg-blue-50 shadow-sm dark:border-blue-800 dark:bg-blue-950/40"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600"
                )}
              >
                {/* Emoji */}
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px]",
                    active
                      ? "bg-white shadow-sm dark:bg-slate-800"
                      : "bg-slate-100 dark:bg-slate-700"
                  )}
                >
                  {g.emoji ?? "💰"}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "truncate text-[14px] font-semibold",
                        active
                          ? "text-blue-700 dark:text-blue-400"
                          : "text-slate-800 dark:text-slate-100"
                      )}
                    >
                      {g.name}
                    </p>
                    {isDemo && (
                      <span className="flex-shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-400 dark:text-slate-500">
                    {g.members.length} members · {g.expenses.length} expenses
                    {totalSpend > 0 && <> · {inr(totalSpend, 0)}</>}
                    {debtors > 0 && (
                      <span className="ml-1 font-semibold text-red-400">
                        {debtors} owe
                      </span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGroup(g.id);
                    }}
                    className="rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-400 group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    aria-label="Delete group"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 transition",
                      active
                        ? "text-blue-400"
                        : "text-slate-300 dark:text-slate-600"
                    )}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Demo hint */}
      {groups.length > 0 && groups.every((g: Group) => DEMO_IDS.has(g.id)) && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          <Sparkles className="h-3 w-3 flex-shrink-0 text-amber-500" />
          These are demo groups — add your own or clear them!
        </div>
      )}

      {showCreate && <CreateGroupSheet onClose={() => setShowCreate(false)} />}
    </div>
  );
}
