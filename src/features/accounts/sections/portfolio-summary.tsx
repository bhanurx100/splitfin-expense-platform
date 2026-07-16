'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { formatCurrency } from '@/src/shared/lib/format'
import type { PortfolioSummary } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { ChevronRight, TrendingUp } from 'lucide-react'
import { useId } from 'react'

function Sparkline({ points }: { points: number[] }) {
  const gradientId = useId()
  const max = Math.max(...points)
  const w = 200
  const h = 56
  const step = w / (points.length - 1)
  const coords = points.map((p, i) => `${i * step},${h - (p / max) * (h - 6) - 3}`)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${coords.join(' ')} ${w},${h}`} fill={`url(#${gradientId})`} />
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PortfolioSummarySection({ portfolio }: { portfolio: PortfolioSummary }) {
  return (
    <section aria-label="Portfolio summary" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Portfolio Summary</h2>
        <button
          type="button"
          className="flex min-h-11 items-center gap-1 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          View All
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        className="glass grid grid-cols-[1.5fr_1fr] gap-4 rounded-xl p-5"
      >
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Total Investment Value</p>
          <AnimatedAmount
            value={portfolio.totalValue}
            currency={portfolio.currency}
            className="text-2xl font-extrabold tracking-tight"
          />
          <Sparkline points={portfolio.sparkline} />
          <p className="text-xs text-muted-foreground">
            Today&apos;s Change{' '}
            <span className="font-semibold text-positive">
              +{formatCurrency(portfolio.todaysChange, portfolio.currency)} ({portfolio.todaysChangePercent}%)
            </span>
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 border-l border-border pl-4">
          <div>
            <p className="text-xs text-muted-foreground">Holdings</p>
            <p className="text-xl font-extrabold">{portfolio.holdings}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Gain</p>
            <p className="flex items-center gap-1 text-sm font-bold text-positive">
              <TrendingUp className="size-3.5" aria-hidden="true" />
              +{formatCurrency(portfolio.totalGain, portfolio.currency)}
            </p>
            <p className="text-xs font-semibold text-positive">({portfolio.totalGainPercent}%)</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
