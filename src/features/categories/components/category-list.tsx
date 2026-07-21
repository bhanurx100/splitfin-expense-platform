'use client'

import { CategoryIcon } from '@/src/shared/components/category-icon'
import { GlassCard } from '@/src/shared/components/glass-card'
import { withCategoryPalette } from '@/src/shared/lib/category-colors'
import { formatCurrency } from '@/src/shared/lib/format'
import { springs } from '@/src/shared/lib/motion'
import type { CategorySummary, Currency } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface CategoryListProps {
  categories: CategorySummary[]
  currency: Currency
}

export function CategoryList({ categories, currency }: CategoryListProps) {
  // Palette colors by position — data stays content-only.
  const colored = withCategoryPalette(categories)

  if (colored.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springs.soft}
        className="glass rounded-2xl p-8 text-center"
      >
        <p className="text-sm font-semibold">Nothing here yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Categories appear automatically from your transactions.
        </p>
      </motion.div>
    )
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Category budgets">
      {colored.map((cat, i) => {
        const budgetUsed = cat.budget ? Math.min((cat.amount / cat.budget) * 100, 100) : null
        const overBudget = cat.budget != null && cat.amount > cat.budget * 0.9
        const trendUp = (cat.trend ?? 0) > 0
        return (
          <motion.li
            key={cat.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ type: 'spring', stiffness: 260, damping: 26, delay: i * 0.04 }}
          >
            <GlassCard interactive className="p-4" style={{ boxShadow: '0 0 20px rgba(0,0,0,0.08)' }}>
              <div className="flex items-center gap-3.5">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${cat.color} 16%, transparent)`,
                    color: cat.color,
                  }}
                >
                  <CategoryIcon name={cat.icon} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold">{cat.name}</p>
                    <p className="shrink-0 text-sm font-bold tabular-nums">
                      {formatCurrency(cat.amount, currency)}
                    </p>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {cat.merchantCount != null ? `${cat.merchantCount} merchants` : 'Uncategorized'}
                      {' · '}
                      {cat.percent}% of total
                    </p>
                    {cat.trend != null && (
                      <p
                        className={`flex shrink-0 items-center gap-0.5 text-xs font-medium ${trendUp ? 'text-negative' : 'text-positive'
                          }`}
                      >
                        {trendUp ? (
                          <TrendingUp className="size-3" aria-hidden="true" />
                        ) : (
                          <TrendingDown className="size-3" aria-hidden="true" />
                        )}
                        {Math.abs(cat.trend)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {budgetUsed != null && cat.budget != null && (
                <div className="mt-3">
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={Math.round(budgetUsed)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${cat.name} budget used`}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: overBudget ? 'var(--negative)' : cat.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${budgetUsed}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {formatCurrency(cat.amount, currency)} of {formatCurrency(cat.budget, currency)} budget
                    {overBudget && <span className="ml-1 font-semibold text-negative">· Near limit</span>}
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.li>
        )
      })}
    </ul>
  )
}
