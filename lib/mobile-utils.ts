// lib/mobile-utils.ts
// Single source of truth for formatting across all mobile components.

// ─── Currency ─────────────────────────────────────────────────────────────────
// The real API already converts milliunits → plain decimals, so we only format.
export function formatINR(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));
}

// ─── Date ─────────────────────────────────────────────────────────────────────
export function formatTxDate(raw: string | Date): string {
  const d = typeof raw === "string" ? new Date(raw) : raw;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatMonthYear(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(d);
}

// ─── Chart Y-axis label ───────────────────────────────────────────────────────
export function formatChartValue(val: number): string {
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(1)}L`;
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(0)}k`;
  return `₹${Math.round(val)}`;
}

// ─── Category colour (deterministic by slot index) ────────────────────────────
const PALETTE = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#8B5CF6", // purple
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#6366F1", // indigo
] as const;

export function categoryColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

// ─── Category icon ────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, string> = {
  "food": "🍔",
  "food & drink": "🍔",
  "groceries": "🛒",
  "shopping": "🛍️",
  "transport": "🚗",
  "transportation": "🚗",
  "travel": "✈️",
  "trips": "✈️",
  "home": "🏠",
  "rent": "🏘️",
  "utilities": "⚡",
  "health": "💊",
  "healthcare": "💊",
  "salary": "💼",
  "freelance": "💻",
  "entertainment": "🎬",
  "education": "📚",
  "fitness": "🏋️",
  "clothing": "👕",
  "subscriptions": "🔔",
  "investments": "📈",
  "savings": "🏦",
  "other": "💰",
  "uncategorized": "❓",
};

export function categoryIcon(name: string): string {
  return ICON_MAP[name.toLowerCase()] ?? "💰";
}