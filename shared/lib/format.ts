/**
 * shared/lib/format.ts
 *
 * Convenience barrel — re-exports all shared formatting utilities.
 * Import from here when you need both currency and date in the same file.
 *
 * @example
 *   import { formatINR, formatMonthYear } from "@/shared/lib/format"
 */

export {
  formatINR,
  formatINRCompact,
  formatChartAxisINR,
  formatUSD,
  formatPercentage,
  inr,
} from "./currency";

export {
  formatShortDate,
  formatTxDate,
  formatMonthYear,
  formatDateRange,
} from "./date";