'use client'

import type { CarouselCardData } from '@/src/shared/three/account-carousel-scene'
import { formatCurrency } from '@/src/shared/lib/format'
import type { AccountPreview, AccountType } from '@/src/types/transaction'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'

const AccountCarouselScene = dynamic(() => import('@/src/shared/three/account-carousel-scene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
      <span className="sr-only">Loading 3D account carousel</span>
    </div>
  ),
})

/** Distinct identity per account type — never reuse one theme. */
const typeThemes: Record<AccountType, { base: string; glow: string; accent: string; atmosphere: string }> = {
  bank: { base: '#5b3df5', glow: '#8b6cff', accent: '#c0b6ff', atmosphere: 'rgba(124, 92, 255, 0.16)' },
  'credit-card': { base: '#2450d8', glow: '#4f7dff', accent: '#b8c9ff', atmosphere: 'rgba(79, 125, 255, 0.14)' },
  'debit-card': { base: '#b45a1b', glow: '#f59e4b', accent: '#e8c39a', atmosphere: 'rgba(245, 158, 75, 0.12)' },
  wallet: { base: '#0c7a5a', glow: '#2dd4a0', accent: '#a7e8d4', atmosphere: 'rgba(45, 212, 160, 0.13)' },
  cash: { base: '#14652e', glow: '#38b26a', accent: '#e5c558', atmosphere: 'rgba(229, 197, 88, 0.1)' },
  investment: { base: '#0e6a8a', glow: '#22c0e8', accent: '#a0e5f5', atmosphere: 'rgba(34, 192, 232, 0.13)' },
}

export function AccountCarousel3D({
  accounts,
  activeIndex,
  onActiveChange,
}: {
  accounts: AccountPreview[]
  activeIndex: number
  onActiveChange: (index: number) => void
}) {
  const cards: CarouselCardData[] = useMemo(
    () =>
      accounts.map((account) => ({
        id: account.id,
        institution: account.institution,
        name: account.name,
        balanceLabel: formatCurrency(account.balance, account.currency),
        balanceCaption: account.type === 'credit-card' ? 'Outstanding' : 'Available Balance',
        maskedNumber: account.maskedNumber,
        isPrimary: account.isPrimary,
        theme: typeThemes[account.type],
      })),
    [accounts],
  )

  const atmosphere = typeThemes[accounts[activeIndex]?.type ?? 'bank'].atmosphere

  return (
    <section aria-label="Your accounts in 3D" className="relative -mx-6">
      {/* Atmosphere crossfades with the selected account type */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-[background] duration-700"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${atmosphere}, transparent)`,
        }}
      />
      <div className="h-[340px] w-full">
        <AccountCarouselScene cards={cards} onActiveChange={onActiveChange} />
      </div>

      <div className="flex justify-center gap-1.5" aria-hidden="true">
        {accounts.map((account, i) => (
          <span
            key={account.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-5 bg-primary' : 'w-1.5 bg-muted'
              }`}
          />
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        Selected account: {accounts[activeIndex]?.institution} {accounts[activeIndex]?.name}
      </p>
    </section>
  )
}
