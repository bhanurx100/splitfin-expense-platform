"use client";

// components/dashboard/BudgetSection.tsx
// Moved from components/mobile/ — no changes.

import { MoreHorizontal, Calendar, Sparkles } from "lucide-react";

export function BudgetSection() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">Budgets</h3>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100"
            aria-label="Pick period"
          >
            <Calendar className="h-4 w-4" />
          </button>
          <button
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <Sparkles className="h-7 w-7 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600">Budgets coming soon</p>
          <p className="mt-0.5 text-xs text-gray-400">
            Set spending limits per category to stay on track
          </p>
        </div>
      </div>
    </div>
  );
}