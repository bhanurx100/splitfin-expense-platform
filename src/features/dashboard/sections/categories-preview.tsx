'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { CategoryIcon } from '@/src/shared/components/category-icon'
import { DonutChart } from '@/src/shared/components/donut-chart'
import { GlassCard } from '@/src/shared/components/glass-card'
import type { CategorySummary } from '@/src/types/transaction'
import Link from 'next/link'
import { useMemo } from 'react'

export function CategoriesPreview({ categories }: { categories: CategorySummary[] }) {
  const { top, othersPercent, total } = useMemo(() => {
    const sorted = [...categories].sort((a, b) => b.amount - a.amount)
    const top = sorted.slice(0, 3)
    const rest = sorted.slice(3)
    return {
      top,
      othersPercent: rest.reduce((s, c) => s + c.percent, 0),
      total: categories.reduce((s, c) => s + c.amount, 0),
    }
  }, [categories])

  const segments = [
    ...top.map((c) => ({ id: c.id, percent: c.percent, color: c.color, label: c.name })),
    { id: 'rest', percent: othersPercent, color: 'oklch(0.4 0.03 285)', label: 'Others' },
  ]

  return (
    <Link href="/categories" className="rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      <GlassCard strong interactive className="flex items-center gap-5 p-5">
        <DonutChart segments={segments} size={128} strokeWidth={14} label="Top spending categories">
          <span className="text-[10px] text-muted-foreground">Total Spent</span>
          <AnimatedAmount value={total} className="text-sm font-bold" />
        </DonutChart>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <h2 className="text-lg font-bold">Top Categories</h2>
          {top.map((c) => (
            <div key={c.id} className="flex items-center gap-2.5">
              <span
                className="flex size-6 items-center justify-center rounded-lg"
                style={{ backgroundColor: `color-mix(in oklch, ${c.color} 18%, transparent)`, color: c.color }}
              >
                <CategoryIcon name={c.icon} className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
              <span className="text-sm font-semibold text-muted-foreground">{c.percent}%</span>
            </div>
          ))}
          <div className="flex items-center gap-2.5">
            <span className="flex size-6 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <CategoryIcon name="more-horizontal" className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">Others</span>
            <span className="text-sm font-semibold text-muted-foreground">
              {Math.round(othersPercent)}%
            </span>
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}
