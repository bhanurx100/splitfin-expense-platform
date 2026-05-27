"use client";

/**
 * features/dashboard/sections/dashboard-summary.tsx
 *
 * Premium fintech home — hero balance + 3 stat pills.
 * No transaction feed. No admin tables.
 * Visual goal: Mercury / Revolut / Robinhood home screen.
 */

import { memo } from "react";
import { TrendingUp, TrendingDown, Eye, EyeOff, Sparkles } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR",
  minimumFractionDigits: 0, maximumFractionDigits: 0,
});
function fmt(v: number) { return INR.format(Math.abs(v)); }

// ── Pill stat ─────────────────────────────────────────────────────────────────

type PillProps = {
  label:   string;
  value:   string;
  delta?:  number;
  accent:  "income" | "expense" | "neutral";
  hidden:  boolean;
};

const Pill = memo(function Pill({ label, value, delta, accent, hidden }: PillProps) {
  const colors = {
    income:  { text: "var(--color-income)",  bg: "var(--color-income-bg)",  border: "var(--color-income-border)"  },
    expense: { text: "var(--color-expense)", bg: "var(--color-expense-bg)", border: "var(--color-expense-border)" },
    neutral: { text: "var(--text-tertiary)", bg: "var(--surface-sunken)",   border: "var(--border-subtle)"        },
  }[accent];

  const deltaPositive = delta !== undefined && delta >= 0;

  return (
    <div
      className="flex flex-col gap-1.5 rounded-2xl p-4 transition-all duration-200"
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p
        className={`text-[22px] font-bold tabular-nums leading-none transition-all ${hidden ? "blur-md select-none" : ""}`}
        style={{ color: colors.text }}
      >
        {value}
      </p>
      {delta !== undefined && (
        <p className="text-[11px] font-medium" style={{ color: deltaPositive ? "var(--color-income)" : "var(--color-expense)" }}>
          {deltaPositive ? "↑" : "↓"} {Math.abs(Math.round(delta))}% vs last period
        </p>
      )}
    </div>
  );
});

// ── Savings ring (pure CSS, no recharts) ──────────────────────────────────────

function SavingsRing({ rate, hidden }: { rate: number; hidden: boolean }) {
  const clamped = Math.max(0, Math.min(100, rate));
  // SVG stroke-dasharray trick — 100-unit circumference circle
  const CIRC = 2 * Math.PI * 18; // r=18
  const dash  = (clamped / 100) * CIRC;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" strokeWidth="3"
            stroke="var(--border-subtle)" fill="none" />
          <circle cx="20" cy="20" r="18" strokeWidth="3"
            stroke={rate >= 20 ? "var(--color-income)" : "var(--color-warning)"}
            strokeLinecap="round" fill="none"
            strokeDasharray={`${dash} ${CIRC}`}
            style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <span
          className={`text-[13px] font-bold tabular-nums ${hidden ? "blur-sm" : ""}`}
          style={{ color: rate >= 20 ? "var(--color-income)" : "var(--color-warning)" }}
        >
          {clamped}%
        </span>
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        Saved
      </p>
    </div>
  );
}

// ── Hero balance card ─────────────────────────────────────────────────────────

type HeroProps = {
  remaining:   number;
  income:      number;
  expenses:    number;
  savingsRate: number;
  accName:     string;
  period:      string;
  hidden:      boolean;
  onHide:      () => void;
};

const HeroCard = memo(function HeroCard({
  remaining, income, expenses, savingsRate, accName, period, hidden, onHide,
}: HeroProps) {
  const net         = income + expenses;
  const netPositive = net >= 0;

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 text-white lg:p-8"
      style={{
        background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 35%, #4338ca 70%, #6366f1 100%)",
        boxShadow: "0 24px 60px rgba(99, 102, 241, 0.35), 0 8px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 left-1/3 h-40 w-40 rounded-full bg-indigo-400/10 blur-2xl" />

      {/* Top row */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-200/70">{accName}</p>
          <p className="mt-0.5 text-[12px] text-indigo-100/50">{period}</p>
        </div>
        <button
          type="button"
          onClick={onHide}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20"
        >
          {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Balance + ring row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-1 text-[12px] font-medium text-indigo-200/60">Net Balance</p>
          <p
            className={`text-5xl font-bold tracking-tight leading-none transition-all duration-200 lg:text-[3.5rem] ${hidden ? "blur-xl select-none" : ""}`}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {fmt(remaining)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold ${
                netPositive ? "bg-emerald-400/20 text-emerald-200" : "bg-red-400/20 text-red-200"
              }`}
            >
              {netPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {netPositive ? "+" : "-"}{fmt(net)}
            </div>
            <span className="text-[11px] text-indigo-200/50">this month</span>
          </div>
        </div>
        <SavingsRing rate={savingsRate} hidden={hidden} />
      </div>
    </div>
  );
});

// ── Quick actions bar ─────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Add",       href: "#add",          icon: "＋", color: "var(--color-info-bg)",      text: "var(--color-info)"     },
  { label: "Accounts",  href: "/accounts",      icon: "🏦", color: "var(--color-income-bg)",    text: "var(--color-income)"   },
  { label: "Split",     href: "/split",         icon: "÷",  color: "var(--color-analytics-bg)", text: "var(--color-analytics)"},
  { label: "History",   href: "/transactions",  icon: "📋", color: "var(--surface-sunken)",     text: "var(--text-tertiary)"  },
] as const;

const QuickActions = memo(function QuickActions({ onAddTx }: { onAddTx: () => void }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {QUICK_ACTIONS.map(({ label, href, icon, color, text }) => (
        href === "#add"
          ? (
            <button
              key={label}
              type="button"
              onClick={onAddTx}
              className="flex flex-col items-center gap-2 rounded-2xl p-3.5 transition-all duration-150 active:scale-95"
              style={{ background: color }}
            >
              <span className="text-xl font-light" style={{ color: text }}>{icon}</span>
              <span className="text-[11px] font-semibold" style={{ color: text }}>{label}</span>
            </button>
          ) : (
            <a
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 rounded-2xl p-3.5 transition-all duration-150 active:scale-95"
              style={{ background: color }}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-[11px] font-semibold" style={{ color: text }}>{label}</span>
            </a>
          )
      ))}
    </div>
  );
});

// ── Public export ─────────────────────────────────────────────────────────────

export type DashboardSummaryProps = {
  income:      number;
  expenses:    number;
  remaining:   number;
  savingsRate: number;
  accName:     string;
  period:      string;
  hidden:      boolean;
  onHide:      () => void;
  onAddTx:     () => void;
  summary?:    { incomeChange?: number; expensesChange?: number };
};

export function DashboardSummary({
  income, expenses, remaining, savingsRate,
  accName, period, hidden, onHide, onAddTx, summary,
}: DashboardSummaryProps) {
  return (
    <div className="space-y-4 lg:space-y-5">
      <HeroCard
        remaining={remaining} income={income} expenses={expenses}
        savingsRate={savingsRate} accName={accName} period={period}
        hidden={hidden} onHide={onHide}
      />

      <QuickActions onAddTx={onAddTx} />

      <div className="grid grid-cols-3 gap-3">
        <Pill label="Income"   value={fmt(income)}            delta={summary?.incomeChange}   accent="income"  hidden={hidden} />
        <Pill label="Expenses" value={fmt(Math.abs(expenses))} delta={summary?.expensesChange} accent="expense" hidden={hidden} />
        <Pill label="Savings"  value={`${savingsRate}%`}                                       accent="neutral" hidden={hidden} />
      </div>
    </div>
  );
}