"use client";
import { memo } from "react";
import type { ChartPeriod, ChartPoint } from "@/features/dashboard/lib/build-chart-data";
import {
  CashFlowChart,
  CategoryPieCard,
  TopSpendingCard,
} from "@/features/dashboard/sections/dashboard-charts";

type Category = { name: string; value: number };

type Props = {
  chartData:   ChartPoint[];
  chartPeriod: ChartPeriod;
  categories:  Category[];
  onPeriod:    (p: ChartPeriod) => void;
};

export const DashboardChartsSection = memo(function DashboardChartsSection({
  chartData,
  chartPeriod,
  categories,
  onPeriod,
}: Props) {
  return (
    <div className="space-y-4">
      <CashFlowChart
        data={chartData}
        period={chartPeriod}
        onPeriod={onPeriod}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CategoryPieCard  categories={categories} />
        <TopSpendingCard  categories={categories} />
      </div>
    </div>
  );
});