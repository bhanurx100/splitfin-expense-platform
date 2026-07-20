'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import { MicroBars } from '@/src/shared/components/micro-bars'
import { ProgressRing } from '@/src/shared/components/progress-ring'
import { springs } from '@/src/shared/lib/motion'
import type { CashFlowPoint, TransactionSummary } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useMemo } from 'react'

/**
 * One premium summary row — Income / Expense / Net Flow share a single
 * balanced row. Numbers are the hero; the mini bars are the REAL monthly
 * cash-flow series (same data as the Overview chart), never fake filler.
 */
export function FlowSummary({
  summary,
  flow,
}: {
  summary: TransactionSummary
  flow: CashFlowPoint[]
}) {
  const netPercent =
    summary.income > 0 ? Math.max(0, Math.min(100, (summary.netFlow / summary.income) * 100)) : 0

  // Real monthly series from the shared cash-flow data.
  const incomeBars = useMemo(() => flow.map((p) => p.inflow), [flow])
  const expenseBars = useMemo(() => flow.map((p) => p.outflow), [flow])

  return (
    <section aria-label="Monthly flow summary" className="grid grid-cols-3 gap-2.5">
      {/* Income */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.soft, delay: 0.05 }}
      >
        <GlassCard interactive hoverGlow="cyan" className="flex h-full flex-col p-3.5">
          <div className="flex items-center gap-1.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-positive/15 text-positive">
              <ArrowDownLeft className="size-3.5" aria-hidden="true" />
            </span>
            <p className="text-xs font-semibold text-muted-foreground">Income</p>
          </div>
          <AnimatedAmount
            value={summary.income}
            currency={summary.currency}
            className="mt-2 block text-lg font-extrabold leading-tight text-positive"
          />
          <p
            className={`mt-0.5 text-[10px] font-medium ${
              summary.incomeChangePercent >= 0 ? 'text-positive/80' : 'text-negative/80'
            }`}
          >
            {summary.incomeChangePercent >= 0 ? '↑' : '↓'} {Math.abs(summary.incomeChangePercent)}%
            vs last month
          </p>
          <MicroBars values={incomeBars} color="var(--positive)" className="mt-auto pt-2" />
        </GlassCard>
      </motion.div>

      {/* Expense */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.soft, delay: 0.12 }}
      >
        <GlassCard interactive hoverGlow="pink" className="flex h-full flex-col p-3.5">
          <div className="flex items-center gap-1.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-negative/15 text-negative">
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </span>
            <p className="text-xs font-semibold text-muted-foreground">Expense</p>
          </div>
          <AnimatedAmount
            value={summary.expense}
            currency={summary.currency}
            className="mt-2 block text-lg font-extrabold leading-tight text-negative"
          />
          {/* Spending less than last month is good news — tone follows semantics */}
          <p
            className={`mt-0.5 text-[10px] font-medium ${
              summary.expenseChangePercent > 0 ? 'text-negative/80' : 'text-positive/80'
            }`}
          >
            {summary.expenseChangePercent >= 0 ? '↑' : '↓'} {Math.abs(summary.expenseChangePercent)}%
            vs last month
          </p>
          <MicroBars values={expenseBars} color="var(--negative)" className="mt-auto pt-2" />
        </GlassCard>
      </motion.div>

      {/* Net Flow — ring matches the visual height of its siblings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.soft, delay: 0.19 }}
      >
        <GlassCard strong interactive hoverGlow="purple" className="flex h-full flex-col items-center justify-between p-3.5 text-center">
          <p className="text-xs font-semibold text-muted-foreground">Net Flow</p>
          <ProgressRing
            percent={netPercent}
            size={62}
            strokeWidth={7}
            color="var(--primary)"
            glow
            label={`You kept ${Math.round(netPercent)}% of income`}
          >
            <span className="text-xs font-bold tabular-nums text-primary">{Math.round(netPercent)}%</span>
          </ProgressRing>
          <AnimatedAmount
            value={summary.netFlow}
            currency={summary.currency}
            signed
            className="block text-sm font-extrabold leading-tight"
          />
        </GlassCard>
      </motion.div>
    </section>
  )
}
