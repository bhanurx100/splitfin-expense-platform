"use client";

// app/(dashboard)/transactions/page.tsx

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { transactions as transactionSchema } from "@/db/schema";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";

import { TransactionList } from "@/components/dashboard/TransactionList";
import { columns } from "./columns";
import { ImportCard } from "./import-card";
import { UploadButton } from "./upload-button";

// ─── Variants ─────────────────────────────────────────
enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}
const INITIAL_IMPORT_RESULTS = { data: [], errors: [], meta: [] };

// ─── Page ─────────────────────────────────────────────
const TransactionsPage = () => {
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);

  const [AccountDialog, confirm] = useSelectAccount();
  const newTransaction = useNewTransaction();
  const createTransactions = useBulkCreateTransactions();
  const deleteTransactions = useBulkDeleteTransactions();
  const transactionsQuery = useGetTransactions();
  const transactions = transactionsQuery.data || [];

  const isDisabled =
    transactionsQuery.isLoading || deleteTransactions.isPending;

  // ── Handlers ───────────────────────────────────────
  const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    setImportResults(results);
    setVariant(VARIANTS.IMPORT);
  };

  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST);
  };

  const onSubmitImport = async (
    values: (typeof transactionSchema.$inferInsert)[]
  ) => {
    const accountId = await confirm();
    if (!accountId)
      return toast.error("Please select an account to continue.");
    const data = values.map((v) => ({
      ...v,
      accountId: accountId as string,
    }));
    createTransactions.mutate(data, { onSuccess: onCancelImport });
  };

  // ── Loading ────────────────────────────────────────
  if (transactionsQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl pb-10 px-4 lg:px-10 pt-6">
        <div className="mb-4 rounded-3xl bg-white p-5 shadow-md">
          <Skeleton className="mb-4 h-6 w-40" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mb-3 flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>

        <div className="hidden rounded-3xl bg-white p-5 shadow-md lg:block">
          <div className="mb-5 flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
          </div>
        </div>
      </div>
    );
  }

  // ── Import ─────────────────────────────────────────
  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <AccountDialog />
        <ImportCard
          data={importResults.data}
          onCancel={onCancelImport}
          onSubmit={onSubmitImport}
        />
      </>
    );
  }

  // ── Main ───────────────────────────────────────────
  return (
    <div className="page-enter w-full pb-12">
      
      {/* HEADER */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 px-4 py-6 text-white lg:px-10 lg:py-8">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold lg:text-2xl">
              Transactions
            </h1>
            <p className="text-xs text-blue-100 lg:text-sm">
              {transactions.length} total
            </p>
          </div>

          <Button
            size="sm"
            onClick={newTransaction.onOpen}
            className="rounded-xl bg-white/20 backdrop-blur transition-all duration-200 hover:bg-white/30 hover:scale-105 active:scale-95"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* CONTENT (NO OVERLAP NOW) */}
      <div className="mx-auto mt-8 w-full max-w-screen-2xl px-4 lg:px-10">
        
        {/* Mobile */}
        <div className="mb-4 lg:hidden">
          <TransactionList maxItems={20} />
        </div>

        {/* Desktop */}
        <div className="hidden lg:block">
          <div className="rounded-3xl bg-white p-5 shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg">
            
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Transaction History
              </h2>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={newTransaction.onOpen}
                  className="rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new
                </Button>

                <UploadButton onUpload={onUpload} />
              </div>
            </div>

            <DataTable
              filterKey="payee"
              columns={columns}
              data={transactions}
              onDelete={(row) => {
                const ids = row.map((r) => r.original.id);
                deleteTransactions.mutate({ ids });
              }}
              disabled={isDisabled}
            />
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="mt-6 flex flex-col gap-3 lg:hidden">
          <div className="rounded-3xl bg-white p-4 shadow-md transition-all duration-200 hover:shadow-lg">
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Import from CSV
            </p>

            <div className="flex gap-3">
              <Button
                size="sm"
                onClick={newTransaction.onOpen}
                className="flex-1 rounded-xl transition-all duration-200 active:scale-95"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add new
              </Button>

              <UploadButton onUpload={onUpload} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;