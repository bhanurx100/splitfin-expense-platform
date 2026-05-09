"use client";
// app/(dashboard)/page.tsx — desktop-optimized home page
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
  formatINR,
  formatMonthYear,
  formatTxDate,
} from "@/lib/mobile-utils";

const ChartCard = dynamic(() => import("@/components/app/home/ChartCard"), { ssr: false });
const CategoryPreview = dynamic(() => import("@/components/app/home/CategoryPreview"), { ssr: false });

type Account = { id: string; name: string };
type ApiTx = {
  id: string;
  date: string;
  category: string | null;
  payee: string;
  amount: number;
  account: string;
};

// ── Page header (desktop: inline, mobile: hero card) ──────────────────────────
function PageHeader({
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
  const selected = accounts.find((a) => a.id === selectedId);
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-0.5 text-sm text-slate-500">{formatMonthYear(new Date())}</p>
      </div>
      <div className="flex items-center gap-3">
        {isLoading ? (
          <div className="h-9 w-36 animate-pulse rounded-xl bg-slate-200" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="max-w-[140px] truncate">
                  {selected?.name ?? "All Accounts"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1 shadow-xl">
              <DropdownMenuLabel className="px-3 text-xs text-slate-400">
                My Accounts
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer rounded-xl px-3 py-2.5"
                onClick={() => onChange({ id: "", name: "All Accounts" })}
              >
                <div className="flex w-full justify-between">
                  <span className="text-sm">All Accounts</span>
                  {selectedId === "" && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {accounts.map((account) => (
                <DropdownMenuItem
                  key={account.id}
                  className="cursor-pointer rounded-xl px-3 py-2.5"
                  onClick={() => onChange(account)}
                >
                  <div className="flex w-full justify-between">
                    <span className="text-sm">{account.name}</span>
                    {account.id === selectedId && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <button
          aria-label="Notifications"
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Summary stat cards ─────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  hidden,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  hidden: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${bgColor}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${color}`}>
        {hidden ? "••••••" : formatINR(Math.abs(value), 0)}
      </p>
    </div>
  );
}

// ── Balance hero (condensed on desktop) ───────────────────────────────────────
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-6 text-white shadow-lg shadow-blue-500/20">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-6 right-16 h-28 w-28 rounded-full bg-white/5" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-100">{accountName}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-200">This month</span>
            <button
              aria-label={hidden ? "Show" : "Hide"}
              type="button"
              className="rounded-full p-1 transition hover:bg-white/20"
              onClick={() => setHidden((h) => !h)}
            >
              {hidden ? (
                <EyeOff className="h-3.5 w-3.5 text-blue-200" />
              ) : (
                <Eye className="h-3.5 w-3.5 text-blue-200" />
              )}
            </button>
          </div>
        </div>
        <div className="mb-5 flex items-end justify-between">
          <p className="text-4xl font-bold tracking-tight">
            {hidden ? "••••••••" : formatINR(Math.abs(remaining), 0)}
          </p>
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              net >= 0 ? "bg-emerald-400/25 text-emerald-200" : "bg-red-400/25 text-red-200"
            }`}
          >
            {net >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {hidden ? "••••" : `${net >= 0 ? "+" : "-"}${formatINR(Math.abs(net), 0)}`}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Income", value: income, Icon: TrendingUp, ring: "bg-emerald-400/25", ic: "text-emerald-300" },
            { label: "Expenses", value: Math.abs(expenses), Icon: TrendingDown, ring: "bg-red-400/25", ic: "text-red-300" },
          ].map(({ Icon, ic, label, ring, value }) => (
            <div key={label} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <div className="mb-1 flex items-center gap-1.5">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full ${ring}`}>
                  <Icon className={`h-3 w-3 ${ic}`} />
                </div>
                <span className="text-[11px] text-blue-100">{label}</span>
              </div>
              <p className="text-sm font-bold">
                {hidden ? "•••" : formatINR(value, 0)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Transaction row ────────────────────────────────────────────────────────────
function TxRow({ tx, index, onOpen }: { tx: ApiTx; index: number; onOpen: (id: string) => void }) {
  const isIncome = tx.amount >= 0;
  const color = categoryColor(index);
  const icon = categoryIcon(tx.category ?? "");
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-slate-50 active:scale-[0.99]"
      onClick={() => onOpen(tx.id)}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base"
        style={{ background: `${color}18` }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{tx.payee}</p>
        <p className="text-[11px] text-slate-400">{formatTxDate(tx.date)}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${isIncome ? "text-emerald-600" : "text-red-500"}`}>
          {isIncome ? "+" : "-"}{formatINR(Math.abs(tx.amount), 0)}
        </p>
        <p className="text-[10px] text-slate-400">{tx.account}</p>
      </div>
    </button>
  );
}

// ── Home page ──────────────────────────────────────────────────────────────────
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
  const typedTx = transactions as ApiTx[];

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const accountName = selectedAccount?.name ?? "All Accounts";

  const onAccountChange = (account: Account) => {
    const url = qs.stringifyUrl(
      { url: pathname, query: { accountId: account.id, from, to } },
      { skipEmptyString: true, skipNull: true }
    );
    router.push(url);
  };

  const chartTransactions = useMemo(
    () => typedTx.map((t) => ({ date: t.date, amount: t.amount })),
    [typedTx]
  );

  return (
    <div className="w-full">
      {/* ── Mobile hero header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-4 pb-16 pt-5 lg:hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Overview</h1>
          <div className="flex items-center gap-2">
            {accountsLoading ? (
              <div className="h-8 w-28 animate-pulse rounded-full bg-white/20" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur-sm transition hover:bg-white/25 focus-visible:outline-none"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="max-w-[100px] truncate text-xs font-semibold">
                      {selectedAccount?.name ?? "All Accounts"}
                    </span>
                    <ChevronDown className="h-3 w-3 text-white/70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1 shadow-xl" sideOffset={8}>
                  <DropdownMenuLabel className="px-3 text-xs text-slate-400">My Accounts</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5" onClick={() => onAccountChange({ id: "", name: "All Accounts" })}>
                    <div className="flex w-full justify-between">
                      <span className="text-sm">All Accounts</span>
                      {selectedAccountId === "" && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {accounts.map((account) => (
                    <DropdownMenuItem key={account.id} className="cursor-pointer rounded-xl px-3 py-2.5" onClick={() => onAccountChange(account)}>
                      <div className="flex w-full justify-between">
                        <span className="text-sm">{account.name}</span>
                        {account.id === selectedAccountId && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <button aria-label="Notifications" type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25">
              <Bell className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile content (below hero) ── */}
      <div className="px-4 pb-6 lg:hidden">
        <div className="-mt-12">
          <BalanceHero
            accountName={accountName}
            expenses={summary?.expensesAmount ?? 0}
            income={summary?.incomeAmount ?? 0}
            remaining={summary?.remainingAmount ?? 0}
          />
        </div>
        <div className="mt-4 space-y-4">
          <BudgetsCard categories={summary?.categories ?? []} index={1} />
          <InsightsCard index={2} summary={summary} transactions={typedTx} />
          <ChartCard summaryDays={summary?.days ?? []} transactions={chartTransactions} />
          <CategoryPreview categories={summary?.categories ?? []} />
          {typedTx.length > 0 && (
            <AppCard>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Recent Transactions</h3>
                <a className="text-xs font-semibold text-blue-600 transition hover:text-blue-700" href="/transactions">View all</a>
              </div>
              <div className="space-y-0.5">
                {typedTx.slice(0, 5).map((tx, i) => (
                  <TxRow key={tx.id} tx={tx} index={i} onOpen={openTx} />
                ))}
              </div>
            </AppCard>
          )}
        </div>
      </div>

      {/* ── Desktop content ── */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-7xl px-6 py-8 xl:px-10">
          {/* Header row */}
          <div className="mb-8">
            <PageHeader
              accounts={accounts}
              isLoading={accountsLoading}
              onChange={onAccountChange}
              selectedId={selectedAccountId}
            />
          </div>

          {/* Top stats row */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <StatCard
              label="Remaining"
              value={summary?.remainingAmount ?? 0}
              icon={Wallet}
              color="text-blue-600"
              bgColor="bg-blue-50"
              hidden={false}
            />
            <StatCard
              label="Income"
              value={summary?.incomeAmount ?? 0}
              icon={TrendingUp}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
              hidden={false}
            />
            <StatCard
              label="Expenses"
              value={Math.abs(summary?.expensesAmount ?? 0)}
              icon={TrendingDown}
              color="text-red-500"
              bgColor="bg-red-50"
              hidden={false}
            />
          </div>

          {/* Main content grid: chart + sidebar */}
          <div className="grid grid-cols-3 gap-6 xl:grid-cols-4">
            {/* Left col — charts & insights */}
            <div className="col-span-2 space-y-6 xl:col-span-3">
              <ChartCard summaryDays={summary?.days ?? []} transactions={chartTransactions} />
              <div className="grid grid-cols-2 gap-6">
                <InsightsCard summary={summary} transactions={typedTx} />
                <CategoryPreview categories={summary?.categories ?? []} />
              </div>
            </div>

            {/* Right col — transactions + budgets */}
            <div className="col-span-1 space-y-6">
              <BudgetsCard categories={summary?.categories ?? []} />
              {typedTx.length > 0 && (
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">Recent</h3>
                    <a className="text-xs font-semibold text-blue-600 transition hover:text-blue-700" href="/transactions">
                      View all
                    </a>
                  </div>
                  <div className="space-y-0.5">
                    {typedTx.slice(0, 8).map((tx, i) => (
                      <TxRow key={tx.id} tx={tx} index={i} onOpen={openTx} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}