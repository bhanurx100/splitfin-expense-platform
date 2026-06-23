/**
 * features/transactions/api/query-keys.ts
 *
 * Single source of truth for all TanStack Query cache keys
 * in the transactions feature.
 *
 * WHY: Query keys were previously inlined as string literals in every hook.
 * Any typo or inconsistency causes stale cache bugs that are hard to trace.
 *
 * USAGE:
 *   import { transactionKeys } from "@/features/transactions/api/query-keys"
 *
 *   useQuery({ queryKey: transactionKeys.list(filters) })
 *   queryClient.invalidateQueries({ queryKey: transactionKeys.all })
 */

export type TransactionListFilters = {
  from?: string;
  to?: string;
  accountId?: string;
};

export const transactionKeys = {
  /** Root key — invalidates everything transaction-related. */
  all: ["transactions"] as const,

  /** All list variants (any filters). */
  lists: () => [...transactionKeys.all, "list"] as const,

  /** A specific list with given filters. */
  list: (filters?: TransactionListFilters) =>
    [...transactionKeys.lists(), filters ?? {}] as const,

  /** All detail variants. */
  details: () => [...transactionKeys.all, "detail"] as const,

  /** A single transaction detail. */
  detail: (id: string) => [...transactionKeys.details(), id] as const,
} as const;

/**
 * Summary keys live in their own feature but transactions mutations must
 * invalidate them. Re-export here so mutation helpers don't need a cross-
 * feature import in every hook.
 */
export const summaryKeys = {
  all: ["summary"] as const,
} as const;

/**
 * Convenience: all keys that a write operation should invalidate.
 * Pass id when a specific transaction was mutated.
 */
export function transactionInvalidationTargets(id?: string) {
  const targets: readonly (readonly string[])[] = id
    ? [transactionKeys.detail(id), transactionKeys.all, summaryKeys.all]
    : [transactionKeys.all, summaryKeys.all];
  return targets;
}