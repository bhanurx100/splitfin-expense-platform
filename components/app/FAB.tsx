"use client";

// components/app/FAB.tsx
// Single-purpose FAB — tapping always opens "Add Transaction".
// The expand-to-menu pattern is gone; a single blue circle is cleaner
// and matches the reference screens exactly.

import { Plus } from "lucide-react";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";

export function FAB() {
  const { onOpen } = useNewTransaction();
  return (
    <button
      aria-label="Add transaction"
      onClick={onOpen}
      className="fixed bottom-[72px] left-1/2 z-50 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-500/40 transition-all duration-200 active:scale-90 hover:bg-blue-700"
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </button>
  );
}