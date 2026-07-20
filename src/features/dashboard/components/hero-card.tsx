'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import type { BalanceSummary } from '@/src/types/transaction'
import { Eye, EyeOff, TrendingDown, TrendingUp } from 'lucide-react'
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

  // The environment reacts to real data — the ambient light inside the
  // card follows this month's actual direction.
  const ahead = summary.monthlyChange >= 0
  const ambient = ahead ? 'oklch(0.55 0.14 165 / 20%)' : 'oklch(0.55 0.16 350 / 20%)'
  const ambientAlt = ahead ? 'oklch(0.45 0.12 195 / 14%)' : 'oklch(0.45 0.12 30 / 14%)'

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
      {/* Graphite / dark-navy foundation — purple is an accent, not a background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(16,18,28,0.9) 0%, rgba(12,13,22,0.4) 55%, rgba(10,11,18,0.85) 100%)',
        }}
        aria-hidden="true"
      />
      {/* Data-reactive atmosphere — tint follows the real monthly change */}
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-700"
        style={{
          background: `radial-gradient(ellipse 85% 65% at 80% 32%, ${ambient}, transparent 62%), radial-gradient(ellipse 55% 50% at 6% 96%, ${ambientAlt}, transparent 60%)`,
        }}
        aria-hidden="true"
      />
      {/* Starfield shimmer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle 1px at 18% 26%, rgba(255,255,255,0.45) 50%, transparent 51%), radial-gradient(circle 1px at 42% 12%, rgba(255,255,255,0.3) 50%, transparent 51%), radial-gradient(circle 1.5px at 64% 44%, rgba(200,180,255,0.4) 50%, transparent 51%), radial-gradient(circle 1px at 88% 66%, rgba(255,255,255,0.28) 50%, transparent 51%), radial-gradient(circle 1px at 30% 70%, rgba(200,180,255,0.26) 50%, transparent 51%)',
        }}
        aria-hidden="true"
      />
      {/* Top edge light */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-14"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.09), transparent)' }}
        aria-hidden="true"
      />
      {/* Breathing ground-glow under the 3D bank (brand accent) */}
      <div
        className="glow-breathe pointer-events-none absolute right-2 bottom-6 h-24 w-44 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(ellipse, rgba(124,60,255,0.36), transparent 70%)' }}
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
          {/* Net Growth — real change vs last month, direction-aware */}
          <p className="mt-0.5 flex items-center gap-2">
            <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Net Growth
            </span>
            <span
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                ahead
                  ? 'border-positive/25 bg-positive/12 text-positive'
                  : 'border-negative/25 bg-negative/12 text-negative'
              }`}
            >
              {ahead ? (
                <TrendingUp className="size-3" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3" aria-hidden="true" />
              )}
              {ahead ? '+' : '−'}
              {formatCurrency(Math.abs(summary.monthlyChange), summary.currency)} ·{' '}
              {Math.abs(summary.monthlyChangePercent)}%
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex size-1.5" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-positive opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-positive" />
            </span>
            Across {summary.accountCount} accounts
          </p>
        </div>
        <div className="relative -mr-2 -mb-4 h-52 w-40 shrink-0 self-end sm:w-48">
          <HeroBankScene />
        </div>
      </div>
    </GlassCard>
  )
}
