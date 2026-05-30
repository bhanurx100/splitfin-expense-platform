/**
 * shared/lib/currency.ts
 *
 * Single source of truth for all monetary formatting in the app.
 *
 * Previously duplicated across:
 *   - features/transactions/lib/formatters.ts   (formatINR, formatAbsINR)
 *   - features/splitpay/lib/calculations.ts     (formatINR)
 *   - components/splitpay/ui.tsx                (inr())
 *   - features/dashboard/sections/*             (inline fmt / INR instances)
 *   - lib/utils.ts                              (formatCurrency — USD)
 *   - features/dashboard/sections/dashboard-summary.tsx (inline fmt)
 *   - features/dashboard/sections/dashboard-charts.tsx  (inline fmt / yAxisFmt)
 */

// ── INR formatters ─────────────────────────────────────────────────────────────

const INR_0 = new Intl.NumberFormat("en-IN", {
  style:                 "currency",
  currency:              "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const INR_2 = new Intl.NumberFormat("en-IN", {
  style:                 "currency",
  currency:              "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a number as Indian Rupees.
 * `decimals` defaults to 0; pass 2 for paisa precision.
 * Always formats the absolute value — sign is the caller's responsibility.
 *
 * @example
 *   formatINR(1234.5)   // "₹1,235"
 *   formatINR(1234.5, 2) // "₹1,234.50"
 */
export function formatINR(value: number, decimals: 0 | 2 = 0): string {
  const fmt = decimals === 2 ? INR_2 : INR_0;
  return fmt.format(Math.abs(value));
}

/**
 * Inline rupee helper — matches the `inr()` signature used in splitpay UI.
 * Alias of formatINR kept for a zero-churn migration of splitpay components.
 */
export const inr = formatINR;

/**
 * Compact INR label for tight spaces (chart axes, badges).
 * @example
 *   formatINRCompact(150000) // "₹1.5L"
 *   formatINRCompact(5000)   // "₹5k"
 *   formatINRCompact(500)    // "₹500"
 */
export function formatINRCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 100_000) return `₹${(abs / 100_000).toFixed(1)}L`;
  if (abs >= 1_000)   return `₹${(abs / 1_000).toFixed(0)}k`;
  return `₹${Math.round(abs)}`;
}

/**
 * Y-axis tick formatter for Recharts — same as formatINRCompact.
 * Named separately so chart code is self-documenting.
 */
export const formatChartAxisINR = formatINRCompact;

// ── USD formatter (legacy — used by lib/utils formatCurrency) ──────────────────

const USD = new Intl.NumberFormat("en-US", {
  style:                 "currency",
  currency:              "USD",
  minimumFractionDigits: 2,
});

/**
 * Format a number as US Dollars.
 * Retained for backward-compat with existing transaction/summary components
 * that display USD amounts (convertAmountFromMilliunits path).
 */
export function formatUSD(value: number): string {
  return USD.format(value);
}

// ── Percentage ─────────────────────────────────────────────────────────────────

/**
 * Format a ratio (0–100) as a locale percentage string.
 * Optionally prepend "+" for positive values.
 *
 * @example
 *   formatPercentage(12.5)                   // "13%"
 *   formatPercentage(12.5, { addPrefix: true }) // "+13%"
 *   formatPercentage(-5,  { addPrefix: true })  // "-5%"
 */
export function formatPercentage(
  value: number,
  options: { addPrefix?: boolean } = {},
): string {
  const result = new Intl.NumberFormat("en-US", { style: "percent" }).format(
    value / 100,
  );
  if (options.addPrefix && value > 0) return `+${result}`;
  return result;
}