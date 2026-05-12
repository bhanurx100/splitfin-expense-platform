// utils/splitpay/calculations.ts

import type {
  Expense, Group, Member, MemberBalance,
  Settlement, GroupSettlement, ExpenseBreakdown,
} from "@/types/splitpay";

// ── Per-expense share computation ────────────────────────────────────────────

/**
 * Given an expense, returns the rupee amount each participant owes.
 * Handles equal / exact / percent / shares methods.
 * Precision: rounded to nearest paisa (2dp), remainder given to first participant.
 */
export function computeExpenseShares(expense: Expense): Record<string, number> {
  const { amount, splitMethod, participants } = expense;
  if (!participants.length || amount <= 0) return {};

  const result: Record<string, number> = {};

  switch (splitMethod) {
    case "equal": {
      const base = Math.floor((amount / participants.length) * 100) / 100;
      const remainder = round2(amount - base * participants.length);
      participants.forEach((p, i) => {
        result[p.memberId] = i === 0 ? round2(base + remainder) : base;
      });
      break;
    }

    case "exact": {
      participants.forEach(p => {
        result[p.memberId] = round2(p.value ?? 0);
      });
      break;
    }

    case "percent": {
      const totalPct = participants.reduce((s, p) => s + (p.value ?? 0), 0);
      const rawShares = participants.map(p => ({
        id: p.memberId,
        raw: totalPct > 0 ? amount * ((p.value ?? 0) / totalPct) : 0,
      }));
      assignWithRemainder(rawShares, amount, result);
      break;
    }

    case "shares": {
      const totalShares = participants.reduce((s, p) => s + (p.value ?? 1), 0);
      const rawShares = participants.map(p => ({
        id: p.memberId,
        raw: totalShares > 0 ? amount * ((p.value ?? 1) / totalShares) : 0,
      }));
      assignWithRemainder(rawShares, amount, result);
      break;
    }
  }

  return result;
}

/** Round to 2 decimal places (paisa precision) */
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Distribute amounts to avoid floating-point drift:
 * assign floor to everyone, give leftover rupees to the first participant.
 */
function assignWithRemainder(
  items: { id: string; raw: number }[],
  total: number,
  out: Record<string, number>
) {
  let assigned = 0;
  items.forEach((item, i) => {
    const v = i < items.length - 1 ? round2(item.raw) : round2(total - assigned);
    out[item.id] = v;
    assigned += v;
  });
}

// ── Full expense breakdown ────────────────────────────────────────────────────

export function computeExpenseBreakdown(expense: Expense): ExpenseBreakdown {
  return {
    expenseId: expense.id,
    shares: computeExpenseShares(expense),
  };
}

// ── Group-level balances ──────────────────────────────────────────────────────

/**
 * Aggregates across all expenses in a group.
 * Returns a MemberBalance per member — net positive means they are owed money.
 */
export function computeGroupBalances(group: Group): MemberBalance[] {
  // Initialise ledger for every member (even those with no transactions)
  const paid: Record<string, number>  = {};
  const owed: Record<string, number>  = {};

  group.members.forEach(m => {
    paid[m.id] = 0;
    owed[m.id] = 0;
  });

  group.expenses.forEach(expense => {
    // What the payer fronted
    paid[expense.paidBy] = round2((paid[expense.paidBy] ?? 0) + expense.amount);

    // What each participant owes on this expense
    const shares = computeExpenseShares(expense);
    Object.entries(shares).forEach(([memberId, share]) => {
      owed[memberId] = round2((owed[memberId] ?? 0) + share);
    });
  });

  return group.members.map(m => {
    const totalPaid = round2(paid[m.id] ?? 0);
    const totalOwed = round2(owed[m.id] ?? 0);
    return {
      memberId: m.id,
      totalPaid,
      totalOwed,
      netBalance: round2(totalPaid - totalOwed),
    };
  });
}

// ── Settlement optimisation ───────────────────────────────────────────────────

/**
 * Minimised settlement: greedy algorithm that reduces N*(N-1)/2 possible
 * transactions to at most N-1 transactions.
 *
 * Credits (net > 0) are matched against debts (net < 0) in descending order.
 */
export function computeSettlements(balances: MemberBalance[]): Settlement[] {
  // Deep-copy so we can mutate
  const credits: { id: string; amount: number }[] = [];
  const debts:   { id: string; amount: number }[] = [];

  balances.forEach(b => {
    if (b.netBalance > 0.005)       credits.push({ id: b.memberId, amount: b.netBalance });
    else if (b.netBalance < -0.005) debts.push({ id: b.memberId, amount: -b.netBalance });
  });

  // Sort descending for greedy matching
  credits.sort((a, b) => b.amount - a.amount);
  debts.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];

  let ci = 0, di = 0;
  while (ci < credits.length && di < debts.length) {
    const credit = credits[ci];
    const debt   = debts[di];
    const amount = round2(Math.min(credit.amount, debt.amount));

    if (amount > 0.005) {
      settlements.push({ fromId: debt.id, toId: credit.id, amount });
    }

    credit.amount = round2(credit.amount - amount);
    debt.amount   = round2(debt.amount   - amount);

    if (credit.amount < 0.005) ci++;
    if (debt.amount   < 0.005) di++;
  }

  return settlements;
}

/** Convenience: compute balances + settlements together */
export function computeGroupSettlement(group: Group): GroupSettlement {
  const balances    = computeGroupBalances(group);
  const settlements = computeSettlements(balances);
  return { balances, settlements };
}

// ── Validation helpers ────────────────────────────────────────────────────────

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

export function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

export function resolveUpi(member: Member): string {
  return member.upiId ?? `${member.phone}@upi`;
}

export function buildUpiLink(member: Member, amount: number): string {
  const upi  = encodeURIComponent(resolveUpi(member));
  const name = encodeURIComponent(member.name);
  const amt  = amount.toFixed(2);
  return `upi://pay?pa=${upi}&pn=${name}&am=${amt}&cu=INR`;
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatINR(amount: number, decimals = 2): string {
  return "₹" + Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function buildSettlementText(group: Group, settlements: Settlement[]): string {
  const memberMap = Object.fromEntries(group.members.map(m => [m.id, m]));
  const lines = [
    `💰 ${group.name} — Settlement`,
    `${group.expenses.length} expense(s) · Total: ${formatINR(group.expenses.reduce((s, e) => s + e.amount, 0))}`,
    "─────────────────",
    ...settlements.map(s =>
      `${memberMap[s.fromId]?.name} → ${memberMap[s.toId]?.name}: ${formatINR(s.amount)}`
    ),
    "─────────────────",
    `Generated by SpendWise`,
  ];
  return lines.join("\n");
}