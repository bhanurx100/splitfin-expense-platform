/**
 * SplitFin Shared Constants
 * App-wide configuration, route definitions, and copy.
 */

// ─── App Meta ─────────────────────────────────────────────────────────────────

export const APP_NAME = "SplitFin" as const
export const APP_VERSION = "1.0.0" as const

// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  home:           "/",
  createGroup:    "/groups/create",
  group:          (id: string) => `/groups/${id}`,
  expense:        (groupId: string, expenseId: string) => `/groups/${groupId}/expenses/${expenseId}`,
  members:        (groupId: string) => `/groups/${groupId}/members`,
  settleUp:       (groupId: string) => `/groups/${groupId}/settle`,
} as const

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  {
    id:    "home",
    label: "Home",
    href:  ROUTES.home,
    icon:  "home",
  },
  {
    id:    "activity",
    label: "Activity",
    href:  "/activity",
    icon:  "activity",
  },
  {
    id:    "add",
    label: "Add",
    href:  "#add-expense",
    icon:  "plus",
    isCta: true,
  },
  {
    id:    "groups",
    label: "Groups",
    href:  "/groups",
    icon:  "users",
  },
  {
    id:    "profile",
    label: "You",
    href:  "/profile",
    icon:  "user",
  },
] as const

// ─── Split Types ──────────────────────────────────────────────────────────────

export const SPLIT_TYPES = [
  { id: "equal",      label: "Equal Split",      description: "Split evenly among all members" },
  { id: "exact",      label: "Exact Amounts",     description: "Set exact amount per person" },
  { id: "percentage", label: "By Percentage",     description: "Split by custom percentages" },
  { id: "shares",     label: "By Shares",         description: "Split by number of shares" },
] as const

export type SplitType = typeof SPLIT_TYPES[number]["id"]

// ─── Group Currencies ─────────────────────────────────────────────────────────

export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
] as const

export type CurrencyCode = typeof CURRENCIES[number]["code"]

// ─── Expense Categories ───────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
  { id: "food",         label: "Food & Dining",  emoji: "🍽️" },
  { id: "travel",       label: "Travel",         emoji: "✈️" },
  { id: "stay",         label: "Accommodation",  emoji: "🏨" },
  { id: "transport",    label: "Transport",      emoji: "🚗" },
  { id: "entertainment",label: "Entertainment",  emoji: "🎬" },
  { id: "shopping",     label: "Shopping",       emoji: "🛍️" },
  { id: "groceries",    label: "Groceries",      emoji: "🛒" },
  { id: "utilities",    label: "Utilities",      emoji: "💡" },
  { id: "medical",      label: "Medical",        emoji: "💊" },
  { id: "other",        label: "Other",          emoji: "📦" },
] as const

export type ExpenseCategoryId = typeof EXPENSE_CATEGORIES[number]["id"]

// ─── Activity Timeline Types ──────────────────────────────────────────────────

export const ACTIVITY_TYPES = {
  EXPENSE_CREATED:    "expense_created",
  EXPENSE_EDITED:     "expense_edited",
  EXPENSE_DELETED:    "expense_deleted",
  PAYMENT_MARKED:     "payment_marked",
  PAYMENT_DETECTED:   "payment_detected",
  SETTLED:            "settled",
} as const

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES]

// ─── Payment Methods ──────────────────────────────────────────────────────────

export const PAYMENT_METHODS = [
  { id: "gpay",     label: "Google Pay",  emoji: "🟡" },
  { id: "phonepe",  label: "PhonePe",     emoji: "🟣" },
  { id: "paytm",    label: "Paytm",       emoji: "🔵" },
  { id: "bhim",     label: "BHIM",        emoji: "🟠" },
  { id: "upi",      label: "UPI ID",      emoji: "📱" },
  { id: "bank",     label: "Bank Transfer",emoji: "🏦" },
  { id: "cash",     label: "Cash",        emoji: "💵" },
  { id: "other",    label: "Other",       emoji: "💳" },
] as const

export type PaymentMethodId = typeof PAYMENT_METHODS[number]["id"]

// ─── Member Roles ─────────────────────────────────────────────────────────────

export const MEMBER_ROLES = {
  ADMIN:  "admin",
  MEMBER: "member",
} as const

export type MemberRole = typeof MEMBER_ROLES[keyof typeof MEMBER_ROLES]

// ─── Settlement Status ────────────────────────────────────────────────────────

export const SETTLEMENT_STATUS = {
  PENDING: "pending",
  PAID:    "paid",
} as const

export type SettlementStatus = typeof SETTLEMENT_STATUS[keyof typeof SETTLEMENT_STATUS]

// ─── Local Storage Keys ───────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  userId:       "splitfin_user_id",
  authToken:    "splitfin_auth_token",
  theme:        "splitfin_theme",
  lastGroup:    "splitfin_last_group",
} as const

// ─── Query Keys (TanStack Query) ──────────────────────────────────────────────

export const QUERY_KEYS = {
  groups:       ["groups"]                                    as const,
  group:        (id: string) => ["groups", id]               as const,
  expenses:     (groupId: string) => ["expenses", groupId]   as const,
  expense:      (id: string) => ["expenses", "detail", id]   as const,
  members:      (groupId: string) => ["members", groupId]    as const,
  settlements:  (groupId: string) => ["settlements", groupId]as const,
  balances:     (groupId: string) => ["balances", groupId]   as const,
  activity:     (groupId: string) => ["activity", groupId]   as const,
  user:         ["user"]                                      as const,
} as const

// ─── API Routes ───────────────────────────────────────────────────────────────

export const API = {
  groups:     "/api/groups",
  group:      (id: string) => `/api/groups/${id}`,
  expenses:   (groupId: string) => `/api/groups/${groupId}/expenses`,
  expense:    (groupId: string, id: string) => `/api/groups/${groupId}/expenses/${id}`,
  members:    (groupId: string) => `/api/groups/${groupId}/members`,
  member:     (groupId: string, userId: string) => `/api/groups/${groupId}/members/${userId}`,
  settlements:(groupId: string) => `/api/groups/${groupId}/settlements`,
  settlement: (groupId: string, id: string) => `/api/groups/${groupId}/settlements/${id}`,
  activity:   (groupId: string) => `/api/groups/${groupId}/activity`,
  user:       "/api/user",
} as const

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULTS = {
  currency:  "INR" as CurrencyCode,
  splitType: "equal" as SplitType,
  pageSize:  20,
  debounce:  300,
} as const

// ─── Copy / Microcopy ─────────────────────────────────────────────────────────

export const COPY = {
  empty: {
    groups:   "No groups yet. Create one to start splitting expenses.",
    expenses: "No expenses yet. Add one to get started.",
    members:  "No members yet.",
    activity: "No activity yet.",
  },
  error: {
    generic:  "Something went wrong. Please try again.",
    network:  "Check your connection and try again.",
    notFound: "Not found.",
  },
  confirm: {
    deleteExpense: "Delete this expense? This can't be undone.",
    removeMember:  "Remove this member? Their expenses remain in the group.",
    settleUp:      "Mark all debts as settled?",
  },
} as const