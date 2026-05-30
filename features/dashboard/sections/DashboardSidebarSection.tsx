"use client";

/**
 * Desktop-only right sidebar (hidden on mobile).
 * Composes:
 *   - SplitPayCard       (Zustand, self-contained)
 *   - CategoryProgressList
 *   - TransactionsShortcutCard

 */

import { SplitPayCard }              from "@/features/dashboard/components/SplitPayCard";
import { CategoryProgressList }      from "@/features/dashboard/components/CategoryProgressList";
import { TransactionsShortcutCard }  from "@/features/dashboard/components/TransactionsShortcutCard";

type Category = { name: string; value: number };

type Props = {
  categories: Category[];
};

export function DashboardSidebarSection({ categories }: Props) {
  return (
    <div className="hidden space-y-4 lg:block lg:space-y-5">
      <SplitPayCard />

      {categories.length > 0 && (
        <CategoryProgressList categories={categories} />
      )}

      <TransactionsShortcutCard />
    </div>
  );
}