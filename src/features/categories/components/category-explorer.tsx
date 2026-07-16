'use client'

import { FilterChips } from '@/src/shared/components/filter-chips'
import type { CategorySummary, Currency } from '@/src/types/transaction'
import { useMemo, useState } from 'react'
import { CategoryList } from './category-list'
import { CategoryOrbit } from './category-orbit'

interface CategoryExplorerProps {
  categories: CategorySummary[]
  currency: Currency
}

const groupOptions = [
  { id: 'all', label: 'All' },
  { id: 'needs', label: 'Needs' },
  { id: 'wants', label: 'Wants' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'others', label: 'Others' },
]

export function CategoryExplorer({ categories, currency }: CategoryExplorerProps) {
  const [group, setGroup] = useState('all')

  const filtered = useMemo(
    () => (group === 'all' ? categories : categories.filter((c) => c.group === group)),
    [group, categories],
  )

  return (
    <section aria-label="Explore categories" className="flex flex-col gap-5">
      <h2 className="text-lg font-bold">Explore Categories</h2>
      <FilterChips
        options={groupOptions}
        value={group}
        onChange={setGroup}
        layoutId="category-group-chip"
        ariaLabel="Filter categories by group"
      />
      {filtered.length > 0 ? (
        <>
          <CategoryOrbit categories={filtered} currency={currency} />
          <CategoryList
            categories={[...filtered].sort((a, b) => b.amount - a.amount)}
            currency={currency}
          />
        </>
      ) : (
        <p className="glass rounded-xl p-6 text-center text-sm text-muted-foreground">
          No categories in this group yet.
        </p>
      )}
    </section>
  )
}
