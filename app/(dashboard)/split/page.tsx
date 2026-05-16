"use client";

/**
 * app/(dashboard)/split/page.tsx
 *
 * Fixed SplitPay — improved mobile responsiveness and UX.
 * Changes:
 *  - Mobile group selection properly transitions to detail view
 *  - Back navigation works correctly
 *  - Desktop layout uses proper grid without empty gaps
 *  - Settlement section is fully responsive
 *  - No horizontal overflow
 *  - Better mobile spacing throughout
 *  - GroupList now calls onSelect callback for mobile transition
 */

import { useState, useMemo, useCallback } from "react";
import {
  Plus, Trash2, ExternalLink, Copy, Check,
  Users, Receipt, ArrowRight, Percent, Scale,
  Info, Sparkles, ChevronLeft, Pencil,
} from "lucide-react";

import type { Group, Expense, SplitMethod } from "@/types/splitpay";
import { useGroupStore, useGroupSettlement } from "@/hooks/splitpay/useGroupStore";
import { useExpenseForm } from "@/hooks/splitpay/useExpenseForm";
import {
  computeExpenseShares, computeGroupSettlement,
  buildSettlementText, resolveUpi, buildUpiLink,
} from "@/utils/splitpay/calculations";
import { Avatar, Card, EmptyBlock, SectionLabel, inr, ParticipantChip } from "@/components/splitpay/ui";
import { MemberList } from "@/components/splitpay/MemberPanel";
import { EditExpenseModal } from "@/components/splitpay/EditExpenseModal";
import { cn } from "@/lib/utils";

// ── Local inline GroupList with mobile callback support ──────────────────────
//import { GroupList } from "@/components/splitpay/GroupPanel";

