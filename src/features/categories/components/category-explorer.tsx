'use client'

import { springs } from '@/src/shared/lib/motion'
import { cn } from '@/src/lib/utils'
import type { CategorySummary, Currency } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import {
  Gift,
  Heart,
  LayoutGrid,
  MoreHorizontal,
  ShoppingBasket,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { CategoryList } from './category-list'
import { CategoryOrbit } from './category-orbit'

interface CategoryExplorerProps {
  categories: CategorySummary[]
  currency: Currency
  period: '1M' | '3M' | '6M' | '1Y' | 'All'
  onPeriodChange: (period: '1M' | '3M' | '6M' | '1Y' | 'All') => void
}

const periodOptions = ['1M', '3M', '6M', '1Y', 'All'] as const

const groupOptions: { id: string; label: string; icon: LucideIcon; borderColor: string }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid, borderColor: 'rgba(124,60,255,0.3)' },
  { id: 'needs', label: 'Needs', icon: ShoppingBasket, borderColor: 'rgba(22,230,161,0.3)' },
  { id: 'wants', label: 'Wants', icon: Gift, borderColor: 'rgba(255,45,120,0.3)' },
  { id: 'lifestyle', label: 'Lifestyle', icon: Heart, borderColor: 'rgba(20,217,255,0.3)' },
  { id: 'others', label: 'Others', icon: MoreHorizontal, borderColor: 'rgba(255,170,43,0.3)' },
]

/** Premium circular group selector — same interaction language as quick actions. */
function GroupSelector({
  value,
  onChange,
  counts,
}: {
  value: string
  onChange: (id: string) => void
  counts: Record<string, number>
}) {
  return (
    <div role="tablist" aria-label="Filter categories by group" className="flex items-start justify-between gap-2 px-1">
      {groupOptions.map((opt) => {
        const active = value === opt.id
        const Icon = opt.icon
        return (
          <motion.button
            key={opt.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.id)}
            initial="rest"
            whileHover="hover"
            whileTap="press"
            animate="rest"
            className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-2 rounded-2xl py-1 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <motion.span
              variants={{
                rest: { scale: 1 },
                hover: { scale: 1.08, y: -2 },
                press: { scale: 0.9 },
              }}
              transition={springs.snappy}
              className={cn(
                'relative flex size-10 items-center justify-center rounded-full border backdrop-blur-[24px] transition-colors duration-300',
                active
                  ? 'border-primary/60 bg-primary text-primary-foreground'
                  : 'border-white/10 bg-[rgba(255,255,255,0.05)] text-foreground/75',
              )}
              style={{
                borderColor: active ? 'rgba(124,60,255,0.6)' : opt.borderColor,
                boxShadow: active
                  ? '0 0 20px rgba(0,0,0,0.12)'
                  : '0 0 20px rgba(0,0,0,0.08)',
              }}
            >
              {active && (
                <motion.span
                  layoutId="group-selector-ring"
                  className="absolute -inset-1 rounded-full border border-primary/50"
                  transition={springs.pill}
                />
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background: active
                    ? 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.25), transparent 60%)'
                    : 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.10), transparent 60%)',
                }}
              />
              <motion.span
                variants={{
                  rest: { scale: 1, rotate: 0 },
                  hover: { scale: 1.12, rotate: -4 },
                  press: { scale: 0.94, rotate: 0 },
                }}
                transition={springs.bouncy}
                className="relative"
              >
                <Icon className="size-5.5" strokeWidth={1.9} aria-hidden="true" />
              </motion.span>
            </motion.span>
            <span
              className={cn(
                'text-center text-[11px] font-medium leading-tight transition-colors duration-300',
                active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground/85',
              )}
            >
              {opt.label}
              {counts[opt.id] != null && (
                <span className="ml-1 text-[9px] tabular-nums text-muted-foreground/70">{counts[opt.id]}</span>
              )}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

export function CategoryExplorer({ categories, currency, period, onPeriodChange }: CategoryExplorerProps) {
  const [group, setGroup] = useState('all')

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: categories.length }
    for (const opt of groupOptions) {
      if (opt.id !== 'all') c[opt.id] = categories.filter((cat) => cat.group === opt.id).length
    }
    return c
  }, [categories])

  const filtered = useMemo(
    () => (group === 'all' ? categories : categories.filter((c) => c.group === group)),
    [group, categories],
  )

  return (
    <section aria-label="Explore categories" className="flex flex-col gap-5">
      <div role="tablist" aria-label="Category time range" className="flex rounded-xl border border-[var(--surface-border)] bg-[var(--surface-subtle)] p-1 shadow-[0_0_16px_var(--surface-glow)]">
        {periodOptions.map((option) => {
          const active = period === option
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onPeriodChange(option)}
              className={cn(
                'min-h-7 flex-1 rounded-full px-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                active ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
      <GroupSelector value={group} onChange={setGroup} counts={counts} />
      {filtered.length > 0 ? (
        <>
          <CategoryOrbit categories={filtered} currency={currency} />
          <CategoryList
            categories={[...filtered].sort((a, b) => b.amount - a.amount)}
            currency={currency}
          />
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springs.soft}
          className="glass rounded-2xl p-8 text-center"
        >
          <p className="text-sm font-semibold">No categories in this group yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a transaction and it will appear here automatically.
          </p>
        </motion.div>
      )}
    </section>
  )
}
