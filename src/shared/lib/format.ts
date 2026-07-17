/**
 * shared/lib/format.ts
 *
 * Premium UI formatting helpers — the single source for currency display
 * and time-based greetings across all five dashboard pages.
 */

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