const SPLIT_METHODS: { key: SplitMethod; label: string; icon: React.ElementType }[] = [
  { key: "equal",   label: "Equal",   icon: Users   },
  { key: "exact",   label: "Exact",   icon: Receipt },
  { key: "percent", label: "Percent", icon: Percent },
  { key: "shares",  label: "Shares",  icon: Scale   },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE ROOT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SplitPage() {
  const { groups, activeGroupId, setActiveGroup } = useGroupStore();
  const activeGroup = groups.find(g => g.id === activeGroupId) ?? null;

  // Mobile uses a stack: "groups" shows the list, "detail" shows selected group
  const [mobileView, setMobileView] = useState<"groups" | "detail">("groups");

  const handleSelectGroup = useCallback((id: string) => {
    setActiveGroup(id);
    setMobileView("detail");
  }, [setActiveGroup]);

  const handleBack = useCallback(() => {
    setMobileView("groups");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Page header — hidden on mobile detail view to save space */}
        <div className={cn("mb-5 lg:mb-6", mobileView === "detail" ? "hidden lg:block" : "block")}>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">Split & Pay</h1>
          <p className="mt-0.5 text-[13px] text-slate-400">Manage groups · split expenses · settle via UPI</p>
        </div>

        {/* Desktop: 3-col grid. Mobile: single column stack with view switching */}
        <div className="lg:grid lg:grid-cols-[260px_1fr_320px] lg:gap-6 xl:grid-cols-[280px_1fr_340px] xl:gap-8">

          {/* Column 1: Group list — visible on desktop always, mobile only in "groups" view */}
          <div className={cn(
            "min-w-0",
            // Mobile: show/hide based on view state
            mobileView === "detail" ? "hidden lg:block" : "block"
          )}>
            <GroupListWithCallback onSelectGroup={handleSelectGroup} />
          </div>

          {/* Column 2+3: Group detail — spans 2 cols on desktop, full width on mobile */}
          <div className={cn(
            "min-w-0 lg:col-span-2",
            // Mobile: show/hide based on view state
            mobileView === "groups" ? "hidden lg:flex" : "flex flex-col"
          )}>
            {activeGroup ? (
              <GroupDetail
                group={activeGroup}
                onBack={handleBack}
                showBackButton={mobileView === "detail"}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20">
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

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP LIST WRAPPER — intercepts group selection for mobile nav
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wraps GroupList and intercepts setActiveGroup calls to also trigger mobile nav.
 * We patch the store's setActiveGroup via a context override approach.
 *
 * Since GroupList uses useGroupStore directly, we wrap the store method:
 */
function GroupListWithCallback({ onSelectGroup }: { onSelectGroup: (id: string) => void }) {
  const store = useGroupStore();

  // Monkey-patch setActiveGroup on the store for this render tree
  // The cleanest solution without modifying GroupPanel.tsx
  const patchedStore = useMemo(() => ({
    ...store,
    setActiveGroup: (id: string) => {
      store.setActiveGroup(id);
      onSelectGroup(id);
    },
  }), [store, onSelectGroup]);

  // Since GroupList reads from useGroupStore hook directly and we can't
  // easily override it without context, we use a click intercept on the wrapper div
  return (
    <div
      onClick={() => {
        // After any click in this div, check if activeGroupId changed
        // This is handled by onSelectGroup being called through the patched store
      }}
    >
      <GroupListIntercepted onSelectGroup={onSelectGroup} />
    </div>
  );
}

/**
 * Inline re-implementation of GroupList that calls onSelectGroup on mobile.
 * This avoids modifying GroupPanel.tsx while fixing mobile navigation.
 */
function GroupListIntercepted({ onSelectGroup }: { onSelectGroup: (id: string) => void }) {
  const { groups, activeGroupId, setActiveGroup, resetToDemo } = useGroupStore();
  const [showCreate, setShowCreate] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Import these from GroupPanel at build time — re-export them here
  // Since we can't modify GroupPanel, we duplicate the minimal logic needed
  const { CreateGroupSheet } = require("@/components/splitpay/GroupPanel");

  function handleSelectGroup(id: string) {
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

  // Compute group stats
  const { computeGroupBalances } = require("@/utils/splitpay/calculations");
  const { DEMO_GROUPS } = require("@/data/splitpay/demo");
  const { RefreshCw, Plus, ChevronRight, Trash2, Sparkles } = require("lucide-react");
  const DEMO_IDS = new Set(DEMO_GROUPS.map((g: Group) => g.id));
  const { deleteGroup } = useGroupStore();

  return (
    <div className="space-y-3">
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
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600"
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
            const totalSpend = g.expenses.reduce((s: number, e: Expense) => s + e.amount, 0);
            const balances = computeGroupBalances(g);
            const debtors = balances.filter((b: { netBalance: number }) => b.netBalance < -0.01).length;

            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleSelectGroup(g.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-150",
                  active
                    ? "border-blue-200 bg-blue-50 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px]",
                  active ? "bg-white shadow-sm" : "bg-slate-100"
                )}>
                  {g.emoji ?? "💰"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("truncate text-[14px] font-semibold", active ? "text-blue-700" : "text-slate-800")}>
                      {g.name}
                    </p>
                    {isDemo && (
                      <span className="flex-shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-600">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-400">
                    {g.members.length} members · {g.expenses.length} expenses
                    {totalSpend > 0 && <> · {inr(totalSpend, 0)}</>}
                    {debtors > 0 && (
                      <span className="ml-1 font-semibold text-red-400">{debtors} owe</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteGroup(g.id); }}
                    className="rounded-lg p-1.5 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-400"
                    aria-label="Delete group"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronRight className={cn("h-4 w-4 shrink-0 transition", active ? "text-blue-400" : "text-slate-300")} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {groups.length > 0 && groups.every((g: Group) => DEMO_IDS.has(g.id)) && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] text-amber-700">
          <Sparkles className="h-3 w-3 flex-shrink-0 text-amber-500" />
          These are demo groups — add your own or clear them!
        </div>
      )}

      {showCreate && <CreateGroupSheet onClose={() => setShowCreate(false)} />}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// GROUP DETAIL
// ═══════════════════════════════════════════════════════════════════════════════

type DetailTab = "members" | "expenses" | "settle";

function GroupDetail({
  group,
  onBack,
  showBackButton,
}: {
  group: Group;
  onBack: () => void;
  showBackButton: boolean;
}) {
  const [tab, setTab] = useState<DetailTab>("expenses");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const settlement = useGroupSettlement(group.id);

  return (
    // On desktop this fills cols 2+3 with a side-by-side layout
    // On mobile it's a single full-width column
    <div className="w-full min-w-0 lg:grid lg:grid-cols-[1fr_300px] lg:gap-6 xl:grid-cols-[1fr_320px] xl:gap-8">

      {/* Main content */}
      <div className="min-w-0 space-y-4 lg:space-y-5">

        {/* Header with back button */}
        <div className="flex items-center gap-3">
          {/* Back button — shown on mobile always, hidden on desktop */}
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 lg:hidden"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="shrink-0 text-2xl">{group.emoji ?? "💰"}</span>
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-bold text-slate-900">{group.name}</h2>
              <p className="text-[12px] text-slate-400">
                {group.members.length} members · {group.expenses.length} expenses
                {group.expenses.length > 0 && (
                  <> · {inr(group.expenses.reduce((s, e) => s + e.amount, 0), 0)} total</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {(["members", "expenses", "settle"] as DetailTab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-semibold capitalize transition",
                tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t}
              {t === "settle" && settlement && settlement.settlements.length > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                  {settlement.settlements.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "members" && <MemberList group={group} />}
        {tab === "expenses" && (
          <ExpensesTab
            group={group}
            showAddExpense={showAddExpense}
            setShowAddExpense={setShowAddExpense}
          />
        )}
        {tab === "settle" && settlement && <SettleTab group={group} settlement={settlement} />}

        {/* Mobile settlement summary — shown below settle tab content */}
        {tab !== "settle" && settlement && settlement.settlements.length > 0 && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 lg:hidden">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-red-700">
                {settlement.settlements.length} settlement{settlement.settlements.length !== 1 ? "s" : ""} pending
              </p>
              <button
                type="button"
                onClick={() => setTab("settle")}
                className="text-[12px] font-bold text-red-600 hover:text-red-700"
              >
                View →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop right sidebar */}
      <div className="hidden lg:block lg:min-w-0">
        {settlement && settlement.settlements.length > 0 ? (
          <SettlementSidebar group={group} settlement={settlement} />
        ) : (
          <TipsCard />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPENSES TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ExpensesTab({
  group,
  showAddExpense,
  setShowAddExpense,
}: {
  group: Group;
  showAddExpense: boolean;
  setShowAddExpense: (v: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Expenses</SectionLabel>
        <button
          type="button"
          onClick={() => setShowAddExpense(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-[12px] font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" /> Add Expense
        </button>
      </div>

      {showAddExpense && (
        <AddExpenseForm group={group} onClose={() => setShowAddExpense(false)} />
      )}

      {group.expenses.length === 0 && !showAddExpense ? (
        <EmptyBlock
          icon={<Receipt className="h-6 w-6" />}
          title="No expenses yet"
          description="Add your first expense to start splitting"
          action={
            <button
              type="button"
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Add Expense
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {group.expenses.map(e => (
            <ExpenseCard key={e.id} expense={e} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPENSE CARD
// ═══════════════════════════════════════════════════════════════════════════════

function ExpenseCard({ expense, group }: { expense: Expense; group: Group }) {
  const { removeExpense } = useGroupStore();
  const [editing, setEditing] = useState(false);
  const payer = group.members.find(m => m.id === expense.paidBy);
  const shares = useMemo(() => computeExpenseShares(expense), [expense]);

  const methodLabel: Record<SplitMethod, string> = {
    equal: "Equal",
    exact: "Exact",
    percent: "Percent",
    shares: "Shares",
  };

  return (
    <>
      <div className="group relative flex items-start gap-3 overflow-hidden rounded-xl border border-slate-100 bg-white px-4 py-3.5 transition hover:border-slate-200 hover:shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Receipt className="h-4 w-4 text-slate-400" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-slate-800">{expense.title}</p>
              <p className="text-[12px] text-slate-400">
                {expense.date}
                {payer && (
                  <> · Paid by <span className="font-medium text-slate-600">{payer.name}</span></>
                )}
                {" · "}
                <span className="rounded bg-slate-100 px-1 text-[10px] font-semibold text-slate-500">
                  {methodLabel[expense.splitMethod]}
                </span>
              </p>
            </div>
            {/* Amount + action buttons */}
            <div className="flex shrink-0 flex-col items-end gap-1">
              <p className="text-[15px] font-bold text-slate-900">{inr(expense.amount, 0)}</p>
              {/* Action buttons — visible on hover (desktop), always visible on mobile */}
              <div className="flex gap-1 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-blue-50 hover:text-blue-500"
                  aria-label="Edit expense"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeExpense(group.id, expense.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-400"
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Member share pills — scrollable on mobile */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {expense.participants.slice(0, 4).map(p => {
              const member = group.members.find(m => m.id === p.memberId);
              if (!member) return null;
              return (
                <div
                  key={p.memberId}
                  className="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
                >
                  <Avatar name={member.name} color={member.color} size={14} />
                  <span className="font-medium">{member.name}</span>
                  <span className="font-bold text-slate-800">{inr(shares[p.memberId] ?? 0, 0)}</span>
                </div>
              );
            })}
            {expense.participants.length > 4 && (
              <div className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-400">
                +{expense.participants.length - 4} more
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <EditExpenseModal group={group} expense={expense} onClose={() => setEditing(false)} />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD EXPENSE FORM
// ═══════════════════════════════════════════════════════════════════════════════

function AddExpenseForm({ group, onClose }: { group: Group; onClose: () => void }) {
  const { addExpense } = useGroupStore();
  const {
    form, grandTotal, tax, tip, validation,
    setField, setMethod, toggleParticipant,
    setAllParticipants, setParticipantValue, reset,
  } = useExpenseForm(group.members);
  const [showTaxTip, setShowTaxTip] = useState(false);

  const selectedIds = new Set(form.participants.map(p => p.memberId));
  const allSelected =
    group.members.length > 0 && group.members.every(m => selectedIds.has(m.id));

  const handleSubmit = useCallback(() => {
    if (!validation.valid) return;
    addExpense(group.id, { ...form, amount: grandTotal });
    reset();
    onClose();
  }, [validation, addExpense, group.id, form, grandTotal, reset, onClose]);

  return (
    <Card className="p-4 lg:p-5">
      <h3 className="mb-4 text-[14px] font-semibold text-slate-800">New Expense</h3>
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
            onChange={e => setField("title", e.target.value)}
            placeholder="Dinner, Cab, Hotel…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white transition"
          />
        </div>

        {/* Amount + Tax/Tip */}
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
                onChange={e => setField("amount", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-[18px] font-bold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowTaxTip(s => !s)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[12px] font-semibold transition",
                showTaxTip
                  ? "border-blue-300 bg-blue-50 text-blue-600"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              )}
            >
              <Percent className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tax/Tip</span>
              <span className="sm:hidden">%</span>
            </button>
          </div>

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
                    onChange={e => setField(field, parseFloat(e.target.value) || 0)}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-semibold outline-none focus:border-blue-400"
                  />
                  <div className="mt-1 flex gap-1">
                    {presets.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setField(field, p)}
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-bold transition",
                          val === p
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
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

          {(form.taxPct > 0 || form.tipPct > 0) && form.amount > 0 && (
            <div className="mt-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-[12px]">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{inr(form.amount, 2)}</span>
              </div>
              {form.taxPct > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Tax ({form.taxPct}%)</span>
                  <span>{inr(tax, 2)}</span>
                </div>
              )}
              {form.tipPct > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Tip ({form.tipPct}%)</span>
                  <span>{inr(tip, 2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
                <span>Total</span>
                <span>{inr(grandTotal, 2)}</span>
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
            onChange={e => setField("date", e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[13px] text-slate-900 outline-none focus:border-blue-400 focus:bg-white transition"
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
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    form.splitMethod === key ? "text-blue-500" : "text-slate-400"
                  )}
                />
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
            {group.members.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setField("paidBy", m.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[13px] font-medium transition",
                  form.paidBy === m.id
                    ? "border-blue-300 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.members.map(m => (
              <ParticipantChip
                key={m.id}
                member={m}
                selected={selectedIds.has(m.id)}
                onClick={() => toggleParticipant(m.id)}
              />
            ))}
          </div>

          {form.splitMethod !== "equal" && form.participants.length > 0 && (
            <div className="mt-3 space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
              {form.participants.map(p => {
                const member = group.members.find(m => m.id === p.memberId);
                if (!member) return null;
                return (
                  <div key={p.memberId} className="flex items-center gap-3">
                    <Avatar name={member.name} color={member.color} size={24} />
                    <span className="w-16 shrink-0 truncate text-[13px] font-medium text-slate-700 sm:w-20">
                      {member.name}
                    </span>
                    <div className="relative flex-1">
                      {form.splitMethod === "exact" && (
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                          ₹
                        </span>
                      )}
                      {form.splitMethod === "percent" && (
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                          %
                        </span>
                      )}
                      {form.splitMethod === "shares" && (
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                          ×
                        </span>
                      )}
                      <input
                        type="number"
                        min="0"
                        step={form.splitMethod === "shares" ? "1" : "0.01"}
                        value={p.value ?? ""}
                        onChange={e =>
                          setParticipantValue(p.memberId, parseFloat(e.target.value) || 0)
                        }
                        placeholder={form.splitMethod === "shares" ? "1" : "0"}
                        className={cn(
                          "h-8 w-full rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 outline-none focus:border-blue-400 transition",
                          form.splitMethod === "exact" ? "pl-6 pr-3" : "pl-3 pr-6"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!validation.valid && form.amount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-700">
            <Info className="h-4 w-4 shrink-0" />
            {validation.error}
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
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

// ═══════════════════════════════════════════════════════════════════════════════
// SETTLE TAB
// ═══════════════════════════════════════════════════════════════════════════════

function SettleTab({
  group,
  settlement,
}: {
  group: Group;
  settlement: ReturnType<typeof computeGroupSettlement>;
}) {
  const [copied, setCopied] = useState(false);
  const memberMap = useMemo(
    () => Object.fromEntries(group.members.map(m => [m.id, m])),
    [group.members]
  );

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(buildSettlementText(group, settlement.settlements));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [group, settlement]);

  if (settlement.settlements.length === 0) {
    return (
      <EmptyBlock
        icon={<Check className="h-6 w-6" />}
        title="All settled up!"
        description="No outstanding balances in this group"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Balances card */}
      <Card className="p-4 lg:p-5">
        <div className="mb-4 flex items-center justify-between">
          <SectionLabel>Balances</SectionLabel>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:bg-slate-200"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="space-y-2">
          {settlement.balances.map(b => {
            const member = memberMap[b.memberId];
            if (!member) return null;
            return (
              <div key={b.memberId} className="flex items-center gap-3">
                <Avatar name={member.name} color={member.color} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-800">{member.name}</p>
                  <p className="text-[11px] text-slate-400">
                    Paid {inr(b.totalPaid, 0)} · Owes {inr(b.totalOwed, 0)}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-[14px] font-bold",
                    b.netBalance > 0
                      ? "text-emerald-600"
                      : b.netBalance < 0
                      ? "text-red-500"
                      : "text-slate-400"
                  )}
                >
                  {b.netBalance > 0 ? "+" : ""}
                  {inr(b.netBalance, 0)}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Settlement plan */}
      <Card className="p-4 lg:p-5">
        <SectionLabel>Settlement Plan</SectionLabel>
        <div className="space-y-4">
          {settlement.settlements.map((s, i) => {
            const from = memberMap[s.fromId];
            const to = memberMap[s.toId];
            if (!from || !to) return null;
            return (
              <div key={i} className="space-y-2">
                {/* Who pays whom */}
                <div className="flex flex-wrap items-center gap-2 text-[13px]">
                  <Avatar name={from.name} color={from.color} size={26} />
                  <span className="font-semibold text-slate-700">{from.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <Avatar name={to.name} color={to.color} size={26} />
                  <span className="text-slate-600">{to.name}</span>
                  <span className="ml-auto font-bold text-red-500">{inr(s.amount, 0)}</span>
                </div>
                {/* UPI payment button */}
                <a
                  href={buildUpiLink(from, s.amount)}
                  className="flex items-center justify-between rounded-xl bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar name={from.name} color="rgba(255,255,255,0.25)" size={24} />
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold">
                        {from.name} pays {to.name}
                      </p>
                      <p className="truncate text-[10px] text-blue-200">{resolveUpi(from)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[13px] font-bold">{inr(s.amount, 0)}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-blue-200" />
                  </div>
                </a>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-400">
          UPI links work with Google Pay, PhonePe, Paytm & BHIM
        </p>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTLEMENT SIDEBAR (desktop only)
// ═══════════════════════════════════════════════════════════════════════════════

function SettlementSidebar({
  group,
  settlement,
}: {
  group: Group;
  settlement: ReturnType<typeof computeGroupSettlement>;
}) {
  const memberMap = useMemo(
    () => Object.fromEntries(group.members.map(m => [m.id, m])),
    [group.members]
  );
  const totalSpend = group.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Total Spend
        </p>
        <p className="text-[22px] font-bold text-white">{inr(totalSpend, 0)}</p>
        <p className="mt-1 text-[12px] text-slate-400">
          {settlement.settlements.length} settlement
          {settlement.settlements.length !== 1 ? "s" : ""} needed
        </p>
      </div>
      <div className="divide-y divide-slate-50 p-2">
        {settlement.settlements.map((s, i) => {
          const from = memberMap[s.fromId];
          const to = memberMap[s.toId];
          if (!from || !to) return null;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl px-3 py-3 transition hover:bg-slate-50"
            >
              <Avatar name={from.name} color={from.color} size={28} />
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              <Avatar name={to.name} color={to.color} size={28} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-slate-700">
                  {from.name} → {to.name}
                </p>
              </div>
              <span className="shrink-0 text-[13px] font-bold text-red-500">
                {inr(s.amount, 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPS CARD
// ═══════════════════════════════════════════════════════════════════════════════

function TipsCard() {
  return (
    <Card className="p-4 lg:p-5">
      <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-700">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Tips
      </h3>
      <div className="space-y-2.5 text-[12px] text-slate-500">
        <p>
          · Hover any expense or member to reveal{" "}
          <span className="font-semibold text-slate-600">Edit</span> and Delete
        </p>
        <p>
          · UPI links use{" "}
          <span className="rounded bg-slate-100 px-1 font-mono text-slate-700">phone@upi</span>{" "}
          — works with GPay, PhonePe
        </p>
        <p>
          · <span className="font-semibold text-slate-600">Shares</span> mode: assign weights for
          unequal splits (2× = pays double)
        </p>
        <p>
          · Switch to <span className="font-semibold text-slate-600">Settle</span> tab for minimum
          transactions
        </p>
        <p>· Member name/color edits reflect instantly across all expenses</p>
      </div>
    </Card>
  );
}