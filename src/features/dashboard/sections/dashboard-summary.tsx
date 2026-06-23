"use client";

/**
 * features/dashboard/sections/dashboard-summary.tsx
 *
 * MIGRATED: now consumes shared design system.
 *   GlowCard   ← replaces inline HeroCard gradient div
 *   MetricCard ← replaces inline Pill component
 *   ActionCard ← replaces inline QuickActions tile buttons
 *
 * Data flow, hooks, and props are unchanged.
 */

import { memo } from "react";
import { TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import { GlowCard } from "@/src/shared/cards";
import { MetricCard } from "@/src/shared/cards";
import { ActionCard } from "@/src/shared/cards";
import type { MetricAccent, MetricDelta } from "@/src/shared/cards";

// ── Formatters ────────────────────────────────────────────────────────────────

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR",
  minimumFractionDigits: 0, maximumFractionDigits: 0,
});
function fmt(v: number) { return INR.format(Math.abs(v)); }

// ── Savings ring (pure CSS — no recharts, kept as-is) ─────────────────────────

function SavingsRing({ rate, hidden }: { rate: number; hidden: boolean }) {
  const clamped = Math.max(0, Math.min(100, rate));
  const CIRC = 2 * Math.PI * 18;
  const dash = (clamped / 100) * CIRC;
  const color = rate >= 20 ? "var(--color-income)" : "var(--color-warning)";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" strokeWidth="3" stroke="var(--border-subtle)" fill="none" />
          <circle
            cx="20" cy="20" r="18" strokeWidth="3"
            stroke={color} strokeLinecap="round" fill="none"
            strokeDasharray={`${dash} ${CIRC}`}
            style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <span
          className={`text-[13px] font-bold tabular-nums ${hidden ? "blur-sm" : ""}`}
          style={{ color }}
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

// ── Quick actions — now ActionCard tiles ──────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Add", href: "#add", icon: "＋", color: "var(--color-info-bg)", text: "var(--color-info)" },
  { label: "Accounts", href: "/accounts", icon: "🏦", color: "var(--color-income-bg)", text: "var(--color-income)" },
  { label: "Split", href: "/split", icon: "÷", color: "var(--color-analytics-bg)", text: "var(--color-analytics)" },
  { label: "History", href: "/transactions", icon: "📋", color: "var(--surface-sunken)", text: "var(--text-tertiary)" },
] as const;

const QuickActions = memo(function QuickActions({ onAddTx }: { onAddTx: () => void }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {QUICK_ACTIONS.map(({ label, href, icon, color, text }) =>
        href === "#add" ? (
          <ActionCard
            key={label}
            label={label}
            icon={<span style={{ color, fontSize: 20 }}>{icon}</span>}
            onClick={onAddTx}
          />
        ) : (
          <ActionCard
            key={label}
            label={label}
            icon={<span style={{ fontSize: 20 }}>{icon}</span>}
            href={href}
          />
        )
      )}
    </div>
  );
});

// ── Stat pills — now MetricCard ───────────────────────────────────────────────

type PillAccent = "income" | "expense" | "neutral";

function pillProps(accent: PillAccent) {
  const metricAccent: Record<PillAccent, MetricAccent> = {
    income: "emerald",
    expense: "rose",
    neutral: "blue",
  };

  return { accent: metricAccent[accent] };
}

function metricDelta(change?: number): MetricDelta | undefined {
  if (change === undefined) return undefined;

  return {
    value: `${change > 0 ? "+" : ""}${change}%`,
    direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
}

// ── Hero card — now GlowCard ──────────────────────────────────────────────────

type HeroProps = {
  remaining: number;
  income: number;
  expenses: number;
  savingsRate: number;
  accName: string;
  period: string;
  hidden: boolean;
  onHide: () => void;
};

const HeroCard = memo(function HeroCard({
  remaining, income, expenses, savingsRate,
  accName, period, hidden, onHide,
}: HeroProps) {
  const net = income + expenses;
  const netPositive = net >= 0;

  return (
    <GlowCard
      gradient="linear-gradient(145deg, #1e1b4b 0%, #312e81 35%, #4338ca 70%, #6366f1 100%)"
      className="relative overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 left-1/3 h-40 w-40 rounded-full bg-indigo-400/10 blur-2xl" />

      <div className="relative">
        {/* Top row */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-200/70">{accName}</p>
            <p className="mt-0.5 text-[12px] text-indigo-100/50">{period}</p>
          </div>
          <button
            type="button" onClick={onHide}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20"
          >
            {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Balance + ring */}
        <div className="flex items-end justify-between">
          <div>
            <p className="mb-1 text-[12px] font-medium text-indigo-200/60">Net Balance</p>
            <p
              className={`text-5xl font-bold tracking-tight leading-none lg:text-[3.5rem] transition-all duration-200 ${hidden ? "blur-xl select-none" : ""}`}
              style={{ fontVariantNumeric: "tabular-nums", color: "#fff" }}
            >
              {fmt(remaining)}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold ${netPositive ? "bg-emerald-400/20 text-emerald-200" : "bg-red-400/20 text-red-200"}`}>
                {netPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {netPositive ? "+" : "-"}{fmt(net)}
              </div>
              <span className="text-[11px] text-indigo-200/50">this month</span>
            </div>
          </div>
          <SavingsRing rate={savingsRate} hidden={hidden} />
        </div>
      </div>
    </GlowCard>
  );
});

// ── Public export ─────────────────────────────────────────────────────────────

export type DashboardSummaryProps = {
  income: number;
  expenses: number;
  remaining: number;
  savingsRate: number;
  accName: string;
  period: string;
  hidden: boolean;
  onHide: () => void;
  onAddTx: () => void;
  summary?: { incomeChange?: number; expensesChange?: number };
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

      {/* Stat pills → MetricCard */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="Income"
          value={hidden ? "••••" : fmt(income)}
          delta={metricDelta(summary?.incomeChange)}
          {...pillProps("income")}
        />
        <MetricCard
          label="Expenses"
          value={hidden ? "••••" : fmt(Math.abs(expenses))}
          delta={metricDelta(summary?.expensesChange)}
          {...pillProps("expense")}
        />
        <MetricCard
          label="Savings"
          value={`${savingsRate}%`}
          {...pillProps("neutral")}
        />
      </div>
    </div>
  );
}
