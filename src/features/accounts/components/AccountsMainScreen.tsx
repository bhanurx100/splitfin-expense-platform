"use client";

import { IconButton } from '@/src/shared/components/icon-button'
import { MobileShell } from '@/src/shared/components/mobile-shell'
import { PageHeader } from '@/src/shared/components/page-header'
import { AccountCarousel3D } from '@/src/features/accounts/components/account-carousel-3d'
import { AccountDetailsSection } from '@/src/features/accounts/components/account-details'
import { AccountFilters, type AccountFilter } from '@/src/features/accounts/components/account-filters'
import { BillsSection } from '@/src/features/accounts/sections/bills-section'
import { PortfolioSummarySection } from '@/src/features/accounts/sections/portfolio-summary'
import { SmartInsights } from '@/src/features/accounts/sections/smart-insights'
import { useNewAccount } from '@/src/features/accounts/hooks/use-new-account'
import { useTransactions } from '@/src/hooks/use-transactions'
import { getAccounts, type AccountData } from '@/src/lib/transaction-selectors'
import type { AccountPreview, AccountDetails, PortfolioSummary, Bill, Insight } from '@/src/types/transaction'
import { Bell, Plus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

export function AccountsMainScreen() {
  const { data: transactions, isLoading } = useTransactions()
  const newAccount = useNewAccount()
  const [filter, setFilter] = useState<AccountFilter>('all')
  const [activeIndex, setActiveIndex] = useState(0)

  // Preserve existing Repository A data flow
  const accountsData: AccountData[] = useMemo(() => {
    if (!transactions) return []
    return getAccounts(transactions)
  }, [transactions])

  // Map AccountData to AccountPreview for premium UI
  const accounts: AccountPreview[] = useMemo(() => {
    return accountsData.map((acc) => ({
      id: acc.id,
      name: acc.name,
      institution: acc.name, // TODO: Add institution field to AccountData or derive from account name
      type: 'bank', // TODO: Add type field to AccountData
      balance: acc.balance,
      monthlyChangePercent: 0, // TODO: Calculate from transaction history
      currency: 'INR',
      isPrimary: acc.balance === Math.max(...accountsData.map(a => a.balance)),
      maskedNumber: undefined, // TODO: Add masked number to AccountData
      lastSynced: 'Just now',
    }))
  }, [accountsData])

  const visibleAccounts =
    filter === 'all' ? accounts : accounts.filter((account) => account.type === filter)

  const onFilterChange = (next: AccountFilter) => {
    setFilter(next)
    setActiveIndex(0)
  }

  const onActiveChange = useCallback((index: number) => setActiveIndex(index), [])

  const activeAccount = visibleAccounts[Math.min(activeIndex, visibleAccounts.length - 1)]

  // TODO: Create selector for account details by ID
  const details: AccountDetails | undefined = activeAccount ? {
    accountId: activeAccount.id,
    currency: activeAccount.currency,
    primaryAmountLabel: 'Available Balance',
    primaryAmount: activeAccount.balance,
    secondaryAmountLabel: 'Total Credits',
    secondaryAmount: 0, // TODO: Get from AccountData.credits
    progressPercent: 50, // TODO: Calculate based on limits or usage
    footnoteLabel: 'Last Transaction',
    footnoteValue: 'Recent', // TODO: Format from AccountData.lastTransaction
    fields: [
      { id: 'type', label: 'Account Type', value: activeAccount.type, icon: 'landmark' },
      { id: 'balance', label: 'Balance', value: `₹${activeAccount.balance.toLocaleString()}`, icon: 'banknote' },
    ],
  } : undefined

  // TODO: Create selector for portfolio summary
  const portfolio: PortfolioSummary = {
    totalValue: accountsData.reduce((sum, acc) => sum + acc.balance, 0),
    todaysChange: 0,
    todaysChangePercent: 0,
    holdings: accountsData.length,
    totalGain: 0,
    totalGainPercent: 0,
    sparkline: [10, 20, 15, 25, 30, 25, 35, 40],
    currency: 'INR',
  }

  // TODO: Create selector for upcoming bills
  const bills: Bill[] = []

  // TODO: Create selector for account insights
  const insights: Insight[] = []

  if (isLoading) {
    return (
      <MobileShell>
        <PageHeader
          title="Accounts"
          subtitle="All your money, in one place"
          actions={
            <>
              <IconButton icon={Bell} label="Notifications" badge={3} />
              <IconButton icon={Plus} label="Add account" className="bg-primary/20 text-primary" onClick={newAccount.onOpen} />
            </>
          }
        />
        <div className="glass rounded-xl p-6 text-center text-sm text-muted-foreground">
          Loading accounts...
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell>
      <PageHeader
        title="Accounts"
        subtitle="All your money, in one place"
        actions={
          <>
            <IconButton icon={Bell} label="Notifications" badge={3} />
            <IconButton icon={Plus} label="Add account" className="bg-primary/20 text-primary" onClick={newAccount.onOpen} />
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

      <PortfolioSummarySection portfolio={portfolio} />

      {bills.length > 0 && <BillsSection bills={bills} />}

      {insights.length > 0 && <SmartInsights insights={insights} />}
    </MobileShell>
  )
}
