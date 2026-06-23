"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/src/lib/transaction-selectors";

interface SpendingOverviewProps {
  categoryBreakdown: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  isDark: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Shopping: "#ffb800",
  Groceries: "#3abff8",
  Food: "#ff7f50",
  Travel: "#ec6cb9",
  Bills: "#f87171",
  Transfer: "#34d399",
  Health: "#9f7aea",
  Entertainment: "#fb923c",
  Salary: "#10b981",
  Investment: "#8b5cf6",
};

const getColor = (category: string): string => {
  return CATEGORY_COLORS[category] || "#6b7280";
};

export function SpendingOverview({ categoryBreakdown, isDark }: SpendingOverviewProps) {
  const totalSpent = categoryBreakdown.reduce((sum, cat) => sum + cat.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="rounded-xl px-4 py-3 text-sm shadow-xl"
          style={{
            background: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
            border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
            backdropFilter: "blur(12px)",
          }}
        >
          <p className="mb-2 font-semibold" style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}>
            {data.name}
          </p>
          <p className="mb-1 font-bold" style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}>
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
            {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="rounded-[28px] p-5 lg:p-7"
      style={{
        background: isDark ? "var(--surface-card)" : "var(--surface-card)",
        border: isDark ? "1px solid var(--border-default)" : "1px solid var(--border-default)",
        boxShadow: isDark ? "var(--shadow-lg)" : "var(--shadow-lg)",
      }}
    >
      <h2
        className="mb-6 text-xl font-bold lg:text-2xl"
        style={{ color: isDark ? "#ffffff" : "#111827" }}
      >
        Spending Overview
      </h2>

      {categoryBreakdown.length > 0 ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          {/* Donut Chart with Total Inside */}
          <div className="relative h-64 w-full lg:h-80 lg:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Total Spent Inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p
                className="text-xs font-medium"
                style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}
              >
                Total Spent
              </p>
              <p
                className="text-lg font-bold lg:text-xl"
                style={{ color: isDark ? "#ffffff" : "#111827" }}
              >
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>

          {/* Clean Legend - Simple two-column layout */}
          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {categoryBreakdown.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center gap-2"
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getColor(category.name) }}
                  />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: isDark ? "#ffffff" : "#111827" }}
                    >
                      {category.name}
                    </span>
                    <span
                      className="text-sm font-semibold whitespace-nowrap"
                      style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)" }}
                    >
                      {formatCurrency(category.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center">
          <p
            className="text-sm"
            style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
          >
            No spending data yet
          </p>
        </div>
      )}
    </div>
  );
}
