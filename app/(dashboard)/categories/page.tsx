"use client";

// app/(dashboard)/categories/page.tsx
//
// WHAT CHANGED vs original:
// ─ Added CategoryChart + CategorySummaryList at top (new visual section)
// ─ Mobile: shows chart cards + simplified list (no DataTable on mobile)
// ─ Desktop: chart cards in a 2-col grid + full DataTable below
// ─ Card shell: rounded-3xl + shadow-sm
// ─ Loading state updated to new card style
//
// WHAT IS 100% PRESERVED:
// ─ useGetCategories, useBulkDeleteCategories, useNewCategory hooks
// ─ DataTable with columns, filterKey, onDelete, disabled
// ─ "Add new" button → useNewCategory().onOpen()
// ─ All existing column definitions (./columns) untouched

import { Loader2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useBulkDeleteCategories } from "@/features/categories/api/use-bulk-delete-categories";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";

// New visual components from components/dashboard
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { CategorySummaryList } from "@/components/dashboard/CategorySummaryList";

// Existing page-level file — unchanged
import { columns } from "./columns";

const CategoriesPage = () => {
  const newCategory = useNewCategory();
  const deleteCategories = useBulkDeleteCategories();
  const categoriesQuery = useGetCategories();
  const categories = categoriesQuery.data || [];
  const isDisabled = categoriesQuery.isLoading || deleteCategories.isPending;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (categoriesQuery.isLoading) {
    return (
      <div className="page-enter mx-auto w-full max-w-screen-2xl space-y-4 pb-10 pt-4 lg:-mt-6 lg:pt-0">
         <div className="flex items-center justify-between px-1 lg:hidden">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Categories</h1>
            <p className="text-xs text-gray-400">Track where your money goes</p>
          </div>
        </div>
        {/* Chart cards skeleton */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="animate-pulse rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-28 rounded-xl" />
              </div>
              <div className="flex h-52 items-center justify-center rounded-2xl bg-gray-50">
                <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
              </div>
            </div>
          ))}
        </div>
        {/* Table skeleton — desktop only */}
        <div className="hidden rounded-3xl bg-white p-5 shadow-sm lg:block">
          <Skeleton className="mb-4 h-7 w-32" />
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto -mt-6 w-full max-w-screen-2xl space-y-4 pb-10">

      {/* ── Row 1: CategoryChart + CategorySummaryList ───────────────────────
          Both mobile and desktop show these visual cards.
          Mobile: stacked (grid-cols-1). Desktop: side by side (lg:grid-cols-2). */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoryChart />
        <CategorySummaryList />
      </div>

      {/* ── Row 2: Full management table ─────────────────────────────────────
          Desktop: full DataTable with sort, filter, bulk-delete.
          Mobile:  simplified card with just the "Add new" CTA — the category
                   list above already shows all categories visually. */}

      {/* Desktop DataTable */}
      <div className="hidden rounded-3xl bg-white p-5 shadow-sm lg:block">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">All Categories</h2>
          <Button size="sm" onClick={newCategory.onOpen} className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Add new
          </Button>
        </div>
        <DataTable
          filterKey="name"
          columns={columns}
          data={categories}
          onDelete={(row) => {
            const ids = row.map((r) => r.original.id);
            deleteCategories.mutate({ ids });
          }}
          disabled={isDisabled}
        />
      </div>

      {/* Mobile action card */}
      <div className="rounded-3xl bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </p>
            <p className="text-xs text-gray-400">Tap the chart to explore spending</p>
          </div>
          <Button size="sm" onClick={newCategory.onOpen} className="rounded-xl transition-all duration-200 active:scale-95">
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;