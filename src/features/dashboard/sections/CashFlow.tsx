"use client";

/**
 * CashFlow.tsx — Premium Cash Movement Visualization
 *
 * DATA SOURCE: public/data.csv only. No hardcoded arrays.
 *
 * Architecture:
 *   - 1M: daily aggregation, x-axis = every ~7 days
 *   - 3M: weekly aggregation, x-axis = week labels
 *   - 6M: monthly aggregation, x-axis = month names
 *   - 1Y: monthly aggregation, x-axis = all 12 months
 *
 * Chart:
 *   - Income: positive values → green wave above 0
 *   - Expense: negative values → pink wave below 0
 *   - Smooth monotone curves, gradient fills, glow effects
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface RawTransaction {
  Type: string;       // "Credit" | "Debit" | "Transfer"
  Date: string;       // "2026-06-01"
  Description: string;
  Category: string;
  Amount: number;
  Account: string;
}

interface ChartPoint {
  label: string;      // displayed on x-axis
  dateKey: string;    // internal sort key
  income: number;     // positive
  expense: number;    // negative (e.g. -3600)
}

type Period = "1M" | "3M" | "6M" | "1Y";

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────────────────────────────────────

const INR_COMPACT = (v: number): string => {
  const a = Math.abs(v);
  if (a >= 100_000) return "₹" + (a / 100_000).toFixed(1) + "L";
  if (a >= 1_000)   return "₹" + (a / 1_000).toFixed(0) + "k";
  return "₹" + Math.round(a);
};

const INR_FULL = (v: number): string =>
  "₹" + Math.abs(v).toLocaleString("en-IN");

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─────────────────────────────────────────────────────────────────────────────
// DATA BUILDERS — all pure functions, no side effects
// ─────────────────────────────────────────────────────────────────────────────

/** Build an ISO date string YYYY-MM-DD */
function isoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

/** Days in a month */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 1M — daily aggregation for the LATEST month in data.
 * X-axis ticks: 1st, 7th, 14th, 21st, 28th (last day).
 */
function build1M(txns: RawTransaction[]): ChartPoint[] {
  if (!txns.length) return [];

  // Find latest month present in data
  const dates = txns.map(t => t.Date).sort();
  const latestDate = new Date(dates[dates.length - 1]);
  const year  = latestDate.getFullYear();
  const month = latestDate.getMonth() + 1; // 1-indexed
  const days  = daysInMonth(year, month);
  const monthName = MONTHS_SHORT[month - 1];

  // Index transactions by date
  const byDate: Record<string, { income: number; expense: number }> = {};
  txns
    .filter(t => t.Date.startsWith(`${year}-${String(month).padStart(2,"0")}`))
    .forEach(t => {
      const d = t.Date;
      if (!byDate[d]) byDate[d] = { income: 0, expense: 0 };
      if (t.Type === "Credit")      byDate[d].income  += t.Amount;
      else if (t.Type === "Debit")  byDate[d].expense += t.Amount;
    });

  // Build full daily array
  const points: ChartPoint[] = [];
  for (let d = 1; d <= days; d++) {
    const dateKey = isoDate(year, month, d);
    const vals    = byDate[dateKey] || { income: 0, expense: 0 };

    // Show label on 1st, every 7th day, and last day
    const showLabel = d === 1 || d % 7 === 0 || d === days;
    const label     = showLabel ? `${d} ${monthName}` : "";

    points.push({
      label,
      dateKey,
      income:  vals.income,
      expense: vals.expense > 0 ? -vals.expense : 0, // negative for chart
    });
  }
  return points;
}

/**
 * 3M — weekly aggregation across last 3 months.
 * Each data point = one ISO week (Mon–Sun).
 * X-axis: abbreviated month names at month boundaries.
 */
