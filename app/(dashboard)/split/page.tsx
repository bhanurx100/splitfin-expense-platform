"use client";

/**
 * app/(dashboard)/split/page.tsx
 *
 * Refactored to use modular SplitPay architecture:
 *   - types/splitpay        → shared types
 *   - utils/splitpay/calculations → calculation engine
 *   - hooks/splitpay/useGroupStore → zustand store
 *   - hooks/splitpay/useExpenseForm → expense form state
 *   - components/splitpay/ui → Avatar, Card, EmptyBlock, SectionLabel, inr
 *   - components/splitpay/GroupPanel → GroupList, CreateGroupSheet
 *   - components/splitpay/MemberPanel → MemberList, AddMemberSheet
 */

import { useState, useMemo, useCallback } from "react";
import {
  Plus, Trash2, ExternalLink, Copy, Check,
  Users, Receipt, ArrowRight, Percent, Scale,
  Info, Sparkles, ChevronLeft,
} from "lucide-react";

// ── Shared types ─────────────────────────────────────────────────────────────
import type { Group, Expense, SplitMethod } from "@/types/splitpay";

// ── Zustand store ─────────────────────────────────────────────────────────────
import { useGroupStore, useGroupSettlement } from "@/hooks/splitpay/useGroupStore";

// ── Expense form hook ─────────────────────────────────────────────────────────
import { useExpenseForm } from "@/hooks/splitpay/useExpenseForm";

// ── Calculation utilities ─────────────────────────────────────────────────────
import {
  computeExpenseShares,
  computeGroupSettlement,
  buildSettlementText,
  resolveUpi,
  buildUpiLink,
} from "@/utils/splitpay/calculations";

// ── Reusable UI components ────────────────────────────────────────────────────
import { Avatar, Card, EmptyBlock, SectionLabel, inr, ParticipantChip } from "@/components/splitpay/ui";
import { GroupList } from "@/components/splitpay/GroupPanel";
import { MemberList } from "@/components/splitpay/MemberPanel";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────

