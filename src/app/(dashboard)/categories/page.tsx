'use client'

import { CategoryExplorer } from '@/src/features/categories/components/category-explorer'
import { SpendingInsight } from '@/src/features/categories/sections/spending-insight'
import {
  availableMonths,
  categoryInsight,
  getCategoriesForMonth,
} from '@/src/lib/data'
import { IconButton } from '@/src/shared/components/icon-button'
import { MobileShell } from '@/src/shared/components/mobile-shell'
import { PageHeader } from '@/src/shared/components/page-header'
import { Bell, Search } from 'lucide-react'
import { Suspense, useMemo, useState } from 'react'

type Period = '1M' | '3M' | '6M' | '1Y' | 'All'

function CategoriesContent() {
  // Deep links (e.g. Overview → /categories?category=shopping) pre-select.

  // Month switching — every month with activity is explorable. All figures
  // on the page (hero, ring, explorer) derive from the selected month.
  const [monthIndex, setMonthIndex] = useState(0)
  const [period, setPeriod] = useState<Period>('1M')
  const month = availableMonths[Math.min(monthIndex, availableMonths.length - 1)]
  const categories = useMemo(() => getCategoriesForMonth(month.key), [month.key])

  return (
    <MobileShell>
      <PageHeader
        title="Categories"
        subtitle="Understand where your money goes"
        actions={
          <>
            <IconButton icon={Search} label="Search categories" />
            <IconButton icon={Bell} label="Notifications" />
          </>
        }
      />

      <CategoryExplorer
        categories={categories}
        currency="INR"
        period={period}
        onPeriodChange={(next) => {
          setPeriod(next)
          const offsets: Record<Period, number> = { '1M': 0, '3M': 2, '6M': 5, '1Y': 11, All: availableMonths.length - 1 }
          setMonthIndex(Math.min(offsets[next], availableMonths.length - 1))
        }}
      />

      <SpendingInsight insight={categoryInsight} />
    </MobileShell>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <span
            className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden="true"
          />
          <span className="sr-only">Loading categories</span>
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  )
}
