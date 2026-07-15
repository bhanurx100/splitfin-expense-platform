/**
 * Create Group feature — domain types
 */

import type { CurrencyCode } from "@/src/config/constants"

// ─── Form ─────────────────────────────────────────────────────────────────────

export interface CreateGroupForm {
  emoji:       string
  name:        string
  description: string
  members:     SelectedMember[]
  splitType:   SplitTypeId
  currency:    CurrencyCode
}

export type CreateGroupFormErrors = Partial<Record<keyof CreateGroupForm, string>>

// ─── Members ──────────────────────────────────────────────────────────────────

export interface ContactSuggestion {
  id:     string
  name:   string
  phone?: string
  email?: string
  emoji:  string   // avatar emoji instead of image
}

export interface SelectedMember extends ContactSuggestion {
  addedAt: number  // timestamp for stable ordering
}

// ─── Split Type ───────────────────────────────────────────────────────────────

export type SplitTypeId = "equal" | "percentage" | "shares" | "custom"

export interface SplitTypeOption {
  id:          SplitTypeId
  label:       string
  description: string
  emoji:       string
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export interface CurrencyOption {
  code:   CurrencyCode
  name:   string
  symbol: string
  flag:   string   // flag emoji
  region: string
}

// ─── Create Group Result ──────────────────────────────────────────────────────

export type CreateGroupStatus = "idle" | "loading" | "success" | "error"