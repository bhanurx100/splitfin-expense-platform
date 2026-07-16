'use client'

import { formatCurrency } from '@/src/shared/lib/format'
import type { Bill } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { ChevronRight, Play, RefreshCw, Smartphone, TrendingUp, Zap, type LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  play: Play,
  zap: Zap,
  'trending-up': TrendingUp,
}

export function BillsSection({ bills }: { bills: Bill[] }) {
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

      <ul className="glass flex flex-col divide-y divide-border rounded-xl px-5">
        {bills.map((bill, i) => {
          const Icon = iconMap[bill.icon] ?? Zap
          return (
            <motion.li
              key={bill.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 260, damping: 28, delay: i * 0.05 }}
            >
              <button
                type="button"
                className="flex min-h-12 w-full items-center gap-3 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${bill.color} 16%, transparent)`,
                    color: bill.color,
                  }}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{bill.name}</span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {bill.autopay && (
                      <span className="flex items-center gap-0.5 font-medium text-info">
                        <RefreshCw className="size-2.5" aria-hidden="true" />
                        AutoPay
                      </span>
                    )}
                    <span>{bill.autopay ? '·' : bill.provider + ' ·'}</span>
                    <span>{bill.dueLabel}</span>
                  </span>
                </span>
                <span className="text-sm font-bold">{formatCurrency(bill.amount, bill.currency)}</span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
