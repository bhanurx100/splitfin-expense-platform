
// ─── Currency ──────────────────────────────────────────────────────────────────
/**
 * Format a number as Indian Rupees.
 * The real API already converts milliunits → plain decimals, so we only format.
 * Math.abs() ensures no leading minus sign — callers add sign if needed.
 */
export function formatINR(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));
}

// ─── Date ──────────────────────────────────────────────────────────────────────
/**
 * Full date + time label for transaction rows.
 * e.g. "09 May 2025, 02:30 pm"
 */
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

/**
 * Month + year label for dashboard headers.
 * e.g. "May 2025"
 */
export function formatMonthYear(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(d);
}

// ─── Chart Y-axis ──────────────────────────────────────────────────────────────
/**
 * Compact currency label for Recharts Y-axis ticks.
 * e.g. 150000 → "₹1.5L", 5000 → "₹5k", 500 → "₹500"
 */
export function formatChartValue(val: number): string {
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(1)}L`;
  if (val >= 1_000)   return `₹${(val / 1_000).toFixed(0)}k`;
  return `₹${Math.round(val)}`;
}

// ─── Short amount helper ───────────────────────────────────────────────────────
/**
 * Absolute value, formatted as INR — used in transaction feed amounts.
 * Callers prepend "+" or "−" based on sign.
 */
export function formatAbsINR(value: number, decimals = 2): string {
  return formatINR(Math.abs(value), decimals);
}