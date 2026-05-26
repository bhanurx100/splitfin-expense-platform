"use client";

/**
 * app/(dashboard)/split/page.tsx
 *
 * Composition root for the SplitPay feature.
 *
 * This file owns:
 *   - Mobile view-state ("groups" | "detail")
 *   - Store active-group patching (GroupListWithCallback)
 *   - AddExpenseForm  — stays here (useExpenseForm logic too coupled to extract safely)
 *   - ExpenseCard     — stays here (inline removeExpense + editing state)
 *
 * Extracted to features/splitpay/sections/:
 *   - SplitHeader
 *   - SplitGroupsSection
 *   - SplitWorkspaceSection  (GroupDetail shell)
 *   - ExpensesTab
 *   - SplitSettlementSection (SettleTab)
 */

import { useState, useMemo, useCallback } from "react";
import {
  Plus, Trash2, Percent, Scale, Users, Receipt, Info, Sparkles,
} from "lucide-react";

import type { Group, Expense, SplitMethod } from "@/types/splitpay";
import { useGroupStore }   from "@/hooks/splitpay/useGroupStore";
import { useExpenseForm }  from "@/hooks/splitpay/useExpenseForm";
import { computeExpenseShares } from "@/features/splitpay/lib/calculations";
import { Avatar, Card, EmptyBlock, ParticipantChip, inr } from "@/components/splitpay/ui";
import { EditExpenseModal } from "@/components/splitpay/EditExpenseModal";
import { cn } from "@/lib/utils";

import { SplitHeader }           from "@/features/splitpay/sections/split-header";
import { SplitGroupsSection }    from "@/features/splitpay/sections/split-groups-section";
import { SplitWorkspaceSection, ExpensesTab } from "@/features/splitpay/sections/split-workspace-section";
import { ExpenseCard }           from "@/features/splitpay/components/expense-card";

// ── Constants ─────────────────────────────────────────────────────────────────

const SPLIT_METHODS: { key: SplitMethod; label: string; icon: React.ElementType }[] = [
  { key: "equal",   label: "Equal",   icon: Users   },
  { key: "exact",   label: "Exact",   icon: Receipt },
  { key: "percent", label: "Percent", icon: Percent },
  { key: "shares",  label: "Shares",  icon: Scale   },
];

// ═════════════════════════════════════════════════════════════════════════════
// PAGE ROOT
// ═════════════════════════════════════════════════════════════════════════════

