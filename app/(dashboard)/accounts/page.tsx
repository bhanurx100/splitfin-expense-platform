"use client";
// app/(dashboard)/accounts/page.tsx
import { Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete-accounts";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { columns } from "./columns";

const AccountsPage = () => {
  const newAccount = useNewAccount();
  const deleteAccounts = useBulkDeleteAccounts();
  const accountsQuery = useGetAccounts();
  const accounts = accountsQuery.data || [];
  const isDisabled = accountsQuery.isLoading || deleteAccounts.isPending;

  if (accountsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 xl:px-10">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 xl:px-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your financial accounts</p>
        </div>
        <Button onClick={newAccount.onOpen} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <p className="text-slate-500">No accounts yet</p>
          <Button onClick={newAccount.onOpen} className="mt-4 rounded-xl">
            Add Account
          </Button>
        </div>
      ) : (
        <>
          {/* Account cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {accounts.map((acc, i) => (
              <motion.div key={acc.id} whileHover={{ scale: 1.015 }} className="transition">
                <AccountCard id={acc.id} name={acc.name} index={i} />
              </motion.div>
            ))}
          </motion.div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">All Accounts</h2>
            </div>
            <DataTable
              filterKey="name"
              columns={columns}
              data={accounts}
              onDelete={(row) => {
                const ids = row.map((r) => r.original.id);
                deleteAccounts.mutate({ ids });
              }}
              disabled={isDisabled}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AccountsPage;