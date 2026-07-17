'use client'

import { FilterChips } from '@/src/shared/components/filter-chips'
import { IconButton } from '@/src/shared/components/icon-button'
import { MobileShell } from '@/src/shared/components/mobile-shell'
import { PageHeader } from '@/src/shared/components/page-header'
import { TransactionActions } from '@/src/features/transactions/components/transaction-actions'
import { FlowSummary } from '@/src/features/transactions/sections/flow-summary'
import { TransactionTimeline } from '@/src/features/transactions/sections/transaction-timeline'
import { monthGroups, transactionSummary } from '@/src/lib/data'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

const typeOptions = [
  { id: 'all', label: 'All' },
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expense' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'refund', label: 'Refund' },
]

export default function TransactionsPage() {
  const [type, setType] = useState('all')

  return (
    <MobileShell>
      <PageHeader
        title="Transactions"
        subtitle="Your money stories"
        actions={
          <>
            <IconButton icon={Search} label="Search transactions" />
            <IconButton icon={SlidersHorizontal} label="Transaction filters" />
          </>
        }
      />

      <FlowSummary summary={transactionSummary} />

      <TransactionActions />

      <FilterChips
        options={typeOptions}
        value={type}
        onChange={setType}
        layoutId="transaction-type-chip"
        ariaLabel="Filter transactions by type"
      />

      <TransactionTimeline groups={monthGroups} activeType={type} />
    </MobileShell>
  )
}
