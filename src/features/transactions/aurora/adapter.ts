import type { Tx } from "@/src/features/transactions/lib/filters";
import type { AuroraTransactionFeed } from "./contracts";

/** Presentation-only mapping boundary for the canonical transactions query. */
export function createAuroraTransactionFeed(items: Tx[]): AuroraTransactionFeed {
  const transactions = items.map((item) => ({
    id: item.id,
    occurredAt: new Date(item.date),
    payee: item.payee,
    category: item.category,
    account: item.account,
    notes: item.notes,
    amount: item.amount,
    kind: item.amount > 0 ? "income" as const : "expense" as const,
  })).sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  const income = transactions.filter((item) => item.amount > 0).reduce((total, item) => total + item.amount, 0);
  const expenses = transactions.filter((item) => item.amount < 0).reduce((total, item) => total + Math.abs(item.amount), 0);
  return { transactions, income, expenses, net: income - expenses };
}
