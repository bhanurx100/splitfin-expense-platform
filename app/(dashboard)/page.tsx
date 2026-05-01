"use client";

// app/(dashboard)/page.tsx — Home screen
// Structure (matches reference screens):
//  1. Gradient header  — greeting + account selector + bell
//  2. Balance card      — overlaps header (float up)
//  3. Cash Flow card
//  4. Chart section     — Week / Month / Year tabs
//  5. Category donut + legend
//  6. Recent Transactions (card list, NOT table)

import { useState, useMemo } from "react";
import { Bell, ChevronDown, TrendingUp, TrendingDown, Wallet, Eye, EyeOff } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

import { useGetSummary }      from "@/features/summary/api/use-get-summary";
import { useGetAccounts }     from "@/features/accounts/api/use-get-accounts";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppCard } from "@/components/app/AppCard";
import {
  formatINR, formatTxDate, formatChartValue,
  categoryColor, categoryIcon, formatMonthYear,
} from "@/lib/mobile-utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type Account = { id: string; name: string };
type Period  = "Week" | "Month" | "Year";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function buildChartData(
  transactions: { date: string; amount: number }[],
  period: "Week" | "Year",
) {
  const now = new Date();
  const buckets: Record<string, { label: string; income: number; expenses: number }> = {};
  if (period === "Week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { label: d.toLocaleDateString("en-IN", { weekday: "short" }), income: 0, expenses: 0 };
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets[key] = { label: d.toLocaleDateString("en-IN", { month: "short" }), income: 0, expenses: 0 };
    }
  }
  for (const tx of transactions) {
    const d   = new Date(tx.date);
    const key = period === "Week"
      ? d.toISOString().slice(0, 10)
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets[key]) continue;
    if (tx.amount >= 0) buckets[key].income   += tx.amount;
    else                buckets[key].expenses += Math.abs(tx.amount);
  }
  return Object.values(buckets);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Blue gradient header with greeting + account selector + bell */
