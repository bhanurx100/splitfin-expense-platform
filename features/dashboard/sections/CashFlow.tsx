"use client";

import { useState, useMemo } from "react";
import { formatCurrency, filterCashFlowByPeriod, TimePeriod } from "../lib/overviewSelectors";

interface CashFlowProps {
  cashFlowData: Array<{
    date: string;
    income: number;
    expense: number;
    net: number;
  }>;
  isDark: boolean;
}

export function CashFlow({ cashFlowData, isDark }: CashFlowProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1M");

  const filteredData = filterCashFlowByPeriod(cashFlowData, selectedPeriod);

  const periods: { value: TimePeriod; label: string }[] = [
    { value: "1M", label: "1M" },
    { value: "3M", label: "3M" },
    { value: "6M", label: "6M" },
    { value: "1Y", label: "1Y" },
  ];

  const totalIncome = filteredData.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = filteredData.reduce((sum, d) => sum + d.expense, 0);
  const totalNet = filteredData.reduce((sum, d) => sum + d.net, 0);

  // Generate smooth bezier curve points
  const generateSmoothPath = (data: number[], isIncome: boolean) => {
    if (data.length === 0) return "";

    const width = 1000;
    const height = 300;
    const centerY = height / 2;
    const maxValue = Math.max(...data.map(Math.abs), 1);
    const padding = 60;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * (width - padding * 2) + padding;
      const y = isIncome
        ? centerY - (value / maxValue) * (centerY - padding)
        : centerY + (value / maxValue) * (centerY - padding);
      return { x, y };
    });

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 3;
      const cp1y = prev.y;
      const cp2x = curr.x - (curr.x - prev.x) / 3;
      const cp2y = curr.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    return path;
  };

  const incomePath = useMemo(() => generateSmoothPath(filteredData.map(d => d.income), true), [filteredData]);
  const expensePath = useMemo(() => generateSmoothPath(filteredData.map(d => d.expense), false), [filteredData]);
  const netPath = useMemo(() => generateSmoothPath(filteredData.map(d => d.net), true), [filteredData]);

  // Get month labels for X-axis
  const monthLabels = filteredData.map(d => {
    const date = new Date(d.date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
  });

  // Calculate Y-axis scale
  const maxValue = Math.max(
    ...filteredData.map(d => Math.max(d.income, d.expense, Math.abs(d.net))),
    100000
  );
  const ySteps = [0, 20000, 40000, 60000, 80000, 100000, 120000].filter(v => v <= maxValue * 1.2);

  return (
    <div
      className="mb-8 overflow-hidden rounded-[28px] p-5 lg:p-7"
      style={{
        background: isDark ? "var(--surface-card)" : "var(--surface-card)",
        border: isDark ? "1px solid var(--border-default)" : "1px solid var(--border-default)",
        boxShadow: isDark ? "var(--shadow-lg)" : "var(--shadow-lg)",
      }}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2
          className="text-xl font-bold lg:text-2xl"
          style={{ color: isDark ? "#ffffff" : "#111827" }}
        >
          Cash Flow
        </h2>

        {/* Segmented Control for Time Period */}
        <div
          className="inline-flex rounded-full p-1"
          style={{
            background: isDark ? "rgba(123, 92, 255, 0.1)" : "rgba(123, 92, 255, 0.05)",
            border: `1px solid ${isDark ? "rgba(123, 92, 255, 0.2)" : "rgba(123, 92, 255, 0.15)"}`,
          }}
        >
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200"
              style={{
                background:
                  selectedPeriod === period.value
                    ? "#7b5cff"
                    : "transparent",
                color:
                  selectedPeriod === period.value
                    ? "#ffffff"
                    : isDark
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.7)",
              }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-3 gap-3 lg:gap-4">
        <div
          className="rounded-xl p-3 transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: isDark
              ? "rgba(0, 210, 122, 0.08)"
              : "rgba(0, 210, 122, 0.06)",
            border: `1px solid ${isDark ? "rgba(0, 210, 122, 0.2)" : "rgba(0, 210, 122, 0.15)"}`,
          }}
        >
          <p
            className="mb-1 text-xs font-medium"
            style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}
          >
            Income
          </p>
          <p className="text-base font-bold lg:text-lg" style={{ color: "#00d27a" }}>
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div
          className="rounded-xl p-3 transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: isDark
              ? "rgba(255, 79, 109, 0.08)"
              : "rgba(255, 79, 109, 0.06)",
            border: `1px solid ${isDark ? "rgba(255, 79, 109, 0.2)" : "rgba(255, 79, 109, 0.15)"}`,
          }}
        >
          <p
            className="mb-1 text-xs font-medium"
            style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}
          >
            Expense
          </p>
          <p className="text-base font-bold lg:text-lg" style={{ color: "#ff4f6d" }}>
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div
          className="rounded-xl p-3 transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: isDark
              ? "rgba(123, 92, 255, 0.08)"
              : "rgba(123, 92, 255, 0.06)",
            border: `1px solid ${isDark ? "rgba(123, 92, 255, 0.2)" : "rgba(123, 92, 255, 0.15)"}`,
          }}
        >
          <p
            className="mb-1 text-xs font-medium"
            style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}
          >
            Net
          </p>
          <p className="text-base font-bold lg:text-lg" style={{ color: "#7b5cff" }}>
            {formatCurrency(totalNet)}
          </p>
        </div>
      </div>

      {/* Premium Wave Chart with Axes */}
      <div className="relative h-[320px] lg:h-[420px]">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D27A" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#00D27A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF4F7A" stopOpacity={0} />
              <stop offset="100%" stopColor="#FF4F7A" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7B5CFF" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#7B5CFF" stopOpacity={0} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Y-axis labels (positive) */}
          {ySteps.slice(0, -1).reverse().map((value, i) => {
            const y = 150 - (value / (ySteps[ySteps.length - 1] || 1)) * 120;
            return (
              <text
                key={`y-pos-${value}`}
                x="45"
                y={y + 4}
                fontSize="10"
                fill={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                textAnchor="end"
              >
                ₹{(value / 1000).toFixed(0)}k
              </text>
            );
          })}

          {/* Y-axis labels (negative) */}
          {ySteps.slice(0, -1).reverse().map((value, i) => {
            const y = 150 + (value / (ySteps[ySteps.length - 1] || 1)) * 120;
            return (
              <text
                key={`y-neg-${value}`}
                x="45"
                y={y + 4}
                fontSize="10"
                fill={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                textAnchor="end"
              >
                -₹{(value / 1000).toFixed(0)}k
              </text>
            );
          })}

          {/* X-axis labels */}
          {monthLabels.map((label, i) => {
            const x = 60 + (i / (monthLabels.length - 1 || 1)) * 880;
            return (
              <text
                key={`x-${label}`}
                x={x}
                y="290"
                fontSize="10"
                fill={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                textAnchor="middle"
              >
                {label}
              </text>
            );
          })}

          {/* Center line (X-axis) */}
          <line
            x1="60"
            y1="150"
            x2="940"
            y2="150"
            stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
            strokeWidth="1"
          />

          {/* Income wave (above X-axis) */}
          {incomePath && (
            <>
              <path
                d={incomePath}
                fill="none"
                stroke="#00D27A"
                strokeWidth="3"
                filter="url(#glow)"
                className="draw-line"
                style={{ animationDelay: "0s" }}
              />
              <path
                d={`${incomePath} L 940 150 L 60 150 Z`}
                fill="url(#incomeGradient)"
                opacity={0.3}
              />
            </>
          )}

          {/* Expense wave (below X-axis) */}
          {expensePath && (
            <>
              <path
                d={expensePath}
                fill="none"
                stroke="#FF4F7A"
                strokeWidth="3"
                filter="url(#glow)"
                className="draw-line"
                style={{ animationDelay: "0.3s" }}
              />
              <path
                d={`${expensePath} L 940 150 L 60 150 Z`}
                fill="url(#expenseGradient)"
                opacity={0.3}
              />
            </>
          )}

          {/* Net wave (overlay) */}
          {netPath && (
            <>
              <path
                d={netPath}
                fill="none"
                stroke="#7B5CFF"
                strokeWidth="3"
                filter="url(#glow)"
                className="draw-line"
                style={{ animationDelay: "0.6s" }}
              />
              <path
                d={`${netPath} L 940 150 L 60 150 Z`}
                fill="url(#netGradient)"
                opacity={0.2}
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
