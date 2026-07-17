'use client'

import { IconButton } from '@/src/shared/components/icon-button'
import { MobileShell } from '@/src/shared/components/mobile-shell'
import { PageHeader } from '@/src/shared/components/page-header'
import { CategoryExplorer } from '@/src/features/categories/components/category-explorer'
import { SpendHero } from '@/src/features/categories/sections/spend-hero'
import { SpendingInsight } from '@/src/features/categories/sections/spending-insight'
import { categories, categoryPageSummary } from '@/src/lib/data'
import { Search, SlidersHorizontal } from 'lucide-react'

export default function CategoriesPage() {
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
        totalSpent={categoryPageSummary.totalSpent}
        changePercent={categoryPageSummary.changePercent}
        month={categoryPageSummary.month}
        currency={categoryPageSummary.currency}
      />

      <CategoryExplorer categories={categories} currency={categoryPageSummary.currency} />

      <SpendingInsight
        savedAmount={categoryPageSummary.savedAmount}
        comparedCategory={categoryPageSummary.comparedCategory}
        currency={categoryPageSummary.currency}
      />
    </MobileShell>
  )
}
