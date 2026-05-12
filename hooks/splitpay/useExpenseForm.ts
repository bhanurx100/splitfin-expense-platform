// hooks/splitpay/useExpenseForm.ts
"use client";

import { useState, useCallback, useMemo } from "react";
//import { createId } from "@paralleldrive/cuid2";
import type { Expense, SplitMethod, Member } from "@/types/splitpay";
import { validateExpenseShares } from "@/utils/splitpay/calculations";

type ExpenseFormState = Omit<Expense, "id" | "groupId">;

const DEFAULT_FORM: ExpenseFormState = {
  title: "",
  amount: 0,
  taxPct: 0,
  tipPct: 0,
  paidBy: "",
  splitMethod: "equal",
  participants: [],
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

export function useExpenseForm(members: Member[], initialExpense?: Expense) {
  const [form, setForm] = useState<ExpenseFormState>(
    initialExpense
      ? { ...initialExpense }
      : {
          ...DEFAULT_FORM,
          // Default: all members participate, equal split
          participants: members.map(m => ({ memberId: m.id })),
          paidBy: members[0]?.id ?? "",
        }
  );

  /* ── Derived ── */
  const base       = form.amount;
  const tax        = base * (form.taxPct / 100);
  const tip        = base * (form.tipPct / 100);
  const grandTotal = base + tax + tip;

  const validation = useMemo(
    () => validateExpenseShares({ ...form, amount: grandTotal, id: "", groupId: "" }),
    [form, grandTotal]
  );

  /* ── Setters ── */
  const setField = useCallback(<K extends keyof ExpenseFormState>(
    key: K,
    value: ExpenseFormState[K]
  ) => setForm(f => ({ ...f, [key]: value })), []);

  const setMethod = useCallback((method: SplitMethod) => {
    setForm(f => ({
      ...f,
      splitMethod: method,
      participants: f.participants.map(p => ({ ...p, value: undefined })),
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
    setForm({
      ...DEFAULT_FORM,
      participants: members.map(m => ({ memberId: m.id })),
      paidBy: members[0]?.id ?? "",
    });
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