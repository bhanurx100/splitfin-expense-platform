'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { CategoryIcon } from '@/src/shared/components/category-icon'
import { DonutChart } from '@/src/shared/components/donut-chart'
import { SpectralRibbon } from '@/src/shared/components/spectral-ribbon'
import { withCategoryPalette } from '@/src/shared/lib/category-colors'
import { formatCurrency } from '@/src/shared/lib/format'
//import { springs } from '@/src/shared/lib/motion'
import { cn } from '@/src/lib/utils'
import type { CategorySummary, Currency } from '@/src/types/transaction'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'

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
  /** Deep-linked selection (e.g. from Overview → /categories?category=id). */
  initialSelectedId?: string | null
  /** Month navigation — every month with activity is explorable. */
  canPrevMonth?: boolean
  canNextMonth?: boolean
  onPrevMonth?: () => void
  onNextMonth?: () => void
}

export function SpendHero({
  categories: rawCategories,
  totalSpent,
  changePercent,
  month,
  currency,
  initialSelectedId = null,
  canPrevMonth = false,
  canNextMonth = false,
  onPrevMonth,
  onNextMonth,
}: SpendHeroProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId)
  const [webglFailed, setWebglFailed] = useState(false)
  const reduced = useReducedMotion()

  // Palette colors by spend rank — data stays content-only; categories
  // added or removed later are colored automatically.
  const categories = useMemo(
    () => withCategoryPalette([...rawCategories].sort((a, b) => b.amount - a.amount)),
    [rawCategories],
  )

  useEffect(() => {
    if (initialSelectedId && categories.some((c) => c.id === initialSelectedId)) {
      setSelectedId(initialSelectedId)
    }
  }, [initialSelectedId, categories])

  const selected = categories.find((c) => c.id === selectedId)
  const top = categories[0]
  const focus = selected ?? top
  const legend = categories.slice(0, 4)

  return (
    <section
      className="edge-light relative overflow-hidden rounded-[28px] border border-white/8 bg-transparent"
      style={{ boxShadow: '0 0 20px rgba(255,170,43,0.08)' }}
      aria-label="Total spending summary"
    >

      <div className="relative flex items-start justify-between gap-3 p-5 pb-0">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <AnimatedAmount
            key={month}
            value={totalSpent}
            currency={currency}
            className="mt-1 block text-[32px] font-extrabold tracking-tight"
          />
          {/* Spending less than the comparison window is good news */}
          <p
            className={cn(
              'mt-1.5 flex items-center gap-1 text-xs font-medium',
              changePercent > 0 ? 'text-negative' : 'text-positive',
            )}
          >
            {changePercent > 0 ? (
              <TrendingUp className="size-3.5" aria-hidden="true" />
            ) : (
              <TrendingDown className="size-3.5" aria-hidden="true" />
            )}
            {Math.abs(changePercent)}% vs last month
          </p>
        </div>
        {/* Month switcher — every month with activity is explorable */}
        <div className="glass flex shrink-0 items-center rounded-2xl">
          <button
            type="button"
            aria-label="Previous month"
            disabled={!canPrevMonth}
            onClick={onPrevMonth}
            className="flex min-h-11 items-center justify-center rounded-l-2xl px-2 text-foreground/90 transition-colors enabled:hover:text-primary disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span className="min-w-20 text-center text-sm font-medium text-foreground/90">
            {month}
          </span>
          <button
            type="button"
            aria-label="Next month"
            disabled={!canNextMonth}
            onClick={onNextMonth}
            className="flex min-h-11 items-center justify-center rounded-r-2xl px-2 text-foreground/90 transition-colors enabled:hover:text-primary disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Centered donut with ribbon behind */}
      <div className="relative mt-1 flex h-56 items-center justify-center">
        <SpectralRibbon className="absolute top-1/2 left-0 h-32 w-full -translate-y-1/2 opacity-80" />

        {/* Centered 3D ring */}
        <div className="relative h-56 w-full max-w-52">
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
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {categories.length}
                </span>
                <span className="text-xs text-muted-foreground">Categories</span>
              </div>
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

      {/* Focus category glass panel */}
      <div className="relative px-4 pb-4">
        <motion.div
          key={focus.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="edge-light relative -mt-3 flex items-center gap-3.5 overflow-hidden rounded-2xl border p-3.5 bg-transparent"
          style={{ borderColor: focus.color, boxShadow: '0 0 20px rgba(0,0,0,0.08)' }}
        >
          <span
            className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl border bg-transparent"
            style={{
              color: focus.color,
              borderColor: focus.color,
              boxShadow: `0 0 12px color-mix(in srgb, ${focus.color} 15%, transparent)`,
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
