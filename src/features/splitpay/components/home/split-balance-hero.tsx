'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import type { SplitPaySummary } from '@/src/types/transaction'
import { ArrowDownLeft, ArrowLeftRight, Wallet } from 'lucide-react'

export function SplitBalanceHero({ summary }: { summary: SplitPaySummary }) {
  return (
    <GlassCard strong className="grid grid-cols-3 gap-2 p-5">
      <div className="flex flex-col items-start gap-1.5">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">You owe</p>
          <span className="flex size-7 items-center justify-center rounded-lg bg-negative/15 text-negative">
            <ArrowLeftRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
        <AnimatedAmount
          value={summary.youOwe}
          currency={summary.currency}
          className="text-xl font-extrabold text-negative"
        />
        <p className="text-[11px] text-muted-foreground">Across {summary.oweGroups} groups</p>
      </div>

      <div className="flex flex-col items-center gap-1.5 border-x border-border px-2 text-center">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">Net Balance</p>
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Wallet className="size-3.5" aria-hidden="true" />
          </span>
        </div>
        <AnimatedAmount
          value={summary.netBalance}
          currency={summary.currency}
          signed
          className="text-xl font-extrabold text-primary"
        />
        <p className="text-[11px] text-muted-foreground">
          {summary.netBalance < 0 ? 'You need to settle up' : 'You are ahead'}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 text-right">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">You&apos;re owed</p>
          <span className="flex size-7 items-center justify-center rounded-lg bg-positive/15 text-positive">
            <ArrowDownLeft className="size-3.5" aria-hidden="true" />
          </span>
        </div>
        <AnimatedAmount
          value={summary.youAreOwed}
          currency={summary.currency}
          className="text-xl font-extrabold text-positive"
        />
        <p className="text-[11px] text-muted-foreground">From {summary.owedGroups} groups</p>
      </div>
    </GlassCard>
  )
}
