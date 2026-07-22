'use client'

import { IconButton } from '@/src/shared/components/icon-button'
import { MobileShell } from '@/src/shared/components/mobile-shell'
import { EmptyState } from '@/src/shared/components/empty-state'
import { PageHeader } from '@/src/shared/components/page-header'
import { AccountCarousel3D } from '@/src/features/accounts/components/account-carousel-3d'
import { AccountDetailsSection } from '@/src/features/accounts/components/account-details'
import { AccountFilters, type AccountFilter } from '@/src/features/accounts/components/account-filters'
import { AccountsHeadline } from '@/src/features/accounts/components/accounts-headline'
import { BillsSection } from '@/src/features/accounts/sections/bills-section'
import { PortfolioSummarySection } from '@/src/features/accounts/sections/portfolio-summary'
import { SmartInsights } from '@/src/features/accounts/sections/smart-insights'
import {
  accountDetailsById,
  accountInsights,
  accounts,
  balanceSummary,
  portfolioSummary,
  upcomingBills,
} from '@/src/lib/data'
import { Bell, Plus, Search, Wallet } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'

function AccountsPageContent() {
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState<AccountFilter>('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const [requestedIndex, setRequestedIndex] = useState(0)

  const visibleAccounts =
    filter === 'all' ? accounts : accounts.filter((account) => account.type === filter)

  // Deep link: /accounts?account=<id> (e.g. from the Overview preview cards).
  const deepLinkedId = searchParams.get('account')
  useEffect(() => {
    if (!deepLinkedId) return
    const index = accounts.findIndex((account) => account.id === deepLinkedId)
    if (index === -1) return
    setFilter('all')
    setActiveIndex(index)
    setRequestedIndex(index)
  }, [deepLinkedId])

  const onFilterChange = (next: AccountFilter) => {
    setFilter(next)
    setActiveIndex(0)
    setRequestedIndex(0)
  }

  const onActiveChange = useCallback((index: number) => setActiveIndex(index), [])
  const onRequestIndex = useCallback((index: number) => setRequestedIndex(index), [])

  const activeAccount = visibleAccounts[Math.min(activeIndex, visibleAccounts.length - 1)]
  const details = activeAccount ? accountDetailsById[activeAccount.id] : undefined

  return (
    <MobileShell>
      <PageHeader
        title="Accounts"
        subtitle="All your money, in one place"
        actions={
          <>
            <IconButton icon={Search} label="Search accounts" />
            <IconButton icon={Bell} label="Notifications" />
            <IconButton icon={Plus} label="Add account" className="bg-white/8 text-foreground" />
          </>
        }
      />

      {/* Derived headline — total, monthly change, active accounts */}
      <AccountsHeadline summary={balanceSummary} />

      <AccountFilters value={filter} onChange={onFilterChange} />

      {visibleAccounts.length > 0 ? (
        <AccountCarousel3D
          accounts={visibleAccounts}
          activeIndex={Math.min(activeIndex, visibleAccounts.length - 1)}
          onActiveChange={onActiveChange}
          requestedIndex={requestedIndex}
          onRequestIndex={onRequestIndex}
        />
      ) : (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Link a bank or card to start tracking your money."
        />
      )}

      {details && <AccountDetailsSection details={details} />}

      <PortfolioSummarySection portfolio={portfolioSummary} accounts={accounts} />

      <BillsSection bills={upcomingBills} />

      <SmartInsights insights={accountInsights} />
    </MobileShell>
  )
}

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <span
            className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden="true"
          />
          <span className="sr-only">Loading accounts</span>
        </div>
      }
    >
      <AccountsPageContent />
    </Suspense>
  )
}
