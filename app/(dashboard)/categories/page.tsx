"use client";
/**
 * app/(dashboard)/categories/page.tsx — TARGET COMPOSITION
 *
 * Before: ~100 lines inline (skeleton + chart grid + table + mobile card)
 * After:  ~45 lines, imports only
 *
 * TO ACTIVATE: copy over app/(dashboard)/categories/page.tsx
 */

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBulkDeleteCategories } from "@/features/categories/api/use-bulk-delete-categories";
import { useGetCategories }        from "@/features/categories/api/use-get-categories";
import { useNewCategory }          from "@/features/categories/hooks/use-new-category";
import { PageContainer }           from "@/shared/navigation/PageContainer";
import { SkeletonPageHeader, SkeletonGrid } from "@/shared/skeletons";
import {CategoryStatsRow} from "@/features/categories/sections/CategoryStatsRow";
import { CategoryTableSection } from "@/features/categories/sections/CategoryTableSection";

function CategoriesSkeleton() {
  return (
    <PageContainer>
      <SkeletonPageHeader />
      <SkeletonGrid cols={2} rows={1} />
    </PageContainer>
  );
}

export default function CategoriesPage() {
  const newCategory      = useNewCategory();
  const deleteCategories = useBulkDeleteCategories();
  const categoriesQuery  = useGetCategories();
  const categories       = categoriesQuery.data ?? [];
  const isDisabled       = categoriesQuery.isLoading || deleteCategories.isPending;

  if (categoriesQuery.isLoading) return <CategoriesSkeleton />;

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
          categories={categories}
          onDelete={(ids) => deleteCategories.mutate({ ids })}
          onAdd={newCategory.onOpen}
          isDisabled={isDisabled}
        />
      </div>
    </PageContainer>
  );
}