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

import type { Currency } from '@/src/types/transaction'

const symbols: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
}

export function formatCurrency(
  amount: number,
  currency: Currency = 'INR',
  options?: { signed?: boolean },
): string {
  const abs = Math.abs(amount)
  const formatted = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(abs)
  const sign = options?.signed ? (amount >= 0 ? '+' : '-') : amount < 0 ? '-' : ''
  return `${sign}${symbols[currency]}${formatted}`
}

export function getTimeGreeting(date: Date = new Date()): string {
  const h = date.getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
