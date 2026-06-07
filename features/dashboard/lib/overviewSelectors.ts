import { Transaction } from './csvParser';

export interface OverviewData {
  totalBalance: number;
  accountCount: number;
  monthlyChange: number;
  income: number;
  expenses: number;
  net: number;
  categoryBreakdown: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  cashFlowData: Array<{
    date: string;
    income: number;
    expense: number;
    net: number;
  }>;
}

export interface AccountData {
  name: string;
  balance: number;
  credits: number;
  debits: number;
  transactionCount: number;
  lastTransaction: string;
}

export interface CategoryData {
  name: string;
  totalSpent: number;
  transactionCount: number;
  percentage: number;
  monthlySpending: number;
}

export function calculateOverviewData(transactions: Transaction[]): OverviewData {
  // Calculate total balance (Credits - Debits)
  const credits = transactions
    .filter(t => t.type === 'Credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const debits = transactions
    .filter(t => t.type === 'Debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalBalance = credits - debits;
  
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
    if (t.type === 'Credit') return sum + t.amount;
    if (t.type === 'Debit') return sum - t.amount;
    return sum;
  }, 0);
  
  const previousNet = previousTransactions.reduce((sum, t) => {
    if (t.type === 'Credit') return sum + t.amount;
    if (t.type === 'Debit') return sum - t.amount;
    return sum;
  }, 0);
  
  const monthlyChange = previousNet !== 0 
    ? ((recentNet - previousNet) / Math.abs(previousNet)) * 100 
    : 0;
  
  // Calculate income, expenses, and net
  const income = transactions
    .filter(t => t.type === 'Credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'Debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const net = income - expenses;
  
  // Calculate category breakdown (only for Debit transactions)
  const categoryMap = new Map<string, number>();
  transactions
    .filter(t => t.type === 'Debit')
    .forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });
  
  const totalExpenses = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
  
  // Calculate cash flow data by month
  const monthlyData = new Map<string, { income: number; expense: number; net: number }>();
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const current = monthlyData.get(monthKey) || { income: 0, expense: 0, net: 0 };
    
    if (t.type === 'Credit') {
      current.income += t.amount;
      current.net += t.amount;
    } else if (t.type === 'Debit') {
      current.expense += t.amount;
      current.net -= t.amount;
    }
    
    monthlyData.set(monthKey, current);
  });
  
  const cashFlowData = Array.from(monthlyData.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    totalBalance,
    accountCount,
    monthlyChange,
    income,
    expenses,
    net,
    categoryBreakdown,
    cashFlowData,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export type TimePeriod = '1M' | '3M' | '6M' | '1Y';

export function calculateAccountData(transactions: Transaction[]): AccountData[] {
  const accountMap = new Map<string, {
    credits: number;
    debits: number;
    transactionCount: number;
    lastTransaction: string;
  }>();

  transactions.forEach(t => {
    const current = accountMap.get(t.account) || {
      credits: 0,
      debits: 0,
      transactionCount: 0,
      lastTransaction: t.date,
    };

    if (t.type === 'Credit') {
      current.credits += t.amount;
    } else if (t.type === 'Debit') {
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

export function calculateCategoryData(transactions: Transaction[]): CategoryData[] {
  const categoryMap = new Map<string, {
    totalSpent: number;
    transactionCount: number;
    monthlySpending: number;
  }>();

  const debitTransactions = transactions.filter(t => t.type === 'Debit');
  const totalExpenses = debitTransactions.reduce((sum, t) => sum + t.amount, 0);

  debitTransactions.forEach(t => {
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
    debitTransactions.map(t => {
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

export function filterCashFlowByPeriod(
  cashFlowData: Array<{ date: string; income: number; expense: number; net: number }>,
  period: TimePeriod
): Array<{ date: string; income: number; expense: number; net: number }> {
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
