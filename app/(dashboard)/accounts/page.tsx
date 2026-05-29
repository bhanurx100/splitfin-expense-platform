"use client";
/**
 * app/(dashboard)/accounts/page.tsx — TARGET COMPOSITION
 *
 * This shows how the page should look AFTER migration.
 * Currently the sections are ready in features/accounts/sections/.
 * Swap in incrementally — no big-bang rewrite needed.
 *
 * Before: ~160 lines of inline skeleton + empty state + card grid + insights
 * After:  ~40 lines, imports only
 *
 * TO ACTIVATE: copy this file over app/(dashboard)/accounts/page.tsx
 */

import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useNewAccount }  from "@/features/accounts/hooks/use-new-account";
import { AccountInsights } from "@/components/dashboard/AccountInsights";
import { PageContainer }   from "@/shared/navigation/PageContainer";
import { AccountGrid }      from "@/features/accounts/sections/AccountGrid";
import { AccountEmptyState } from "@/features/accounts/sections/AccountEmptyState";
 
import {
  SkeletonPageHeader,
  SkeletonGrid,
} from "@/shared/skeletons/index";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function AccountsPageSkeleton() {
  return (
    <PageContainer>
      <SkeletonPageHeader />
      <SkeletonGrid cols={3} rows={1} />
    </PageContainer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const newAccount    = useNewAccount();
  const accountsQuery = useGetAccounts();
  const accounts      = accountsQuery.data ?? [];

  if (accountsQuery.isLoading) return <AccountsPageSkeleton />;

  return (
    <PageContainer>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
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
        <Button onClick={newAccount.onOpen} className="gap-2 rounded-xl text-[13px] shadow-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Account</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </motion.div>

      {/* Content */}
      {accounts.length === 0 ? (
        <AccountEmptyState onAdd={newAccount.onOpen} />
      ) : (
        <div className="space-y-6 lg:space-y-8">
          <AccountGrid accounts={accounts} />
          <div className="h-px bg-[var(--border-subtle)]" />
          <AccountInsights />
        </div>
      )}
    </PageContainer>
  );
}