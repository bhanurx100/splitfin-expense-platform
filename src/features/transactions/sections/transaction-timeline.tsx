'use client'

import { CategoryIcon } from '@/src/shared/components/category-icon'
import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import type { MonthGroup, Transaction, TransactionType } from '@/src/types/transaction'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarRange, ChevronRight, Receipt, RefreshCw, Users } from 'lucide-react'

const typeStyles: Record<
  TransactionType,
  { color: string; badge: string; label: string; sign: '+' | '-' }
> = {
  income: { color: 'var(--positive)', badge: 'bg-positive/15 text-positive', label: 'Income', sign: '+' },
  expense: { color: 'var(--negative)', badge: 'bg-negative/15 text-negative', label: 'Expense', sign: '-' },
  transfer: { color: 'var(--primary)', badge: 'bg-primary/15 text-primary', label: 'Transfer', sign: '-' },
  refund: { color: 'var(--positive)', badge: 'bg-positive/15 text-positive', label: 'Income', sign: '+' },
}

function TransactionRow({ tx, index }: { tx: Transaction; index: number }) {
  const style = typeStyles[tx.type]
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -14 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26, delay: index * 0.04 }}
      className="relative flex gap-4 pl-7"
    >
      {/* Timeline node */}
      <span
        aria-hidden="true"
        className="node-pulse absolute top-6 left-0 size-3 -translate-x-1/2 rounded-full"
        style={{
          backgroundColor: style.color,
          boxShadow: `0 0 10px ${style.color}`,
        }}
      />
      <GlassCard interactive className="flex min-w-0 flex-1 items-center gap-3.5 p-3.5">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: `color-mix(in oklch, ${style.color} 14%, transparent)`,
            color: style.color,
          }}
        >
          <CategoryIcon name={tx.icon} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{tx.merchant}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            {tx.category} · {tx.subtitle}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${style.badge}`}>
              {tx.type === 'transfer' ? 'Transfer' : style.label}
            </span>
            {tx.isSplit && (
              <span className="flex items-center gap-0.5 rounded-md bg-info/15 px-1.5 py-0.5 text-[10px] font-semibold text-info">
                <Users className="size-2.5" aria-hidden="true" />
                Split
              </span>
            )}
            {tx.isRecurring && (
              <span className="flex items-center gap-0.5 rounded-md bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                <RefreshCw className="size-2.5" aria-hidden="true" />
                Recurring
              </span>
            )}
            {tx.hasReceipt && (
              <span className="flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                <Receipt className="size-2.5" aria-hidden="true" />
                Bill
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold tabular-nums" style={{ color: style.color }}>
            {style.sign}
            {formatCurrency(tx.amount, tx.currency)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {tx.time} · {tx.date}
          </p>
        </div>
      </GlassCard>
    </motion.li>
  )
}

interface TransactionTimelineProps {
  groups: MonthGroup[]
  activeType: string
}

export function TransactionTimeline({ groups, activeType }: TransactionTimelineProps) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const visible =
          activeType === 'all'
            ? group.transactions
            : group.transactions.filter((t) =>
              activeType === 'income' ? t.type === 'income' || t.type === 'refund' : t.type === activeType,
            )
        if (visible.length === 0) return null
        return (
          <section key={group.id} aria-label={`${group.month} ${group.year} transactions`}>
            <GlassCard strong interactive className="flex items-center gap-3.5 p-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <CalendarRange className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold">
                  {group.month} {group.year}
                </p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-lg font-extrabold tabular-nums">
                  {formatCurrency(group.totalSpent, group.currency)}
                </p>
              </div>
              <span className="glass flex size-10 shrink-0 items-center justify-center rounded-2xl">
                <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
              </span>
            </GlassCard>

            <div className="relative mt-4">
              {/* Glowing timeline spine */}
              <span
                aria-hidden="true"
                className="absolute top-2 bottom-2 left-0 w-px bg-gradient-to-b from-primary/60 via-primary/25 to-transparent"
              />
              <ul className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {visible.map((tx, i) => (
                    <TransactionRow key={tx.id} tx={tx} index={i} />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </section>
        )
      })}
    </div>
  )
}
