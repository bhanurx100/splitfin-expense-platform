"use client";
/**
 * features/categories/sections/CategoryTableSection.tsx
 *
 * Section: desktop data table + mobile summary card.
 * Extracted from app/(dashboard)/categories/page.tsx.
 */

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { columns } from "@/app/(dashboard)/categories/columns";

type Category = { id: string; name: string };

type Props = {
  categories:   Category[];
  onDelete:     (ids: string[]) => void;
  onAdd:        () => void;
  isDisabled:   boolean;
};

export function CategoryTableSection({ categories, onDelete, onAdd, isDisabled }: Props) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:block lg:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-800">All Categories</h2>
        </div>
        <DataTable
          filterKey="name"
          columns={columns}
          data={categories}
          onDelete={(rows) => onDelete(rows.map((r) => r.original.id))}
          disabled={isDisabled}
        />
      </div>

      {/* Mobile summary */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </p>
            <p className="text-xs text-slate-400">Tap the chart to explore spending</p>
          </div>
          <Button size="sm" onClick={onAdd} className="gap-1.5 rounded-xl">
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>
      </div>
    </>
  );
}