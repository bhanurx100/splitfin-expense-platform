/**
 * features/summary/api/query-keys.ts
 *
 * Cache keys for the summary/dashboard data layer.
 *
 * Summary is always dependent on the date range + account filter from
 * URL search params — so every unique (from, to, accountId) combo is
 * a separate cache entry.
 */

export type SummaryFilters = {
  from?: string;
  to?: string;
  accountId?: string;
};

export const summaryKeys = {
  /** Root — invalidate everything summary-related. */
  all: ["summary"] as const,

  /** A specific summary parameterized by filters. */
  detail: (filters?: SummaryFilters) =>
    [...summaryKeys.all, filters ?? {}] as const,
} as const;