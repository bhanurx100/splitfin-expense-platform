export type OverviewActivity = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  direction: "credit" | "debit" | "transfer";
};

export type OverviewCategory = { name: string; amount: number; percentage: number };
export type OverviewAccount = { id: string; name: string; kind: string; balance: number };

/** Presentation contract: replace this adapter with summary/query results in a later phase. */
export interface AuroraOverviewModel {
  greetingName?: string;
  balance: number;
  monthlyChange: number;
  accountCount: number;
  income: number;
  expenses: number;
  netWorth: number;
  categories: OverviewCategory[];
  accounts: OverviewAccount[];
  activities: OverviewActivity[];
  splitPay: { outstanding: number; groupCount: number };
}
