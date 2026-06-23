/**
 * features/accounts/api/query-keys.ts
 *
 * Single source of truth for all TanStack Query cache keys
 * in the accounts feature.
 */

export const accountKeys = {
  /** Root — invalidates everything account-related. */
  all: ["accounts"] as const,

  /** All list variants. */
  lists: () => [...accountKeys.all, "list"] as const,

  /** The single accounts list (no filter variants needed yet). */
  list: () => [...accountKeys.lists()] as const,

  /** All detail variants. */
  details: () => [...accountKeys.all, "detail"] as const,

  /** A single account detail. */
  detail: (id: string) => [...accountKeys.details(), id] as const,
} as const;

/**
 * Summary must be invalidated after any account write because
 * account deletes cascade to transactions → summary changes.
 */
export const summaryKeys = {
  all: ["summary"] as const,
} as const;

/**
 * Transactions cache must also be invalidated after account deletes
 * (cascade) or renames (account name appears in transaction rows).
 */
export const transactionKeys = {
  all: ["transactions"] as const,
} as const;

/** All keys a write operation should invalidate. Pass id for targeted detail bust. */
export function accountInvalidationTargets(id?: string) {
  return [
    accountKeys.all,
    transactionKeys.all,
    summaryKeys.all,
    ...(id ? [accountKeys.detail(id)] : []),
  ] as const;
}