function build3M(txns: RawTransaction[]): ChartPoint[] {
  if (!txns.length) return [];

  const dates    = txns.map(t => new Date(t.Date)).sort((a,b) => +a - +b);
  const endDate  = dates[dates.length - 1];
  // Go back 3 months from end
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 3);
  startDate.setDate(1);

  // Build weekly buckets: key = "YYYY-WW"
  const weekBuckets: Record<string, { income: number; expense: number; startDate: Date }> = {};

  // Helper: get ISO week start (Monday) for a date
  const getWeekStart = (d: Date): Date => {
    const day  = d.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day;
    const mon  = new Date(d);
    mon.setDate(d.getDate() + diff);
    mon.setHours(0,0,0,0);
    return mon;
  };

  const getWeekKey = (d: Date): string => {
    const ws = getWeekStart(d);
    return `${ws.getFullYear()}-${String(ws.getMonth()+1).padStart(2,"0")}-${String(ws.getDate()).padStart(2,"0")}`;
  };

  txns
    .filter(t => {
      const d = new Date(t.Date);
      return d >= startDate && d <= endDate;
    })
    .forEach(t => {
      const d   = new Date(t.Date);
      const key = getWeekKey(d);
      if (!weekBuckets[key]) weekBuckets[key] = { income: 0, expense: 0, startDate: getWeekStart(d) };
      if (t.Type === "Credit")     weekBuckets[key].income  += t.Amount;
      else if (t.Type === "Debit") weekBuckets[key].expense += t.Amount;
    });

  // Sort weeks
  const sortedKeys = Object.keys(weekBuckets).sort();

  // Track which months we've already labeled
  const labeledMonths = new Set<string>();

  return sortedKeys.map(key => {
    const bucket   = weekBuckets[key];
    const wStart   = bucket.startDate;
    const monthKey = `${wStart.getFullYear()}-${wStart.getMonth()}`;
    const showLabel = !labeledMonths.has(monthKey);
    if (showLabel) labeledMonths.add(monthKey);

    return {
      label:    showLabel ? MONTHS_SHORT[wStart.getMonth()] : "",
      dateKey:  key,
      income:   bucket.income,
      expense:  bucket.expense > 0 ? -bucket.expense : 0,
    };
  });
}

/**
 * 6M — monthly aggregation, last 6 months.
 * X-axis: month name for each point.
 */
function build6M(txns: RawTransaction[]): ChartPoint[] {
  return buildMonthly(txns, 6);
}

/**
 * 1Y — monthly aggregation, last 12 months.
 */
function build1Y(txns: RawTransaction[]): ChartPoint[] {
  return buildMonthly(txns, 12);
}

function buildMonthly(txns: RawTransaction[], nMonths: number): ChartPoint[] {
  if (!txns.length) return [];

  const dates   = txns.map(t => t.Date).sort();
  const latest  = new Date(dates[dates.length - 1]);
  const endYear = latest.getFullYear();
  const endMon  = latest.getMonth(); // 0-indexed

  const points: ChartPoint[] = [];

  for (let i = nMonths - 1; i >= 0; i--) {
    let y = endYear;
    let m = endMon - i; // 0-indexed
    while (m < 0) { m += 12; y--; }
    while (m > 11) { m -= 12; y++; }

    const prefix  = `${y}-${String(m+1).padStart(2,"0")}`;
    const monthly = txns.filter(t => t.Date.startsWith(prefix));

    const income  = monthly.filter(t => t.Type === "Credit").reduce((s,t) => s + t.Amount, 0);
    const expense = monthly.filter(t => t.Type === "Debit").reduce((s,t) => s + t.Amount, 0);

    points.push({
      label:   MONTHS_SHORT[m],
      dateKey: prefix,
      income,
      expense: expense > 0 ? -expense : 0,
    });
  }
  return points;
}

// ─────────────────────────────────────────────────────────────────────────────
// Y-AXIS — nice rounded ticks, symmetric around 0
// ─────────────────────────────────────────────────────────────────────────────

