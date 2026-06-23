/**
 * features/splitpay/lib/calculations.ts
 *
 * All split/settlement math — unchanged.
 * formatINR previously duplicated here; now imported from shared/lib.
 */

import type {
  Expense,
  Group,
  Member,
  MemberBalance,
  Settlement,
  GroupSettlement,
  ExpenseBreakdown,
} from "@/src/features/splitpay/types";

import { formatINR } from "@/src/shared/lib/currency";

// ─── Internal helpers ──────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function assignWithRemainder(
  items: { id: string; raw: number }[],
  total: number,
  out:   Record<string, number>,
): void {
  let assigned = 0;
  items.forEach((item, i) => {
    const v = i < items.length - 1 ? round2(item.raw) : round2(total - assigned);
    out[item.id] = v;
    assigned += v;
  });
}

// ─── Per-expense share computation ────────────────────────────────────────────

export function computeExpenseShares(expense: Expense): Record<string, number> {
  const { amount, splitMethod, participants } = expense;
  if (!participants.length || amount <= 0) return {};

  const result: Record<string, number> = {};

  switch (splitMethod) {
    case "equal": {
      const base      = Math.floor((amount / participants.length) * 100) / 100;
      const remainder = round2(amount - base * participants.length);
      participants.forEach((p, i) => {
        result[p.memberId] = i === 0 ? round2(base + remainder) : base;
      });
      break;
    }
    case "exact": {
      participants.forEach((p) => { result[p.memberId] = round2(p.value ?? 0); });
      break;
    }
    case "percent": {
      const totalPct = participants.reduce((s, p) => s + (p.value ?? 0), 0);
      const rawShares = participants.map((p) => ({
        id:  p.memberId,
        raw: totalPct > 0 ? amount * ((p.value ?? 0) / totalPct) : 0,
      }));
      assignWithRemainder(rawShares, amount, result);
      break;
    }
    case "shares": {
      const totalShares = participants.reduce((s, p) => s + (p.value ?? 1), 0);
      const rawShares   = participants.map((p) => ({
        id:  p.memberId,
        raw: totalShares > 0 ? amount * ((p.value ?? 1) / totalShares) : 0,
      }));
      assignWithRemainder(rawShares, amount, result);
      break;
    }
  }

  return result;
}

// ─── Full expense breakdown ────────────────────────────────────────────────────

export function computeExpenseBreakdown(expense: Expense): ExpenseBreakdown {
  return { expenseId: expense.id, shares: computeExpenseShares(expense) };
}

// ─── Group-level balances ──────────────────────────────────────────────────────

export function computeGroupBalances(group: Group): MemberBalance[] {
  const paid: Record<string, number> = {};
  const owed: Record<string, number> = {};
  group.members.forEach((m) => { paid[m.id] = 0; owed[m.id] = 0; });

  group.expenses.forEach((expense) => {
    paid[expense.paidBy] = round2((paid[expense.paidBy] ?? 0) + expense.amount);
    const shares = computeExpenseShares(expense);
    Object.entries(shares).forEach(([memberId, share]) => {
      owed[memberId] = round2((owed[memberId] ?? 0) + share);
    });
  });

  return group.members.map((m) => {
    const totalPaid = round2(paid[m.id] ?? 0);
    const totalOwed = round2(owed[m.id] ?? 0);
    return { memberId: m.id, totalPaid, totalOwed, netBalance: round2(totalPaid - totalOwed) };
  });
}

// ─── Settlement optimisation ───────────────────────────────────────────────────

export function computeSettlements(balances: MemberBalance[]): Settlement[] {
  const credits: { id: string; amount: number }[] = [];
  const debts:   { id: string; amount: number }[] = [];

  balances.forEach((b) => {
    if (b.netBalance  >  0.005) credits.push({ id: b.memberId, amount:  b.netBalance });
    if (b.netBalance  < -0.005) debts.push({   id: b.memberId, amount: -b.netBalance });
  });

  credits.sort((a, b) => b.amount - a.amount);
  debts.sort(  (a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let ci = 0, di = 0;

  while (ci < credits.length && di < debts.length) {
    const credit = credits[ci];
    const debt   = debts[di];
    const amount = round2(Math.min(credit.amount, debt.amount));

    if (amount > 0.005) settlements.push({ fromId: debt.id, toId: credit.id, amount });

    credit.amount = round2(credit.amount - amount);
    debt.amount   = round2(debt.amount   - amount);
    if (credit.amount < 0.005) ci++;
    if (debt.amount   < 0.005) di++;
  }

  return settlements;
}

export function computeGroupSettlement(group: Group): GroupSettlement {
  const balances    = computeGroupBalances(group);
  const settlements = computeSettlements(balances);
  return { balances, settlements };
}

// ─── Validation ────────────────────────────────────────────────────────────────

export type ValidationResult = { valid: boolean; error?: string };

export function validateExpenseShares(expense: Expense): ValidationResult {
  if (expense.splitMethod === "exact") {
    const total = expense.participants.reduce((s, p) => s + (p.value ?? 0), 0);
    const diff  = Math.abs(total - expense.amount);
    if (diff > 0.01) return { valid: false, error: `Amounts sum to ₹${round2(total)}, bill is ₹${expense.amount}` };
  }
  if (expense.splitMethod === "percent") {
    const total = expense.participants.reduce((s, p) => s + (p.value ?? 0), 0);
    if (Math.abs(total - 100) > 0.5) return { valid: false, error: `Percentages sum to ${round2(total)}%, must equal 100%` };
  }
  if (!expense.participants.length) return { valid: false, error: "Add at least one participant" };
  if (!expense.paidBy)              return { valid: false, error: "Select who paid" };
  if (expense.amount <= 0)          return { valid: false, error: "Enter a valid amount" };
  return { valid: true };
}

// ─── UPI helpers ───────────────────────────────────────────────────────────────

export function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

export function resolveUpi(member: Member): string {
  return member.upiId ?? `${member.phone}@upi`;
}

export function buildUpiLink(member: Member, amount: number): string {
  const upi  = encodeURIComponent(resolveUpi(member));
  const name = encodeURIComponent(member.name);
  return `upi://pay?pa=${upi}&pn=${name}&am=${amount.toFixed(2)}&cu=INR`;
}

// ─── Settlement text ───────────────────────────────────────────────────────────

export function buildSettlementText(group: Group, settlements: Settlement[]): string {
  const memberMap = Object.fromEntries(group.members.map((m) => [m.id, m]));
  const lines = [
    `💰 ${group.name} — Settlement`,
    `${group.expenses.length} expense(s) · Total: ${formatINR(group.expenses.reduce((s, e) => s + e.amount, 0), 2)}`,
    "─────────────────",
    ...settlements.map(
      (s) => `${memberMap[s.fromId]?.name} → ${memberMap[s.toId]?.name}: ${formatINR(s.amount, 2)}`
    ),
    "─────────────────",
    "Generated by SpendWise",
  ];
  return lines.join("\n");
}