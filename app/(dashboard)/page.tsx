"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ChevronDown, Eye, EyeOff, Bell, Sparkles,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

import { useGetAccounts }     from "@/features/accounts/api/use-get-accounts";
import { useGetSummary }      from "@/features/summary/api/use-get-summary";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categoryColor, categoryIcon, formatINR, formatMonthYear, formatTxDate } from "@/lib/mobile-utils";

/* ─── types ─────────────────────────────────────────────────────────────── */
type Account = { id: string; name: string };
type ApiTx   = { id: string; date: string; category: string | null; payee: string; amount: number; account: string };
type SummaryDay = { date: string; income: number; expenses: number };
type Category   = { name: string; value: number };

/* ─── helpers ────────────────────────────────────────────────────────────── */
function fmt(v: number) { return formatINR(Math.abs(v), 0); }
function pct(a: number, b: number) { if (!b) return 0; return Math.round(((a - b) / Math.abs(b)) * 100); }

/* ─── Stat card ─────────────────────────────────────────────────────────── */
function StatCard({
  label, value, delta, icon: Icon, accent, hidden, delay = 0,
}: {
  label: string; value: number; delta?: number; icon: React.ElementType;
  accent: "blue" | "emerald" | "red"; hidden: boolean; delay?: number;
}) {
  const accentMap = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-600",    icon: "text-blue-500",    border: "border-blue-100"    },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-500", border: "border-emerald-100" },
    red:     { bg: "bg-red-50",     text: "text-red-500",     icon: "text-red-400",     border: "border-red-100"     },
  }[accent];

  const isUp   = delta !== undefined && delta >= 0;
  const DeltaIcon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-lg"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* subtle dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: "radial-gradient(circle, #0f172a 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${accentMap.bg}`}>
            <Icon className={`h-4 w-4 ${accentMap.icon}`} />
          </div>
        </div>

        <p className={`mb-1 text-[1.6rem] font-bold leading-none tracking-tight text-slate-900 transition-all duration-200 ${hidden ? "blur-md select-none" : ""}`}
           style={{ fontVariantNumeric: "tabular-nums" }}>
          {fmt(value)}
        </p>

        {delta !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
            <DeltaIcon className="h-3.5 w-3.5" />
            {Math.abs(delta)}% vs last period
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Insight pill ───────────────────────────────────────────────────────── */
function InsightPill({ text, sub, color }: { text: string; sub?: string; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 transition-colors hover:bg-slate-100/60">
      <div className="flex items-center gap-2.5">
        <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
        <span className="text-[13px] font-medium text-slate-700">{text}</span>
      </div>
      {sub && <span className="text-[13px] font-bold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>{sub}</span>}
    </div>
  );
}

/* ─── Tx row ─────────────────────────────────────────────────────────────── */
function TxRow({ tx, index, onOpen }: { tx: ApiTx; index: number; onOpen: (id: string) => void }) {
  const isIncome = tx.amount >= 0;
  const color    = categoryColor(index % 10);
  return (
    <button
      type="button"
      onClick={() => onOpen(tx.id)}
      className="group flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-all duration-150 hover:bg-slate-50 active:scale-[0.99]"
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm transition-transform duration-150 group-hover:scale-105"
        style={{ background: `${color}15` }}
      >
        {categoryIcon(tx.category ?? "")}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-slate-800">{tx.payee}</p>
        <p className="text-[11px] text-slate-400">{formatTxDate(tx.date)}</p>
      </div>
      <span
        className={`text-[13px] font-bold tabular-nums ${isIncome ? "text-emerald-600" : "text-red-500"}`}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {isIncome ? "+" : "−"}{fmt(tx.amount)}
      </span>
    </button>
  );
}

/* ─── Custom chart tooltip ───────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 p-3.5 shadow-xl backdrop-blur-sm">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[13px]">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.dataKey}</span>
          <span className="ml-auto font-bold text-slate-800" style={{ fontVariantNumeric: "tabular-nums" }}>
            ₹{Math.abs(p.value).toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Mini pie chart ─────────────────────────────────────────────────────── */
function CategoryPie({ categories }: { categories: Category[] }) {
  const top = categories.slice(0, 6);
  const total = top.reduce((s, c) => s + c.value, 0);

  if (!top.length) return (
    <div className="flex h-40 items-center justify-center text-sm text-slate-400">No data for this period</div>
  );

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-36 w-36 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={top} dataKey="value" innerRadius={42} outerRadius={66} paddingAngle={2} strokeWidth={0}>
              {top.map((_, i) => <Cell key={i} fill={categoryColor(i)} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total</p>
          <p className="text-sm font-bold text-slate-800" style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmt(total)}
          </p>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        {top.map((cat, i) => (
          <div key={cat.name} className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: categoryColor(i) }} />
            <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-600">{cat.name}</p>
            <p className="text-[12px] font-bold text-slate-800 tabular-nums">
              {Math.round((cat.value / total) * 100)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Budget bar ─────────────────────────────────────────────────────────── */
function BudgetBar({ cat, index, max }: { cat: Category; index: number; max: number }) {
  const pct = Math.min(Math.round((cat.value / max) * 100), 100);
  const color = categoryColor(index);
  const isHigh = pct > 80;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{categoryIcon(cat.name)}</span>
          <span className="text-[13px] font-medium text-slate-700">{cat.name}</span>
        </div>
        <span className={`text-[13px] font-bold tabular-nums ${isHigh ? "text-red-500" : "text-slate-800"}`}>
          {fmt(cat.value)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: isHigh ? "#ef4444" : color }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const pathname      = usePathname();
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const [hidden, setHidden]   = useState(false);
  const [chartPeriod, setChartPeriod] = useState<"W" | "M" | "Y">("M");

  const from            = searchParams.get("from") || "";
  const to              = searchParams.get("to") || "";
  const selectedAccId   = searchParams.get("accountId") || "";

  const { data: summary,  isLoading: sumLoading  } = useGetSummary();
  const { data: accounts = [], isLoading: accLoading } = useGetAccounts();
  const { data: txRaw  = [] } = useGetTransactions();
  const { onOpen } = useOpenTransaction();

  const txs = txRaw as ApiTx[];
  const selectedAcc = accounts.find(a => a.id === selectedAccId);
  const accName = selectedAcc?.name ?? "All Accounts";
  const period  = formatMonthYear(new Date());

  /* chart data */
  const chartData = useMemo(() => {
    if (chartPeriod === "M") {
      return (summary?.days ?? []).map((d: SummaryDay) => ({
        label: new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        income:   d.income,
        expenses: d.expenses,
      }));
    }
    const now = new Date();
    const buckets: Record<string, { label: string; income: number; expenses: number }> = {};
    if (chartPeriod === "W") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        buckets[key] = { label: d.toLocaleDateString("en-IN", { weekday: "short" }), income: 0, expenses: 0 };
      }
      txs.forEach(t => {
        const key = new Date(t.date).toISOString().slice(0, 10);
        if (!buckets[key]) return;
        if (t.amount >= 0) buckets[key].income += t.amount;
        else buckets[key].expenses += Math.abs(t.amount);
      });
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        buckets[key] = { label: d.toLocaleDateString("en-IN", { month: "short" }), income: 0, expenses: 0 };
      }
      txs.forEach(t => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        if (!buckets[key]) return;
        if (t.amount >= 0) buckets[key].income += t.amount;
        else buckets[key].expenses += Math.abs(t.amount);
      });
    }
    return Object.values(buckets);
  }, [chartPeriod, summary?.days, txs]);

  const onAccChange = (acc: Account) => {
    const url = qs.stringifyUrl(
      { url: pathname, query: { accountId: acc.id, from, to } },
      { skipEmptyString: true, skipNull: true }
    );
    router.push(url);
  };

  const income    = summary?.incomeAmount    ?? 0;
  const expenses  = summary?.expensesAmount  ?? 0;
  const remaining = summary?.remainingAmount ?? 0;
  const categories = summary?.categories ?? [];
  const maxCat    = categories[0]?.value ?? 1;

  /* insights */
  const topMerchant = useMemo(() => {
    const map: Record<string, number> = {};
    txs.filter(t => t.amount < 0).forEach(t => { map[t.payee] = (map[t.payee] ?? 0) + Math.abs(t.amount); });
    const [name, val] = Object.entries(map).sort((a, b) => b[1] - a[1])[0] ?? [];
    return name ? { name, val } : null;
  }, [txs]);

  const savingsRate = income > 0 ? Math.round(((income + expenses) / income) * 100) : 0;

  /* ── skeleton ── */
  if (sumLoading || accLoading) return <DashboardSkeleton />;

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50/60">

      {/* ── MOBILE: gradient hero header ──────────────────────────────── */}
      <div className="lg:hidden">
        <MobileHeader
          accounts={accounts} selectedId={selectedAccId} accName={accName}
          period={period} income={income} expenses={expenses} remaining={remaining}
          hidden={hidden} onHide={() => setHidden(h => !h)}
          onAccChange={onAccChange} isLoading={accLoading}
        />
        <MobileContent
          txs={txs} categories={categories} remaining={remaining} income={income}
          expenses={expenses} summary={summary} hidden={hidden}
          savingsRate={savingsRate} topMerchant={topMerchant} onOpen={onOpen}
          chartData={chartData} chartPeriod={chartPeriod} setChartPeriod={setChartPeriod}
        />
      </div>

      {/* ── DESKTOP ────────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <DesktopDashboard
          accounts={accounts} selectedId={selectedAccId} accName={accName}
          period={period} income={income} expenses={expenses} remaining={remaining}
          hidden={hidden} onHide={() => setHidden(h => !h)} onAccChange={onAccChange}
          isLoading={accLoading} txs={txs} categories={categories} summary={summary}
          savingsRate={savingsRate} topMerchant={topMerchant} onOpen={onOpen}
          maxCat={maxCat}
          chartData={chartData} chartPeriod={chartPeriod} setChartPeriod={setChartPeriod}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DESKTOP DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
function DesktopDashboard({
  accounts, selectedId, accName, period, income, expenses, remaining,
  hidden, onHide, onAccChange, isLoading, txs, categories, summary,
  savingsRate, topMerchant, onOpen, maxCat, chartData, chartPeriod, setChartPeriod,
}: any) {
  const net = income + expenses;

  return (
    <div className="mx-auto max-w-[1400px] px-6 xl:px-10 2xl:px-12">

      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 py-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Overview</h1>
          <p className="text-[13px] text-slate-400">{period}</p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Account selector */}
          <AccountPicker accounts={accounts} selectedId={selectedId} onChange={onAccChange} isLoading={isLoading} />

          {/* Balance visibility */}
          <button
            type="button" onClick={onHide}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
          >
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {/* Balance — hero card */}
        <div className="col-span-1 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-5 text-white shadow-lg shadow-blue-500/20">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-200">Net Balance</p>
          <p className={`mb-3 text-3xl font-bold tracking-tight transition-all duration-200 ${hidden ? "blur-md select-none" : ""}`}
             style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmt(remaining)}
          </p>
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${net >= 0 ? "bg-emerald-400/25 text-emerald-200" : "bg-red-400/25 text-red-200"}`}>
              {net >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {net >= 0 ? "+" : "-"}{fmt(net)}
            </div>
            <span className="text-[11px] text-blue-200">this month</span>
          </div>
          <p className="mt-3 text-[11px] text-blue-300/70">{accName}</p>
        </div>

        <StatCard label="Income" value={income} delta={summary?.incomeChange ? Math.round(summary.incomeChange) : undefined} icon={TrendingUp} accent="emerald" hidden={hidden} delay={0.05} />
        <StatCard label="Expenses" value={Math.abs(expenses)} delta={summary?.expensesChange ? Math.round(summary.expensesChange) : undefined} icon={TrendingDown} accent="red" hidden={hidden} delay={0.1} />
        <StatCard label="Savings Rate" value={savingsRate} icon={Sparkles} accent="blue" hidden={hidden} delay={0.15} />
      </div>

      {/* ── MAIN GRID ─────────────────────────────────────────────── */}
      <div className="mt-5 grid grid-cols-12 gap-5 pb-10">

        {/* ── LEFT: Chart + Breakdown ──────────────────────────────── */}
        <div className="col-span-8 space-y-5">

          {/* Chart card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-200 hover:shadow-md">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">Cash Flow</h3>
                <p className="mt-0.5 text-[12px] text-slate-400">Income vs Expenses</p>
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                {(["W","M","Y"] as const).map(p => (
                  <button
                    key={p} type="button"
                    onClick={() => setChartPeriod(p)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-150 ${
                      chartPeriod === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {p === "W" ? "Week" : p === "M" ? "Month" : "Year"}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "DM Sans" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickFormatter={v => v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1.5 }} />
                  <Area type="monotone" dataKey="income"   stroke="#3b82f6" strokeWidth={2.5} fill="url(#gInc)" dot={false} activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gExp)" dot={false} activeDot={{ r: 4, fill: "#f43f5e", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center gap-5">
              {[{ color: "#3b82f6", label: "Income" }, { color: "#f43f5e", label: "Expenses" }].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                  <span className="text-[12px] text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Two-col: Category pie + Spending breakdown */}
          <div className="grid grid-cols-2 gap-5">

            {/* Category distribution */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-200 hover:shadow-md">
              <h3 className="mb-4 text-[15px] font-semibold text-slate-900">By Category</h3>
              <CategoryPie categories={categories} />
            </div>

            {/* Top spending */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-200 hover:shadow-md">
              <h3 className="mb-4 text-[15px] font-semibold text-slate-900">Top Spending</h3>
              <div className="space-y-4">
                {categories.slice(0, 4).map((cat: Category, i: number) => (
                  <BudgetBar key={cat.name} cat={cat} index={i} max={maxCat} />
                ))}
                {!categories.length && (
                  <p className="text-center text-sm text-slate-400 py-8">No expense data</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Balance card + Insights + Transactions ─────────── */}
        <div className="col-span-4 space-y-5">

          {/* Insights */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-200 hover:shadow-md">
            <div className="mb-3.5 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <h3 className="text-[14px] font-semibold text-slate-800">Insights</h3>
            </div>
            <div className="space-y-2">
              {topMerchant && (
                <InsightPill
                  text={`Top: ${topMerchant.name}`}
                  sub={fmt(topMerchant.val)}
                  color="#f59e0b"
                />
              )}
              <InsightPill
                text={income > 0 ? `Saving ${savingsRate}% of income` : "No income this period"}
                color={savingsRate >= 20 ? "#10b981" : "#ef4444"}
              />
              {expenses < 0 && (
                <InsightPill
                  text="Total expenses"
                  sub={fmt(Math.abs(expenses))}
                  color="#ef4444"
                />
              )}
              {categories[0] && (
                <InsightPill
                  text={`${categories[0].name} is top category`}
                  color={categoryColor(0)}
                />
              )}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:border-slate-200 hover:shadow-md">
            <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
              <h3 className="text-[14px] font-semibold text-slate-800">Recent Transactions</h3>
              <a href="/transactions" className="text-[12px] font-semibold text-blue-600 transition hover:text-blue-700">
                View all →
              </a>
            </div>
            <div className="p-2">
              {txs.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-slate-400">No transactions yet</p>
                </div>
              ) : (
                txs.slice(0, 8).map((tx: ApiTx, i: number) => (
                  <TxRow key={tx.id} tx={tx} index={i} onOpen={onOpen} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOBILE HEADER
   ═══════════════════════════════════════════════════════════════════════════ */
function MobileHeader({ accounts, selectedId, accName, period, income, expenses, remaining, hidden, onHide, onAccChange, isLoading }: any) {
  const net = income + expenses;
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 px-4 pb-10 pt-5 text-white">
      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/10" />

      <div className="relative">
        {/* Top row */}
        <div className="mb-6 flex items-center justify-between">
          <AccountPicker accounts={accounts} selectedId={selectedId} onChange={onAccChange} isLoading={isLoading} dark />
          <div className="flex items-center gap-2">
            <button type="button" onClick={onHide} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white/70 transition hover:bg-white/20">
              {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white/70">
              <Bell className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="mb-1 text-[12px] font-medium text-blue-200/70">{period} · {accName}</div>
        <div className={`mb-2 text-4xl font-bold tracking-tight transition-all duration-200 ${hidden ? "blur-lg select-none" : ""}`}
             style={{ fontVariantNumeric: "tabular-nums" }}>
          {fmt(remaining)}
        </div>
        <div className={`flex items-center gap-1.5 text-[13px] font-semibold ${net >= 0 ? "text-emerald-300" : "text-red-300"}`}>
          {net >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {net >= 0 ? "+" : "-"}{fmt(net)} this month
        </div>

        {/* Income / Expense chips */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            { label: "Income",   value: income,              color: "emerald", Icon: TrendingUp   },
            { label: "Expenses", value: Math.abs(expenses),  color: "red",     Icon: TrendingDown },
          ].map(({ label, value, color, Icon }) => (
            <div key={label} className="rounded-2xl bg-white/8 border border-white/10 p-3 backdrop-blur-sm">
              <div className="mb-1 flex items-center gap-1.5">
                <Icon className={`h-3 w-3 text-${color}-300`} />
                <span className="text-[11px] font-medium text-white/60">{label}</span>
              </div>
              <p className={`text-[15px] font-bold ${hidden ? "blur-sm" : ""}`} style={{ fontVariantNumeric: "tabular-nums" }}>
                {fmt(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOBILE CONTENT
   ═══════════════════════════════════════════════════════════════════════════ */
function MobileContent({ txs, categories, income, expenses, summary, hidden, savingsRate, topMerchant, onOpen, chartData, chartPeriod, setChartPeriod }: any) {
  return (
    <div className="-mt-4 space-y-4 px-4 pb-28">

      {/* Chart */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-slate-800">Cash Flow</h3>
          <div className="flex rounded-xl bg-slate-100 p-0.5">
            {(["W","M","Y"] as const).map(p => (
              <button key={p} type="button" onClick={() => setChartPeriod(p)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${chartPeriod === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 2, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="mInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income"   stroke="#3b82f6" strokeWidth={2} fill="url(#mInc)" dot={false} />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#mExp)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <h3 className="text-[14px] font-semibold text-slate-800">Insights</h3>
        </div>
        <div className="space-y-2">
          {topMerchant && <InsightPill text={`Top spend: ${topMerchant.name}`} sub={fmt(topMerchant.val)} color="#f59e0b" />}
          <InsightPill text={income > 0 ? `Saving ${savingsRate}% of income` : "No income this period"} color={savingsRate >= 20 ? "#10b981" : "#ef4444"} />
          {categories[0] && <InsightPill text={`${categories[0].name} is top category`} color={categoryColor(0)} />}
        </div>
      </div>

      {/* Category pie */}
      {categories.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-[14px] font-semibold text-slate-800">Spending Breakdown</h3>
          <CategoryPie categories={categories} />
        </div>
      )}

      {/* Recent transactions */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-50 px-4 py-3.5">
          <h3 className="text-[14px] font-semibold text-slate-800">Recent Transactions</h3>
          <a href="/transactions" className="text-[12px] font-semibold text-blue-600">View all →</a>
        </div>
        <div className="p-2">
          {txs.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No transactions yet</p>
          ) : (
            txs.slice(0, 6).map((tx: ApiTx, i: number) => (
              <TxRow key={tx.id} tx={tx} index={i} onOpen={onOpen} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACCOUNT PICKER
   ═══════════════════════════════════════════════════════════════════════════ */
function AccountPicker({ accounts, selectedId, onChange, isLoading, dark = false }: {
  accounts: Account[]; selectedId: string; onChange: (a: Account) => void; isLoading: boolean; dark?: boolean;
}) {
  const selected = accounts.find(a => a.id === selectedId);
  const label = selected?.name ?? "All Accounts";

  if (isLoading) return (
    <div className={`h-8 w-36 animate-pulse rounded-xl ${dark ? "bg-white/20" : "bg-slate-200"}`} />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[13px] font-medium transition-all focus-visible:outline-none ${
          dark
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300"
        }`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="max-w-[130px] truncate">{label}</span>
          <ChevronDown className={`h-3.5 w-3.5 ${dark ? "text-white/50" : "text-slate-400"}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-2xl border-slate-100 p-1.5 shadow-xl">
        <DropdownMenuItem
          className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[13px]"
          onClick={() => onChange({ id: "", name: "All Accounts" })}
        >
          All Accounts
          {selectedId === "" && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 bg-slate-100" />
        {accounts.map(acc => (
          <DropdownMenuItem
            key={acc.id}
            className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[13px]"
            onClick={() => onChange(acc)}
          >
            {acc.name}
            {acc.id === selectedId && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON
   ═══════════════════════════════════════════════════════════════════════════ */
function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 xl:px-10">
      <div className="flex items-center justify-between border-b border-slate-100 py-5">
        <div className="space-y-2">
          <div className="h-5 w-24 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-3.5 w-32 animate-pulse rounded-xl bg-slate-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-36 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200/60" style={{ animationDelay: `${i*0.1}s` }} />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-12 gap-5">
        <div className="col-span-8 space-y-5">
          <div className="h-80 animate-pulse rounded-2xl bg-white border border-slate-100" />
          <div className="grid grid-cols-2 gap-5">
            <div className="h-52 animate-pulse rounded-2xl bg-white border border-slate-100" />
            <div className="h-52 animate-pulse rounded-2xl bg-white border border-slate-100" />
          </div>
        </div>
        <div className="col-span-4 space-y-5">
          <div className="h-40 animate-pulse rounded-2xl bg-white border border-slate-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-white border border-slate-100" />
        </div>
      </div>
    </div>
  );
}