'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import type { AccountPreview } from '@/src/types/transaction'
import { cn } from '@/src/lib/utils'
import {
  Banknote,
  CreditCard,
  Landmark,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'

const typeMeta: Record<string, { icon: LucideIcon; tone: string; bg: string }> = {
  bank: { icon: Landmark, tone: 'text-primary', bg: 'bg-primary/15' },
  'credit-card': { icon: CreditCard, tone: 'text-info', bg: 'bg-info/15' },
  'debit-card': { icon: CreditCard, tone: 'text-warning', bg: 'bg-warning/15' },
  wallet: { icon: Wallet, tone: 'text-positive', bg: 'bg-positive/15' },
  cash: { icon: Banknote, tone: 'text-warning', bg: 'bg-warning/15' },
  investment: { icon: TrendingUp, tone: 'text-info', bg: 'bg-info/15' },
}

export function AccountsPreview({ accounts }: { accounts: AccountPreview[] }) {
  return (
    <section aria-label="Accounts preview" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Accounts</h2>
        <Link
          href="/accounts"
          className="rounded-lg text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          View all
        </Link>
      </div>
      <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 scrollbar-none">
        {accounts.map((account) => {
          const meta = typeMeta[account.type] ?? typeMeta.bank
          const Icon = meta.icon
          const positive = account.monthlyChangePercent >= 0
          return (
            <GlassCard
              key={account.id}
              interactive
              className={cn(
                'flex w-40 shrink-0 flex-col gap-2.5 p-4',
                account.isPrimary && 'glow-primary border-primary/30',
              )}
            >
              <span className={cn('flex size-9 items-center justify-center rounded-xl', meta.bg, meta.tone)}>
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <div>
                <p className="truncate text-sm font-semibold">{account.institution}</p>
                <p className="truncate text-[11px] text-muted-foreground">{account.name}</p>
              </div>
              <AnimatedAmount
                value={account.balance}
                currency={account.currency}
                className="text-lg font-bold"
              />
              <p
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  positive ? 'text-positive' : 'text-negative',
                )}
              >
                {positive ? (
                  <TrendingUp className="size-3.5" aria-hidden="true" />
                ) : (
                  <TrendingDown className="size-3.5" aria-hidden="true" />
                )}
                {Math.abs(account.monthlyChangePercent)}%
              </p>
            </GlassCard>
          )
        })}
      </div>
    </section>
  )
}
