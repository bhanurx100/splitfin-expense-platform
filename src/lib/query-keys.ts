/**
 * lib/query-keys.ts
 *
 * Single source of truth for all TanStack Query cache keys.
 *
 * RULES:
 *  - Keys are arrays — never plain strings
 *  - .all is the broadest invalidation (all queries for that domain)
 *  - .lists() starts with the same prefix as .all so invalidating lists
 *    also catches every filtered variant
 *
 * LEGACY COMPATIBILITY:
 *  Keys deliberately match the pre-refactor shapes so that cache entries
 *  are shared correctly during the incremental migration:
 *
 *    transactionKeys.detail(id) → ["transaction", { id }]   (singular)
 *    transactionKeys.all        → ["transactions"]           (plural)
 *    summaryKeys.all            → ["summary"]
 *    accountKeys.detail(id)     → ["account", { id }]       (singular)
 *    categoryKeys.detail(id)    → ["category", { id }]      (singular)
 *
 *  Once ALL hooks are migrated these shapes can be normalised to a
 *  consistent hierarchy without any external behaviour change.
 */

// ── Transactions ──────────────────────────────────────────────────────────────

export const transactionKeys = {
  /**
   * Broadest key — invalidates every query whose key starts with "transactions".
   * Matches legacy: ["transactions"]
   */
  all: ["transactions"] as const,

  /**
   * Invalidates all list queries (filtered or unfiltered).
   * Because .all IS the list scope (legacy had no "list" segment),
   * this is intentionally an alias of .all.
   */
  lists: () => [...transactionKeys.all] as const,

  /**
   * A specific filtered list.
   * Matches legacy: ["transactions", { from, to, accountId }]
   */
  list: (filters: { from?: string; to?: string; accountId?: string }) =>
    [...transactionKeys.all, filters] as const,

  /**
   * A specific transaction detail.
   * Uses legacy key shape ["transaction", { id }] — note singular scope —
   * so that useGetTransaction cache entries are invalidated correctly by
   * useDeleteTransaction without a key mismatch.
   */
  detail: (id: string) => ["transaction", { id }] as const,
} as const;

// ── Summary ───────────────────────────────────────────────────────────────────

export const summaryKeys = {
  /** Matches legacy: ["summary"] */
  all: ["summary"] as const,

  /** Matches legacy: ["summary", { from, to, accountId }] */
  detail: (filters: { from?: string; to?: string; accountId?: string }) =>
    [...summaryKeys.all, filters] as const,
} as const;

// ── Accounts ──────────────────────────────────────────────────────────────────

export const accountKeys = {
  /** Matches legacy: ["accounts"] */
  all: ["accounts"] as const,

  lists: () => [...accountKeys.all] as const,

  /** Matches legacy: ["account", { id }] */
  detail: (id: string) => ["account", { id }] as const,
} as const;

// ── Categories ────────────────────────────────────────────────────────────────

export const categoryKeys = {
  /** Matches legacy: ["categories"] */
  all: ["categories"] as const,

  lists: () => [...categoryKeys.all] as const,

  /** Matches legacy: ["category", { id }] */
  detail: (id: string) => ["category", { id }] as const,
} as const;