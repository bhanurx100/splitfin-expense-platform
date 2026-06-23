/**
 * features/transactions/api/transaction-queries.ts
 *
 * Reusable TanStack Query option configs for the transactions feature.
 *
 * Hooks import these configs and call useQuery(transactionListQuery(filters)).
 * This keeps hooks thin and makes query configs testable/composable.
 *
 * Pattern: queryOptions() factory functions that return the full config object.
 * Each factory combines the right query key + the right API call.
 */

import type { UseQueryOptions } from "@tanstack/react-query";
import {
  transactionKeys,
  type TransactionListFilters,
} from "./query-keys";
import {
  getTransactions,
  getTransaction,
  type TransactionListItem,
  type TransactionDetail,
} from "./transactions-api";

// ─── List query ────────────────────────────────────────────────────────────────

/**
 * Query options for the transaction list (filterable by date range + account).
 *
 * Usage in a hook:
 *   const query = useQuery(transactionListQuery(filters));
 */
export function transactionListQuery(
  filters?: TransactionListFilters
): UseQueryOptions<TransactionListItem[], Error> {
  return {
    queryKey: transactionKeys.list(filters),
    queryFn: () => getTransactions(filters),
    staleTime: 60 * 1000, // 1 minute — matches global default
  };
}

// ─── Detail query ──────────────────────────────────────────────────────────────

/**
 * Query options for a single transaction detail.
 *
 * Usage in a hook:
 *   const query = useQuery(transactionDetailQuery(id));
 */
export function transactionDetailQuery(
  id: string | undefined
): UseQueryOptions<TransactionDetail, Error> {
  return {
    queryKey: transactionKeys.detail(id ?? ""),
    queryFn: () => getTransaction(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  };
}