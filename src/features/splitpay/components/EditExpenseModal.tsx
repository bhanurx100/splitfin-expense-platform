"use client";

import { useState, useCallback } from "react";
import { X, Percent, Users, Receipt, Scale, Info } from "lucide-react";
import { useGroupStore } from "@/src/features/splitpay/hooks/useGroupStore";
import { useExpenseForm } from "@/src/features/splitpay/hooks/useExpenseForm";
import type { Group, Expense, SplitMethod } from "@/src/features/splitpay/types";
import { Avatar, ParticipantChip, inr } from "./ui";
import { cn } from "@/src/lib/utils";

const SPLIT_METHODS: {
  key: SplitMethod;
  label: string;
  icon: React.ElementType;
}[] = [
    { key: "equal", label: "Equal", icon: Users },
    { key: "exact", label: "Exact", icon: Receipt },
    { key: "percent", label: "Percent", icon: Percent },
    { key: "shares", label: "Shares", icon: Scale },
  ];

type Props = {
  group: Group;
  expense: Expense;
  onClose: () => void;
};

export function EditExpenseModal({ group, expense, onClose }: Props) {
  const { updateExpense } = useGroupStore();

  // useExpenseForm accepts an initialExpense — pre-fills everything
  const {
    form,
    grandTotal,
    tax,
    tip,
    validation,
    setField,
    setMethod,
    toggleParticipant,
    setAllParticipants,
    setParticipantValue,
  } = useExpenseForm(group.members, expense);

  const [showTaxTip, setShowTaxTip] = useState(
    expense.taxPct > 0 || expense.tipPct > 0
  );

  const selectedIds = new Set(form.participants.map((p) => p.memberId));
  const allSelected =
    group.members.length > 0 &&
    group.members.every((m) => selectedIds.has(m.id));

  const handleSave = useCallback(() => {
    if (!validation.valid) return;
    updateExpense(group.id, expense.id, {
      ...form,
      amount: grandTotal,
    });
    onClose();
  }, [
    validation,
    updateExpense,
    group.id,
    expense.id,
    form,
    grandTotal,
    onClose,
  ]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={handleBackdrop}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">
              Edit Expense
            </h3>
            <p className="text-[12px] text-slate-400">
              Changes recalculate settlements instantly
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
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
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
            />
          </div>

          {/* Amount */}
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
                  onChange={(e) =>
                    setField("amount", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-[18px] font-bold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowTaxTip((s) => !s)}
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

            {showTaxTip && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      label: "Tax %",
                      field: "taxPct" as const,
                      val: form.taxPct,
                      presets: [5, 12, 18],
                    },
                    {
                      label: "Tip %",
                      field: "tipPct" as const,
                      val: form.tipPct,
                      presets: [10, 15, 20],
                    },
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
                      onChange={(e) =>
                        setField(field, parseFloat(e.target.value) || 0)
                      }
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-semibold outline-none focus:border-blue-400"
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
              onChange={(e) => setField("date", e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[13px] text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
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
                      form.splitMethod === key
                        ? "text-blue-500"
                        : "text-slate-400"
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
              {group.members.map((m) => (
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
                    color={
                      form.paidBy === m.id ? "rgba(255,255,255,0.3)" : m.color
                    }
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
                className="text-[11px] font-semibold text-blue-600 transition hover:text-blue-700"
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
              <div className="mt-3 space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {form.splitMethod === "exact" &&
                    "Amount each person owes (₹)"}
                  {form.splitMethod === "percent" &&
                    "Percentage each person pays (%)"}
                  {form.splitMethod === "shares" &&
                    "Relative weight per person"}
                </p>
                {form.participants.map((p) => {
                  const member = group.members.find((m) => m.id === p.memberId);
                  if (!member) return null;
                  return (
                    <div key={p.memberId} className="flex items-center gap-3">
                      <Avatar
                        name={member.name}
                        color={member.color}
                        size={24}
                      />
                      <span className="w-20 shrink-0 truncate text-[13px] font-medium text-slate-700">
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
                          onChange={(e) =>
                            setParticipantValue(
                              p.memberId,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder={
                            form.splitMethod === "shares" ? "1" : "0"
                          }
                          className={cn(
                            "h-8 w-full rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 outline-none transition focus:border-blue-400",
                            form.splitMethod === "exact"
                              ? "pl-6 pr-3"
                              : "pl-3 pr-6"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Live validation hint for percent/exact */}
                {form.splitMethod === "percent" && (
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-semibold",
                      Math.abs(
                        form.participants.reduce(
                          (s, p) => s + (p.value ?? 0),
                          0
                        ) - 100
                      ) < 0.5
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    )}
                  >
                    <span>Total</span>
                    <span>
                      {form.participants
                        .reduce((s, p) => s + (p.value ?? 0), 0)
                        .toFixed(1)}
                      %
                    </span>
                  </div>
                )}
                {form.splitMethod === "exact" &&
                  grandTotal > 0 &&
                  (() => {
                    const assigned = form.participants.reduce(
                      (s, p) => s + (p.value ?? 0),
                      0
                    );
                    const diff = grandTotal - assigned;
                    return Math.abs(diff) > 0.01 ? (
                      <div
                        className={cn(
                          "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-semibold",
                          diff > 0
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-600"
                        )}
                      >
                        <span>{diff > 0 ? "Unassigned" : "Over-assigned"}</span>
                        <span>{inr(Math.abs(diff), 2)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
                        <span>All assigned</span>
                        <span>✓</span>
                      </div>
                    );
                  })()}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Notes <span className="font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Any extra details…"
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
            />
          </div>

          {/* Validation error */}
          {!validation.valid &&
            form.amount > 0 &&
            form.participants.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-700">
                <Info className="h-4 w-4 shrink-0" />
                {validation.error}
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 gap-2.5 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={
              !validation.valid || !form.title.trim() || grandTotal <= 0
            }
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
