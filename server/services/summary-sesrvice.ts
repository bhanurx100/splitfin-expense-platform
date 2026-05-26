/**
 * server/services/summary-service.ts
 *
 * ORCHESTRATION LAYER — business logic only, no direct db access.
 *
 * Delegates all db reads to summaryRepository.
 * Owns: date normalization, period comparison, category bucketing, gap-filling.
 *
 * FUTURE EXTENSION POINTS:
 *   - Budget utilization per category       (TODO)
 *   - Merchant frequency analytics          (TODO)
 *   - AI-driven spend insights              (TODO)
 *   - Redis caching for heavy aggregations  (TODO)
 */

import { differenceInDays, parse, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { calculatePercentageChange } from "@/lib/utils";
import { summaryRepository} from "@/server/repositories/summary-repository";

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

/** Fill gaps so chart data has a point for every day in the range. */
function fillMissingDays(
  activeDays: { date: Date; income: number; expenses: number }[],
  startDate:  Date,
  endDate:    Date
): { date: string; income: number; expenses: number }[] {
  if (!activeDays.length) return [];

  return eachDayOfInterval({ start: startDate, end: endDate }).map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));
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

    // Parallel fetch: current totals + prior period totals + categories + daily
    const [current, last, rawCategories, activeDays] = await Promise.all([
      summaryRepository.getFinancialTotals(baseParams),
      summaryRepository.getFinancialTotals({ userId, accountId, startDate: lastPeriodStart, endDate: lastPeriodEnd }),
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