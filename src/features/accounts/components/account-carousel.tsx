'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { formatCurrency } from '@/src/shared/lib/format'
import type { AccountPreview, AccountType } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import {
  Banknote,
  ChevronRight,
  CreditCard,
  Landmark,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const typeMeta: Record<AccountType, { icon: LucideIcon; color: string; label: string }> = {
  bank: { icon: Landmark, color: 'var(--primary)', label: 'Savings Account' },
  'credit-card': { icon: CreditCard, color: 'var(--info)', label: 'Credit Card' },
  'debit-card': { icon: CreditCard, color: 'var(--warning)', label: 'Debit Card' },
  wallet: { icon: Wallet, color: 'var(--positive)', label: 'Wallet' },
  cash: { icon: Banknote, color: 'var(--positive)', label: 'Cash in Hand' },
  investment: { icon: TrendingUp, color: 'var(--info)', label: 'Investment' },
}

export function AccountCarousel({ accounts }: { accounts: AccountPreview[] }) {
  const scrollRef = useRef<HTMLUListElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const cardWidth = el.scrollWidth / accounts.length
      setActiveIndex(Math.min(Math.round(el.scrollLeft / cardWidth), accounts.length - 1))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [accounts.length])

  return (
    <section aria-label="Your accounts" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Your Accounts</h2>
        <button
          type="button"
          className="flex min-h-11 items-center gap-1 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          View all
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <ul
        ref={scrollRef}
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-2 scrollbar-none"
      >
        {accounts.map((account, i) => {
          const meta = typeMeta[account.type]
          const Icon = meta.icon
          const negative = account.monthlyChangePercent < 0
          return (
            <motion.li
              key={account.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ type: 'spring', stiffness: 240, damping: 26, delay: i * 0.05 }}
              className="w-64 shrink-0 snap-center"
            >
              <div
                className="glass-strong relative flex h-full flex-col gap-4 overflow-hidden rounded-xl p-5"
                style={{
                  borderColor: `color-mix(in oklch, ${meta.color} 35%, transparent)`,
                  boxShadow: `0 0 24px color-mix(in oklch, ${meta.color} 14%, transparent)`,
                }}
              >
                {/* Accent wash */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-30"
                  style={{
                    background: `radial-gradient(ellipse 90% 100% at 50% 0%, color-mix(in oklch, ${meta.color} 40%, transparent), transparent)`,
                  }}
                />

                <div className="relative flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-11 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: `color-mix(in oklch, ${meta.color} 18%, transparent)`,
                        color: meta.color,
                      }}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">{account.institution}</p>
                      <p className="text-xs text-muted-foreground">{account.name}</p>
                    </div>
                  </div>
                  {account.isPrimary && (
                    <span className="flex items-center gap-1 rounded-lg bg-primary/15 px-2 py-1 text-[10px] font-semibold text-primary">
                      <Sparkles className="size-2.5" aria-hidden="true" />
                      Primary
                    </span>
                  )}
                </div>

                <div className="relative">
                  <AnimatedAmount
                    value={account.balance}
                    currency={account.currency}
                    className="block text-2xl font-extrabold tracking-tight"
                  />
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {account.type === 'credit-card' ? 'Outstanding' : 'Available Balance'}
                  </p>
                </div>

                <div className="relative flex items-center justify-between gap-2 text-xs">
                  <p
                    className={`flex items-center gap-1 font-semibold ${negative ? 'text-negative' : 'text-positive'}`}
                  >
                    {negative ? (
                      <TrendingDown className="size-3.5" aria-hidden="true" />
                    ) : (
                      <TrendingUp className="size-3.5" aria-hidden="true" />
                    )}
                    {Math.abs(account.monthlyChangePercent)}%
                  </p>
                  <p className="text-muted-foreground">
                    {account.maskedNumber ?? formatCurrency(account.balance, account.currency)}
                    {account.accountsCount != null && ` · ${account.accountsCount} accounts`}
                  </p>
                </div>

                <p className="relative text-[11px] text-muted-foreground">
                  Synced {account.lastSynced}
                </p>
              </div>
            </motion.li>
          )
        })}
      </ul>

      <div className="flex justify-center gap-1.5" aria-hidden="true">
        {accounts.map((account, i) => (
          <span
            key={account.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-5 bg-primary' : 'w-1.5 bg-muted'
              }`}
          />
        ))}
      </div>
    </section>
  )
}
