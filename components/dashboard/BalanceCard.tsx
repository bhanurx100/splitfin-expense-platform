"use client";

// components/dashboard/BalanceCard.tsx
// Unchanged from components/mobile/BalanceCard.tsx — only import path updated.

import { useState } from "react";
import { TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import { formatINR } from "@/lib/mobile-utils";

type BalanceCardProps = {
  accountName: string;
  remainingAmount: number;
  thisMonthIncome: number;
  thisMonthExpenses: number;
  otherAccounts?: { name: string }[];
};

export function BalanceCard({
  accountName,
  remainingAmount,
  thisMonthIncome,
  thisMonthExpenses,
  otherAccounts = [],
}: BalanceCardProps) {
  const [hidden, setHidden] = useState(false);

  const netChange = thisMonthIncome + thisMonthExpenses;
  const netPositive = netChange >= 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 p-5 text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -right-4 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-white/5" />

      <div className="relative">
        {/* Top row */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-blue-100">{accountName}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-blue-100">This month</span>
            <button
              onClick={() => setHidden((h) => !h)}
              className="rounded-full p-1 transition-all duration-200 hover:bg-white/20 active:scale-90"
              aria-label={hidden ? "Show balance" : "Hide balance"}
            >
              {hidden ? (
                <EyeOff className="h-4 w-4 text-blue-100" />
              ) : (
                <Eye className="h-4 w-4 text-blue-100" />
              )}
            </button>
          </div>
        </div>

        {/* Balance + badge */}
        <div className="mb-1 flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            {hidden ? "••••••" : formatINR(remainingAmount)}
          </h2>
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${
              netPositive ? "bg-emerald-400/20" : "bg-red-400/20"
            }`}
          >
            {netPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-300" />
            )}
            <span
              className={`text-sm font-semibold ${
                netPositive ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {hidden
                ? "••••"
                : `${netPositive ? "+" : "−"}${formatINR(Math.abs(netChange))}`}
            </span>
          </div>
        </div>

        {/* Income / Expenses mini cards */}
        <div className="mb-5 mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/20">
            <div className="mb-1 flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/30">
                <TrendingUp className="h-3 w-3 text-emerald-300" />
              </div>
              <span className="text-xs text-blue-100">Income</span>
            </div>
            <p className="text-base font-bold">
              {hidden ? "•••••" : formatINR(thisMonthIncome)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <div className="mb-1 flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-400/30">
                <TrendingDown className="h-3 w-3 text-red-300" />
              </div>
              <span className="text-xs text-blue-100">Expenses</span>
            </div>
            <p className="text-base font-bold">
              {hidden ? "•••••" : formatINR(Math.abs(thisMonthExpenses))}
            </p>
          </div>
        </div>

        {/* Other accounts */}
        {otherAccounts.length > 0 && (
          <div className="space-y-2 border-t border-white/20 pt-3">
            <p className="text-xs text-blue-100">Other Accounts</p>
            {otherAccounts.map((acc) => (
              <div key={acc.name} className="flex items-center justify-between">
                <span className="text-sm font-medium">{acc.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}