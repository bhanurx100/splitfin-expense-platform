'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { CategoryIcon } from '@/src/shared/components/category-icon'
import { DonutChart } from '@/src/shared/components/donut-chart'
import { GlassCard } from '@/src/shared/components/glass-card'
import { withCategoryPalette } from '@/src/shared/lib/category-colors'
import { springs } from '@/src/shared/lib/motion'
import { cn } from '@/src/lib/utils'
import { formatCurrency } from '@/src/shared/lib/format'
import type { CategorySummary } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

export function CategoriesPreview({ categories }: { categories: CategorySummary[] }) {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)

  const { top, others, othersPercent, total } = useMemo(() => {
    const sorted = withCategoryPalette([...categories].sort((a, b) => b.amount - a.amount))
    const top = sorted.slice(0, 4)
    const rest = sorted.slice(4)
    return {
      top,
      others: rest,
      othersPercent: rest.reduce((s, c) => s + c.percent, 0),
      total: categories.reduce((s, c) => s + c.amount, 0),
    }
  }, [categories])

  const segments = useMemo(
    () => [
      ...top.map((c) => ({
        id: c.id,
        percent: c.percent,
        color: c.color,
        label: c.name,
        value: formatCurrency(c.amount),
      })),
      {
        id: 'rest',
        percent: othersPercent,
        color: 'oklch(0.4 0.03 285)',
        label: 'Others',
        value: undefined,
      },
    ],
    [top, othersPercent],
  )

  const openCategory = (id: string) => {
    router.push(id === 'rest' ? '/categories' : `/categories?category=${id}`)
  }

  return (
    <section aria-label="Top categories" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Top Categories</h2>
        <Link
          href="/categories"
          className="rounded-lg text-sm font-medium text-primary transition-colors hover:text-primary-bright focus-visible:outline-2 focus-visible:outline-ring"
        >
          View all
        </Link>
      </div>
      <GlassCard strong className="flex flex-col gap-5 p-5">
        {/* Donut — center crossfades to the active slice */}
        <div className="flex justify-center pt-1">
          <DonutChart
            segments={segments}
            size={168}
            strokeWidth={17}
            label="Top spending categories"
            activeId={activeId}
            onActiveChange={setActiveId}
            onSelect={openCategory}
            centerValue={undefined}
          >
            <span className="text-[10px] text-muted-foreground">Total Spent</span>
            <AnimatedAmount value={total} className="text-base font-bold" />
          </DonutChart>
        </div>
        {/* Legend rows — hovering a row highlights its slice and vice versa */}
        <div className="flex min-w-0 flex-col gap-1">
          {top.map((c) => {
            const active = activeId === c.id
            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => openCategory(c.id)}
                onPointerEnter={() => setActiveId(c.id)}
                onPointerLeave={() => setActiveId(null)}
                animate={{
                  backgroundColor: active
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(255,255,255,0)',
                  scale: active ? 1.015 : 1,
                }}
                transition={springs.soft}
                className="flex min-h-10 items-center gap-2.5 rounded-xl px-2 text-left focus-visible:outline-2 focus-visible:outline-ring"
                aria-label={`${c.name} — ${c.percent}% of spending. Open category.`}
              >
                <span
                  className="flex size-7 items-center justify-center rounded-lg transition-transform duration-300"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${c.color} 18%, transparent)`,
                    color: c.color,
                    boxShadow: active ? `0 0 12px color-mix(in oklch, ${c.color} 45%, transparent)` : 'none',
                  }}
                >
                  <CategoryIcon name={c.icon} className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums transition-colors duration-300',
                    active ? 'text-foreground' : 'text-muted-foreground',
                  )}
                  style={active ? { color: c.color } : undefined}
                >
                  {c.percent}%
                </span>
              </motion.button>
            )
          })}
          {others.length > 0 && (
            <motion.button
              type="button"
              onClick={() => openCategory('rest')}
              onPointerEnter={() => setActiveId('rest')}
              onPointerLeave={() => setActiveId(null)}
              animate={{
                backgroundColor:
                  activeId === 'rest' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0)',
              }}
              transition={springs.soft}
              className="flex min-h-10 items-center gap-2.5 rounded-xl px-2 text-left focus-visible:outline-2 focus-visible:outline-ring"
              aria-label="Other categories — open categories"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <CategoryIcon name="more-horizontal" className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">Others</span>
              <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                {Math.round(othersPercent)}%
              </span>
            </motion.button>
          )}
        </div>
      </GlassCard>
    </section>
  )
}
