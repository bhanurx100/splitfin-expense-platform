/**
 * features/dashboard/lib/build-chart-data.ts
 *
 * Pure function — extracted from app/(dashboard)/page.tsx.
 * No React. No hooks. Safe to import on server or client.
 */

export type SummaryDay  = { date: string; income: number; expenses: number };
export type ChartPoint  = { label: string; income: number; expenses: number };
export type ChartPeriod = "W" | "M" | "Y";

export function buildChartData(
  days:   SummaryDay[],
  period: ChartPeriod,
): ChartPoint[] {
  // Month: use server-aggregated days directly
  if (period === "M") {
    return days.map((d) => ({
      label:    new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      income:   d.income,
      expenses: d.expenses,
    }));
  }

  const now     = new Date();
  const buckets: Record<string, ChartPoint> = {};

  if (period === "W") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = {
        label:    d.toLocaleDateString("en-IN", { weekday: "short" }),
        income:   0,
        expenses: 0,
      };
    }
    days.forEach((d) => {
      const key = d.date.slice(0, 10);
      if (buckets[key]) {
        buckets[key].income   += d.income;
        buckets[key].expenses += d.expenses;
      }
    });
  } else {
    // Year — 12 monthly buckets
    for (let i = 11; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets[key] = {
        label:    d.toLocaleDateString("en-IN", { month: "short" }),
        income:   0,
        expenses: 0,
      };
    }
    days.forEach((d) => {
      const key = d.date.slice(0, 7);
      if (buckets[key]) {
        buckets[key].income   += d.income;
        buckets[key].expenses += d.expenses;
      }
    });
  }

  return Object.values(buckets);
}