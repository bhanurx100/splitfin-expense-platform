'use client'

import { CategoryIcon } from '@/src/shared/components/category-icon'
import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import { springs } from '@/src/shared/lib/motion'
import { cn } from '@/src/lib/utils'
import type { MonthGroup, Transaction, TransactionType } from '@/src/types/transaction'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarRange, ChevronDown, ChevronRight, Receipt, RefreshCw, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const typeStyles: Record<
  TransactionType,
  { color: string; badge: string; label: string; sign: '+' | '-' }
> = {
  income: { color: 'var(--positive)', badge: 'border border-positive/30 text-positive', label: 'Income', sign: '+' },
  expense: { color: 'var(--negative)', badge: 'border border-negative/30 text-negative', label: 'Expense', sign: '-' },
  transfer: { color: 'var(--primary)', badge: 'border border-primary/30 text-primary', label: 'Transfer', sign: '-' },
  refund: { color: 'var(--info)', badge: 'border border-info/30 text-info', label: 'Refund', sign: '+' },
}

/** X center of the spine (px) inside every timeline block. */
const SPINE_X = 5

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
      className="group relative pl-7"
      onPointerEnter={() => onHover(tx.id)}
      onPointerLeave={() => onHover(null)}
    >
      {/* Individual transaction markers only - no spine segments (header provides continuous line) */}
      {/* Timeline node — hollow outlined circle with transparent center */}
      <motion.span
        aria-hidden="true"
        animate={{ scale: expanded ? 1.2 : 1 }}
        transition={springs.bouncy}
        className="absolute top-7 z-10 size-3 -translate-x-1/2 rounded-full transition-transform duration-300 group-hover:scale-[1.15]"
        style={{
          left: SPINE_X,
          backgroundColor: 'transparent',
          border: `2px solid ${style.color}`,
          boxShadow: `0 0 8px ${style.color}44`,
        }}
      />
      <GlassCard
        interactive
        className={cn(
          'flex min-w-0 flex-1 cursor-pointer items-start gap-3 p-3 transition-shadow duration-300',
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
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/8"
          style={{
            color: style.color,
            boxShadow: `0 0 16px color-mix(in oklch, ${style.color} 8%, transparent)`,
          }}
        >
          <CategoryIcon name={tx.icon} className="size-4.5" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{tx.merchant}</p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {tx.account} · {tx.category}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${style.badge}`}>
              {style.label}
            </span>
            {tx.isSplit && (
              <span className="flex items-center gap-0.5 rounded-md border border-info/30 px-1.5 py-0.5 text-[10px] font-semibold text-info">
                <Users className="size-2.5" aria-hidden="true" />
                Split
              </span>
            )}
            {tx.isRecurring && (
              <span className="flex items-center gap-0.5 rounded-md border border-warning/30 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                <RefreshCw className="size-2.5" aria-hidden="true" />
                Recurring
              </span>
            )}
            {tx.hasReceipt && (
              <span className="flex items-center gap-0.5 rounded-md border border-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
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
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl border border-white/6 bg-transparent px-4 py-3 text-xs">
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
  /** ISO date (YYYY-MM-DD) — expand matching transaction when deep-linked. */
  highlightDate?: string
  /** Month key (YYYY-MM) — scroll to matching month group. */
  highlightMonth?: string
}

export function TransactionTimeline({ groups, activeType, highlightDate, highlightMonth }: TransactionTimelineProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const monthRefs = useRef<Record<string, HTMLElement | null>>({})

  // Deep-link: expand a specific transaction or scroll to a month from cash flow.
  useEffect(() => {
    if (highlightDate) {
      for (const group of groups) {
        const match = group.transactions.find((t) => t.isoDate === highlightDate)
        if (match) {
          setExpandedId(match.id)
          const el = monthRefs.current[group.id]
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
      }
    }
    if (highlightMonth) {
      const el = monthRefs.current[highlightMonth]
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [highlightDate, highlightMonth, groups])

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
        className="glass flex flex-col items-center gap-2 rounded-2xl border border-white/8 p-10 text-center"
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
            ref={(el) => {
              monthRefs.current[group.id] = el
            }}
            aria-label={`${group.month} ${group.year} transactions`}
            className="relative"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ ...springs.soft, delay: gi * 0.05 }}
          >
            {/* ── Month header (anchored to the spine) ──────────────── */}
            <div className="relative pl-7">
              {/* Header spine stub — continuous vertical line connecting through all transactions */}
              <motion.span
                aria-hidden="true"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                className="absolute top-[62%] w-[2px] rounded-full"
                style={{
                  left: SPINE_X - 1,
                  height: `calc(100% - 62% + ${visible.length * 80 + 32}px)`,
                  transformOrigin: 'top',
                  background: `linear-gradient(180deg, var(--primary)88, ${firstColor}88)`,
                }}
              />
              <span
                aria-hidden="true"
                className="absolute top-1/2 z-10 flex size-[28px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-info/40 bg-transparent text-info"
                style={{ left: SPINE_X, boxShadow: '0 0 8px rgba(20,217,255,0.25)' }}
              >
                <CalendarRange className="size-3.5" aria-hidden="true" />
              </span>
              <GlassCard strong interactive className="flex items-center gap-3.5 p-4" style={{ boxShadow: '0 0 20px rgba(0,0,0,0.08)' }}>
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
