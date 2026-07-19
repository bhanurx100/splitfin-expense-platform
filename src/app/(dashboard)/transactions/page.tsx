'use client'

import { TransactionActions } from '@/src/features/transactions/components/transaction-actions'
import { FlowSummary } from '@/src/features/transactions/sections/flow-summary'
import { TransactionTimeline } from '@/src/features/transactions/sections/transaction-timeline'
import { monthGroups, transactionSummary } from '@/src/lib/data'
import { FilterChips } from '@/src/shared/components/filter-chips'
import { IconButton } from '@/src/shared/components/icon-button'
import { MobileShell } from '@/src/shared/components/mobile-shell'
import { PageHeader } from '@/src/shared/components/page-header'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

const validTypes = new Set(['all', 'income', 'expense', 'transfer', 'refund'])

function TransactionsContent() {
  const searchParams = useSearchParams()
  const [type, setType] = useState('all')

  // Deep links (e.g. Overview → /transactions?type=income) land pre-filtered.
  useEffect(() => {
    const param = searchParams.get('type')
    if (param && validTypes.has(param)) setType(param)
  }, [searchParams])

  const typeOptions = useMemo(() => {
    const all = monthGroups.flatMap((g) => g.transactions)
    const count = (pred: (t: (typeof all)[number]) => boolean) => all.filter(pred).length
    return [
      { id: 'all', label: 'All', count: all.length },
      { id: 'income', label: 'Income', count: count((t) => t.type === 'income' || t.type === 'refund') },
      { id: 'expense', label: 'Expense', count: count((t) => t.type === 'expense') },
      { id: 'transfer', label: 'Transfer', count: count((t) => t.type === 'transfer') },
      { id: 'refund', label: 'Refund', count: count((t) => t.type === 'refund') },
    ]
  }, [])

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

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionsContent />
    </Suspense>
  )
}
