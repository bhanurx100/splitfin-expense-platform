'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import type { BalanceSummary } from '@/src/types/transaction'
import { Eye, EyeOff, MoreHorizontal, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const HeroBankScene = dynamic(() => import('@/src/shared/three/hero-bank-scene'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-full bg-primary/8" aria-hidden="true" />,
})

export function HeroCard({ summary }: { summary: BalanceSummary }) {
  const [hidden, setHidden] = useState(false)
  const router = useRouter()

  return (
    <GlassCard
      strong
      interactive
      hoverGlow="purple"
      className="relative overflow-hidden p-6"
      onClick={() => router.push('/accounts')}
      role="link"
      aria-label="Total balance — view accounts"
    >
      {/* Ambient nebula behind the bank */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 72% 64% at 78% 38%, oklch(0.45 0.18 285 / 30%), transparent)',
        }}
        aria-hidden="true"
      />
      {/* Breathing ground-glow under the 3D bank */}
      <div
        className="glow-breathe pointer-events-none absolute right-2 bottom-6 h-24 w-44 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(ellipse, rgba(124,60,255,0.38), transparent 70%)' }}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total Balance</span>
            <button
              type="button"
              aria-label={hidden ? 'Show balance' : 'Hide balance'}
              aria-pressed={hidden}
              onClick={(e) => {
                e.stopPropagation()
                setHidden((h) => !h)
              }}
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
            <span className="size-1.5 animate-pulse rounded-full bg-positive" aria-hidden="true" />
            Across {summary.accountCount} accounts
          </p>
        </div>
        <div className="relative -mr-2 -mb-4 h-52 w-40 shrink-0 self-end sm:w-48">
          <HeroBankScene />
        </div>
      </div>
      <button
        type="button"
        aria-label="Balance options"
        onClick={(e) => e.stopPropagation()}
        className="glass absolute top-4 right-4 flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <MoreHorizontal className="size-4" />
      </button>
    </GlassCard>
  )
}
