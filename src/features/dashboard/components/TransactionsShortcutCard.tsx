"use client";

/**
 * features/dashboard/components/TransactionsShortcutCard.tsx
 *
 * Simple link card to the transactions page.
 * Extracted from app/(dashboard)/page.tsx right-sidebar block.
 */

import { memo } from "react";

export const TransactionsShortcutCard = memo(function TransactionsShortcutCard() {
  return (
    <a
      href="/transactions"
      className="flex items-center justify-between rounded-2xl p-4 transition-all duration-200 hover:opacity-80"
      style={{
        background: "var(--surface-card)",
        border:     "1px solid var(--border-default)",
        boxShadow:  "var(--shadow-card)",
      }}
    >
      <div>
        <p className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
          All Transactions
        </p>
        <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
          Search, filter &amp; manage
        </p>
      </div>
      <span className="text-[20px]">📋</span>
    </a>
  );
});