'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import type { BalanceSummary } from '@/src/types/transaction'
import { formatCurrency } from '@/src/shared/lib/format'
import { Eye, EyeOff, MoreHorizontal, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const HeroBankScene = dynamic(() => import('@/src/shared/three/hero-bank-scene'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-xl bg-primary/5" aria-hidden="true" />,
})

export function HeroCard({ summary }: { summary: BalanceSummary }) {
  const [hidden, setHidden] = useState(false)

  return (
    <GlassCard strong className="relative overflow-hidden p-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 80% 40%, oklch(0.45 0.18 285 / 25%), transparent)',
        }}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total Balance</span>
            <button
              type="button"
              aria-label={hidden ? 'Show balance' : 'Hide balance'}
              aria-pressed={hidden}
              onClick={() => setHidden((h) => !h)}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <AnimatedAmount
            value={summary.totalBalance}
            currency={summary.currency}
            hidden={hidden}
            className="text-4xl font-extrabold tracking-tight"
          />
          <p className="flex items-center gap-1.5 text-sm">
            <TrendingUp className="size-4 text-positive" aria-hidden="true" />
            <span className="font-semibold text-positive">
              {formatCurrency(summary.monthlyChange, summary.currency)} ({summary.monthlyChangePercent}%)
            </span>
            <span className="text-muted-foreground">this month</span>
          </p>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-positive" aria-hidden="true" />
            Across {summary.accountCount} accounts
          </p>
        </div>
        <div className="relative h-44 w-36 shrink-0 sm:w-44">
          <HeroBankScene />
        </div>
      </div>
      <button
        type="button"
        aria-label="Balance options"
        className="glass absolute top-4 right-4 flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <MoreHorizontal className="size-4" />
      </button>
    </GlassCard>
  )
}
