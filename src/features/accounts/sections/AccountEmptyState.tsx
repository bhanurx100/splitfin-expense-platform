"use client";
/**
 * features/accounts/sections/AccountEmptyState.tsx
 *
 * Section: empty state shown when user has no accounts.
 * Extracted from app/(dashboard)/accounts/page.tsx.
 */

import { motion } from "framer-motion";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type Props = { onAdd: () => void };

export function AccountEmptyState({ onAdd }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-2xl border border-dashed border-[var(--border-strong)]",
        "bg-[var(--surface-card)] px-8 py-16 shadow-[var(--shadow-card)]",
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-overlay)]">
        <Wallet className="h-6 w-6 text-[var(--text-muted)]" strokeWidth={1.5} />
      </div>
      <h3 className="mb-1 text-[15px] font-semibold text-[var(--text-primary)]">No accounts yet</h3>
      <p className="mb-6 max-w-[240px] text-[13px] leading-relaxed text-[var(--text-muted)]">
        Add your first account to start tracking your finances across banks and cards.
      </p>
      <Button onClick={onAdd} className="gap-2 rounded-xl">
        <Plus className="h-4 w-4" />
        Add Account
      </Button>
    </motion.div>
  );
}