function getNiceYAxis(points: ChartPoint[]): {
  domain: [number, number];
  ticks: number[];
  formatter: (v: number) => string;
} {
  if (!points.length) return { domain: [-50000, 50000], ticks: [-50000,-25000,0,25000,50000], formatter: INR_COMPACT };

  const maxIncome  = Math.max(...points.map(p => p.income), 0);
  const minExpense = Math.min(...points.map(p => p.expense), 0); // already negative

  const absMax = Math.max(maxIncome, Math.abs(minExpense));

  // Nice round step sizes
  const steps = [500,1000,2000,5000,10000,20000,25000,50000,100000,200000,250000,500000,1000000];
  const step  = steps.find(s => absMax / s <= 4) || 1000000;

  // Number of ticks above (and below) 0
  const nTicks    = Math.ceil(absMax / step);
  const clampedN  = Math.max(2, Math.min(nTicks + 1, 6));
  const domainMax = clampedN * step;

  const ticks: number[] = [];
  for (let i = -clampedN; i <= clampedN; i++) {
    ticks.push(i * step);
  }

  return {
    domain:    [-domainMax, domainMax],
    ticks,
    formatter: INR_COMPACT,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
  isDark: boolean;
}

function CashFlowTooltip({ active, payload, label, isDark }: TooltipProps) {
  if (!active || !payload?.length || !label) return null;

  const income  = payload.find(p => p.dataKey === "income");
  const expense = payload.find(p => p.dataKey === "expense");

  // Skip tooltip on empty days
  if (!income?.value && !expense?.value) return null;

  return (
    <div style={{
      background:    isDark ? "rgba(10,16,35,0.95)" : "rgba(255,255,255,0.97)",
      border:        `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
      borderRadius:  14,
      padding:       "12px 16px",
      backdropFilter:"blur(16px)",
      boxShadow:     isDark
        ? "0 8px 32px rgba(0,0,0,0.6)"
        : "0 8px 32px rgba(0,0,0,0.15)",
      minWidth:      160,
      fontSize:      13,
    }}>
      <div style={{
        color:        isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)",
        fontWeight:   600,
        fontSize:     11,
        marginBottom: 10,
        textTransform:"uppercase",
        letterSpacing:"0.05em",
      }}>
        {label}
      </div>

      {income && income.value !== 0 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:24, marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#00D27A", boxShadow:"0 0 6px rgba(0,210,122,0.8)" }} />
            <span style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }}>Income</span>
          </div>
          <span style={{ fontWeight:700, color:"#00D27A" }}>{INR_FULL(income.value)}</span>
        </div>
      )}

      {expense && expense.value !== 0 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#FF4F7A", boxShadow:"0 0 6px rgba(255,79,122,0.8)" }} />
            <span style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }}>Expense</span>
          </div>
          <span style={{ fontWeight:700, color:"#FF4F7A" }}>{INR_FULL(Math.abs(expense.value))}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERIOD BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function PeriodButton({ label, active, onClick, isDark }: {
  label: Period;
  active: boolean;
  onClick: () => void;
  isDark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding:          "5px 12px",
        borderRadius:     8,
        border:           "none",
        cursor:           "pointer",
        fontSize:         12,
        fontWeight:       700,
        letterSpacing:    "0.02em",
        background:       active ? "#7B61FF" : "transparent",
        color:            active ? "#fff" : isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
        transition:       "background 0.18s, color 0.18s",
        WebkitTransition: "background 0.18s, color 0.18s",
        outline:          "none",
      }}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface CashFlowProps {
  transactions: RawTransaction[];
  isDark: boolean;
}

export function CashFlow({ transactions, isDark }: CashFlowProps) {
  const [period, setPeriod] = useState<Period>("1M");

  // Build chart data per period — memoised so CSV is only processed once per period change
  const chartData = useMemo((): ChartPoint[] => {
    if (!transactions.length) return [];
    switch (period) {
      case "1M": return build1M(transactions);
      case "3M": return build3M(transactions);
      case "6M": return build6M(transactions);
      case "1Y": return build1Y(transactions);
      default:   return build1M(transactions);
    }
  }, [transactions, period]);

  // Totals for summary row
  const totals = useMemo(() => ({
    income:  chartData.reduce((s, p) => s + p.income, 0),
    expense: chartData.reduce((s, p) => s + Math.abs(p.expense), 0),
    net:     chartData.reduce((s, p) => s + p.income + p.expense, 0),
  }), [chartData]);

  // Y-axis config
  const yAxis = useMemo(() => getNiceYAxis(chartData), [chartData]);

  const cardBg = isDark
    ? "rgba(16,25,50,0.65)"
    : "#ffffff";
  const border = isDark
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(0,0,0,0.07)";
  const textPrimary   = isDark ? "#ffffff"                    : "#111827";
  const textSecondary = isDark ? "rgba(255,255,255,0.5)"      : "rgba(0,0,0,0.45)";
  const gridColor     = isDark ? "rgba(255,255,255,0.05)"     : "rgba(0,0,0,0.06)";
  const reflineColor  = isDark ? "rgba(255,255,255,0.18)"     : "rgba(0,0,0,0.15)";

  // Show only labeled x-axis ticks
  const xTickFormatter = useCallback((val: string) => val, []);

  return (
    <div style={{
      borderRadius:    22,
      background:      cardBg,
      border,
      padding:         "20px 20px 16px",
      backdropFilter:  "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      boxShadow:       isDark
        ? "0 4px 40px rgba(0,0,0,0.5)"
        : "0 4px 40px rgba(0,0,0,0.08)",
    }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:16, fontWeight:700, color:textPrimary }}>Cash Flow</span>
          {/* Info icon */}
          <div style={{
            width:18, height:18, borderRadius:"50%",
            border:`1.5px solid ${textSecondary}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, color:textSecondary, cursor:"pointer", userSelect:"none",
          }}>i</div>
        </div>

        {/* Segmented control */}
        <div style={{
          display:       "flex",
          background:    isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
          borderRadius:  10,
          padding:       "3px",
          gap:           2,
        }}>
          {(["1M","3M","6M","1Y"] as Period[]).map(p => (
            <PeriodButton
              key={p}
              label={p}
              active={period === p}
              onClick={() => setPeriod(p)}
              isDark={isDark}
            />
          ))}
        </div>
      </div>

      {/* ── Summary row ────────────────────────────────────────────────── */}
      <div style={{ display:"flex", gap:28, marginBottom:18 }}>
        <div>
          <div style={{ fontSize:11, color:textSecondary, marginBottom:3, fontWeight:500 }}>Income</div>
          <div style={{ fontSize:18, fontWeight:800, color:"#00D27A", letterSpacing:"-0.02em", fontVariantNumeric:"tabular-nums" }}>
            {INR_FULL(totals.income)}
          </div>
        </div>
        <div>
          <div style={{ fontSize:11, color:textSecondary, marginBottom:3, fontWeight:500 }}>Expenses</div>
          <div style={{ fontSize:18, fontWeight:800, color:"#FF4F7A", letterSpacing:"-0.02em", fontVariantNumeric:"tabular-nums" }}>
            {INR_FULL(totals.expense)}
          </div>
        </div>
        <div>
          <div style={{ fontSize:11, color:textSecondary, marginBottom:3, fontWeight:500 }}>Net</div>
          <div style={{
            fontSize:18, fontWeight:800,
            color: totals.net >= 0 ? "#00D27A" : "#FF4F7A",
            letterSpacing:"-0.02em", fontVariantNumeric:"tabular-nums"
          }}>
            {totals.net >= 0 ? "+" : "-"}{INR_FULL(Math.abs(totals.net))}
          </div>
        </div>
      </div>

      {/* ── Chart ──────────────────────────────────────────────────────── */}
      <div style={{ width:"100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 16, right: 8, left: 4, bottom: 4 }}
          >
            {/* Gradient definitions */}
            <defs>
              {/* Income — green above 0 */}
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#00D27A" stopOpacity={0.45} />
                <stop offset="55%"  stopColor="#00D27A" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#00D27A" stopOpacity={0.02} />
              </linearGradient>

              {/* Expense — pink below 0 */}
              <linearGradient id="expenseGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%"   stopColor="#FF4F7A" stopOpacity={0.45} />
                <stop offset="55%"  stopColor="#FF4F7A" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#FF4F7A" stopOpacity={0.02} />
              </linearGradient>

              {/* Glow filters */}
              <filter id="incomeGlow" x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="expenseGlow" x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="3 4"
              stroke={gridColor}
              vertical={false}
            />

            {/* Zero reference line — prominent */}
            <ReferenceLine
              y={0}
              stroke={reflineColor}
              strokeWidth={1.5}
              strokeDasharray="none"
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: textSecondary, fontSize: 11, fontWeight: 500 }}
              dy={8}
              interval={0}
              // Only render ticks that have a label
              tickFormatter={(v: string) => v}
            />

            <YAxis
              domain={yAxis.domain}
              ticks={yAxis.ticks}
              tickFormatter={yAxis.formatter}
              axisLine={false}
              tickLine={false}
              tick={{ fill: textSecondary, fontSize: 11, fontWeight: 500 }}
              width={44}
            />

            <Tooltip
              content={(props: any) => (
                <CashFlowTooltip {...props} isDark={isDark} />
              )}
              cursor={{
                stroke:          isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
                strokeWidth:     1.5,
                strokeDasharray: "4 3",
              }}
            />

            {/* EXPENSE — rendered first so it appears behind income */}
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#FF4F7A"
              strokeWidth={3}
              fill="url(#expenseGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#FF4F7A",
                stroke: isDark ? "#0a1020" : "#fff",
                strokeWidth: 2,
                filter: "url(#expenseGlow)",
              }}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
              style={{ filter: "drop-shadow(0 0 6px rgba(255,79,122,0.55))" }}
            />

            {/* INCOME — rendered on top */}
            <Area
              type="monotone"
              dataKey="income"
              stroke="#00D27A"
              strokeWidth={3}
              fill="url(#incomeGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#00D27A",
                stroke: isDark ? "#0a1020" : "#fff",
                strokeWidth: 2,
                filter: "url(#incomeGlow)",
              }}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
              style={{ filter: "drop-shadow(0 0 6px rgba(0,210,122,0.55))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", gap:20, marginTop:12, justifyContent:"center" }}>
        {[
          { color:"#00D27A", label:"Income" },
          { color:"#FF4F7A", label:"Expenses" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{
              width:9, height:9, borderRadius:"50%",
              background: color,
              boxShadow:  `0 0 6px ${color}`,
            }} />
            <span style={{ fontSize:12, fontWeight:500, color:textSecondary }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Footer link ─────────────────────────────────────────────────── */}
      <div style={{
        marginTop:   14,
        paddingTop:  14,
        borderTop:   `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        display:     "flex",
        alignItems:  "center",
        justifyContent: "space-between",
        cursor:      "pointer",
      }}>
        <span style={{ fontSize:13, color:"#7B61FF", fontWeight:600 }}>
          View Cash Flow Insights
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#7B61FF" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
}