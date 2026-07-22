'use client'

import type { CarouselCardData } from '@/src/shared/three/account-carousel-scene'
import { formatCurrency } from '@/src/shared/lib/format'
import type { AccountPreview, AccountType } from '@/src/types/transaction'
import dynamic from 'next/dynamic'
import { memo, useEffect, useMemo, useRef, useState } from 'react'

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
  bank: { base: '#5b3df5', glow: '#8b6cff', accent: '#c0b6ff', atmosphere: 'rgba(124, 92, 255, 0.05)' },
  'credit-card': { base: '#2450d8', glow: '#4f7dff', accent: '#b8c9ff', atmosphere: 'rgba(79, 125, 255, 0.05)' },
  'debit-card': { base: '#b45a1b', glow: '#f59e4b', accent: '#e8c39a', atmosphere: 'rgba(245, 158, 75, 0.05)' },
  wallet: { base: '#0c7a5a', glow: '#2dd4a0', accent: '#a7e8d4', atmosphere: 'rgba(45, 212, 160, 0.05)' },
  cash: { base: '#14652e', glow: '#38b26a', accent: '#e5c558', atmosphere: 'rgba(56, 178, 106, 0.04)' },
  investment: { base: '#0e6a8a', glow: '#22c0e8', accent: '#a0e5f5', atmosphere: 'rgba(34, 192, 232, 0.05)' },
}

export const AccountCarousel3D = memo(function AccountCarousel3D({
  accounts,
  activeIndex,
  onActiveChange,
  requestedIndex,
  onRequestIndex,
}: {
  accounts: AccountPreview[]
  activeIndex: number
  onActiveChange: (index: number) => void
  /** Index an external control wants the carousel to spring to. */
  requestedIndex?: number
  /** Pagination-dot taps — parent decides the requested index. */
  onRequestIndex?: (index: number) => void
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
        iconType: account.type,
        theme: typeThemes[account.type],
      })),
    [accounts],
  )

  const atmosphere = typeThemes[accounts[activeIndex]?.type ?? 'bank'].atmosphere

  // Defer mounting the heavy three.js/fiber bundle until the carousel is
  // actually near the viewport. On first page load this keeps the initial
  // paint/hydration free of the 3D chunk's parse + execute cost — the
  // scene only starts fetching once the browser is about to show it.
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldMount, setShouldMount] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Give the rest of the page a moment to paint first even if the
    // carousel is already in view on load (e.g. top of the Accounts page).
    let idleId: number | undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          const schedule =
            'requestIdleCallback' in window
              ? (window as typeof window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback
              : (cb: () => void) => window.setTimeout(cb, 1)
          idleId = schedule(() => setShouldMount(true))
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      if (idleId !== undefined && 'cancelIdleCallback' in window) {
        ; (window as typeof window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId)
      }
    }
  }, [])

  return (
    <section
      ref={containerRef}
      aria-label="Your accounts in 3D"
      className="relative -mx-4 mt-3 overflow-hidden rounded-2xl bg-card border border-[rgba(99,102,241,0.45)] shadow-[0_0_16px_rgba(99,102,241,0.22)]"
    >
      {/* Atmosphere crossfades with the selected account type */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-[background] duration-700"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${atmosphere}, transparent 75%)`,
        }}
      />
      <div className="h-[400px] w-full">
        {shouldMount ? (
          <div className="relative h-full overflow-hidden rounded-[inherit] bg-card">
            <AccountCarouselScene
              cards={cards}
              onActiveChange={onActiveChange}
              requestedIndex={requestedIndex}
            />
            <div className="absolute inset-0 rounded-[inherit] border border-white/5 pointer-events-none" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span
              className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
              aria-hidden="true"
            />
            <span className="sr-only">Loading 3D account carousel</span>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-1.5" role="tablist" aria-label="Choose account">
        {accounts.map((account, i) => (
          <button
            key={account.id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`${account.institution} ${account.name}`}
            onClick={() => onRequestIndex?.(i)}
            className="group/dot flex min-h-6 min-w-6 items-center justify-center focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-all duration-300 group-hover/dot:bg-primary/70 ${i === activeIndex ? 'w-5 bg-primary' : 'w-1.5 bg-muted'
                }`}
            />
          </button>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        Selected account: {accounts[activeIndex]?.institution} {accounts[activeIndex]?.name}
      </p>
    </section>
  )
})