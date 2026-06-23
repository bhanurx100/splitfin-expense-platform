"use client";
/**
 * features/categories/sections/CategoryStatsRow.tsx
 *
 * Section: chart + summary list side by side.
 * Extracted from app/(dashboard)/categories/page.tsx.
 * Both children are self-fetching (they call their own hooks).
 */

import { CategoryChart } from "@/src/features/categories/components/CategoryChart";
import { CategorySummaryList } from "@/src/features/categories/components/CategorySummaryList";

export function CategoryStatsRow() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <CategoryChart />
      <CategorySummaryList />
    </div>
  );
}