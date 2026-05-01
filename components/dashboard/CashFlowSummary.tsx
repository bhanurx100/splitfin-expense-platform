"use client";

// components/dashboard/CashFlowSummary.tsx
// Moved from components/mobile/CashFlowSummary.tsx — import path only change.

import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatINR } from "@/lib/mobile-utils";

type CashFlowProps = {
  income: number;
  expenses: number;
  remainingAmount: number;
  period?: string;
  isLoading?: boolean;
};

function RowSkeleton() {
  return <div className="h-14 w-full animate-pulse rounded-2xl bg-gray-100" />;
}

export function CashFlowSummary({
  income,
  expenses,
  remainingAmount,
  period = "This month",
  isLoading = false,
}: CashFlowProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800">Cash Flow</h3>
        <p className="text-xs text-gray-400">{period}</p>
      </div>
      <div className="space-y-3">
        {isLoading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 transition-all duration-200 hover:bg-emerald-100/60">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Income</span>
              </div>
              <span className="text-sm font-bold text-emerald-600">
                +{formatINR(income, 2)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3 transition-all duration-200 hover:bg-red-100/60">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">Expenses</span>
              </div>
              <span className="text-sm font-bold text-red-500">
                −{formatINR(Math.abs(expenses), 2)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3 transition-all duration-200 hover:bg-blue-100/60">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Wallet className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Remaining</span>
              </div>
              <span className={`text-sm font-bold ${remainingAmount >= 0 ? "text-blue-600" : "text-red-500"}`}>
                {remainingAmount >= 0 ? "+" : "−"}
                {formatINR(Math.abs(remainingAmount), 2)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}