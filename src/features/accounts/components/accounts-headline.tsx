'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import type { BalanceSummary } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { Layers, TrendingDown, TrendingUp, Wallet } from 'lucide-react'

/**
 * Accounts headline — every figure is derived from the account store and
 * the transaction ledger (same selector as the Overview hero). Nothing
 * on this strip is written by hand.
 */
export function AccountsHeadline({ summary }: { summary: BalanceSummary }) {
  const ahead = summary.monthlyChange >= 0

  return (
    <motion.section
      aria-label="Accounts summary"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 26 }}
    >
      <GlassCard strong className="relative flex items-stretch overflow-hidden p-4">
        {/* Ambient accent — follows the real monthly direction */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: ahead
              ? 'radial-gradient(ellipse 60% 80% at 0% 50%, oklch(0.55 0.14 165 / 12%), transparent)'
              : 'radial-gradient(ellipse 60% 80% at 0% 50%, oklch(0.55 0.16 350 / 12%), transparent)',
          }}
          aria-hidden="true"
        />

        {/* Total balance — the headline number */}
        <div className="relative flex min-w-0 flex-1 items-center gap-3">
          <span className="glow-breathe flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Total Balance
            </p>
            <AnimatedAmount
              value={summary.totalBalance}
              currency={summary.currency}
              className="block truncate text-xl font-extrabold leading-tight tracking-tight"
            />
            {summary.creditOutstanding > 0 && (
              <p className="text-[9px] text-muted-foreground">
                after {formatCurrency(summary.creditOutstanding, summary.currency)} card dues
              </p>
            )}
          </div>
        </div>

        <span className="mx-3 w-px shrink-0 self-stretch bg-white/8" aria-hidden="true" />

        {/* Monthly change */}
        <div className="relative flex shrink-0 flex-col justify-center gap-0.5">
          <p className="text-[9px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            This Month
          </p>
          <p
            className={`flex items-center gap-1 text-sm font-extrabold leading-tight ${
              ahead ? 'text-positive' : 'text-negative'
            }`}
          >
            {ahead ? (
              <TrendingUp className="size-3.5" aria-hidden="true" />
            ) : (
              <TrendingDown className="size-3.5" aria-hidden="true" />
            )}
            {ahead ? '+' : '−'}
            {formatCurrency(Math.abs(summary.monthlyChange), summary.currency)}
          </p>
          <p className="text-[9px] text-muted-foreground">{Math.abs(summary.monthlyChangePercent)}%</p>
        </div>

        <span className="mx-3 w-px shrink-0 self-stretch bg-white/8" aria-hidden="true" />

        {/* Active accounts */}
        <div className="relative flex shrink-0 flex-col items-end justify-center gap-0.5">
          <p className="text-[9px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Active
          </p>
          <p className="flex items-center gap-1 text-sm font-extrabold leading-tight">
            <Layers className="size-3.5 text-primary" aria-hidden="true" />
            {summary.accountCount}
          </p>
          <p className="text-[9px] text-muted-foreground">accounts</p>
        </div>
      </GlassCard>
    </motion.section>
  )
}
