'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { CategoryIcon } from '@/src/shared/components/category-icon'
import { DonutChart } from '@/src/shared/components/donut-chart'
import { SpectralRibbon } from '@/src/shared/components/spectral-ribbon'
import { formatCurrency } from '@/src/shared/lib/format'
import type { CategorySummary, Currency } from '@/src/types/transaction'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const CategoryRingScene = dynamic(() => import('@/src/shared/three/category-ring-scene'), {
  ssr: false,
  loading: () => null,
})

interface SpendHeroProps {
  categories: CategorySummary[]
  totalSpent: number
  changePercent: number
  month: string
  currency: Currency
}

export function SpendHero({ categories, totalSpent, changePercent, month, currency }: SpendHeroProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [webglFailed, setWebglFailed] = useState(false)
  const reduced = useReducedMotion()
  const selected = categories.find((c) => c.id === selectedId)
  const top = categories[0]
  const focus = selected ?? top

  return (
    <section
      className="edge-light relative overflow-hidden rounded-[28px]"
      style={{
        background:
          'linear-gradient(170deg, rgba(24, 22, 52, 0.85), rgba(10, 12, 27, 0.92) 55%, rgba(8, 9, 22, 0.96))',
      }}
      aria-label="Total spending summary"
    >
      {/* LAYER 5 — ambient haze behind the ring composition */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/4 -right-1/4 size-[80%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(124,60,255,0.2), transparent 65%)',
          filter: 'blur(20px)',
        }}
      />

      <div className="relative flex items-start justify-between gap-3 p-5 pb-0">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <AnimatedAmount
            value={totalSpent}
            currency={currency}
            className="mt-1 block text-[32px] font-extrabold tracking-tight"
          />
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-positive">
            <TrendingUp className="size-3.5" aria-hidden="true" />
            {changePercent}% vs last month
          </p>
        </div>
        <button
          type="button"
          className="glass flex min-h-11 shrink-0 items-center gap-1.5 rounded-2xl px-3.5 text-sm font-medium text-foreground/90 focus-visible:outline-2 focus-visible:outline-ring"
        >
          {month}
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </div>

      {/* Composition row: ribbon flows behind the dominant 3D ring */}
      <div className="relative mt-1 h-56">
        <SpectralRibbon className="absolute top-1/2 left-0 h-32 w-full -translate-y-1/2 opacity-80" />

        <div className="absolute top-0 right-1 h-56 w-[58%] min-w-56">
          {!webglFailed ? (
            <>
              <CategoryRingScene
                segments={categories.map((c) => ({
                  id: c.id,
                  percent: c.percent,
                  color: c.color,
                  label: c.name,
                }))}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
                reducedMotion={!!reduced}
              />
              {/* Central cavity label + contact shadow */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {categories.length}
                </span>
                <span className="text-xs text-muted-foreground">Categories</span>
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1 left-1/2 h-4 w-3/5 -translate-x-1/2 rounded-full"
                style={{
                  background: 'radial-gradient(ellipse, rgba(124,60,255,0.35), transparent 70%)',
                  filter: 'blur(6px)',
                }}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <DonutChart
                segments={categories.map((c) => ({ id: c.id, percent: c.percent, color: c.color, label: c.name }))}
                size={180}
                strokeWidth={22}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
                label={`Spending split across ${categories.length} categories`}
              >
                <span className="text-3xl font-extrabold tabular-nums">{categories.length}</span>
                <span className="mt-0.5 text-xs text-muted-foreground">Categories</span>
              </DonutChart>
            </div>
          )}
        </div>

        {/* Screen-reader equivalent of the visual ring */}
        <ul className="sr-only">
          {categories.map((c) => (
            <li key={c.id}>
              {c.name}: {formatCurrency(c.amount, currency)}, {c.percent}% of total
            </li>
          ))}
        </ul>
      </div>

      {/* Top Category glass panel — embedded, overlapping the lower hero */}
      <div className="relative px-4 pb-4">
        <motion.div
          key={focus.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="edge-light relative -mt-3 flex items-center gap-3.5 overflow-hidden rounded-2xl p-3.5"
          style={{
            background: 'rgba(18, 20, 39, 0.78)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* LAYER 2 — localized category-colored inner glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 45% 120% at 8% 50%, color-mix(in srgb, ${focus.color} 18%, transparent), transparent 70%)`,
            }}
          />
          <span
            className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(150deg, color-mix(in srgb, ${focus.color} 32%, transparent), color-mix(in srgb, ${focus.color} 10%, transparent))`,
              boxShadow: `inset 0 1px 0 color-mix(in srgb, ${focus.color} 45%, transparent), 0 0 14px color-mix(in srgb, ${focus.color} 25%, transparent)`,
              color: focus.color,
            }}
          >
            <CategoryIcon name={focus.icon} className="size-5" />
          </span>
          <div className="relative min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{selected ? 'Selected Category' : 'Top Category'}</p>
            <p className="truncate text-base font-bold">{focus.name}</p>
          </div>
          <div className="relative text-right">
            <p className="text-base font-bold tabular-nums">{formatCurrency(focus.amount, currency)}</p>
            <p className="text-xs font-medium" style={{ color: focus.color }}>
              {focus.percent}% of total
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
