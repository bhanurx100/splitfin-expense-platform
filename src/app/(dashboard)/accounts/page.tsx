'use client'

import { IconButton } from '@/src/shared/components/icon-button'
import { MobileShell } from '@/src/shared/components/mobile-shell'
import { PageHeader } from '@/src/shared/components/page-header'
import { AccountCarousel3D } from '@/src/features/accounts/components/account-carousel-3d'
import { AccountDetailsSection } from '@/src/features/accounts/components/account-details'
import { AccountFilters, type AccountFilter } from '@/src/features/accounts/components/account-filters'
import { BillsSection } from '@/src/features/accounts/sections/bills-section'
import { PortfolioSummarySection } from '@/src/features/accounts/sections/portfolio-summary'
import { SmartInsights } from '@/src/features/accounts/sections/smart-insights'
import {
  accountDetailsById,
  accountInsights,
  accounts,
  greeting,
  portfolioSummary,
  upcomingBills,
} from '@/src/lib/data'
import { Bell, Plus } from 'lucide-react'
import { useCallback, useState } from 'react'

export default function AccountsPage() {
  const [filter, setFilter] = useState<AccountFilter>('all')
  const [activeIndex, setActiveIndex] = useState(0)

  const visibleAccounts =
    filter === 'all' ? accounts : accounts.filter((account) => account.type === filter)

  const onFilterChange = (next: AccountFilter) => {
    setFilter(next)
    setActiveIndex(0)
  }

  const onActiveChange = useCallback((index: number) => setActiveIndex(index), [])

  const activeAccount = visibleAccounts[Math.min(activeIndex, visibleAccounts.length - 1)]
  const details = activeAccount ? accountDetailsById[activeAccount.id] : undefined

  return (
    <MobileShell>
      <PageHeader
        title="Accounts"
        subtitle="All your money, in one place"
        actions={
          <>
            <IconButton icon={Bell} label="Notifications" badge={greeting.unreadNotifications} />
            <IconButton icon={Plus} label="Add account" className="bg-primary/20 text-primary" />
          </>
        }
      />

      <AccountFilters value={filter} onChange={onFilterChange} />

      {visibleAccounts.length > 0 ? (
        <AccountCarousel3D
          accounts={visibleAccounts}
          activeIndex={Math.min(activeIndex, visibleAccounts.length - 1)}
          onActiveChange={onActiveChange}
        />
      ) : (
        <p className="glass rounded-xl p-6 text-center text-sm text-muted-foreground">
          No accounts in this category yet.
        </p>
      )}

      {details && <AccountDetailsSection details={details} />}

      <PortfolioSummarySection portfolio={portfolioSummary} />

      <BillsSection bills={upcomingBills} />

      <SmartInsights insights={accountInsights} />
    </MobileShell>
  )
}
