'use client'

import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import type { Currency } from '@/src/types/transaction'
import { ChevronRight, PiggyBank } from 'lucide-react'

interface SpendingInsightProps {
  savedAmount: number
  comparedCategory: string
  currency: Currency
}

export function SpendingInsight({ savedAmount, comparedCategory, currency }: SpendingInsightProps) {
  return (
    <GlassCard strong interactive className="flex items-center gap-4 p-4">
      <span className="glow-breathe flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <PiggyBank className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Spending Insight</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
          You spent{' '}
          <span className="font-semibold text-positive">
            {formatCurrency(savedAmount, currency)}
          </span>{' '}
          less on {comparedCategory} compared to last month.
        </p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </GlassCard>
  )
}
