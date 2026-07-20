'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { CategoryIcon } from '@/src/shared/components/category-icon'
import { DonutChart } from '@/src/shared/components/donut-chart'
import { SpectralRibbon } from '@/src/shared/components/spectral-ribbon'
import { withCategoryPalette } from '@/src/shared/lib/category-colors'
import { formatCurrency } from '@/src/shared/lib/format'
import { springs } from '@/src/shared/lib/motion'
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
      className="edge-light relative overflow-hidden rounded-[28px]"
      style={{
        background:
          'linear-gradient(170deg, rgba(24, 22, 52, 0.85), rgba(10, 12, 27, 0.92) 55%, rgba(8, 9, 22, 0.96))',
      }}
      aria-label="Total spending summary"
    >
      {/* Ambient haze behind the ring composition */}
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

      {/* Balanced composition: legend left, 3D ring right, ribbon behind */}
      <div className="relative mt-1 flex h-56 items-center">
        <SpectralRibbon className="absolute top-1/2 left-0 h-32 w-full -translate-y-1/2 opacity-80" />

        {/* Legend — hovering a row lifts its ring segment */}
        <div className="relative z-10 flex w-[42%] flex-col justify-center gap-1 pl-5">
          {legend.map((c) => {
            const active = selectedId === c.id
            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(active ? null : c.id)}
                onPointerEnter={() => setSelectedId(c.id)}
                onPointerLeave={() => setSelectedId((cur) => (cur === c.id ? null : cur))}
                animate={{
                  backgroundColor: active ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0)',
                  x: active ? 3 : 0,
                }}
                transition={springs.soft}
                className="flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-left focus-visible:outline-2 focus-visible:outline-ring"
                aria-label={`${c.name} — ${c.percent}% of spending`}
              >
                <span
                  className="flex size-6 items-center justify-center rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${c.color} 18%, transparent)`,
                    color: c.color,
                    boxShadow: active ? `0 0 12px color-mix(in oklch, ${c.color} 45%, transparent)` : 'none',
                  }}
                >
                  <CategoryIcon name={c.icon} className="size-3" />
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-xs font-medium transition-colors duration-300',
                    active ? 'text-foreground' : 'text-foreground/75',
                  )}
                >
                  {c.name}
                </span>
                <span
                  className="text-xs font-semibold tabular-nums transition-colors duration-300"
                  style={{ color: active ? c.color : 'var(--muted-foreground)' }}
                >
                  {c.percent}%
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* 3D ring */}
        <div className="absolute top-0 right-1 h-56 w-[58%] min-w-52">
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

      {/* Focus category glass panel */}
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
