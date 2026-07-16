'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import type { SplitPaySummary } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, Plus, Scale } from 'lucide-react'
import Link from 'next/link'

export function SplitPayPreview({ summary }: { summary: SplitPaySummary }) {
  const metrics = [
    {
      id: 'receive',
      label: 'You will receive',
      sub: `From ${summary.owedGroups} groups`,
      value: summary.youAreOwed,
      icon: ArrowDownLeft,
      tone: 'text-positive',
      bg: 'bg-positive/15',
    },
    {
      id: 'pay',
      label: 'You need to pay',
      sub: `Across ${summary.oweGroups} groups`,
      value: summary.youOwe,
      icon: ArrowUpRight,
      tone: 'text-negative',
      bg: 'bg-negative/15',
    },
    {
      id: 'net',
      label: 'Net balance',
      sub: summary.netBalance >= 0 ? 'You are ahead' : 'You need to settle up',
      value: summary.netBalance,
      icon: Scale,
      tone: 'text-primary',
      bg: 'bg-primary/15',
      signed: true,
    },
  ]

  return (
    <GlassCard strong className="relative flex flex-col gap-4 overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">SplitPay Overview</h2>
        <Link
          href="/splitpay"
          className="flex min-h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground glow-primary transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          <Plus className="size-4" aria-hidden="true" />
          New Split
        </Link>
      </div>
      <div className="relative flex flex-col gap-3">
        {/* Connecting line */}
        <motion.span
          className="absolute top-4 bottom-4 left-[17px] w-px bg-gradient-to-b from-positive/40 via-negative/40 to-primary/40"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ transformOrigin: 'top' }}
          aria-hidden="true"
        />
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.id} className="relative flex items-center gap-3">
              <span className={`z-10 flex size-9 items-center justify-center rounded-xl ${m.bg} ${m.tone} node-pulse`}>
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.sub}</p>
              </div>
              <AnimatedAmount
                value={m.value}
                currency={summary.currency}
                signed={m.signed}
                className={`text-base font-bold ${m.tone}`}
              />
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
