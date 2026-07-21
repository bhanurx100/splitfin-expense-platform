'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import { springs } from '@/src/shared/lib/motion'
import type { CashFlowPoint, TransactionSummary } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react'

/**
 * Transactions page hero — Net Flow is the primary KPI.
 * Income and expense support it; no decorative charts or progress rings.
 */
export function FlowSummary({
  summary,
}: {
  summary: TransactionSummary
  flow?: CashFlowPoint[]
}) {
  const netPositive = summary.netFlow >= 0
  const retentionPercent =
    summary.income > 0 ? Math.round((summary.netFlow / summary.income) * 100) : 0

  return (
    <motion.section
      aria-label="Monthly transaction summary"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.soft}
    >
      <GlassCard
        strong
        radius="2xl"
        padding="lg"
        className="relative overflow-hidden"
        style={{ borderColor: 'var(--border)', boxShadow: '0 0 20px color-mix(in srgb, var(--positive) 12%, transparent)' }}
      >

        <p className="mb-5 text-xs font-medium tracking-wide text-muted-foreground">Monthly activity</p>

        {/* Primary KPI — Net Flow */}
        <div className="mb-5 flex flex-col items-center gap-1 text-center">
          <span className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Net Flow
          </span>
          <AnimatedAmount
            value={summary.netFlow}
            currency={summary.currency}
            signed
            className={`text-[1.75rem] font-extrabold leading-none tracking-tight sm:text-[2rem] ${netPositive ? 'text-positive' : 'text-negative'
              }`}
          />
          {summary.income > 0 && (
            <p className="text-xs text-muted-foreground">
              {retentionPercent >= 0 ? `${retentionPercent}% of income retained` : 'Expenses exceed income'}
            </p>
          )}
        </div>

        {/* Supporting metrics */}
        <div className="grid grid-cols-2 gap-3 border-t border-white/8 pt-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-positive/30 text-positive">
                <ArrowDownLeft className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">Income</span>
            </div>
            <AnimatedAmount
              value={summary.income}
              currency={summary.currency}
              className="truncate text-base font-bold leading-tight text-positive sm:text-lg"
            />
            <p
              className={`text-[10px] font-medium ${summary.incomeChangePercent >= 0 ? 'text-positive/75' : 'text-negative/75'
                }`}
            >
              {summary.incomeChangePercent >= 0 ? '↑' : '↓'} {Math.abs(summary.incomeChangePercent)}% vs last month
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5 border-l border-white/8 pl-3">
            <div className="flex items-center gap-1.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-negative/30 text-negative">
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">Expense</span>
            </div>
            <AnimatedAmount
              value={summary.expense}
              currency={summary.currency}
              className="truncate text-base font-bold leading-tight text-negative sm:text-lg"
            />
            <p
              className={`text-[10px] font-medium ${summary.expenseChangePercent > 0 ? 'text-negative/75' : 'text-positive/75'
                }`}
            >
              {summary.expenseChangePercent >= 0 ? '↑' : '↓'} {Math.abs(summary.expenseChangePercent)}% vs last month
            </p>
          </div>
        </div>

        {/* Activity footer — ties hero to the timeline below */}
        <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-white/6 pt-3 text-[11px] text-muted-foreground">
          <Receipt className="size-3.5 shrink-0" aria-hidden="true" />
          <span>
            {summary.transactionCount} transaction{summary.transactionCount === 1 ? '' : 's'} this month
            <span className="mx-1.5 text-foreground/20">·</span>
            {summary.incomeTransactionCount} in · {summary.expenseTransactionCount} out
          </span>
        </div>
      </GlassCard>
    </motion.section>
  )
}
