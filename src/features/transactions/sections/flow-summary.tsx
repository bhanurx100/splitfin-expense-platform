'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import { MicroBars } from '@/src/shared/components/micro-bars'
import { ProgressRing } from '@/src/shared/components/progress-ring'
import type { TransactionSummary } from '@/src/types/transaction'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

export function FlowSummary({ summary }: { summary: TransactionSummary }) {
  const netPercent = summary.income > 0 ? (summary.netFlow / summary.income) * 100 : 0

  return (
    <section aria-label="Monthly flow summary" className="grid grid-cols-2 gap-3">
      <GlassCard className="col-span-1 p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-positive/15 text-positive">
            <ArrowDownLeft className="size-4" aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold">Income</p>
        </div>
        <AnimatedAmount
          value={summary.income}
          currency={summary.currency}
          className="mt-2.5 block text-xl font-extrabold text-positive"
        />
        <p className="mt-1 text-xs font-medium text-positive/90">
          ↑ {summary.incomeChangePercent}% vs last month
        </p>
        <MicroBars values={summary.incomeBars} color="var(--positive)" className="mt-3" />
      </GlassCard>

      <GlassCard className="col-span-1 p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-negative/15 text-negative">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold">Expense</p>
        </div>
        <AnimatedAmount
          value={summary.expense}
          currency={summary.currency}
          className="mt-2.5 block text-xl font-extrabold text-negative"
        />
        <p className="mt-1 text-xs font-medium text-negative/90">
          ↑ {summary.expenseChangePercent}% vs last month
        </p>
        <MicroBars values={summary.expenseBars} color="var(--negative)" className="mt-3" />
      </GlassCard>

      <GlassCard strong className="col-span-2 flex items-center justify-between gap-4 p-4">
        <div>
          <p className="text-sm text-muted-foreground">Net Flow</p>
          <AnimatedAmount
            value={summary.netFlow}
            currency={summary.currency}
            className="mt-1 block text-2xl font-extrabold"
          />
          <p className="mt-1 text-xs text-muted-foreground">This month</p>
        </div>
        <ProgressRing
          percent={netPercent}
          size={88}
          strokeWidth={9}
          color="var(--primary)"
          label={`You kept ${Math.round(netPercent)}% of income`}
        >
          <span className="text-sm font-bold tabular-nums text-primary">{Math.round(netPercent)}%</span>
        </ProgressRing>
      </GlassCard>
    </section>
  )
}
