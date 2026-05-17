"use client";
// app/(dashboard)/accounts/page.tsx
//
// Refactored layout:
//   1. Page header — title + Add Account button
//   2. Account cards grid (kept, refined)
//   3. Account Insights section (replaces duplicate table)
//   NO FAB — accounts page does not need floating action button

import { Plus, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
//import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete-accounts";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { AccountInsights } from "@/components/dashboard/AccountInsights";
import { cn } from "@/lib/utils";

// ── Skeleton state ─────────────────────────────────────────────────────────────

function AccountsPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between lg:mb-8">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Cards skeleton */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[112px] animate-pulse rounded-2xl bg-[var(--surface-overlay)]"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>

      {/* Insights skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-[var(--surface-overlay)]"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyAccounts({ onAdd }: { onAdd: () => void }) {
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
      <div className={cn(
        "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
        "bg-[var(--surface-overlay)]",
      )}>
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

// ── Page ───────────────────────────────────────────────────────────────────────

const AccountsPage = () => {
  const newAccount = useNewAccount();
  const accountsQuery = useGetAccounts();
  const accounts = accountsQuery.data ?? [];

  if (accountsQuery.isLoading) {
    return <AccountsPageSkeleton />;
  }

  return (
    /*
     * Bottom padding:
     *   - mobile: pb-28 clears FAB (56px) + bottom nav (56px) + gap
     *     However, this page does NOT render a FAB, so pb-20 is enough
     *     for bottom nav + safe area
     *   - desktop: pb-8 standard
     */
    <div className="mx-auto w-full max-w-screen-xl px-4 pb-20 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-7">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-5 flex items-center justify-between lg:mb-7"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] lg:text-2xl">
            Accounts
          </h1>
          <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">
            {accounts.length === 0
              ? "Manage your financial accounts"
              : `${accounts.length} account${accounts.length !== 1 ? "s" : ""} connected`}
          </p>
        </div>

        <Button
          onClick={newAccount.onOpen}
          className="gap-2 rounded-xl text-[13px] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Account</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </motion.div>

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {accounts.length === 0 ? (
        <EmptyAccounts onAdd={newAccount.onOpen} />
      ) : (
        <div className="space-y-6 lg:space-y-8">

          {/* ── Account cards grid ─────────────────────────────────────────── */}
          <section>
            {/* Subtle section label */}
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Your Accounts
            </p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.07 } },
              }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence>
                {accounts.map((acc, i) => (
                  <motion.div
                    key={acc.id}
                    variants={{
                      hidden:  { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
                    }}
                  >
                    <AccountCard
                      id={acc.id}
                      name={acc.name}
                      index={i}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </section>

          {/* ── Divider ────────────────────────────────────────────────────── */}
          <div className="h-px bg-[var(--border-subtle)]" />

          {/* ── Account Insights ────────────────────────────────────────────── */}
          <AccountInsights />

        </div>
      )}
    </div>
  );
};

export default AccountsPage;