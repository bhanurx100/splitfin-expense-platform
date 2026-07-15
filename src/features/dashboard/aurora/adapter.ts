import { accountBalance, accounts, periodChangePct, recentTransactions, spendingByCategory, totalBalance, totalExpense, totalIncome, type Transaction } from "@/src/features/dashboard/lib/store";
import type { AuroraOverviewModel } from "./contracts";

/** Temporary presentation adapter around the existing dashboard data source. */
export function createAuroraOverviewModel(transactions: Transaction[]): AuroraOverviewModel {
  const expenses = totalExpense(transactions);
  const categories = spendingByCategory(transactions).slice(0, 4).map((item) => ({
    name: item.category,
    amount: item.total,
    percentage: expenses > 0 ? (item.total / expenses) * 100 : 0,
  }));

  return {
    balance: totalBalance(transactions),
    monthlyChange: periodChangePct(transactions, "1M"),
    accountCount: accounts.length,
    income: totalIncome(transactions),
    expenses,
    netWorth: totalBalance(transactions),
    categories,
    accounts: accounts.map((account) => ({ ...account, balance: accountBalance(transactions, account.id) })),
    activities: recentTransactions(transactions).map((transaction) => ({
      id: transaction.id,
      title: transaction.merchant,
      subtitle: transaction.note,
      amount: transaction.amount,
      direction: transaction.type === "expense" ? "debit" : transaction.type === "transfer" ? "transfer" : "credit",
    })),
    // There is no canonical SplitPay summary query yet; this keeps the visual contract explicit.
    splitPay: { outstanding: 0, groupCount: 0 },
  };
}
