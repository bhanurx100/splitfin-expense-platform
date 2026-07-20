'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import type { Bill } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import {
  CalendarClock,
  ChevronRight,
  Play,
  RefreshCw,
  Smartphone,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  play: Play,
  zap: Zap,
  'trending-up': TrendingUp,
}

export function BillsSection({ bills }: { bills: Bill[] }) {
  if (bills.length === 0) {
    return (
      <section aria-label="Upcoming bills and autopay" className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Upcoming Bills &amp; AutoPay</h2>
        <GlassCard className="p-6 text-center">
          <p className="text-sm font-semibold">No upcoming bills</p>
          <p className="mt-1 text-xs text-muted-foreground">
            When you add a bill or AutoPay, it will show up here.
          </p>
        </GlassCard>
      </section>
    )
  }

  return (
    <section aria-label="Upcoming bills and autopay" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Upcoming Bills &amp; AutoPay</h2>
        <button
          type="button"
          className="flex min-h-11 items-center gap-1 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          View All
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {bills.map((bill, i) => {
          const Icon = iconMap[bill.icon] ?? Zap
          const isNext = i === 0
          return (
            <motion.li
              key={bill.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ type: 'spring', stiffness: 240, damping: 26, delay: i * 0.06 }}
            >
              <GlassCard
                interactive
                pressable
                hoverGlow="purple"
                className="relative flex items-center gap-3.5 overflow-hidden p-4"
                style={{
                  borderColor: isNext
                    ? `color-mix(in oklch, ${bill.color} 38%, transparent)`
                    : undefined,
                }}
              >
                {/* Soft color wash from the bill's identity color */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-24 opacity-25"
                  style={{
                    background: `linear-gradient(90deg, color-mix(in oklch, ${bill.color} 22%, transparent), transparent)`,
                  }}
                />

                {/* Icon tile */}
                <motion.span
                  whileHover={{ scale: 1.08, rotate: -4 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${bill.color} 16%, transparent)`,
                    color: bill.color,
                    boxShadow: `0 0 14px color-mix(in oklch, ${bill.color} 22%, transparent)`,
                  }}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </motion.span>

                {/* Name + schedule */}
                <span className="relative min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold">{bill.name}</span>
                    {isNext && (
                      <span className="shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        Next
                      </span>
                    )}
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="size-3" aria-hidden="true" />
                      {bill.dueLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{bill.provider}</span>
                  </span>
                </span>

                {/* Amount + AutoPay status */}
                <span className="relative flex shrink-0 flex-col items-end gap-1">
                  <AnimatedAmount
                    value={bill.amount}
                    currency={bill.currency}
                    className="text-sm font-extrabold tabular-nums"
                  />
                  {bill.autopay ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-info">
                      <motion.span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-info"
                        animate={{ opacity: [1, 0.3, 1], scale: [1, 0.75, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <RefreshCw className="size-2.5" aria-hidden="true" />
                      AutoPay
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-muted-foreground">Manual</span>
                  )}
                </span>
              </GlassCard>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
