/**
 * Create Group page — all static data and mock data.
 * Components never contain hardcoded values.
 */

import type {
  SplitTypeOption,
  CurrencyOption,
  ContactSuggestion,
} from "../types/create-group"

// ─── Default Form Values ──────────────────────────────────────────────────────

export const DEFAULT_EMOJI  = "🎉"
export const DEFAULT_SPLIT  = "equal" as const
export const DEFAULT_CURRENCY = "INR" as const
export const MAX_DESC_LENGTH  = 120
export const MAX_MEMBERS      = 20

// ─── Emoji Picker Options ─────────────────────────────────────────────────────

export const GROUP_EMOJIS = [
  // Travel & Trips
  "🏖️", "🏔️", "✈️", "🚀", "🌍", "🗺️", "🛳️", "🏕️",
  // Food & Dining
  "🍽️", "🍕", "🍣", "☕", "🍻", "🥂", "🍜", "🎂",
  // Home & Life
  "🏠", "🛋️", "🛒", "💡", "🔑", "🏋️", "🎮", "📚",
  // People & Social
  "👥", "🎉", "🎊", "💼", "🤝", "🎓", "💑", "👨‍👩‍👧",
  // Finance & Work
  "💰", "💳", "📊", "🏦", "💎", "🎯", "🚗", "⚡",
] as const

// ─── Split Types ──────────────────────────────────────────────────────────────

export const SPLIT_TYPE_OPTIONS: SplitTypeOption[] = [
  {
    id:          "equal",
    label:       "Equal Split",
    description: "Everyone pays the same amount",
    emoji:       "⚖️",
  },
  {
    id:          "percentage",
    label:       "By Percentage",
    description: "Assign custom % to each person",
    emoji:       "📊",
  },
  {
    id:          "shares",
    label:       "By Shares",
    description: "Split by number of shares held",
    emoji:       "🔢",
  },
  {
    id:          "custom",
    label:       "Custom Amounts",
    description: "Set exact amounts per person",
    emoji:       "✏️",
  },
]

// ─── Currencies ───────────────────────────────────────────────────────────────

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "INR", name: "Indian Rupee",       symbol: "₹",    flag: "🇮🇳", region: "South Asia" },
  { code: "USD", name: "US Dollar",          symbol: "$",    flag: "🇺🇸", region: "North America" },
  { code: "EUR", name: "Euro",               symbol: "€",    flag: "🇪🇺", region: "Europe" },
  { code: "GBP", name: "British Pound",      symbol: "£",    flag: "🇬🇧", region: "Europe" },
  { code: "AED", name: "UAE Dirham",         symbol: "د.إ",  flag: "🇦🇪", region: "Middle East" },
  { code: "SGD", name: "Singapore Dollar",   symbol: "S$",   flag: "🇸🇬", region: "Southeast Asia" },
]

// ─── Mock Contact Suggestions ─────────────────────────────────────────────────

export const MOCK_CONTACTS: ContactSuggestion[] = [
  { id: "c1",  name: "Rahul Sharma",   phone: "+91 98765 43210", emoji: "👨" },
  { id: "c2",  name: "Neha Singh",     phone: "+91 87654 32109", emoji: "👩" },
  { id: "c3",  name: "Amit Kumar",     phone: "+91 76543 21098", emoji: "🧑" },
  { id: "c4",  name: "Priya Patel",    phone: "+91 65432 10987", emoji: "👩‍💼" },
  { id: "c5",  name: "Rohan Gupta",    phone: "+91 54321 09876", emoji: "👨‍💻" },
  { id: "c6",  name: "Meera Iyer",     phone: "+91 43210 98765", emoji: "👩‍🎨" },
  { id: "c7",  name: "Arjun Nair",     email: "arjun@example.com", emoji: "🧑‍🚀" },
  { id: "c8",  name: "Sneha Reddy",    email: "sneha@example.com", emoji: "👩‍🏫" },
  { id: "c9",  name: "Vikram Das",     phone: "+91 32109 87654", emoji: "👨‍🍳" },
  { id: "c10", name: "Kavya Menon",    phone: "+91 21098 76543", emoji: "👩‍🔬" },
  { id: "c11", name: "Sanjay Mehta",   email: "sanjay@example.com", emoji: "🧔" },
  { id: "c12", name: "Divya Krishnan", phone: "+91 10987 65432", emoji: "👩" },
]

// ─── Name Placeholder Rotation ────────────────────────────────────────────────

export const NAME_PLACEHOLDERS = [
  "e.g. Goa Trip",
  "e.g. Flat 304",
  "e.g. Office Lunch",
  "e.g. Weekend Dinner",
  "e.g. Europe 2025",
] as const

// ─── Description Placeholder ──────────────────────────────────────────────────

export const DESC_PLACEHOLDER = "e.g. Trip with college friends (optional)"