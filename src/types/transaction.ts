export type Currency = 'INR' | 'USD' | 'EUR'

export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund'

export type AccountType =
  | 'bank'
  | 'credit-card'
  | 'debit-card'
  | 'wallet'
  | 'cash'
  | 'investment'

export interface UserGreeting {
  name: string
  subtitle: string
  unreadNotifications: number
}

export interface BalanceSummary {
  totalBalance: number
  monthlyChange: number
  monthlyChangePercent: number
  accountCount: number
  currency: Currency
}

export interface MoneySummary {
  moneyIn: number
  moneyOut: number
  netBalance: number
  bars: number[]
  currency: Currency
}

export interface AccountPreview {
  id: string
  name: string
  institution: string
  type: AccountType
  balance: number
  monthlyChangePercent: number
  currency: Currency
  accountsCount?: number
  isPrimary?: boolean
  maskedNumber?: string
  lastSynced?: string
}

export interface CashFlowPoint {
  label: string
  inflow: number
  outflow: number
}

export interface CategorySummary {
  id: string
  name: string
  icon: string
  amount: number
  percent: number
  color: string
  budget?: number
  trend?: number
  merchantCount?: number
  group?: 'needs' | 'wants' | 'lifestyle' | 'others'
}

export interface SplitPaySummary {
  youOwe: number
  youAreOwed: number
  netBalance: number
  oweGroups: number
  owedGroups: number
  currency: Currency
}

export interface Insight {
  id: string
  icon: string
  title: string
  description: string
  cta?: string
  tone: 'positive' | 'negative' | 'info' | 'warning'
}

export interface Transaction {
  id: string
  merchant: string
  subtitle: string
  category: string
  icon: string
  account: string
  type: TransactionType
  amount: number
  currency: Currency
  time: string
  date: string
  status?: 'completed' | 'pending' | 'failed'
  hasReceipt?: boolean
  isSplit?: boolean
  isRecurring?: boolean
}

export interface MonthGroup {
  id: string
  month: string
  year: number
  totalSpent: number
  currency: Currency
  transactions: Transaction[]
}

export interface TransactionSummary {
  income: number
  expense: number
  netFlow: number
  incomeChangePercent: number
  expenseChangePercent: number
  incomeBars: number[]
  expenseBars: number[]
  currency: Currency
}

export interface SplitMember {
  id: string
  name: string
  avatar: string
  netBalance: number
  direction: 'you-owe' | 'owes-you' | 'settled'
}

export interface SplitGroup {
  id: string
  name: string
  emojiIcon: string
  coverColor: string
  membersSettled: number
  membersTotal: number
  memberAvatars: string[]
  extraMembers: number
  status: 'you-owe' | 'you-are-owed' | 'settled'
  amount: number
  totalAmount: number
  currency: Currency
}

export interface DistributionSegment {
  id: string
  label: string
  amount: number
  percent: number
  color: string
}

/** A single labelled field in the dynamic account details grid. */
export interface AccountDetailField {
  id: string
  label: string
  value: string
  icon: string
  copyable?: boolean
  tone?: 'positive' | 'negative' | 'default'
}

/** Per-account detail payload — shape varies by account type upstream. */
export interface AccountDetails {
  accountId: string
  fields: AccountDetailField[]
  primaryAmountLabel: string
  primaryAmount: number
  secondaryAmountLabel: string
  secondaryAmount: number
  progressPercent: number
  footnoteLabel: string
  footnoteValue: string
  currency: Currency
}

export interface Bill {
  id: string
  name: string
  provider: string
  icon: string
  color: string
  amount: number
  dueLabel: string
  autopay: boolean
  currency: Currency
}

export interface PortfolioSummary {
  totalValue: number
  todaysChange: number
  todaysChangePercent: number
  holdings: number
  totalGain: number
  totalGainPercent: number
  sparkline: number[]
  currency: Currency
}

export interface CategoryPageSummary {
  totalSpent: number
  changePercent: number
  month: string
  savedAmount: number
  comparedCategory: string
  currency: Currency
}
