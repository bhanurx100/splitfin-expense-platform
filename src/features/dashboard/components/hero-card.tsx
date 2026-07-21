'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import type { BalanceSummary } from '@/src/types/transaction'
import { Eye, EyeOff, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const HeroBankScene = dynamic(() => import('@/src/shared/three/hero-bank-scene'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-full bg-info/8" aria-hidden="true" />,
})

export function HeroCard({ summary }: { summary: BalanceSummary }) {
  const [hidden, setHidden] = useState(false)
  const router = useRouter()
  const ahead = summary.monthlyChange >= 0

  return (
    <GlassCard
      strong
      interactive
      hoverGlow="cyan"
      radius="2xl"
      padding="lg"
      className="relative min-h-[220px] overflow-hidden"
      onClick={() => router.push('/accounts')}
      role="link"
      aria-label="Total balance — view accounts"
    >
      {/* Dark graphite foundation — subtle teal accent only */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, rgba(14,16,24,0.96) 0%, rgba(10,11,18,0.88) 50%, rgba(8,10,16,0.94) 100%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-700"
        style={{
          background: ahead
            ? 'radial-gradient(ellipse 70% 55% at 88% 42%, oklch(0.55 0.12 195 / 14%), transparent 65%), radial-gradient(ellipse 50% 45% at 8% 92%, oklch(0.55 0.14 165 / 10%), transparent 60%)'
            : 'radial-gradient(ellipse 70% 55% at 88% 42%, oklch(0.55 0.12 195 / 12%), transparent 65%), radial-gradient(ellipse 50% 45% at 8% 92%, oklch(0.55 0.16 350 / 10%), transparent 60%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-12"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06), transparent)' }}
        aria-hidden="true"
      />

      <div className="relative flex min-h-[188px] items-center gap-4">
        {/* Text column — clear vertical hierarchy */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 pr-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium tracking-wide text-muted-foreground">Total Balance</span>
              <button
                type="button"
                aria-label={hidden ? 'Show balance' : 'Hide balance'}
                aria-pressed={hidden}
                onClick={(e) => {
                  e.stopPropagation()
                  setHidden((h) => !h)
                }}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
            <AnimatedAmount
              value={summary.totalBalance}
              currency={summary.currency}
              hidden={hidden}
              className="text-[2rem] font-extrabold leading-none tracking-tight sm:text-[2.125rem]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Net Monthly Growth
            </span>
            <AnimatedAmount
              value={summary.monthlyChange}
              currency={summary.currency}
              signed
              className={`text-lg font-bold leading-tight ${ahead ? 'text-positive' : 'text-negative'}`}
            />
            <p className={`flex items-center gap-1 text-xs font-medium ${ahead ? 'text-positive/85' : 'text-negative/85'}`}>
              {ahead ? (
                <TrendingUp className="size-3 shrink-0" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3 shrink-0" aria-hidden="true" />
              )}
              {Math.abs(summary.monthlyChangePercent)}% vs last month
            </p>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/6 pt-3">
            <p className="text-xs text-muted-foreground">
              Across {summary.accountCount} account{summary.accountCount === 1 ? '' : 's'}
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/90">
              <RefreshCw className="size-3 shrink-0 text-info/70" aria-hidden="true" />
              <span>
                Last synced:{' '}
                <span className="font-medium text-foreground/80">{summary.lastSyncedLabel}</span>
              </span>
            </p>
          </div>
        </div>

        {/* 3D bank — right-middle, breathing room */}
        <div className="relative h-40 w-[7.5rem] shrink-0 self-center sm:h-44 sm:w-[8.5rem]">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-2 h-16 rounded-full blur-2xl"
            style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.18), transparent 70%)' }}
            aria-hidden="true"
          />
          <HeroBankScene />
        </div>
      </div>
    </GlassCard>
  )
}
