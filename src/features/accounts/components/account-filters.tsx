'use client'

import { FilterChips } from '@/src/shared/components/filter-chips'

export type AccountFilter = 'all' | 'bank' | 'credit-card' | 'debit-card' | 'wallet'

const options = [
  { id: 'all', label: 'All' },
  { id: 'bank', label: 'Bank' },
  { id: 'credit-card', label: 'Credit Cards' },
  { id: 'debit-card', label: 'Debit Cards' },
  { id: 'wallet', label: 'Wallets' },
]

export function AccountFilters({
  value,
  onChange,
}: {
  value: AccountFilter
  onChange: (value: AccountFilter) => void
}) {
  return (
    <FilterChips
      options={options}
      value={value}
      onChange={(id) => onChange(id as AccountFilter)}
      layoutId="account-filter"
      ariaLabel="Filter accounts by type"
    />
  )
}
