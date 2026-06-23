/**
 * server/services/summary-service.ts
 *
 * OPTIMIZATIONS vs original:
 *  1. fillMissingDays: Map-based O(1) lookup replaces Array.find O(n) per day
 *     → for a 90-day window with 60 active days: ~5400 comparisons → ~90
 *  2. Promise.all retained (was already parallel) — confirmed no ordering dep
 *  3. No logic changes — behavior identical
 */

import { differenceInDays, parse, subDays, eachDayOfInterval } from "date-fns";
import { calculatePercentageChange } from "@/src/lib/utils";
import { summaryRepository } from "@/src/server/repositories/summary-repository";

// ─── Input / Output types ──────────────────────────────────────────────────────

export type GetSummaryInput = {
  userId:     string;
  from?:      string;
  to?:        string;
  accountId?: string;
};

export type SummaryResult = {
  remainingAmount: number;
  remainingChange: number;
  incomeAmount:    number;
  incomeChange:    number;
  expensesAmount:  number;
  expensesChange:  number;
  categories:      { name: string; value: number }[];
  days:            { date: string; income: number; expenses: number }[];
};

// ─── Private helpers ───────────────────────────────────────────────────────────

function parseDateParam(raw: string | undefined, fallback: Date): Date {
  if (!raw) return fallback;
  return parse(raw, "yyyy-MM-dd", new Date());
}

/**
 * Fill gaps so chart data has a point for every day in the range.
 *
 * OPTIMIZED: Build a Map<dateKey, row> once (O(n)) then look up each calendar
 * day in O(1), instead of Array.find() which is O(n) per day → O(n²) total.
 *
 * For a 90-day range with 60 active days the old code did up to 5,400
 * comparisons; this version does exactly 90 + 60 = 150 operations.
 */
function fillMissingDays(
  activeDays: { date: Date; income: number; expenses: number }[],
  startDate:  Date,
  endDate:    Date
): { date: string; income: number; expenses: number }[] {
  if (!activeDays.length) return [];

  // Build O(1) lookup by ISO date string key
  const byDate = new Map<string, { income: number; expenses: number }>();
  for (const row of activeDays) {
    byDate.set(row.date.toISOString().slice(0, 10), { income: row.income, expenses: row.expenses });
  }

  return eachDayOfInterval({ start: startDate, end: endDate }).map((day) => {
    const key   = day.toISOString().slice(0, 10);
    const found = byDate.get(key);
    return {
      date:     day.toISOString(),
      income:   found?.income   ?? 0,
      expenses: found?.expenses ?? 0,
    };
  });
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const summaryService = {

  /**
   * Full dashboard summary for a user.
   * All amounts returned in milliunits — the API layer converts to decimals.
   */
  async getSummaryForUser(input: GetSummaryInput): Promise<SummaryResult> {
    const { userId, accountId } = input;

    // Date range
    const defaultTo   = new Date();
    const defaultFrom = subDays(defaultTo, 30);
    const startDate   = parseDateParam(input.from, defaultFrom);
    const endDate     = parseDateParam(input.to,   defaultTo);

    const periodLength    = differenceInDays(endDate, startDate) + 1;
    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd   = subDays(endDate,   periodLength);

    const baseParams = { userId, accountId, startDate, endDate };

    // All 4 queries fire in parallel — no sequential dependency
    const [current, last, rawCategories, activeDays] = await Promise.all([
      summaryRepository.getFinancialTotals(baseParams),
      summaryRepository.getFinancialTotals({
        userId,
        accountId,
        startDate: lastPeriodStart,
        endDate:   lastPeriodEnd,
      }),
      summaryRepository.getCategoryTotals(baseParams),
      summaryRepository.getDailyTotals(baseParams),
    ]);

    // Category bucketing: top 3 named + "Other"
    const topCategories   = rawCategories.slice(0, 3);
    const otherCategories = rawCategories.slice(3);
    const otherSum        = otherCategories.reduce((s, c) => s + c.value, 0);
    const finalCategories = [...topCategories];
    if (otherCategories.length > 0) finalCategories.push({ name: "Other", value: otherSum });

    return {
      remainingAmount: current.remaining,
      remainingChange: calculatePercentageChange(current.remaining, last.remaining),
      incomeAmount:    current.income,
      incomeChange:    calculatePercentageChange(current.income,    last.income),
      expensesAmount:  current.expenses,
      expensesChange:  calculatePercentageChange(current.expenses,  last.expenses),
      categories:      finalCategories,
      days:            fillMissingDays(activeDays, startDate, endDate),
    };
  },
};