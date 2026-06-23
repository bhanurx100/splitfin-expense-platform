/**
 * features/summary/api/summary-queries.ts
 *
 * Query option factory for the summary endpoint.
 * The hook calls useQuery(summaryQuery(filters)) — zero inline logic.
 */

import type { UseQueryOptions } from "@tanstack/react-query";
import { summaryKeys, type SummaryFilters } from "./query-keys";
import { getSummary, type SummaryData } from "./summary-api";

export function summaryQuery(
  filters?: SummaryFilters
): UseQueryOptions<SummaryData, Error> {
  return {
    queryKey: summaryKeys.detail(filters),
    queryFn:  () => getSummary(filters),
    staleTime: 60 * 1000,
  };
}