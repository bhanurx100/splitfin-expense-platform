/**
 * Group Page — domain types
 */

import type { MemberRole } from "@/src/config/constants"

// ─── Member ───────────────────────────────────────────────────────────────────

export interface GroupPageMember {
  id:        string
  name:      string
  emoji:     string
  role:      MemberRole
  isYou:     boolean
  joinedAt:  string
  /** net balance in this group: positive = owed to them, negative = they owe you */
  balance:   number
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export type TimelineCardType =
  | "expense_created"
  | "expense_edited"
  | "expense_deleted"
  | "settlement"
  | "payment_detected"
  | "payment_manual"
  | "payment_pending"

export interface TimelinePayer {
  id:     string
  name:   string
  emoji:  string
  amount: number
}

export interface TimelineCard {
  id:          string
  type:        TimelineCardType
  title:       string
  subtitle:    string
  amount:      number
  time:        string       // ISO string
  dateGroup:   "today" | "yesterday" | "earlier"
  payers:      TimelinePayer[]
  category?:   string       // emoji
  note?:       string
  editedFrom?: number       // original amount if edited
  via?:        string       // "PhonePe", "GPay" etc for payment_detected
  transactionId?: string
  status?:     "completed" | "pending"
}

// ─── Group Summary ────────────────────────────────────────────────────────────

export interface GroupSummary {
  id:              string
  name:            string
  emoji:           string
  memberCount:     number
  totalExpenses:   number   // sum of all expense amounts
  youWillPay:      number
  youWillReceive:  number
  settled:         number   // total settled amount
  lastSettledAt:   string | null
  currency:        string
  currencySymbol:  string
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

export type GroupTab = "timeline" | "members"

// ─── Page Data ────────────────────────────────────────────────────────────────

export interface GroupPageData {
  summary:    GroupSummary
  members:    GroupPageMember[]
  timeline:   TimelineCard[]
  currentUserId: string
}