'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import { MicroBars } from '@/src/shared/components/micro-bars'
import type { MoneySummary } from '@/src/types/transaction'
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react'
import Link from 'next/link'

export function MoneySummaryRow({ summary }: { summary: MoneySummary }) {
  const items = [
    {
      id: 'in',
      label: 'Money In',
      value: summary.moneyIn,
      icon: ArrowDownLeft,
      tone: 'text-info',
      bg: 'bg-info/15',
      color: 'var(--info)',
      glow: 'cyan' as const,
      href: '/transactions?type=income',
      signed: false,
    },
    {
      id: 'out',
      label: 'Money Out',
      value: summary.moneyOut,
      icon: ArrowUpRight,
      tone: 'text-negative',
      bg: 'bg-negative/15',
      color: 'var(--negative)',
      glow: 'pink' as const,
      href: '/transactions?type=expense',
      signed: false,
    },
    {
      id: 'net',
      label: 'Net Balance',
      value: summary.netBalance,
      icon: Wallet,
      tone: 'text-primary',
      bg: 'bg-primary/15',
      color: 'var(--primary)',
      glow: 'purple' as const,
      href: '/transactions',
      signed: true,
    },
  ]

  return (
    <section aria-label="Monthly money summary" className="grid grid-cols-3 gap-2.5">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-label={`${item.label} — view transactions`}
            className="rounded-xl focus-visible:outline-2 focus-visible:outline-ring"
          >
            <GlassCard interactive hoverGlow={item.glow} className="flex h-full flex-col gap-2 p-3.5">
              <span className={`flex size-8 items-center justify-center rounded-xl ${item.bg} ${item.tone} glow-breathe`}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="text-[11px] text-muted-foreground">{item.label}</span>
              <AnimatedAmount
                value={item.value}
                currency={summary.currency}
                signed={item.signed}
                className={`text-base font-bold leading-tight ${item.tone}`}
              />
              <MicroBars values={summary.bars} color={item.color} className="mt-auto" />
              <span className="text-[10px] text-muted-foreground">This month</span>
            </GlassCard>
          </Link>
        )
      })}
    </section>
  )
}
