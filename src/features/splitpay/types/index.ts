/**
 * SplitFin Core Types
 * All domain model interfaces and utility types.
 */

import type { SplitType, CurrencyCode, ActivityType, MemberRole, SettlementStatus, PaymentMethodId, ExpenseCategoryId } from "@/src/config/constants"

// Re-export group page types for convenience
export type { GroupPageMember, GroupSummary, GroupTab, GroupPageData, TimelineCard, TimelineCardType, TimelinePayer } from "./group"

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id:        string
  name:      string
  email:     string
  phone?:    string
  image?:    string
  createdAt: string
}

export interface UserProfile extends User {
  totalGroups:    number
  totalExpenses:  number
}

// ─── Group ────────────────────────────────────────────────────────────────────

export interface Group {
  id:        string
  name:      string
  emoji:     string
  currency?:  CurrencyCode
  createdAt: string
  members:   Member[]
  expenses:  Expense[]
}

export interface GroupWithStats extends Group {
  memberCount:      number
  expenseCount:     number
  totalExpenses:    number
  settledAmount:    number
  pendingCount:     number
  settledCount:     number
  lastSettledAt?:   string
  /** Your net balance in this group. Positive = you will receive */
  yourBalance:      number
}

// ─── Member ───────────────────────────────────────────────────────────────────

export interface Member {
  id:     string
  name:   string
  emoji:  string
  color:  string
  upiId?: string
  phone?: string
}

export interface GroupMember {
  id:       string
  groupId:  string
  userId:   string
  role:     MemberRole
  joinedAt: string
  upiId?:   string
  phone?:   string
  user:     User
}

// ─── Expense ──────────────────────────────────────────────────────────────────

export type SplitMethod = "equal" | "exact" | "percent" | "shares"

export interface Expense {
  id:          string
  groupId:     string
  title:       string
  amount:      number
  currency:    CurrencyCode
  category?:   ExpenseCategoryId
  splitType?:  SplitType
  splitMethod: SplitMethod
  taxPct:      number
  tipPct:      number
  paidBy:      string  // User ID who paid
  participants:ExpenseParticipant[]
  date:        string
  notes?:      string
}

export interface ExpenseParticipant {
  memberId: string
  value?:   number  // For exact/percent/shares split methods
}

// ─── Settlement ───────────────────────────────────────────────────────────────

export interface Settlement {
  id:        string
  groupId:   string
  payerId:   string
  receiverId:string
  amount:    number
  currency:  CurrencyCode
  status:    SettlementStatus
  method?:   PaymentMethodId
  paidAt?:   string
  createdAt: string
  payer:     User
  receiver:  User
  fromId:    string  // For simplified settlements
  toId:      string  // For simplified settlements
}

/** Simplified settlement transaction (output of simplify algorithm) */
export interface SimplifiedDebt {
  from:   User
  to:     User
  amount: number
}

// ─── Balance ──────────────────────────────────────────────────────────────────

export interface MemberBalance {
  memberId:   string
  totalPaid:  number
  totalOwed:  number
  netBalance: number
}

export interface ExpenseBreakdown {
  expenseId: string
  shares:    Record<string, number>
}

export interface GroupSettlement {
  balances:    MemberBalance[]
  settlements: Settlement[]
}

export interface GroupBalanceSummary {
  /** What YOU will receive */
  youWillReceive: number
  /** What YOU will pay */
  youWillPay:     number
  /** Your net balance */
  yourNet:        number
  memberBalances: MemberBalance[]
  debts:          SimplifiedDebt[]
}

// ─── Activity / Timeline ──────────────────────────────────────────────────────

export interface ActivityItem {
  id:         string
  groupId:    string
  type:       ActivityType
  entityId?:  string   // expense id, settlement id, etc.
  userId:     string
  metadata:   ActivityMetadata
  createdAt:  string
  user:       User
}

export type ActivityMetadata =
  | ExpenseCreatedMeta
  | ExpenseEditedMeta
  | ExpenseDeletedMeta
  | PaymentMarkedMeta
  | PaymentDetectedMeta
  | SettledMeta

export interface ExpenseCreatedMeta {
  type:        "expense_created"
  expenseId:   string
  title:       string
  amount:      number
  paidByNames: string[]
}

export interface ExpenseEditedMeta {
  type:      "expense_edited"
  expenseId: string
  title:     string
  changes:   string[]
}

export interface ExpenseDeletedMeta {
  type:      "expense_deleted"
  title:     string
  amount:    number
}

export interface PaymentMarkedMeta {
  type:       "payment_marked"
  amount:     number
  toUserId:   string
  toUserName: string
  method?:    PaymentMethodId
}

export interface PaymentDetectedMeta {
  type:             "payment_detected"
  amount:           number
  fromUserId:       string
  fromUserName:     string
  via:              string
  transactionId?:   string
}

export interface SettledMeta {
  type:   "settled"
  amount: number
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?:    T
  error?:   string
  message?: string
}

export interface PaginatedResponse<T> {
  data:       T[]
  total:      number
  page:       number
  pageSize:   number
  hasMore:    boolean
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export interface CreateGroupApiForm {
  name:        string
  description?:string
  emoji:       string
  currency:    CurrencyCode
  splitType:   SplitType
  memberEmails:string[]
}

export interface AddExpenseForm {
  title:       string
  amount:      number | ""
  category:    ExpenseCategoryId
  splitType:   SplitType
  note?:       string
  payers:      { userId: string; amount: number }[]
  participants:{ userId: string; share: number }[]
}

export interface MarkPaidForm {
  toUserId:     string
  amount:       number
  method:       PaymentMethodId
  note?:        string
  paidInCash?:  boolean
}

// ─── Component Prop Helpers ────────────────────────────────────────────────────

export type ClassName = string | undefined | null | false

export interface WithClassName {
  className?: string
}

export interface WithChildren {
  children: React.ReactNode
}

export interface WithChildrenAndClassName extends WithClassName, WithChildren {}

// ─── Utility ─────────────────────────────────────────────────────────────────

export type Nullable<T>  = T | null
export type Optional<T>  = T | undefined
export type ID           = string
export type ISODateString= string
export type Amount       = number  // always in minor currency unit (paise, cents)

/** Deep partial — all fields optional recursively */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

// ─── SplitPay Home Page Types ───────────────────────────────────────────────────

export interface CurrentUser {
  id:    string
  name:  string
  emoji: string
}

export interface HomeBalance {
  youWillPay:     number
  youWillReceive: number
  net:            number
}

export interface GroupCardData {
  id:              string
  name:            string
  emoji:           string
  memberCount:     number
  expenseCount:    number
  settledCount:    number
  pendingCount:    number
  yourBalance:     number
  direction:       "pay" | "receive"
  lastSettledAt:   string
  settledProgress: number
}

export interface HomePageData {
  currentUser: CurrentUser
  balance:     HomeBalance
  groups:      GroupCardData[]
}

export interface SplitNavItem {
  id:       string
  label:    string
  icon:     string
  href:     string
  isActive: boolean
}