"use client";

/**
 * hooks/splitpay/useExpenseForm.ts
 *
 * Manages form state for adding OR editing an expense.
 *
 * Edit mode: pass `initialExpense` — form pre-fills with existing values.
 *   The `amount` field is reverse-calculated from the stored grandTotal
 *   minus tax/tip so the base amount is editable independently.
 *
 * Add mode: no `initialExpense` — form starts with defaults.
 */

import { useState, useCallback, useMemo } from "react";
import type { Expense, SplitMethod, Member } from "@/types/splitpay";
import { validateExpenseShares } from "@/features/splitpay/lib/calculations";

type ExpenseFormState = Omit<Expense, "id" | "groupId">;

// ── Default form for add mode ─────────────────────────────────────────────────

function buildDefaultForm(members: Member[]): ExpenseFormState {
  return {
    title:        "",
    amount:       0,
    taxPct:       0,
    tipPct:       0,
    paidBy:       members[0]?.id ?? "",
    splitMethod:  "equal",
    participants: members.map(m => ({ memberId: m.id })),
    date:         new Date().toISOString().slice(0, 10),
    notes:        "",
  };
}

// ── Reverse-calculate base amount from grandTotal + tax/tip pcts ──────────────
// grandTotal = base * (1 + taxPct/100 + tipPct/100)
// base = grandTotal / (1 + taxPct/100 + tipPct/100)

function reverseBaseAmount(grandTotal: number, taxPct: number, tipPct: number): number {
  const multiplier = 1 + taxPct / 100 + tipPct / 100;
  if (multiplier === 0) return grandTotal;
  return Math.round((grandTotal / multiplier) * 100) / 100;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useExpenseForm(members: Member[], initialExpense?: Expense) {
  const [form, setForm] = useState<ExpenseFormState>(() => {
    if (initialExpense) {
      // Edit mode: reverse the stored grandTotal back to base amount
      // so the user edits the base, and tax/tip still apply on top.
      const baseAmount = reverseBaseAmount(
        initialExpense.amount,
        initialExpense.taxPct,
        initialExpense.tipPct
      );
      return {
        title:        initialExpense.title,
        amount:       baseAmount,
        taxPct:       initialExpense.taxPct,
        tipPct:       initialExpense.tipPct,
        paidBy:       initialExpense.paidBy,
        splitMethod:  initialExpense.splitMethod,
        participants: initialExpense.participants.map(p => ({ ...p })),
        date:         initialExpense.date,
        notes:        initialExpense.notes ?? "",
      };
    }
    return buildDefaultForm(members);
  });

  // ── Derived totals ──────────────────────────────────────────────────────────
  const base       = form.amount;
  const tax        = base * (form.taxPct / 100);
  const tip        = base * (form.tipPct / 100);
  const grandTotal = Math.round((base + tax + tip) * 100) / 100;

  // ── Validation (runs against grandTotal) ────────────────────────────────────
  const validation = useMemo(
    () => validateExpenseShares({
      ...form,
      amount:  grandTotal,
      id:      "",
      groupId: "",
    }),
    [form, grandTotal]
  );

  // ── Setters ─────────────────────────────────────────────────────────────────

  const setField = useCallback(<K extends keyof ExpenseFormState>(
    key: K,
    value: ExpenseFormState[K]
  ) => setForm(f => ({ ...f, [key]: value })), []);

  const setMethod = useCallback((method: SplitMethod) => {
    setForm(f => ({
      ...f,
      splitMethod:  method,
      // Reset per-participant values when switching method
      participants: f.participants.map(p => ({ memberId: p.memberId })),
    }));
  }, []);

  const toggleParticipant = useCallback((memberId: string) => {
    setForm(f => {
      const exists = f.participants.some(p => p.memberId === memberId);
      return {
        ...f,
        participants: exists
          ? f.participants.filter(p => p.memberId !== memberId)
          : [...f.participants, { memberId }],
      };
    });
  }, []);

  const setAllParticipants = useCallback((all: boolean) => {
    setForm(f => ({
      ...f,
      participants: all ? members.map(m => ({ memberId: m.id })) : [],
    }));
  }, [members]);

  const setParticipantValue = useCallback((memberId: string, value: number) => {
    setForm(f => ({
      ...f,
      participants: f.participants.map(p =>
        p.memberId === memberId ? { ...p, value } : p
      ),
    }));
  }, []);

  const reset = useCallback(() => {
    setForm(buildDefaultForm(members));
  }, [members]);

  return {
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
    reset,
  };
}