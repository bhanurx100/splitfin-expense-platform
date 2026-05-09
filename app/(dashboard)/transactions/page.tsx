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

enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}
const INITIAL_IMPORT_RESULTS = { data: [], errors: [], meta: [] };

const TransactionsPage = () => {
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);
  const [AccountDialog, confirm] = useSelectAccount();
  const newTransaction = useNewTransaction();
  const createTransactions = useBulkCreateTransactions();
  const deleteTransactions = useBulkDeleteTransactions();
  const transactionsQuery = useGetTransactions();
  const transactions = transactionsQuery.data || [];
  const isDisabled = transactionsQuery.isLoading || deleteTransactions.isPending;

  const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    setImportResults(results);
    setVariant(VARIANTS.IMPORT);
  };
  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST);
  };
  const onSubmitImport = async (values: (typeof transactionSchema.$inferInsert)[]) => {
    const accountId = await confirm();
    if (!accountId) return toast.error("Please select an account to continue.");
    const data = values.map((v) => ({ ...v, accountId: accountId as string }));
    createTransactions.mutate(data, { onSuccess: onCancelImport });
  };

  if (transactionsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 xl:px-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-7 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <AccountDialog />
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 xl:px-10">
          <ImportCard data={importResults.data} onCancel={onCancelImport} onSubmit={onSubmitImport} />
        </div>
      </>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile header */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 px-4 py-6 text-white lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Transactions</h1>
            <p className="text-xs text-blue-100">{transactions.length} total</p>
          </div>
          <Button size="sm" onClick={newTransaction.onOpen} className="rounded-xl bg-white/20 backdrop-blur hover:bg-white/30">
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Mobile list */}
      <div className="mt-4 px-4 pb-6 lg:hidden">
        <TransactionList maxItems={20} />
        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-slate-700">Import from CSV</p>
          <div className="flex gap-3">
            <Button size="sm" onClick={newTransaction.onOpen} className="flex-1 rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Add new
            </Button>
            <UploadButton onUpload={onUpload} />
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-7xl px-6 py-8 xl:px-10">
          {/* Page header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
              <p className="mt-0.5 text-sm text-slate-500">{transactions.length} total transactions</p>
            </div>
            <div className="flex items-center gap-2">
              <UploadButton onUpload={onUpload} />
              <Button onClick={newTransaction.onOpen} className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
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
      </div>
    </div>
  );
};

export default TransactionsPage;