'use client'

import { CategoryExplorer } from '@/src/features/categories/components/category-explorer'
import { SpendHero } from '@/src/features/categories/sections/spend-hero'
import { SpendingInsight } from '@/src/features/categories/sections/spending-insight'
import {
  availableMonths,
  categoryInsight,
  getCategoriesForMonth,
  getCategoryPageSummaryForMonth,
} from '@/src/lib/data'
import { IconButton } from '@/src/shared/components/icon-button'
import { MobileShell } from '@/src/shared/components/mobile-shell'
import { PageHeader } from '@/src/shared/components/page-header'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'

function CategoriesContent() {
  const searchParams = useSearchParams()
  // Deep links (e.g. Overview → /categories?category=shopping) pre-select.
  const initialCategory = searchParams.get('category')

  // Month switching — every month with activity is explorable. All figures
  // on the page (hero, ring, explorer) derive from the selected month.
  const [monthIndex, setMonthIndex] = useState(0)
  const month = availableMonths[Math.min(monthIndex, availableMonths.length - 1)]
  const categories = useMemo(() => getCategoriesForMonth(month.key), [month.key])
  const summary = useMemo(() => getCategoryPageSummaryForMonth(month.key), [month.key])

  return (
    <MobileShell>
      <PageHeader
        title="Categories"
        subtitle="Understand where your money goes"
        actions={
          <>
            <IconButton icon={Search} label="Search categories" />
            <IconButton icon={SlidersHorizontal} label="Category filters" badge={1} />
          </>
        }
      />

      <SpendHero
        categories={categories}
        totalSpent={summary.totalSpent}
        changePercent={summary.changePercent}
        month={summary.month}
        currency={summary.currency}
        initialSelectedId={initialCategory}
        canPrevMonth={monthIndex < availableMonths.length - 1}
        canNextMonth={monthIndex > 0}
        onPrevMonth={() => setMonthIndex((i) => Math.min(i + 1, availableMonths.length - 1))}
        onNextMonth={() => setMonthIndex((i) => Math.max(i - 1, 0))}
      />

      <CategoryExplorer categories={categories} currency={summary.currency} />

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
