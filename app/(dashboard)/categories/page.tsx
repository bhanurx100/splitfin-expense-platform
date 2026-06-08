"use client";
/**
 * app/(dashboard)/categories/page.tsx — TARGET COMPOSITION
 *
 * Categories derived from transactions as single source of truth.
 */

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { PageContainer } from "@/shared/navigation/PageContainer";
import { SkeletonPageHeader, SkeletonGrid } from "@/shared/skeletons";
import { CategoryStatsRow } from "@/features/categories/sections/CategoryStatsRow";
import { CategoryTableSection } from "@/features/categories/sections/CategoryTableSection";
import { useTransactions } from "@/hooks/use-transactions";
import { getCategories } from "@/lib/transaction-selectors";

function CategoriesSkeleton() {
  return (
    <PageContainer>
      <SkeletonPageHeader />
      <SkeletonGrid cols={2} rows={1} />
    </PageContainer>
  );
}

export default function CategoriesPage() {
  const { data: transactions, isLoading } = useTransactions();
  const newCategory = useNewCategory();

  const categories = useMemo(() => {
    if (!transactions) return [];
    return getCategories(transactions);
  }, [transactions]);

  if (isLoading) return <CategoriesSkeleton />;

  // Convert CategoryData to the format expected by CategoryTableSection
  const tableCategories = categories.map(cat => ({
    id: cat.name,
    name: cat.name,
    totalSpent: cat.totalSpent,
    transactionCount: cat.transactionCount,
    percentage: cat.percentage,
  }));

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between lg:mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">Categories</h1>
          <p className="mt-0.5 text-sm text-slate-500">Track where your money goes</p>
        </div>
        <Button onClick={newCategory.onOpen} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="space-y-6 lg:space-y-8">
        <CategoryStatsRow />
        <CategoryTableSection
          categories={tableCategories}
          onDelete={() => {}} // No delete for CSV-derived categories
          onAdd={newCategory.onOpen}
          isDisabled={false}
        />
      </div>
    </PageContainer>
  );
}