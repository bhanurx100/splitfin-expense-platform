"use client";

/**
 * app/(dashboard)/split/page.tsx
 *
 * Composition root for the SplitPay feature.
 *
 * Owns:
 *   - Mobile view-state ("groups" | "detail")
 *   - Store active-group patching
 *
 * All rendering delegated to features/splitpay/sections/:
 *   - SplitHeader
 *   - SplitGroupsSection
 *   - SplitWorkspaceSection  (GroupDetail shell + ExpensesTab)
 *   - AddExpenseForm          ← extracted (was inline here)
 *   - ExpenseCard
 *   - SplitSettlementSection
 */

import { useState, useCallback } from "react";
import { Users } from "lucide-react";

import type { Group } from "@/types/splitpay";
import { useGroupStore } from "@/hooks/splitpay/useGroupStore";
import { EmptyBlock } from "@/features/splitpay/components/ui";
import { cn } from "@/lib/utils";

import { SplitHeader } from "@/features/splitpay/sections/split-header";
import { SplitGroupsSection } from "@/features/splitpay/sections/split-groups-section";
import {
  SplitWorkspaceSection,
  ExpensesTab,
} from "@/features/splitpay/sections/split-workspace-section";
import { ExpenseCard } from "@/features/splitpay/components/expense-card";
import { AddExpenseForm } from "@/features/splitpay/sections/AddExpenseForm";

// ═════════════════════════════════════════════════════════════════════════════
// PAGE ROOT
// ═════════════════════════════════════════════════════════════════════════════

export default function SplitPage() {
  const { groups, activeGroupId, setActiveGroup } = useGroupStore();
  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;

  const [mobileView, setMobileView] = useState<"groups" | "detail">("groups");

  const handleSelectGroup = useCallback(
    (id: string) => {
      setActiveGroup(id);
      setMobileView("detail");
    },
    [setActiveGroup]
  );

  const handleBack = useCallback(() => setMobileView("groups"), []);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/60">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <SplitHeader hidden={mobileView === "detail"} />

        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-6 xl:grid-cols-[280px_1fr] xl:gap-8">
          {/* Column 1 — group list */}
          <div
            className={cn(
              "min-w-0",
              mobileView === "detail" ? "hidden lg:block" : "block"
            )}
          >
            <SplitGroupsSection onSelectGroup={handleSelectGroup} />
          </div>

          {/* Column 2 — workspace */}
          <div
            className={cn(
              "min-w-0",
              mobileView === "groups" ? "hidden lg:flex" : "flex flex-col"
            )}
          >
            {activeGroup ? (
              <WorkspaceWithExpenses
                group={activeGroup}
                onBack={handleBack}
                showBackButton={mobileView === "detail"}
              />
            ) : (
              <div
                className={cn(
                  "flex flex-1 items-center justify-center rounded-2xl py-20",
                  "border border-dashed border-slate-200 bg-white",
                  "dark:border-slate-700 dark:bg-slate-800/40"
                )}
              >
                <EmptyBlock
                  icon={<Users className="h-6 w-6" />}
                  title="Select a group"
                  description="Choose a group on the left or create a new one"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// WORKSPACE WIRING — slots AddExpenseForm + ExpenseCard into SplitWorkspaceSection
// ═════════════════════════════════════════════════════════════════════════════

function WorkspaceWithExpenses({
  group,
  onBack,
  showBackButton,
}: {
  group: Group;
  onBack: () => void;
  showBackButton: boolean;
}) {
  const [showAddExpense, setShowAddExpense] = useState(false);

  const expenseSlot = (
    <ExpensesTab
      group={group}
      showAddExpense={showAddExpense}
      onToggleAdd={setShowAddExpense}
      addFormSlot={
        showAddExpense ? (
          <AddExpenseForm
            group={group}
            onClose={() => setShowAddExpense(false)}
          />
        ) : null
      }
      listSlot={group.expenses.map((e) => (
        <ExpenseCard key={e.id} expense={e} group={group} />
      ))}
    />
  );

  return (
    <SplitWorkspaceSection
      group={group}
      onBack={onBack}
      showBackButton={showBackButton}
      expenseSlot={expenseSlot}
    />
  );
}
