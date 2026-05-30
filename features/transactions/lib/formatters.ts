/**
 * features/transactions/lib/formatters.ts
 *
 * Previously owned currency/date implementations.
 * Now re-exports from shared/lib to eliminate duplication.
 *
 * All existing import paths in the transactions feature continue to work
 * without change — this file is a transparent shim.
 */

// ── Re-exports from shared ─────────────────────────────────────────────────────

export {
  formatINR,
  formatINRCompact  as formatChartValue,
  formatINR         as formatAbsINR,
} from "@/shared/lib/currency";

export {
  formatTxDate,
  formatMonthYear,
} from "@/shared/lib/date";

// formatAbsINR alias — kept for callers that used the old name
// (they pass Math.abs() themselves; shared formatINR already does it internally)
export { formatINR as formatAbsoluteINR } from "@/shared/lib/currency";