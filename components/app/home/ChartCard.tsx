"use client";

import { useMemo, useState } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppCard } from "@/components/app/AppCard";

import {
  formatChartValue,
  formatINR,
} from "@/features/transactions/lib/formatters";

type Period = "Week" | "Month" | "Year";

function buildChartData(
  transactions: { date: string; amount: number }[],
  period: "Week" | "Year"
) {
  const now = new Date();

  const buckets: Record<
    string,
    { label: string; income: number; expenses: number }
  > = {};

  if (period === "Week") {
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(now);

      date.setDate(date.getDate() - index);

      const key = date.toISOString().slice(0, 10);

      buckets[key] = {
        label: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        income: 0,
        expenses: 0,
      };
    }
  } else {
    for (let index = 11; index >= 0; index -= 1) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - index,
        1
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      buckets[key] = {
        label: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
        income: 0,
        expenses: 0,
      };
    }
  }

  for (const transaction of transactions) {
    const date = new Date(transaction.date);

    const key =
      period === "Week"
        ? date.toISOString().slice(0, 10)
        : `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;

    if (!buckets[key]) continue;

    if (transaction.amount >= 0) {
      buckets[key].income += transaction.amount;
    } else {
      buckets[key].expenses += Math.abs(transaction.amount);
    }
  }

  return Object.values(buckets);
}

type Props = {
  transactions: { date: string; amount: number }[];
  summaryDays: {
    date: string;
    income: number;
    expenses: number;
  }[];
};

export default function ChartCard({
  transactions,
  summaryDays,
}: Props) {
  const [period, setPeriod] = useState<Period>("Month");

  const data = useMemo(() => {
    if (period === "Month") {
      return summaryDays.map((day) => ({
        label: new Date(day.date).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
          }
        ),
        income: day.income,
        expenses: day.expenses,
      }));
    }

    return buildChartData(transactions, period);
  }, [period, summaryDays, transactions]);

  return (
    <AppCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          Overview
        </h3>

        <div className="flex rounded-xl bg-gray-100 p-0.5">
          {(["Week", "Month", "Year"] as Period[]).map(
            (value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-150 ${
                  period === value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500"
                }`}
              >
                {value}
              </button>
            )
          )}
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: -24,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="gIncome"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#3B82F6"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="#3B82F6"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="gExp"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#EF4444"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="#EF4444"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#F1F5F9"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#94A3B8",
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatChartValue}
              tick={{
                fontSize: 9,
                fill: "#94A3B8",
              }}
            />

            <Tooltip
              formatter={(value: number, name: string) => [
                formatINR(value, 0),
                name === "income"
                  ? "Income"
                  : "Expenses",
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow:
                  "0 4px 20px rgba(0,0,0,0.08)",
                fontSize: 12,
              }}
            />

            <Area
              type="monotone"
              dataKey="income"
              stroke="#3B82F6"
              fill="url(#gIncome)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#3B82F6",
                strokeWidth: 0,
              }}
            />

            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#EF4444"
              fill="url(#gExp)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#EF4444",
                strokeWidth: 0,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-[11px] text-gray-500">
            Income
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-[11px] text-gray-500">
            Expenses
          </span>
        </div>
      </div>
    </AppCard>
  );
}