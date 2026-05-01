"use client";

// components/dashboard/TransactionList.tsx
// Moved from components/mobile/TransactionList.tsx.
// Added: `maxItems` prop (default 5) so desktop sidebar can show fewer rows.

import { useState } from "react";
import { ChevronRight, Receipt } from "lucide-react";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { formatINR, formatTxDate, categoryColor, categoryIcon } from "@/lib/mobile-utils";
import { TransactionSkeleton } from "./Skeletons";

type ApiTx = {
  id: string;
  date: string;
  category: string | null;
  categoryId: string | null;
  payee: string;
  amount: number;
  account: string;
  accountId: string;
};

function TransactionItem({
  tx,
  index,
  onOpen,
}: {
  tx: ApiTx;
  index: number;
  onOpen: (id: string) => void;
}) {
  const isIncome = tx.amount >= 0;
  const color = categoryColor(index);
  const icon = categoryIcon(tx.category ?? "");

  return (
    <button
      onClick={() => onOpen(tx.id)}
      className="group flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-all duration-200 ease-in-out hover:bg-blue-50/50 hover:shadow-sm active:scale-[0.98] active:bg-blue-50"
    >
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-lg transition-transform duration-200 group-hover:scale-110"
        style={{ background: `${color}18` }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-800">{tx.payee}</p>
        <p className="text-xs text-gray-400">{formatTxDate(tx.date)}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${isIncome ? "text-emerald-600" : "text-red-500"}`}>
          {isIncome ? "+" : "−"}
          {formatINR(tx.amount, 2)}
        </p>
        <p className="truncate text-xs text-gray-400">
          {tx.category ?? "Uncategorized"}
        </p>
        <p className="truncate text-[10px] text-gray-300">{tx.account}</p>
      </div>
    </button>
  );
}

type TransactionListProps = {
  /** Max rows shown before "View all" toggle. Default 5. */
  maxItems?: number;
};

export function TransactionList({ maxItems = 5 }: TransactionListProps) {
  const [showAll, setShowAll] = useState(false);
  const { data: transactions = [], isLoading } = useGetTransactions();
  const { onOpen } = useOpenTransaction();

  if (isLoading) return <TransactionSkeleton />;

  const hasMore = transactions.length > maxItems;
  const displayed = showAll ? transactions : transactions.slice(0, maxItems);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">Recent Transactions</h3>
        {hasMore && (
          <button
            onClick={() => setShowAll((s) => !s)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600"
          >
            {showAll ? "Show less" : `View all (${transactions.length})`}
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform duration-200 ${showAll ? "rotate-90" : ""}`}
            />
          </button>
        )}
      </div>

      {transactions.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <Receipt className="h-7 w-7 text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">No transactions yet</p>
            <p className="text-xs text-gray-400">Tap + below to add your first one</p>
          </div>
        </div>
      )}

      <div className="space-y-0.5">
        {displayed.map((tx, i) => (
          <TransactionItem key={tx.id} tx={tx as ApiTx} index={i} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}