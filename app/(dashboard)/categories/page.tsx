"use client";
// app/(dashboard)/categories/page.tsx
import { Loader2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useBulkDeleteCategories } from "@/features/categories/api/use-bulk-delete-categories";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { CategorySummaryList } from "@/components/dashboard/CategorySummaryList";
import { columns } from "./columns";

const CategoriesPage = () => {
  const newCategory = useNewCategory();
  const deleteCategories = useBulkDeleteCategories();
  const categoriesQuery = useGetCategories();
  const categories = categoriesQuery.data || [];
  const isDisabled = categoriesQuery.isLoading || deleteCategories.isPending;

  if (categoriesQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 xl:px-10">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm">
              <Skeleton className="mb-4 h-5 w-24" />
              <div className="flex h-52 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 xl:px-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="mt-0.5 text-sm text-slate-500">Track where your money goes</p>
        </div>
        <Button onClick={newCategory.onOpen} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryChart />
        <CategorySummaryList />
      </div>

      {/* Desktop table */}
      <div className="hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:block">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">All Categories</h2>
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
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </p>
            <p className="text-xs text-slate-400">Tap the chart to explore spending</p>
          </div>
          <Button size="sm" onClick={newCategory.onOpen} className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;