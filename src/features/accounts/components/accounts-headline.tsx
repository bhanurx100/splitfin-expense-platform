'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { formatCurrency } from '@/src/shared/lib/format'
import type { BalanceSummary } from '@/src/types/transaction'
import { accounts } from '@/src/lib/data'
import { motion } from 'framer-motion'
import { Landmark, CreditCard, Wallet, WalletCards } from 'lucide-react'

/**
 * Accounts page hero — premium headline with balance, distribution, and metrics.
 */
export function AccountsHeadline({ summary }: { summary: BalanceSummary }) {
  // Calculate distribution by account type (excluding linked accounts)
  const realAccounts = accounts.filter((a) => !a.linkedAccountId)
  const totalBalance = realAccounts.reduce((sum, a) => {
    return a.type === 'credit-card' ? sum - a.balance : sum + a.balance
  }, 0)

  // Group by type for distribution
  const byType = realAccounts.reduce((acc, a) => {
    const type = a.type === 'debit-card' ? 'bank' : a.type
    if (!acc[type]) acc[type] = { count: 0, balance: 0 }
    acc[type].count += 1
    acc[type].balance += a.type === 'credit-card' ? -a.balance : a.balance
    return acc
  }, {} as Record<string, { count: number; balance: number }>)

  // Distribution data with colors
  const distribution = [
    { type: 'bank', icon: Landmark, label: 'Bank', color: '#3b82f6', balance: byType.bank?.balance ?? 0, count: byType.bank?.count ?? 0 },
    { type: 'credit-card', icon: CreditCard, label: 'Credit Card', color: '#06b6d4', balance: byType['credit-card']?.balance ?? 0, count: byType['credit-card']?.count ?? 0 },
    { type: 'wallet', icon: Wallet, label: 'Wallet', color: '#10b981', balance: byType.wallet?.balance ?? 0, count: byType.wallet?.count ?? 0 },
    { type: 'cash', icon: WalletCards, label: 'Cash', color: '#f59e0b', balance: byType.cash?.balance ?? 0, count: byType.cash?.count ?? 0 },
  ].filter((d) => d.balance > 0)

  // Calculate percentages
  const distributionWithPercents = distribution.map((d) => ({
    ...d,
    percent: Math.round((d.balance / totalBalance) * 100),
  }))

  // Calculate metrics
  const cardDue = Math.abs(byType['credit-card']?.balance ?? 0)
  const netWorth = totalBalance + cardDue
  const available = totalBalance

  return (
    <motion.section
      aria-label="Accounts summary"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card px-[1.125rem] pt-[1.125rem] pb-[1.125rem] shadow-[0_0_20px_rgba(99,102,241,0.08)]"
    >
      {/* Subtle edge light */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-[0.875rem]">
        {/* Balance Section */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-[0.5rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Total Balance
          </p>
          <AnimatedAmount
            value={totalBalance}
            currency={summary.currency}
            className="text-[2.5rem] font-extrabold leading-none tracking-tight sm:text-[2.625rem]"
          />
          {cardDue > 0 && (
            <p className="text-[0.8125rem] text-muted-foreground">
              after {formatCurrency(cardDue, summary.currency)} card dues
            </p>
          )}
        </div>

        {/* Distribution Section */}
        <div className="flex flex-col gap-[0.75rem]">
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-[0.875rem] font-semibold text-foreground">
              Distributed across
            </p>
            <p className="text-[1.25rem] font-semibold bg-gradient-to-r from-[#3b82f6] via-[#06b6d4] to-[#10b981] bg-clip-text text-transparent">
              {realAccounts.length} Accounts
            </p>
          </div>

          {/* Allocation Bar */}
          <div className="flex h-2 w-full overflow-hidden rounded-[999px]">
            {distributionWithPercents.map((d) => (
              <div
                key={d.type}
                className="h-full transition-all duration-300"
                style={{ width: `${d.percent}%`, backgroundColor: d.color }}
                aria-label={`${d.label}: ${d.percent}%`}
              />
            ))}
          </div>

          {/* Distribution Rows */}
          <div className="flex flex-col gap-2">
            {distributionWithPercents.map((d) => (
              <motion.div
                key={d.type}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="relative flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2"
              >
                {/* Icon */}
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${d.color}15` }}
                >
                  <d.icon className="size-4" style={{ color: d.color }} aria-hidden="true" />
                </span>

                {/* Title & Subtitle */}
                <div className="flex min-w-0 flex-1 flex-col gap-0">
                  <span className="text-[0.75rem] font-semibold text-foreground leading-tight">{d.label}</span>
                  <span className="text-[0.6875rem] text-muted-foreground leading-tight">
                    {d.count} account{d.count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Amount */}
                <span className="text-[1.125rem] font-bold text-foreground tabular-nums leading-none">
                  {formatCurrency(d.balance, summary.currency)}
                </span>

                {/* Percentage */}
                <span className="text-[1rem] font-bold text-foreground tabular-nums leading-none" style={{ color: d.color }}>
                  {d.percent}%
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Metrics Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-muted/30 p-2">
            <p className="text-[0.625rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Net Worth
            </p>
            <p className="text-[1rem] font-bold text-foreground tabular-nums leading-none">
              {formatCurrency(netWorth, summary.currency)}
            </p>
          </div>
          <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-muted/30 p-2">
            <p className="text-[0.625rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Available
            </p>
            <p className="text-[1rem] font-bold text-foreground tabular-nums leading-none">
              {formatCurrency(available, summary.currency)}
            </p>
          </div>
          <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-muted/30 p-2">
            <p className="text-[0.625rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Card Due
            </p>
            <p className="text-[1rem] font-bold text-foreground tabular-nums leading-none">
              {formatCurrency(cardDue, summary.currency)}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
