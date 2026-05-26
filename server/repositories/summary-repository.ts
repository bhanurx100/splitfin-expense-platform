/**
 * server/repositories/summary-repository.ts
 *
 * DATA ACCESS LAYER — raw db aggregation queries for the summary/dashboard.
 *
 * Rules:
 *  ✅ Direct drizzle queries only
 *  ✅ Returns raw db row shapes (milliunits, Date objects)
 *  ❌ NO business logic
 *  ❌ NO period comparison logic
 *  ❌ NO "Other" category bucketing
 *  ❌ NO gap-filling for charts
 *  ❌ NO unit conversion
 *  ❌ NO percentage change calculations
 *
 * All orchestration above lives in summary-service.ts.
 */

import { and, desc, eq, gte, lt, lte, sql, sum } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { accounts, categories, transactions } from "@/db/schema";

// ─── Shared filter type ────────────────────────────────────────────────────────

export type SummaryDbParams = {
  userId:     string;
  startDate:  Date;
  endDate:    Date;
  accountId?: string;
};

// ─── Return types ──────────────────────────────────────────────────────────────

export type FinancialTotalsRow = {
  income:    number; // milliunits
  expenses:  number; // milliunits
  remaining: number; // milliunits
};

export type CategoryTotalRow = {
  name:  string;
  value: number; // milliunits, absolute (expenses only)
};

export type DailyTotalRow = {
  date:     Date;
  income:   number; // milliunits
  expenses: number; // milliunits — already absolute (ABS applied in SQL)
};

// ─── Repository ────────────────────────────────────────────────────────────────

export const summaryRepository = {

  /**
   * Aggregate income / expenses / remaining for a user within a date window.
   * Optionally scoped to a single account.
   *
   * Called twice by the service: once for the current period,
   * once for the prior period (for % change calculation).
   */
  async getFinancialTotals(
    params: SummaryDbParams
  ): Promise<FinancialTotalsRow> {
    const { userId, startDate, endDate, accountId } = params;

    const [row] = await db
      .select({
        income: sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`
          .mapWith(Number),
        expenses: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`
          .mapWith(Number),
        remaining: sum(transactions.amount).mapWith(Number),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          accountId ? eq(transactions.accountId, accountId) : undefined,
          eq(accounts.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      );

    return {
      income:    row?.income    ?? 0,
      expenses:  row?.expenses  ?? 0,
      remaining: row?.remaining ?? 0,
    };
  },

  /**
   * Spending totals grouped by category — expenses only, ordered desc.
   * Returns all categories; the service is responsible for the top-N + "Other" bucketing.
   */
  async getCategoryTotals(
    params: SummaryDbParams
  ): Promise<CategoryTotalRow[]> {
    const { userId, startDate, endDate, accountId } = params;

    return db
      .select({
        name:  categories.name,
        value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          accountId ? eq(transactions.accountId, accountId) : undefined,
          eq(accounts.userId, userId),
          lt(transactions.amount, 0),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(categories.name)
      .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`));
  },

  /**
   * Daily income + expense totals for chart rendering.
   * Returns only days that have transactions — the service fills gaps.
   * Expenses are returned as positive values (ABS applied in SQL).
   */
  async getDailyTotals(
    params: SummaryDbParams
  ): Promise<DailyTotalRow[]> {
    const { userId, startDate, endDate, accountId } = params;

    return db
      .select({
        date: transactions.date,
        income: sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`
          .mapWith(Number),
        expenses: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`
          .mapWith(Number),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          accountId ? eq(transactions.accountId, accountId) : undefined,
          eq(accounts.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(transactions.date)
      .orderBy(transactions.date);
  },
};