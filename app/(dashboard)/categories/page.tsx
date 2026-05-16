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
      <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex items-center justify-between lg:mb-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl bg-white p-5 shadow-sm lg:p-6"
            >
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
    <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between lg:mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">
            Categories
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Track where your money goes
          </p>
        </div>
        <Button onClick={newCategory.onOpen} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="space-y-6 lg:space-y-8">
        {/* ── Charts row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CategoryChart />
          <CategorySummaryList />
        </div>

        {/* ── Desktop table ─────────────────────────────────────────────── */}
        <div className="hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:block lg:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-slate-800">
              All Categories
            </h2>
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

        {/* ── Mobile summary card ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {categories.length}{" "}
                {categories.length === 1 ? "category" : "categories"}
              </p>
              <p className="text-xs text-slate-400">
                Tap the chart to explore spending
              </p>
            </div>
            <Button
              size="sm"
              onClick={newCategory.onOpen}
              className="gap-1.5 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;