"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import {
  Bell,
  ChevronDown,
  Eye,
  EyeOff,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import dynamic from "next/dynamic";
import { AppCard } from "@/components/app/AppCard";
import { BudgetsCard } from "@/components/app/BudgetsCard";
import { InsightsCard } from "@/components/app/InsightsCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import {
  categoryColor,
  categoryIcon,
  formatChartValue,
  formatINR,
  formatMonthYear,
  formatTxDate,
} from "@/lib/mobile-utils";

const ChartCard = dynamic(
  () => import("@/components/app/home/ChartCard"),
  {
    ssr: false,
  }
);

const CategoryPreview = dynamic(
  () => import("@/components/app/home/CategoryPreview"),
  {
    ssr: false,
  }
);

type Account = { id: string; name: string };
type Period = "Week" | "Month" | "Year";
type ApiTx = {
  id: string;
  date: string;
  category: string | null;
  payee: string;
  amount: number;
  account: string;
};


function HomeHeaderBar({
  accounts,
  selectedId,
  onChange,
  isLoading,
}: {
  accounts: Account[];
  selectedId: string;
  onChange: (account: Account) => void;
  isLoading: boolean;
}) {
  const selected = accounts.find((account) => account.id === selectedId);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-4 pb-16 pt-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -left-6 bottom-0 h-32 w-32 rounded-full bg-blue-400/20" />

      <div className="relative flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Overview</h1>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-28 animate-pulse rounded-full bg-white/20" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur-sm transition-all hover:bg-white/25 focus-visible:outline-none"
                  type="button"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="max-w-[100px] truncate text-xs font-semibold">
                    {selected?.name ?? "All Accounts"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-white/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 rounded-2xl p-1 shadow-xl"
                sideOffset={8}
              >
                <DropdownMenuLabel className="px-3 text-xs text-gray-400">
                  My Accounts
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer rounded-xl px-3 py-2.5"
                  onClick={() => onChange({ id: "", name: "All Accounts" })}
                >
                  <div className="flex w-full justify-between">
                    <span className="text-sm">All Accounts</span>
                    {selectedId === "" ? (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    ) : null}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {accounts.map((account) => (
                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl px-3 py-2.5"
                    key={account.id}
                    onClick={() => onChange(account)}
                  >
                    <div className="flex w-full justify-between">
                      <span className="text-sm">{account.name}</span>
                      {account.id === selectedId ? (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      ) : null}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <button
            aria-label="Notifications"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
            type="button"
          >
            <Bell className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BalanceHero({
  remaining,
  income,
  expenses,
  accountName,
}: {
  remaining: number;
  income: number;
  expenses: number;
  accountName: string;
}) {
  const [hidden, setHidden] = useState(false);
  const net = income + expenses;

  return (
    <div className="-mt-12">
      <div className="relative overflow-hidden rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500 to-blue-400 p-5 text-white shadow-xl shadow-blue-500/25">
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-6 -right-2 h-20 w-20 rounded-full bg-white/10" />

        <div className="relative">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-blue-100">
              {accountName}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-blue-100">This month</span>
              <button
                aria-label={hidden ? "Show balance" : "Hide balance"}
                className="rounded-full p-0.5 transition hover:bg-white/20"
                onClick={() => setHidden((current) => !current)}
                type="button"
              >
                {hidden ? (
                  <EyeOff className="h-3.5 w-3.5 text-blue-200" />
                ) : (
                  <Eye className="h-3.5 w-3.5 text-blue-200" />
                )}
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-end justify-between">
            <p className="text-3xl font-bold tracking-tight">
              {hidden ? "******" : formatINR(Math.abs(remaining))}
            </p>

            <div
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${
                net >= 0 ? "bg-emerald-400/25" : "bg-red-400/25"
              }`}
            >
              {net >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-300" />
              )}
              <span
                className={`text-xs font-bold ${
                  net >= 0 ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {hidden
                  ? "****"
                  : `${net >= 0 ? "+" : "-"}${formatINR(Math.abs(net))}`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                label: "Income",
                value: income,
                Icon: TrendingUp,
                ring: "bg-emerald-400/30",
                iconColor: "text-emerald-300",
              },
              {
                label: "Expenses",
                value: Math.abs(expenses),
                Icon: TrendingDown,
                ring: "bg-red-400/30",
                iconColor: "text-red-300",
              },
            ].map(({ Icon, iconColor, label, ring, value }) => (
              <div
                className="rounded-xl bg-white/10 p-3 backdrop-blur-sm"
                key={label}
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${ring}`}
                  >
                    <Icon className={`h-3 w-3 ${iconColor}`} />
                  </div>
                  <span className="text-[11px] text-blue-100">{label}</span>
                </div>

                <p className="text-sm font-bold">
                  {hidden ? "***" : formatINR(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CashFlowCard({
  income,
  expenses,
  remaining,
  period,
  isLoading,
}: {
  income: number;
  expenses: number;
  remaining: number;
  period: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <AppCard>
        <div className="mb-3 h-5 w-24 animate-pulse rounded bg-gray-200" />
        {[0, 1, 2].map((item) => (
          <div
            className="mb-2 h-12 animate-pulse rounded-xl bg-gray-100"
            key={item}
          />
        ))}
      </AppCard>
    );
  }

  const rows = [
    {
      label: "Income",
      value: income,
      prefix: "+",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      iconBg: "bg-emerald-100",
      Icon: TrendingUp,
      iconColor: "text-emerald-600",
    },
    {
      label: "Expenses",
      value: Math.abs(expenses),
      prefix: "-",
      bg: "bg-red-50",
      text: "text-red-500",
      iconBg: "bg-red-100",
      Icon: TrendingDown,
      iconColor: "text-red-500",
    },
    {
      label: "Remaining",
      value: Math.abs(remaining),
      prefix: remaining >= 0 ? "+" : "-",
      bg: "bg-blue-50",
      text: remaining >= 0 ? "text-blue-600" : "text-red-500",
      iconBg: "bg-blue-100",
      Icon: Wallet,
      iconColor: "text-blue-600",
    },
  ] as const;

  return (
    <AppCard>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Cash Flow</h3>
        <span className="text-xs text-gray-400">{period}</span>
      </div>

      <div className="space-y-2">
        {rows.map(
          ({ Icon, bg, iconBg, iconColor, label, prefix, text, value }) => (
            <div
              className={`flex items-center justify-between rounded-xl ${bg} px-3 py-2.5`}
              key={label}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${iconBg}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {label}
                </span>
              </div>

              <span className={`text-sm font-bold ${text}`}>
                {prefix}
                {formatINR(value, 2)}
              </span>
            </div>
          )
        )}
      </div>
    </AppCard>
  );
}

function TxRow({
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
      className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-150 hover:bg-gray-50 active:scale-[0.98]"
      onClick={() => onOpen(tx.id)}
      type="button"
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base"
        style={{ background: `${color}18` }}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-800">
          {tx.payee}
        </p>
        <p className="text-[11px] text-gray-400">{formatTxDate(tx.date)}</p>
      </div>

      <div className="text-right">
        <p
          className={`text-sm font-bold ${
            isIncome ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatINR(tx.amount, 2)}
        </p>
        <p className="text-[10px] text-gray-400">{tx.account}</p>
      </div>
    </button>
  );
}

export default function HomePage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const selectedAccountId = searchParams.get("accountId") || "";

  const { data: summary, isLoading: summaryLoading } = useGetSummary();
  const { data: accounts = [], isLoading: accountsLoading } = useGetAccounts();
  const { data: transactions = [] } = useGetTransactions();
  const { onOpen: openTx } = useOpenTransaction();

  const typedTransactions = transactions as ApiTx[];
  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId
  );
  const accountName = selectedAccount?.name ?? "All Accounts";
  const period = formatMonthYear(new Date());

  const onAccountChange = (account: Account) => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          accountId: account.id,
          from,
          to,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  };

  const chartTransactions = useMemo(
    () =>
      typedTransactions.map((transaction) => ({
        date: transaction.date,
        amount: transaction.amount,
      })),
    [typedTransactions]
  );

  return (
    <div className="w-full">
      <HomeHeaderBar
        accounts={accounts}
        isLoading={accountsLoading}
        onChange={onAccountChange}
        selectedId={selectedAccountId}
      />

      <div className="px-4 pb-6">
        <BalanceHero
          accountName={accountName}
          expenses={summary?.expensesAmount ?? 0}
          income={summary?.incomeAmount ?? 0}
          remaining={summary?.remainingAmount ?? 0}
        />

        <div className="mt-4 space-y-4">
          <CashFlowCard
            expenses={summary?.expensesAmount ?? 0}
            income={summary?.incomeAmount ?? 0}
            isLoading={summaryLoading}
            period={period}
            remaining={summary?.remainingAmount ?? 0}
          />

          <BudgetsCard categories={summary?.categories ?? []} index={1} />

          <InsightsCard
            index={2}
            summary={summary}
            transactions={typedTransactions}
          />

          <ChartCard
            summaryDays={summary?.days ?? []}
            transactions={chartTransactions}
          />

          <CategoryPreview categories={summary?.categories ?? []} />

          {typedTransactions.length > 0 ? (
            <AppCard>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">
                  Recent Transactions
                </h3>
                <a
                  className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                  href="/transactions"
                >
                  View all
                </a>
              </div>

              <div className="space-y-0.5">
                {typedTransactions.slice(0, 5).map((transaction, index) => (
                  <TxRow
                    index={index}
                    key={transaction.id}
                    onOpen={openTx}
                    tx={transaction}
                  />
                ))}
              </div>
            </AppCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
