'use client'

import { CategoryIcon } from '@/src/shared/components/category-icon'
import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import { springs } from '@/src/shared/lib/motion'
import { cn } from '@/src/lib/utils'
import type { MonthGroup, Transaction, TransactionType } from '@/src/types/transaction'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarRange, ChevronDown, ChevronRight, Receipt, RefreshCw, Users } from 'lucide-react'
import { useState } from 'react'

const typeStyles: Record<
  TransactionType,
  { color: string; badge: string; label: string; sign: '+' | '-' }
> = {
  income: { color: 'var(--positive)', badge: 'bg-positive/15 text-positive', label: 'Income', sign: '+' },
  expense: { color: 'var(--negative)', badge: 'bg-negative/15 text-negative', label: 'Expense', sign: '-' },
  transfer: { color: 'var(--primary)', badge: 'bg-primary/15 text-primary', label: 'Transfer', sign: '-' },
  refund: { color: 'var(--info)', badge: 'bg-info/15 text-info', label: 'Refund', sign: '+' },
}

/** X center of the spine (px) inside every timeline block. */
const SPINE_X = 7

function TransactionRow({
  tx,
  index,
  prevColor,
  isLast,
  expanded,
  onToggle,
  onHover,
}: {
  tx: Transaction
  index: number
  /** Color of the previous node — the segment blends from it into this one. */
  prevColor: string
  isLast: boolean
  expanded: boolean
  onToggle: () => void
  onHover: (id: string | null) => void
}) {
  const style = typeStyles[tx.type]
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ ...springs.soft, delay: index * 0.045 }}
      className="group relative pl-9"
      onPointerEnter={() => onHover(tx.id)}
      onPointerLeave={() => onHover(null)}
    >
      {/* Spine segment — blends previous node's color into this node */}
      <motion.span
        aria-hidden="true"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.045 }}
        className="absolute w-[2px] rounded-full transition-[filter] duration-400 group-hover:brightness-150"
        style={{
          left: SPINE_X - 1,
          top: -12,
          bottom: isLast ? 'calc(100% - 34px)' : -12,
          transformOrigin: 'top',
          background: `linear-gradient(180deg, ${prevColor}, ${style.color})`,
          boxShadow: `0 0 6px ${style.color}44`,
        }}
      />
      {/* Timeline node — grows + glows on hover */}
      <motion.span
        aria-hidden="true"
        animate={{ scale: expanded ? 1.3 : 1 }}
        transition={springs.bouncy}
        className="absolute top-7 z-10 size-3 -translate-x-1/2 rounded-full transition-transform duration-300 group-hover:scale-[1.45]"
        style={{
          left: SPINE_X,
          backgroundColor: style.color,
          boxShadow: `0 0 8px ${style.color}, 0 0 18px ${style.color}55`,
        }}
      />
      <GlassCard
        interactive
        className={cn(
          'flex min-w-0 flex-1 cursor-pointer items-start gap-3.5 p-3.5 transition-shadow duration-300',
          expanded && 'border-white/20',
        )}
        onClick={onToggle}
        role="button"
        aria-expanded={expanded}
        aria-label={`${tx.merchant} — ${formatCurrency(tx.amount, tx.currency)}. Toggle details.`}
      >
        <motion.span
          whileHover={{ scale: 1.1, rotate: -4 }}
          transition={springs.bouncy}
          className="flex size-12 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: `color-mix(in oklch, ${style.color} 14%, transparent)`,
            color: style.color,
          }}
        >
          <CategoryIcon name={tx.icon} className="size-5" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{tx.merchant}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {tx.account} · {tx.category}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${style.badge}`}>
              {style.label}
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
        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="text-base font-bold tabular-nums transition-colors duration-300" style={{ color: style.color }}>
            {style.sign}
            {formatCurrency(tx.amount, tx.currency)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {tx.time} · {tx.date}
          </p>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={springs.soft}
            className="text-muted-foreground"
          >
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </motion.span>
        </div>
      </GlassCard>

      {/* Expandable details — smooth open animation */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-xs">
              <div>
                <p className="text-muted-foreground">Account</p>
                <p className="mt-0.5 font-medium">{tx.account}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="mt-0.5 font-medium">{tx.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="mt-0.5 font-medium capitalize">{tx.status ?? 'completed'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="mt-0.5 font-medium">
                  {tx.date} · {tx.time}
                </p>
              </div>
              {tx.subtitle && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Note</p>
                  <p className="mt-0.5 font-medium">{tx.subtitle}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

interface TransactionTimelineProps {
  groups: MonthGroup[]
  activeType: string
}

export function TransactionTimeline({ groups, activeType }: TransactionTimelineProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const visibleGroups = groups
    .map((group) => ({
      group,
      visible:
        activeType === 'all'
          ? group.transactions
          : group.transactions.filter((t) =>
              activeType === 'income' ? t.type === 'income' || t.type === 'refund' : t.type === activeType,
            ),
    }))
    .filter(({ visible }) => visible.length > 0)

  if (visibleGroups.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springs.soft}
        className="glass flex flex-col items-center gap-2 rounded-2xl p-10 text-center"
      >
        <p className="text-sm font-semibold">No transactions yet</p>
        <p className="max-w-56 text-xs leading-relaxed text-muted-foreground">
          Add your first transaction and it will appear on the timeline.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {visibleGroups.map(({ group, visible }, gi) => {
        const firstColor = typeStyles[visible[0].type].color
        return (
          <motion.section
            key={group.id}
            aria-label={`${group.month} ${group.year} transactions`}
            className="relative"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ ...springs.soft, delay: gi * 0.05 }}
          >
            {/* ── Month header (anchored to the spine) ──────────────── */}
            <div className="relative pl-9">
              {/* Header spine stub — blends into the first transaction's color */}
              <motion.span
                aria-hidden="true"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                className="absolute top-[62%] w-[2px] rounded-full"
                style={{
                  left: SPINE_X - 1,
                  bottom: -16,
                  transformOrigin: 'top',
                  background: `linear-gradient(180deg, var(--primary), ${firstColor})`,
                  boxShadow: `0 0 6px ${firstColor}44`,
                }}
              />
              <span
                aria-hidden="true"
                className="absolute top-1/2 z-10 flex size-[31px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/40 bg-[#171040] text-primary"
                style={{ left: SPINE_X, boxShadow: '0 0 14px rgba(124,60,255,0.45)' }}
              >
                <CalendarRange className="size-4" aria-hidden="true" />
              </span>
              <GlassCard strong interactive className="flex items-center gap-3.5 p-4">
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
            </div>

            {/* ── Transactions on the spine ─────────────────────────── */}
            <ul className="mt-4 flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {visible.map((tx, i) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    index={i}
                    prevColor={i === 0 ? firstColor : typeStyles[visible[i - 1].type].color}
                    isLast={i === visible.length - 1}
                    expanded={expandedId === tx.id}
                    onToggle={() => setExpandedId((cur) => (cur === tx.id ? null : tx.id))}
                    onHover={setHoveredId}
                  />
                ))}
              </AnimatePresence>
            </ul>
          </motion.section>
        )
      })}
    </div>
  )
}
