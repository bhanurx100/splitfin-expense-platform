'use client'

import { QuickActions, type QuickAction } from '@/src/shared/components/quick-actions'
import { CreditCard, Landmark, LayoutGrid, Nfc, Wallet } from 'lucide-react'
import { useMemo } from 'react'

export type AccountFilter = 'all' | 'bank' | 'credit-card' | 'debit-card' | 'wallet'

/**
 * Account type filters rendered as premium circular shortcuts — the
 * same interaction language as the app's quick actions, with the
 * active filter lit. Replaces the old dashboard chip row.
 */
export function AccountFilters({
  value,
  onChange,
}: {
  value: AccountFilter
  onChange: (value: AccountFilter) => void
}) {
  const actions = useMemo<QuickAction[]>(
    () => [
      { id: 'all', icon: LayoutGrid, label: 'All', tone: 'primary', onClick: () => onChange('all') },
      { id: 'bank', icon: Landmark, label: 'Bank', tone: 'primary', onClick: () => onChange('bank') },
      { id: 'credit-card', icon: CreditCard, label: 'Credit', tone: 'info', onClick: () => onChange('credit-card') },
      { id: 'debit-card', icon: Nfc, label: 'Debit', tone: 'warning', onClick: () => onChange('debit-card') },
      { id: 'wallet', icon: Wallet, label: 'Wallets', tone: 'positive', onClick: () => onChange('wallet') },
    ],
    [onChange],
  )

  return (
    <section aria-label="Filter accounts by type">
      <QuickActions actions={actions} activeId={value} />
    </section>
  )
}