function HomeHeader({
  accounts, selectedId, onChange, isLoading,
}: {
  accounts: Account[];
  selectedId: string;
  onChange: (a: Account) => void;
  isLoading: boolean;
}) {
  const { user } = useUser();
  const selected = accounts.find(a => a.id === selectedId);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-5 pb-20 pt-6">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-blue-400/20" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-blue-200">{greeting()}</p>
          <h2 className="mt-0.5 text-xl font-bold text-white">
            {user?.firstName ?? "there"} 👋
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-28 animate-pulse rounded-full bg-white/20" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-white backdrop-blur-sm transition-all hover:bg-white/25 focus-visible:outline-none">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="max-w-[100px] truncate text-xs font-semibold">
                    {selected?.name ?? "All Accounts"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-52 rounded-2xl p-1 shadow-xl">
                <DropdownMenuLabel className="px-3 text-xs text-gray-400">My Accounts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onChange({ id: "", name: "All Accounts" })} className="cursor-pointer rounded-xl px-3 py-2.5">
                  <div className="flex w-full justify-between">
                    <span className="text-sm">All Accounts</span>
                    {selectedId === "" && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {accounts.map(acc => (
                  <DropdownMenuItem key={acc.id} onClick={() => onChange(acc)} className="cursor-pointer rounded-xl px-3 py-2.5">
                    <div className="flex w-full justify-between">
                      <span className="text-sm">{acc.name}</span>
                      {acc.id === selectedId && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Balance card floating over the header */
function BalanceHero({
  remaining, income, expenses, accountName,
}: {
  remaining: number; income: number; expenses: number; accountName: string;
}) {
  const [hidden, setHidden] = useState(false);
  const net = income + expenses; // expenses is negative from API

  return (
    <div className="-mt-14 px-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-blue-400 p-5 shadow-2xl shadow-blue-500/30 text-white">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-2 h-24 w-24 rounded-full bg-white/10" />

        <div className="relative">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-blue-100">{accountName}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-100">This month</span>
              <button onClick={() => setHidden(h => !h)}
                className="rounded-full p-0.5 transition hover:bg-white/20">
                {hidden ? <EyeOff className="h-3.5 w-3.5 text-blue-200" /> : <Eye className="h-3.5 w-3.5 text-blue-200" />}
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-end justify-between">
            <p className="text-3xl font-bold tracking-tight">
              {hidden ? "••••••" : formatINR(remaining)}
            </p>
            <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${net >= 0 ? "bg-emerald-400/25" : "bg-red-400/25"}`}>
              {net >= 0
                ? <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                : <TrendingDown className="h-3.5 w-3.5 text-red-300" />}
              <span className={`text-xs font-bold ${net >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                {hidden ? "••••" : `${net >= 0 ? "+" : "−"}${formatINR(Math.abs(net))}`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Income",   value: income,            icon: TrendingUp,   color: "emerald" },
              { label: "Expenses", value: Math.abs(expenses), icon: TrendingDown, color: "red"     },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl bg-white/10 p-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-${color}-400/30`}>
                    <Icon className={`h-3 w-3 text-${color}-300`} />
                  </div>
                  <span className="text-xs text-blue-100">{label}</span>
                </div>
                <p className="text-base font-bold">{hidden ? "•••" : formatINR(value)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cash Flow card */
function CashFlowCard({
  income, expenses, remaining, period, isLoading,
}: {
  income: number; expenses: number; remaining: number;
  period: string; isLoading: boolean;
}) {
  if (isLoading) return (
    <div className="mx-4 animate-pulse rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-3 h-5 w-24 rounded bg-gray-200" />
      {[0,1,2].map(i => <div key={i} className="mb-2 h-12 rounded-2xl bg-gray-100" />)}
    </div>
  );

  const rows = [
    { label: "Income",    value: income,               prefix: "+", bg: "bg-emerald-50", icon: TrendingUp,   text: "text-emerald-600", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { label: "Expenses",  value: Math.abs(expenses),   prefix: "−", bg: "bg-red-50",     icon: TrendingDown, text: "text-red-500",     iconBg: "bg-red-100",     iconColor: "text-red-500"     },
    { label: "Remaining", value: Math.abs(remaining),  prefix: remaining >= 0 ? "+" : "−", bg: "bg-blue-50", icon: Wallet, text: remaining >= 0 ? "text-blue-600" : "text-red-500", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  ];

  return (
    <AppCard className="mx-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Cash Flow</h3>
        <span className="text-xs text-gray-400">{period}</span>
      </div>
      <div className="space-y-2">
        {rows.map(({ label, value, prefix, bg, icon: Icon, text, iconBg, iconColor }) => (
          <div key={label} className={`flex items-center justify-between rounded-2xl ${bg} px-4 py-3`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
            <span className={`text-sm font-bold ${text}`}>{prefix}{formatINR(value, 2)}</span>
          </div>
        ))}
      </div>
    </AppCard>
  );
}

/** Chart section with Week/Month/Year toggle */
function ChartCard({ transactions, summaryDays }: {
  transactions: { date: string; amount: number }[];
  summaryDays: { date: string; income: number; expenses: number }[];
}) {
  const [period, setPeriod] = useState<Period>("Month");

  const data = useMemo(() => {
    if (period === "Month") {
      return summaryDays.map(d => ({
        label: new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        income: d.income,
        expenses: d.expenses,
      }));
    }
    return buildChartData(transactions, period);
  }, [period, transactions, summaryDays]);

  return (
    <AppCard className="mx-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Overview</h3>
        <div className="flex rounded-xl bg-gray-100 p-0.5">
          {(["Week", "Month", "Year"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-150 ${
                period === p ? "bg-blue-600 text-white shadow-sm" : "text-gray-500"
              }`}>{p}</button>
          ))}
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatChartValue} tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 14, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
              formatter={(v: number, n: string) => [formatINR(v, 0), n === "income" ? "Income" : "Expenses"]}
            />
            <Area type="monotone" dataKey="income"   stroke="#3B82F6" strokeWidth={2.5} fill="url(#gIncome)" dot={false} activeDot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }} />
            <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2.5} fill="url(#gExp)"    dot={false} activeDot={{ r: 4, fill: "#EF4444", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center gap-4">
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-blue-500" /><span className="text-[11px] text-gray-500">Income</span></div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-500" /><span className="text-[11px] text-gray-500">Expenses</span></div>
      </div>
    </AppCard>
  );
}

/** Category donut + legend */
function CategoryPreview({ categories }: {
  categories: { name: string; value: number }[];
}) {
  const data = categories.map((c, i) => ({ ...c, color: categoryColor(i), icon: categoryIcon(c.name) }));
  const total = data.reduce((s, c) => s + c.value, 0);

  if (data.length === 0) return null;

  return (
    <AppCard className="mx-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Categories</h3>
        <span className="text-xs text-red-500 font-medium">Expenses</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative h-28 w-28 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={54} paddingAngle={2} dataKey="value">
                {data.map(c => <Cell key={c.name} fill={c.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[9px] text-gray-400">Amount</p>
            <p className="text-xs font-bold text-gray-800">{formatINR(total)}</p>
          </div>
        </div>

        {/* Legend list */}
        <div className="flex-1 space-y-2">
          {data.slice(0, 4).map(c => (
            <div key={c.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <span className="text-xs text-gray-600 truncate max-w-[90px]">{c.name}</span>
              </div>
              <span className="text-xs font-semibold text-gray-800">{formatINR(c.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </AppCard>
  );
}

/** Recent transaction card row */
function TxRow({ tx, index, onOpen }: {
  tx: { id: string; date: string; category: string | null; payee: string; amount: number; account: string };
  index: number;
  onOpen: (id: string) => void;
}) {
  const isIncome = tx.amount >= 0;
  const color = categoryColor(index);
  const icon  = categoryIcon(tx.category ?? "");

  return (
    <button onClick={() => onOpen(tx.id)}
      className="group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-150 hover:bg-gray-50 active:scale-[0.98]">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-lg"
        style={{ background: `${color}18` }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-800">{tx.payee}</p>
        <p className="text-xs text-gray-400">{formatTxDate(tx.date)}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${isIncome ? "text-emerald-600" : "text-red-500"}`}>
          {isIncome ? "+" : "−"}{formatINR(tx.amount, 2)}
        </p>
        <p className="text-[10px] text-gray-400">{tx.account}</p>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const { data: summary,      isLoading: summaryLoading }  = useGetSummary();
  const { data: accounts = [], isLoading: accountsLoading } = useGetAccounts();
  const { data: transactions = [] }                         = useGetTransactions();
  const { onOpen: openTx }                                  = useOpenTransaction();

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const accountName     = selectedAccount?.name ?? "All Accounts";
  const period          = formatMonthYear(new Date());

  return (
    <div className="w-full">
      {/* 1 — Gradient header */}
      <HomeHeader
        accounts={accounts}
        selectedId={selectedAccountId}
        onChange={a => setSelectedAccountId(a.id)}
        isLoading={accountsLoading}
      />

      {/* 2 — Balance card (floats up over header) */}
      <BalanceHero
        remaining={summary?.remainingAmount  ?? 0}
        income={summary?.incomeAmount        ?? 0}
        expenses={summary?.expensesAmount    ?? 0}
        accountName={accountName}
      />

      {/* 3 — Spacer + content stack */}
      <div className="mt-4 space-y-4 pb-4">
        {/* Cash flow */}
        <CashFlowCard
          income={summary?.incomeAmount      ?? 0}
          expenses={summary?.expensesAmount  ?? 0}
          remaining={summary?.remainingAmount ?? 0}
          period={period}
          isLoading={summaryLoading}
        />

        {/* Chart */}
        <ChartCard
          transactions={transactions as { date: string; amount: number }[]}
          summaryDays={summary?.days ?? []}
        />

        {/* Category preview */}
        <CategoryPreview categories={summary?.categories ?? []} />

        {/* Recent transactions */}
        {transactions.length > 0 && (
          <AppCard className="mx-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Recent Transactions</h3>
              <a href="/transactions" className="text-xs font-medium text-blue-600">View all</a>
            </div>
            <div className="divide-y divide-gray-50">
              {transactions.slice(0, 5).map((tx, i) => (
                <TxRow key={tx.id} tx={tx as any} index={i} onOpen={openTx} />
              ))}
            </div>
          </AppCard>
        )}
      </div>
    </div>
  );
}