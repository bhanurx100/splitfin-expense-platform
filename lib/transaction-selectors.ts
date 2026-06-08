/**
 * Transaction Selectors
 * 
 * Pure functions that derive data from Transaction[].
 * These are the single source of truth for all derived data.
 * 
 * All pages and components should use these selectors.
 * No feature should parse CSV or calculate directly from raw data.
 */

import { Transaction } from '@/types/transaction';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AccountData {
  name: string;
  balance: number;
  credits: number;
  debits: number;
  transactionCount: number;
  lastTransaction: Date;
}

export interface CategoryData {
  name: string;
  totalSpent: number;
  transactionCount: number;
  percentage: number;
  monthlySpending: number;
}

export interface HeroSummary {
  totalBalance: number;
  accountCount: number;
  monthlyChange: number;
  income: number;
  expenses: number;
  net: number;
}

export interface CashFlowData {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface SpendingOverview {
  name: string;
  value: number;
  percentage: number;
}

// ─── Account Selectors ─────────────────────────────────────────────────────────

/**
 * Get all accounts from transactions
 */
export function getAccounts(transactions: Transaction[]): AccountData[] {
  const accountMap = new Map<string, {
    credits: number;
    debits: number;
    transactionCount: number;
    lastTransaction: Date;
  }>();

  transactions.forEach(t => {
    const current = accountMap.get(t.account) || {
      credits: 0,
      debits: 0,
      transactionCount: 0,
      lastTransaction: t.date,
    };

    if (t.type === 'income') {
      current.credits += t.amount;
    } else if (t.type === 'expense') {
      current.debits += t.amount;
    }

    current.transactionCount += 1;
    if (t.date > current.lastTransaction) {
      current.lastTransaction = t.date;
    }

    accountMap.set(t.account, current);
  });

  return Array.from(accountMap.entries()).map(([name, data]) => ({
    name,
    balance: data.credits - data.debits,
    credits: data.credits,
    debits: data.debits,
    transactionCount: data.transactionCount,
    lastTransaction: data.lastTransaction,
  })).sort((a, b) => b.balance - a.balance);
}

// ─── Category Selectors ────────────────────────────────────────────────────────

/**
 * Get all categories from transactions
 */
export function getCategories(transactions: Transaction[]): CategoryData[] {
  const categoryMap = new Map<string, {
    totalSpent: number;
    transactionCount: number;
    monthlySpending: number;
  }>();

  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  expenseTransactions.forEach(t => {
    const current = categoryMap.get(t.category) || {
      totalSpent: 0,
      transactionCount: 0,
      monthlySpending: 0,
    };

    current.totalSpent += t.amount;
    current.transactionCount += 1;

    categoryMap.set(t.category, current);
  });

  // Calculate monthly spending (average per month)
  const uniqueMonths = new Set(
    expenseTransactions.map(t => {
      const date = new Date(t.date);
      return `${date.getFullYear()}-${date.getMonth()}`;
    })
  ).size || 1;

  return Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    totalSpent: data.totalSpent,
    transactionCount: data.transactionCount,
    percentage: totalExpenses > 0 ? (data.totalSpent / totalExpenses) * 100 : 0,
    monthlySpending: data.totalSpent / uniqueMonths,
  })).sort((a, b) => b.totalSpent - a.totalSpent);
}

// ─── Income/Expense Selectors ─────────────────────────────────────────────────

/**
 * Get total income from transactions
 */
export function getIncomeTotal(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Get total expense from transactions
 */
export function getExpenseTotal(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

// ─── Cash Flow Selectors ─────────────────────────────────────────────────────

/**
 * Get cash flow data from transactions
 */
export function getCashFlow(transactions: Transaction[]): CashFlowData[] {
  const monthlyData = new Map<string, { income: number; expense: number; net: number }>();
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const current = monthlyData.get(monthKey) || { income: 0, expense: 0, net: 0 };
    
    if (t.type === 'income') {
      current.income += t.amount;
      current.net += t.amount;
    } else if (t.type === 'expense') {
      current.expense += t.amount;
      current.net -= t.amount;
    }
    
    monthlyData.set(monthKey, current);
  });
  
  return Array.from(monthlyData.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Spending Overview Selectors ───────────────────────────────────────────────

/**
 * Get spending overview from transactions
 */
export function getSpendingOverview(transactions: Transaction[]): SpendingOverview[] {
  const categoryMap = new Map<string, number>();
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });
  
  const totalExpenses = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
  
  return Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

// ─── Hero Summary Selectors ────────────────────────────────────────────────────

/**
 * Get hero summary from transactions
 */
export function getHeroSummary(transactions: Transaction[]): HeroSummary {
  const income = getIncomeTotal(transactions);
  const expenses = getExpenseTotal(transactions);
  const totalBalance = income - expenses;
  const net = income - expenses;
  
  // Get unique accounts
  const uniqueAccounts = new Set(transactions.map(t => t.account));
  const accountCount = uniqueAccounts.size;
  
  // Calculate monthly change (compare last 30 days with previous 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  const recentTransactions = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
  const previousTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  });
  
  const recentNet = recentTransactions.reduce((sum, t) => {
    if (t.type === 'income') return sum + t.amount;
    if (t.type === 'expense') return sum - t.amount;
    return sum;
  }, 0);
  
  const previousNet = previousTransactions.reduce((sum, t) => {
    if (t.type === 'income') return sum + t.amount;
    if (t.type === 'expense') return sum - t.amount;
    return sum;
  }, 0);
  
  const monthlyChange = previousNet !== 0 
    ? ((recentNet - previousNet) / Math.abs(previousNet)) * 100 
    : 0;
  
  return {
    totalBalance,
    accountCount,
    monthlyChange,
    income,
    expenses,
    net,
  };
}

// ─── Utility Functions ────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export type TimePeriod = '1M' | '3M' | '6M' | '1Y';

export function filterCashFlowByPeriod(
  cashFlowData: CashFlowData[],
  period: TimePeriod
): CashFlowData[] {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case '1M':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case '3M':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case '6M':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      break;
    case '1Y':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }

  return cashFlowData.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= now;
  });
}