export default function SplitPage() {
  const { groups, activeGroupId, setActiveGroup } = useGroupStore();
  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;

  const [mobileView, setMobileView] = useState<"groups" | "detail">("groups");

  const handleSelectGroup = useCallback((id: string) => {
    setActiveGroup(id);
    setMobileView("detail");
  }, [setActiveGroup]);

  const handleBack = useCallback(() => setMobileView("groups"), []);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/60">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        <SplitHeader hidden={mobileView === "detail"} />

        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-6 xl:grid-cols-[280px_1fr] xl:gap-8">

          {/* Column 1 — group list */}
          <div className={cn(
            "min-w-0",
            mobileView === "detail" ? "hidden lg:block" : "block",
          )}>
            <GroupListWithCallback onSelectGroup={handleSelectGroup} />
          </div>

          {/* Column 2 — workspace */}
          <div className={cn(
            "min-w-0",
            mobileView === "groups" ? "hidden lg:flex" : "flex flex-col",
          )}>
            {activeGroup ? (
              <WorkspaceWithExpenses
                group={activeGroup}
                onBack={handleBack}
                showBackButton={mobileView === "detail"}
              />
            ) : (
              <div className={cn(
                "flex flex-1 items-center justify-center rounded-2xl py-20",
                "border border-dashed border-slate-200 bg-white",
                "dark:border-slate-700 dark:bg-slate-800/40",
              )}>
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
// GROUP LIST WRAPPER — patches setActiveGroup for mobile nav
// ═════════════════════════════════════════════════════════════════════════════

function GroupListWithCallback({
  onSelectGroup,
}: {
  onSelectGroup: (id: string) => void;
}) {
  return <SplitGroupsSection onSelectGroup={onSelectGroup} />;
}

// ═════════════════════════════════════════════════════════════════════════════
// WORKSPACE WITH EXPENSES — wires AddExpenseForm + ExpenseCard into slots
// ═════════════════════════════════════════════════════════════════════════════

function WorkspaceWithExpenses({
  group,
  onBack,
  showBackButton,
}: {
  group:          Group;
  onBack:         () => void;
  showBackButton: boolean;
}) {
  const [showAddExpense, setShowAddExpense] = useState(false);

  const expenseSlot = (
    <ExpensesTab
      group={group}
      showAddExpense={showAddExpense}
      onToggleAdd={setShowAddExpense}
      addFormSlot={
        showAddExpense
          ? <AddExpenseForm group={group} onClose={() => setShowAddExpense(false)} />
          : null
      }
      listSlot={
        group.expenses.map((e) => (
          <ExpenseCard key={e.id} expense={e} group={group} />
        ))
      }
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

// ═════════════════════════════════════════════════════════════════════════════
// ADD EXPENSE FORM — stays here (tightly coupled to useExpenseForm)
// ═════════════════════════════════════════════════════════════════════════════

function AddExpenseForm({
  group,
  onClose,
}: {
  group:   Group;
  onClose: () => void;
}) {
  const { addExpense } = useGroupStore();
  const {
    form, grandTotal, tax, tip, validation,
    setField, setMethod, toggleParticipant,
    setAllParticipants, setParticipantValue, reset,
  } = useExpenseForm(group.members);

  const [showTaxTip, setShowTaxTip] = useState(false);

  const selectedIds = new Set(form.participants.map((p) => p.memberId));
  const allSelected =
    group.members.length > 0 &&
    group.members.every((m) => selectedIds.has(m.id));

  const handleSubmit = useCallback(() => {
    if (!validation.valid) return;
    addExpense(group.id, { ...form, amount: grandTotal });
    reset();
    onClose();
  }, [validation, addExpense, group.id, form, grandTotal, reset, onClose]);

  return (
    <Card className={cn(
      "p-4 lg:p-5",
      "dark:border-slate-700 dark:bg-slate-800/60",
    )}>
      <h3 className="mb-4 text-[14px] font-semibold text-slate-800 dark:text-slate-100">
        New Expense
      </h3>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Description
          </label>
          <input
            autoFocus
            type="text"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Dinner, Cab, Hotel…"
            className={cn(
              "h-10 w-full rounded-xl border px-3.5 text-[14px] outline-none transition",
              "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
              "focus:border-blue-400 focus:bg-white",
              "dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500",
              "dark:focus:border-blue-500 dark:focus:bg-slate-700",
            )}
          />
        </div>

        {/* Amount + Tax/Tip toggle */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Amount
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount || ""}
                onChange={(e) => setField("amount", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={cn(
                  "h-11 w-full rounded-xl border pl-9 pr-4 text-[18px] font-bold outline-none transition",
                  "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-300",
                  "focus:border-blue-400 focus:bg-white",
                  "dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100",
                  "dark:focus:border-blue-500 dark:focus:bg-slate-700",
                )}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowTaxTip((s) => !s)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[12px] font-semibold transition",
                showTaxTip
                  ? "border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:border-slate-500",
              )}
            >
              <Percent className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tax/Tip</span>
              <span className="sm:hidden">%</span>
            </button>
          </div>

          {/* Tax/Tip fields */}
          {showTaxTip && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  { label: "Tax %", field: "taxPct" as const, val: form.taxPct, presets: [5, 12, 18] },
                  { label: "Tip %", field: "tipPct" as const, val: form.tipPct, presets: [10, 15, 20] },
                ] as const
              ).map(({ label, field, val, presets }) => (
                <div key={field}>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={val || ""}
                    onChange={(e) => setField(field, parseFloat(e.target.value) || 0)}
                    className={cn(
                      "h-9 w-full rounded-xl border px-3 text-[13px] font-semibold outline-none transition",
                      "border-slate-200 bg-white focus:border-blue-400",
                      "dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-blue-500",
                    )}
                  />
                  <div className="mt-1 flex gap-1">
                    {presets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setField(field, p)}
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-bold transition",
                          val === p
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600",
                        )}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grand total breakdown */}
          {(form.taxPct > 0 || form.tipPct > 0) && form.amount > 0 && (
            <div className="mt-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-[12px] dark:bg-slate-700/50">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span><span>{inr(form.amount, 2)}</span>
              </div>
              {form.taxPct > 0 && (
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Tax ({form.taxPct}%)</span><span>{inr(tax, 2)}</span>
                </div>
              )}
              {form.tipPct > 0 && (
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Tip ({form.tipPct}%)</span><span>{inr(tip, 2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900 dark:border-slate-600 dark:text-slate-100">
                <span>Total</span><span>{inr(grandTotal, 2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setField("date", e.target.value)}
            className={cn(
              "h-10 w-full rounded-xl border px-3.5 text-[13px] outline-none transition",
              "border-slate-200 bg-slate-50 text-slate-900",
              "focus:border-blue-400 focus:bg-white",
              "dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100",
              "dark:focus:border-blue-500 dark:focus:bg-slate-700",
            )}
          />
        </div>

        {/* Split method */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Split Method
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {SPLIT_METHODS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMethod(key)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border py-2.5 text-center transition",
                  form.splitMethod === key
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400 dark:hover:border-slate-500",
                )}
              >
                <Icon className={cn(
                  "h-4 w-4",
                  form.splitMethod === key
                    ? "text-blue-500"
                    : "text-slate-400 dark:text-slate-500",
                )} />
                <span className="text-[11px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Paid by */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Paid by
          </label>
          <div className="flex flex-wrap gap-2">
            {group.members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setField("paidBy", m.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[13px] font-medium transition",
                  form.paidBy === m.id
                    ? "border-blue-300 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600",
                )}
              >
                <Avatar
                  name={m.name}
                  color={form.paidBy === m.id ? "rgba(255,255,255,0.3)" : m.color}
                  size={20}
                />
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Participants */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Participants
            </label>
            <button
              type="button"
              onClick={() => setAllParticipants(!allSelected)}
              className="text-[11px] font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.members.map((m) => (
              <ParticipantChip
                key={m.id}
                member={m}
                selected={selectedIds.has(m.id)}
                onClick={() => toggleParticipant(m.id)}
              />
            ))}
          </div>

          {/* Per-participant value inputs for non-equal methods */}
          {form.splitMethod !== "equal" && form.participants.length > 0 && (
            <div className="mt-3 space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-600/60 dark:bg-slate-700/30">
              {form.participants.map((p) => {
                const member = group.members.find((m) => m.id === p.memberId);
                if (!member) return null;
                return (
                  <div key={p.memberId} className="flex items-center gap-3">
                    <Avatar name={member.name} color={member.color} size={24} />
                    <span className="w-16 shrink-0 truncate text-[13px] font-medium text-slate-700 dark:text-slate-200 sm:w-20">
                      {member.name}
                    </span>
                    <div className="relative flex-1">
                      {form.splitMethod === "exact" && (
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">₹</span>
                      )}
                      {form.splitMethod === "percent" && (
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">%</span>
                      )}
                      {form.splitMethod === "shares" && (
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">×</span>
                      )}
                      <input
                        type="number"
                        min="0"
                        step={form.splitMethod === "shares" ? "1" : "0.01"}
                        value={p.value ?? ""}
                        onChange={(e) =>
                          setParticipantValue(p.memberId, parseFloat(e.target.value) || 0)
                        }
                        placeholder={form.splitMethod === "shares" ? "1" : "0"}
                        className={cn(
                          "h-8 w-full rounded-lg border text-[13px] font-semibold outline-none transition",
                          "border-slate-200 bg-white text-slate-800 focus:border-blue-400",
                          "dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-blue-500",
                          form.splitMethod === "exact" ? "pl-6 pr-3" : "pl-3 pr-6",
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Validation error */}
        {!validation.valid && form.amount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            <Info className="h-4 w-4 shrink-0" />
            {validation.error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "flex-1 rounded-xl border py-2.5 text-[14px] font-semibold transition",
              "border-slate-200 text-slate-600 hover:bg-slate-50",
              "dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!validation.valid || !form.title.trim() || grandTotal <= 0}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40"
          >
            Add Expense
          </button>
        </div>
      </div>
    </Card>
  );
}