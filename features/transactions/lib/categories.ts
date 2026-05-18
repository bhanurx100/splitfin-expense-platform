
// ─── Color palette ─────────────────────────────────────────────────────────────
/**
 * 10-color palette; index wraps with modulo so it works for any number of categories.
 * Ordered to maximize visual contrast between adjacent categories.
 */
const PALETTE = [
  "#3B82F6", // blue-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EC4899", // pink-500
  "#06B6D4", // cyan-500
  "#84CC16", // lime-500
  "#F97316", // orange-500
  "#6366F1", // indigo-500
] as const;

/**
 * Returns a hex color for a given index (wraps around).
 * Use the slot index, not a hash, to keep colors stable across renders.
 */
export function categoryColor(index: number): string {
  return PALETTE[((index % PALETTE.length) + PALETTE.length) % PALETTE.length];
}

// ─── Icon map ──────────────────────────────────────────────────────────────────
/**
 * Lowercase category name → emoji icon.
 * Fallback: "💰" for unknown categories.
 */
const ICON_MAP: Record<string, string> = {
  "food":             "🍔",
  "food & drink":     "🍔",
  "groceries":        "🛒",
  "shopping":         "🛍️",
  "transport":        "🚗",
  "transportation":   "🚗",
  "travel":           "✈️",
  "trips":            "✈️",
  "home":             "🏠",
  "rent":             "🏘️",
  "utilities":        "⚡",
  "health":           "💊",
  "healthcare":       "💊",
  "salary":           "💼",
  "freelance":        "💻",
  "entertainment":    "🎬",
  "education":        "📚",
  "fitness":          "🏋️",
  "clothing":         "👕",
  "subscriptions":    "🔔",
  "investments":      "📈",
  "savings":          "🏦",
  "other":            "💰",
  "uncategorized":    "❓",
};

/**
 * Returns an emoji for a category name (case-insensitive).
 * Falls back to "💰" for unmapped categories.
 */
export function categoryIcon(name: string): string {
  return ICON_MAP[name.toLowerCase()] ?? "💰";
}

// ─── Re-export palette for external use ───────────────────────────────────────
export { PALETTE as CATEGORY_PALETTE };