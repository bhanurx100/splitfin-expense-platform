// types/splitpay/index.ts

export type SplitMethod = "equal" | "exact" | "percent" | "shares";

export type Member = {
  id: string;
  name: string;
  phone: string; // 10-digit Indian mobile
  upiId?: string; // custom UPI ID, defaults to phone@upi
  color: string;
};

// How a single participant's share is expressed within one expense
export type ParticipantShare = {
  memberId: string;
  // for "exact": rupee amount they owe
  // for "percent": percentage (0-100)
  // for "shares": weight (positive integer)
  // for "equal": unused (calculated automatically)
  value?: number;
};

export type Expense = {
  id: string;
  groupId: string;
  title: string;
  amount: number; // grand total in rupees (post tax/tip)
  taxPct: number;
  tipPct: number;
  paidBy: string; // memberId
  splitMethod: SplitMethod;
  participants: ParticipantShare[]; // subset of group members
  date: string; // ISO date string
  notes?: string;
};

export type Group = {
  id: string;
  name: string;
  emoji?: string;
  members: Member[];
  expenses: Expense[];
  createdAt: string;
};

// ── Calculation output types ──────────────────────────────────────────────────

/** How much each member paid vs. owes across all expenses in a group */
export type MemberBalance = {
  memberId: string;
  totalPaid: number;   // sum of expense.amount where paidBy === memberId
  totalOwed: number;   // sum of computed shares across all expenses
  netBalance: number;  // totalPaid - totalOwed  (positive = owed money back, negative = owes money)
};

/** A single directed settlement transaction */
export type Settlement = {
  fromId: string; // who pays
  toId: string;   // who receives
  amount: number; // rupees
};

export type GroupSettlement = {
  balances: MemberBalance[];
  settlements: Settlement[]; // minimised set of transactions
};

/** Per-expense breakdown: how much each participant owes on that expense */
export type ExpenseBreakdown = {
  expenseId: string;
  shares: Record<string, number>; // memberId → rupee amount
};