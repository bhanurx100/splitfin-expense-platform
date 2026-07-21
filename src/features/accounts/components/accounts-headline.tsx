'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { formatCurrency } from '@/src/shared/lib/format'
import type { BalanceSummary } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { Layers, TrendingDown, TrendingUp } from 'lucide-react'

/**
 * Accounts page hero — premium headline on a seamless black surface.
 * Carousel below stays untouched; this establishes hierarchy above it.
 */
export function AccountsHeadline({ summary }: { summary: BalanceSummary }) {
  const ahead = summary.monthlyChange >= 0

  return (
    <motion.section
      aria-label="Accounts summary"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 26 }}
      className="relative overflow-hidden rounded-[var(--radius)] border border-white/6 bg-background px-5 py-6"
    >
      {/* Subtle edge light — no colored fill, blends with page background */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-5">
        {/* Primary: total balance */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Total Balance
          </p>
          <AnimatedAmount
            value={summary.totalBalance}
            currency={summary.currency}
            className="text-[2rem] font-extrabold leading-none tracking-tight"
          />
          {summary.creditOutstanding > 0 && (
            <p className="text-xs text-muted-foreground">
              after {formatCurrency(summary.creditOutstanding, summary.currency)} card dues
            </p>
          )}
        </div>

        {/* Secondary metrics — aligned row */}
        <div className="grid grid-cols-2 gap-4 border-t border-white/6 pt-4">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              This Month
            </p>
            <p
              className={`flex items-center gap-1.5 text-lg font-extrabold leading-tight ${
                ahead ? 'text-positive' : 'text-negative'
              }`}
            >
              {ahead ? (
                <TrendingUp className="size-4 shrink-0" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-4 shrink-0" aria-hidden="true" />
              )}
              {ahead ? '+' : '−'}
              {formatCurrency(Math.abs(summary.monthlyChange), summary.currency)}
            </p>
            <p className="text-xs text-muted-foreground">{Math.abs(summary.monthlyChangePercent)}% vs last month</p>
          </div>

          <div className="flex flex-col gap-1 border-l border-white/6 pl-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Active
            </p>
            <p className="flex items-center gap-1.5 text-lg font-extrabold leading-tight">
              <Layers className="size-4 shrink-0 text-info" aria-hidden="true" />
              {summary.accountCount}
            </p>
            <p className="text-xs text-muted-foreground">
              account{summary.accountCount === 1 ? '' : 's'} · synced {summary.lastSyncedLabel}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
