/**
 * shared/lib/date.ts
 *
 * Single source of truth for all date formatting in the app.
 *
 * Previously duplicated across:
 *   - features/transactions/lib/formatters.ts  (formatTxDate, formatMonthYear)
 *   - features/transactions/lib/filters.ts     (fmtDate)
 *   - lib/utils.ts                             (formatDateRange)
 */

import { format, subDays } from "date-fns";

// ── Display formatters ─────────────────────────────────────────────────────────

/**
 * Short date label used in mobile transaction feed group headers.
 * @example  "09 May 2025"
 */
export function formatShortDate(raw: string | Date): string {
  const d = typeof raw === "string" ? new Date(raw) : raw;
  return format(d, "dd MMM yyyy");
}

/**
 * Full date + time label for transaction row details.
 * @example  "09 May 2025, 02:30 pm"
 */
export function formatTxDate(raw: string | Date): string {
  const d = typeof raw === "string" ? new Date(raw) : raw;
  return new Intl.DateTimeFormat("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Month + year label for dashboard period headers.
 * @example  "May 2025"
 */
export function formatMonthYear(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year:  "numeric",
  }).format(d);
}

/**
 * Human-readable date range label used in filters and data cards.
 * Falls back to the last 30 days when no period is supplied.
 *
 * @example  "Apr 01 - Apr 30, 2025"
 */
type Period = {
  from: string | Date | undefined;
  to:   string | Date | undefined;
};

export function formatDateRange(period?: Period): string {
  const defaultTo   = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  if (!period?.from) {
    return `${format(defaultFrom, "LLL dd")} - ${format(defaultTo, "LLL dd, y")}`;
  }
  if (period?.to) {
    return `${format(period.from, "LLL dd")} - ${format(period.to, "LLL dd, y")}`;
  }
  return format(period.from, "LLL dd, y");
}