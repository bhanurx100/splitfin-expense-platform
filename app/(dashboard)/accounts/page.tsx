"use client";

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

  const isDisabled =
    accountsQuery.isLoading || deleteAccounts.isPending;

  // ───── LOADING ─────
  if (accountsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#0E1117] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1117] text-white">

      {/* ───── CONTENT ───── */}
      <div className="mx-auto max-w-screen-2xl px-4 py-10 lg:px-14">

        {/* ───── HEADER (CLEAN, NOT HEAVY) ───── */}
        <div className="mb-10 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Accounts
            </h1>
            <p className="text-sm text-gray-400">
              Manage your financial ecosystem
            </p>
          </div>

          <Button
            onClick={newAccount.onOpen}
            className="rounded-lg bg-white text-black hover:bg-gray-200 transition"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>

        {/* ───── CARDS (PRIMARY FOCUS) ───── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          {accounts.map((acc, i) => (
            <motion.div
              key={acc.id}
              whileHover={{ scale: 1.02 }}
              className="transition"
            >
              <AccountCard id={acc.id} name={acc.name} index={i} />
            </motion.div>
          ))}
        </motion.div>

        {/* ───── TABLE SECTION (SECONDARY) ───── */}
        {accounts.length > 0 && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-[#11151F] p-6">

            <div className="mb-4">
              <h2 className="text-sm font-medium text-gray-300">
                All Accounts
              </h2>
            </div>

            {/* 🔥 FIX: remove ugly blue header */}
            <div className="[&_*]:!bg-transparent [&_*]:!text-gray-300">
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

          </div>
        )}

        {/* ───── EMPTY STATE ───── */}
        {accounts.length === 0 && (
          <div className="mt-16 flex flex-col items-center text-center text-gray-400">
            <p>No accounts yet</p>
            <Button
              onClick={newAccount.onOpen}
              className="mt-4 bg-white text-black"
            >
              Add Account
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AccountsPage;