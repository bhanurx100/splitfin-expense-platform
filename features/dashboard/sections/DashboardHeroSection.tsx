"use client";

import { DashboardHeader }  from "@/features/dashboard/sections/dashboard-header";
import { DashboardSummary } from "@/features/dashboard/sections/dashboard-summary";

type Account = { id: string; name: string };

type Props = {
  // Header
  period:      string;
  accounts:    Account[];
  selectedId:  string;
  accName:     string;
  isLoading:   boolean;
  onAccChange: (a: Account) => void;

  // Summary
  income:      number;
  expenses:    number;
  remaining:   number;
  savingsRate: number;
  hidden:      boolean;
  onHide:      () => void;
  onAddTx:     () => void;
  summary?:    { incomeChange?: number; expensesChange?: number };
};

export function DashboardHeroSection({
  period, accounts, selectedId, accName, isLoading, onAccChange,
  income, expenses, remaining, savingsRate,
  hidden, onHide, onAddTx, summary,
}: Props) {
  return (
    <>
      {/* Desktop-only top bar */}
      <div className="hidden lg:block">
        <DashboardHeader
          period={period}
          accounts={accounts}
          selectedId={selectedId}
          accName={accName}
          hidden={hidden}
          isLoading={isLoading}
          onHide={onHide}
          onAccChange={onAccChange}
        />
      </div>

      <DashboardSummary
        income={income}
        expenses={expenses}
        remaining={remaining}
        savingsRate={savingsRate}
        accName={accName}
        period={period}
        hidden={hidden}
        onHide={onHide}
        onAddTx={onAddTx}
        summary={summary}
      />
    </>
  );
}