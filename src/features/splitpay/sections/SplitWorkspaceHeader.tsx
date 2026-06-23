"use client";
/**
 * features/splitpay/sections/SplitWorkspaceHeader.tsx
 *
 * The top of the workspace panel:
 *   - Mobile back button
 *   - Group emoji + name + stats
 *   - Tab strip (Members / Expenses / Settle)
 *
 * Extracted from SplitWorkspaceSection (split-workspace-section.tsx).
 * Pure presentational — no Zustand, no calculations.
 */

import { ChevronLeft } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { inr } from "@/src/features/splitpay/components/ui";
import type { Group } from "@/src/features/splitpay/types";

type DetailTab = "members" | "expenses" | "settle";

type Props = {
  group: Group;
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  onBack: () => void;
  showBackButton: boolean;
  pendingCount: number; // settlements pending — badge on settle tab
};

const TABS: { key: DetailTab; label: string }[] = [
  { key: "members", label: "Members" },
  { key: "expenses", label: "Expenses" },
  { key: "settle", label: "Settle" },
];

export function SplitWorkspaceHeader({
  group,
  activeTab,
  onTabChange,
  onBack,
  showBackButton,
  pendingCount,
}: Props) {
  const totalSpend = group.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-3">
      {/* Group identity row */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            type="button"
            onClick={onBack}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-xl border px-2.5 py-1.5 lg:hidden",
              "text-[12px] font-semibold transition",
              "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
              {group.members.length} members · {group.expenses.length} expenses
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
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2",
              "text-[13px] font-semibold capitalize transition-all duration-150",
              activeTab === key
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            )}
          >
            {label}
            {key === "settle" && pendingCount > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none text-white",
                  activeTab === "settle" ? "bg-red-400" : "bg-red-500"
                )}
              >
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