const SPLIT_METHODS: { key: SplitMethod; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "equal",   label: "Equal",   icon: Users,    desc: "Split evenly"         },
  { key: "exact",   label: "Exact",   icon: Receipt,  desc: "Set amounts manually" },
  { key: "percent", label: "Percent", icon: Percent,  desc: "Set percentages"      },
  { key: "shares",  label: "Shares",  icon: Scale,    desc: "Weighted split"       },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function SplitPage() {
  const { groups, activeGroupId, setActiveGroup, addExpense, removeExpense } = useGroupStore();
  const activeGroup = groups.find(g => g.id === activeGroupId) ?? null;

  // Mobile: which panel to show
  const [mobileView, setMobileView] = useState<"groups" | "detail">("groups");

  const handleSelectGroup = useCallback((id: string) => {
    setActiveGroup(id);
    setMobileView("detail");
  }, [setActiveGroup]);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">Split & Pay</h1>
            <p className="mt-0.5 text-[13px] text-slate-400">Manage groups · split expenses · pay via UPI</p>
          </div>
        </div>

        {/* Desktop: 3-col layout | Mobile: stacked */}
        <div className="lg:grid lg:grid-cols-[280px_1fr_380px] lg:gap-6 xl:gap-8">

          {/* ── Col 1: Groups list ── */}
          <div className={cn("lg:block", mobileView === "detail" ? "hidden" : "block")}>
            <GroupListWrapper onSelect={handleSelectGroup} activeGroupId={activeGroupId} />
          </div>

          {/* ── Col 2 + 3: Group detail ── */}
          {activeGroup ? (
            <GroupDetail
              group={activeGroup}
              mobileView={mobileView}
              onBack={() => setMobileView("groups")}
            />
          ) : (
            <div className={cn("lg:col-span-2 lg:block", mobileView === "groups" ? "hidden lg:block" : "block")}>
              <EmptyBlock
                icon={<Users className="h-6 w-6" />}
                title="Select a group"
                description="Choose a group on the left or create a new one to start splitting"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP LIST WRAPPER — wraps GroupList + handles selection callback
// ═══════════════════════════════════════════════════════════════════════════════

function GroupListWrapper({
  onSelect, activeGroupId,
}: { onSelect: (id: string) => void; activeGroupId: string | null }) {
  // GroupList from components/splitpay/GroupPanel already uses useGroupStore internally.
  // We just render it; the store's setActiveGroup is called inside GroupList via onClick.
  // We additionally call onSelect for mobile nav.
  const { setActiveGroup } = useGroupStore();

  return (
    <div
      onClick={(e) => {
        // Intercept group card clicks bubbled up — handled internally by GroupList
      }}
    >
      <GroupList />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP DETAIL — Members + Add Expense + Settlement
// ═══════════════════════════════════════════════════════════════════════════════

type DetailTab = "members" | "expenses" | "settle";

function GroupDetail({
  group, mobileView, onBack,
}: { group: Group; mobileView: "groups" | "detail"; onBack: () => void }) {
  const [tab, setTab] = useState<DetailTab>("expenses");
  const [showAddExpense, setShowAddExpense] = useState(false);

  const settlement = useGroupSettlement(group.id);

  return (
    <div className={cn("lg:col-span-2 lg:grid lg:grid-cols-[1fr_360px] lg:gap-6", mobileView === "groups" ? "hidden lg:flex" : "flex flex-col gap-5")}>

      {/* ── Main content area ── */}
      <div className="space-y-5">

        {/* Mobile back + Group header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 lg:hidden"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Groups
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{group.emoji ?? "💰"}</span>
            <div>
              <h2 className="text-[16px] font-bold text-slate-900">{group.name}</h2>
              <p className="text-[12px] text-slate-400">
                {group.members.length} members · {group.expenses.length} expenses
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
                "flex-1 rounded-lg py-1.5 text-[13px] font-semibold capitalize transition",
                tab === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t}
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
        {tab === "settle" && settlement && (
          <SettleTab group={group} settlement={settlement} />
        )}
      </div>

      {/* ── Right: Quick settlement panel ── */}
      <div className="hidden lg:block">
        {settlement && settlement.settlements.length > 0 ? (
          <SettlementPanel group={group} settlement={settlement} />
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
  group, showAddExpense, setShowAddExpense,
}: { group: Group; showAddExpense: boolean; setShowAddExpense: (v: boolean) => void }) {
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

      {group.expenses.length === 0 ? (
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
// ADD EXPENSE FORM — uses useExpenseForm hook
// ═══════════════════════════════════════════════════════════════════════════════

function AddExpenseForm({ group, onClose }: { group: Group; onClose: () => void }) {
  const { addExpense } = useGroupStore();
  const {
    form, grandTotal, tax, tip, validation,
    setField, setMethod, toggleParticipant, setAllParticipants,
    setParticipantValue, reset,
  } = useExpenseForm(group.members);

  const [showTaxTip, setShowTaxTip] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!validation.valid) return;
    addExpense(group.id, {
      ...form,
      amount: grandTotal,
    });
    reset();
    onClose();
  }, [validation, addExpense, group.id, form, grandTotal, reset, onClose]);

  const selectedIds = new Set(form.participants.map(p => p.memberId));
  const allSelected = group.members.length > 0 && group.members.every(m => selectedIds.has(m.id));

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-[14px] font-semibold text-slate-800">New Expense</h3>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Description</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setField("title", e.target.value)}
            placeholder="Dinner, Cab, Hotel…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white transition"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Amount</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] font-bold text-slate-400">₹</span>
              <input
                type="number" min="0" step="0.01"
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
                "flex items-center gap-1.5 rounded-xl border px-3 text-[12px] font-semibold transition",
                showTaxTip
                  ? "border-blue-300 bg-blue-50 text-blue-600"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              )}
            >
              <Percent className="h-3.5 w-3.5" />
              Tax/Tip
            </button>
          </div>

          {/* Tax/Tip row */}
          {showTaxTip && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { label: "Tax %", field: "taxPct" as const, val: form.taxPct, presets: [5, 12, 18] },
                { label: "Tip %", field: "tipPct" as const, val: form.tipPct, presets: [10, 15, 20] },
              ].map(({ label, field, val, presets }) => (
                <div key={field}>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</label>
                  <input
                    type="number" min="0" max="100"
                    value={val || ""}
                    onChange={e => setField(field, parseFloat(e.target.value) || 0)}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-semibold outline-none focus:border-blue-400"
                  />
                  <div className="mt-1 flex gap-1">
                    {presets.map(p => (
                      <button key={p} type="button"
                        onClick={() => setField(field, p)}
                        className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold transition",
                          val === p ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
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

          {/* Grand total */}
          {(form.taxPct > 0 || form.tipPct > 0) && form.amount > 0 && (
            <div className="mt-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-[12px]">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{inr(form.amount, 2)}</span></div>
              {form.taxPct > 0 && <div className="flex justify-between text-slate-500"><span>Tax</span><span>{inr(tax, 2)}</span></div>}
              {form.tipPct > 0 && <div className="flex justify-between text-slate-500"><span>Tip</span><span>{inr(tip, 2)}</span></div>}
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
                <span>Total</span><span>{inr(grandTotal, 2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Split method */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Split Method</label>
          <div className="grid grid-cols-4 gap-1.5">
            {SPLIT_METHODS.map(({ key, label, icon: Icon }) => (
              <button
                key={key} type="button"
                onClick={() => setMethod(key)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border py-2.5 text-center transition",
                  form.splitMethod === key
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                )}
              >
                <Icon className={cn("h-4 w-4", form.splitMethod === key ? "text-blue-500" : "text-slate-400")} />
                <span className="text-[11px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Paid by */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Paid by</label>
          <div className="flex flex-wrap gap-2">
            {group.members.map(m => (
              <button
                key={m.id} type="button"
                onClick={() => setField("paidBy", m.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[13px] font-medium transition",
                  form.paidBy === m.id
                    ? "border-blue-300 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <Avatar name={m.name} color={form.paidBy === m.id ? "rgba(255,255,255,0.3)" : m.color} size={20} />
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Participants */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Participants</label>
            <button
              type="button"
              onClick={() => setAllParticipants(!allSelected)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
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

          {/* Per-participant value inputs for non-equal splits */}
          {form.splitMethod !== "equal" && form.participants.length > 0 && (
            <div className="mt-3 space-y-2">
              {form.participants.map(p => {
                const member = group.members.find(m => m.id === p.memberId);
                if (!member) return null;
                return (
                  <div key={p.memberId} className="flex items-center gap-3">
                    <Avatar name={member.name} color={member.color} size={24} />
                    <span className="min-w-[80px] text-[13px] font-medium text-slate-700">{member.name}</span>
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
                        type="number" min="0" step={form.splitMethod === "shares" ? "1" : "0.01"}
                        value={p.value ?? ""}
                        onChange={e => setParticipantValue(p.memberId, parseFloat(e.target.value) || 0)}
                        placeholder={form.splitMethod === "shares" ? "1" : "0"}
                        className={cn(
                          "h-8 w-full rounded-lg border border-slate-200 bg-slate-50 text-[13px] font-semibold outline-none focus:border-blue-400 focus:bg-white",
                          form.splitMethod === "exact" ? "pl-7 pr-3" : "pl-3 pr-7"
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
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-700">
            <Info className="h-4 w-4 flex-shrink-0" />
            {validation.error}
          </div>
        )}

        {/* Date */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setField("date", e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[13px] text-slate-900 outline-none focus:border-blue-400 focus:bg-white transition"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button" onClick={handleSubmit}
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
// EXPENSE CARD — single expense row
// ═══════════════════════════════════════════════════════════════════════════════

function ExpenseCard({ expense, group }: { expense: Expense; group: Group }) {
  const { removeExpense } = useGroupStore();
  const payer = group.members.find(m => m.id === expense.paidBy);
  const shares = useMemo(() => computeExpenseShares(expense), [expense]);

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3.5 transition hover:border-slate-200">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[18px]">
        <Receipt className="h-4 w-4 text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[14px] font-semibold text-slate-800">{expense.title}</p>
            <p className="text-[12px] text-slate-400">
              {expense.date} · Paid by {payer?.name ?? "Unknown"} · {expense.splitMethod}
            </p>
          </div>
          <p className="ml-3 flex-shrink-0 text-[15px] font-bold text-slate-900">
            {inr(expense.amount, 2)}
          </p>
        </div>

        {/* Per-member share pills */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {expense.participants.slice(0, 5).map(p => {
            const member = group.members.find(m => m.id === p.memberId);
            if (!member) return null;
            return (
              <div key={p.memberId} className="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                <Avatar name={member.name} color={member.color} size={14} />
                <span className="font-medium">{member.name}</span>
                <span className="font-bold text-slate-800">{inr(shares[p.memberId] ?? 0, 0)}</span>
              </div>
            );
          })}
          {expense.participants.length > 5 && (
            <div className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-400">
              +{expense.participants.length - 5} more
            </div>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={() => removeExpense(group.id, expense.id)}
        className="mt-0.5 flex-shrink-0 rounded-lg p-1.5 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-400"
        aria-label="Delete expense"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTLE TAB — full settlement breakdown
// ═══════════════════════════════════════════════════════════════════════════════

function SettleTab({ group, settlement }: { group: Group; settlement: ReturnType<typeof computeGroupSettlement> }) {
  const [copied, setCopied] = useState(false);
  const memberMap = useMemo(
    () => Object.fromEntries(group.members.map(m => [m.id, m])),
    [group.members]
  );

  const copy = useCallback(async () => {
    const text = buildSettlementText(group, settlement.settlements);
    await navigator.clipboard.writeText(text);
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
      {/* Balance summary */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <SectionLabel>Balances</SectionLabel>
          <button
            type="button" onClick={copy}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:bg-slate-200"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
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
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-slate-800">{member.name}</p>
                  <p className="text-[11px] text-slate-400">
                    Paid {inr(b.totalPaid, 0)} · Owes {inr(b.totalOwed, 0)}
                  </p>
                </div>
                <p className={cn(
                  "text-[14px] font-bold",
                  b.netBalance > 0 ? "text-emerald-600" : b.netBalance < 0 ? "text-red-500" : "text-slate-400"
                )}>
                  {b.netBalance > 0 ? "+" : ""}{inr(b.netBalance, 0)}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Settlement plan */}
      <Card className="p-5">
        <SectionLabel>Settlement Plan</SectionLabel>
        <div className="space-y-3">
          {settlement.settlements.map((s, i) => {
            const from = memberMap[s.fromId];
            const to   = memberMap[s.toId];
            if (!from || !to) return null;
            return (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2 text-[13px]">
                  <Avatar name={from.name} color={from.color} size={26} />
                  <span className="font-semibold text-slate-700">{from.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  <Avatar name={to.name} color={to.color} size={26} />
                  <span className="text-slate-600">{to.name}</span>
                  <span className="ml-auto font-bold text-red-500">{inr(s.amount, 0)}</span>
                </div>
                <a
                  href={buildUpiLink(from, s.amount)}
                  className="flex items-center justify-between rounded-xl bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <Avatar name={from.name} color="rgba(255,255,255,0.25)" size={24} />
                    <div>
                      <p className="text-[12px] font-semibold">{from.name} pays {to.name}</p>
                      <p className="text-[10px] text-blue-200">{resolveUpi(from)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
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
// SETTLEMENT PANEL — compact right-sidebar version
// ═══════════════════════════════════════════════════════════════════════════════

function SettlementPanel({ group, settlement }: { group: Group; settlement: ReturnType<typeof computeGroupSettlement> }) {
  const memberMap = useMemo(
    () => Object.fromEntries(group.members.map(m => [m.id, m])),
    [group.members]
  );

  const totalSpend = group.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Spend</p>
        <p className="text-[22px] font-bold text-white">{inr(totalSpend, 0)}</p>
        <p className="mt-1 text-[12px] text-slate-400">
          {settlement.settlements.length} settlement{settlement.settlements.length !== 1 ? "s" : ""} needed
        </p>
      </div>

      {/* Settlements */}
      <div className="divide-y divide-slate-50 p-2">
        {settlement.settlements.map((s, i) => {
          const from = memberMap[s.fromId];
          const to   = memberMap[s.toId];
          if (!from || !to) return null;
          return (
            <div key={i} className="flex items-center gap-2.5 rounded-xl px-3 py-3 transition hover:bg-slate-50">
              <Avatar name={from.name} color={from.color} size={28} />
              <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
              <Avatar name={to.name} color={to.color} size={28} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-slate-700">
                  {from.name} → {to.name}
                </p>
              </div>
              <span className="text-[13px] font-bold text-red-500">{inr(s.amount, 0)}</span>
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
    <Card className="p-5">
      <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-700">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        Tips
      </h3>
      <div className="space-y-2.5 text-[12px] text-slate-500">
        <p>• Add members first, then log expenses against them</p>
        <p>• UPI links use <span className="rounded bg-slate-100 px-1 font-mono text-slate-700">phone@upi</span> format — works with GPay, PhonePe</p>
        <p>• <span className="font-semibold text-slate-600">Shares</span> mode: assign weights for unequal splits</p>
        <p>• Switch to the <span className="font-semibold text-slate-600">Settle</span> tab to see the minimum transactions needed</p>
      </div>
    </Card>
  );
}