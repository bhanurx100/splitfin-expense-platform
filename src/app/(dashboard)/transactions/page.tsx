"use client";

/**
 * app/(dashboard)/transactions/page.tsx
 *
 * Composition root — no inline UI.
 * All logic and rendering delegated to feature sections.
 * Uses canonical Transaction[] as single source of truth.
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";

import { transactions as transactionSchema } from "@/src/db/schema";
import { useSelectAccount } from "@/src/features/accounts/hooks/use-select-account";
import { useBulkCreateTransactions } from "@/src/features/transactions/api/use-bulk-create-transactions";
import { useBulkDeleteTransactions } from "@/src/features/transactions/api/use-bulk-delete-transactions";
import { useGetTransactions } from "@/src/features/transactions/api/use-get-transactions";
import { useNewTransaction } from "@/src/features/transactions/hooks/use-new-transaction";
import { INITIAL_IMPORT } from "@/src/features/transactions/constants";
import type { Tx } from "@/src/features/transactions/lib/filters";

import { ImportCard } from "./import-card";
import { TransactionsSkeleton } from "@/src/features/transactions/sections/TransactionsSkeleton";
import { createAuroraTransactionFeed } from "@/src/features/transactions/aurora/adapter";
import { AuroraTransactions } from "@/src/features/transactions/aurora/transactions";

enum VIEW {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

export default function TransactionsPage() {
  const [view, setView] = useState<VIEW>(VIEW.LIST);
  const [importData, setImportData] = useState(INITIAL_IMPORT);
  const [AccountDialog, confirmAccount] = useSelectAccount();
  const newTx = useNewTransaction();
  const bulkCreate = useBulkCreateTransactions();
  const bulkDelete = useBulkDeleteTransactions();
  const txQuery = useGetTransactions();
  const transactions = (txQuery.data ?? []) as Tx[];
  const isDisabled = txQuery.isLoading || bulkDelete.isPending;

  const onUpload = useCallback((r: typeof INITIAL_IMPORT) => {
    setImportData(r);
    setView(VIEW.IMPORT);
  }, []);

  const onCancelImport = useCallback(() => {
    setImportData(INITIAL_IMPORT);
    setView(VIEW.LIST);
  }, []);

  const onSubmitImport = useCallback(
    async (values: (typeof transactionSchema.$inferInsert)[]) => {
      const accountId = await confirmAccount();
      if (!accountId)
        return toast.error("Please select an account to continue.");
      bulkCreate.mutate(
        values.map((v) => ({ ...v, accountId: accountId as string })),
        { onSuccess: onCancelImport }
      );
    },
    [confirmAccount, bulkCreate, onCancelImport]
  );

  if (view === VIEW.IMPORT) {
    return (
      <>
        <AccountDialog />
        <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <ImportCard
            data={importData.data}
            onCancel={onCancelImport}
            onSubmit={onSubmitImport}
          />
        </div>
      </>
    );
  }

  if (txQuery.isLoading) return <TransactionsSkeleton />;

  return (
    <>
      <AccountDialog />
      <AuroraTransactions feed={createAuroraTransactionFeed(transactions)} onNewTransaction={newTx.onOpen} />
    </>
  );
}
