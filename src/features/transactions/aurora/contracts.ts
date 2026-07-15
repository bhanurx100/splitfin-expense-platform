export type TransactionKind = "income" | "expense" | "transfer" | "refund";

export interface AuroraTransaction {
  id: string;
  occurredAt: Date;
  payee: string;
  category: string | null;
  account: string;
  notes?: string | null;
  amount: number;
  kind: TransactionKind;
}

export interface AuroraTransactionFeed {
  transactions: AuroraTransaction[];
  income: number;
  expenses: number;
  net: number;
}
