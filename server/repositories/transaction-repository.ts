/**
 * server/repositories/transaction-repository.ts
 *
 * DATA ACCESS LAYER — owns all raw DB operations for transactions.
 *
 * Rules for this file:
 *  ✅ Direct drizzle queries
 *  ✅ SQL filtering, ordering, joining
 *  ✅ Returns raw DB row shapes
 *  ❌ NO business logic
 *  ❌ NO validation
 *  ❌ NO formatting / unit conversion
 *  ❌ NO grouping / analytics
 *  ❌ NO toast / error UI
 *
 * MIGRATION NOTE:
 *   Current API routes (app/api/[[...route]]/transactions.ts) contain
 *   inline drizzle queries. This repository mirrors that logic so routes
 *   can be migrated one at a time to call the service layer instead.
 *   Until migration, both patterns coexist safely.
 */

import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { accounts, categories, transactions } from "@/db/schema";

// ─── Input types ───────────────────────────────────────────────────────────────

export type GetTransactionsParams = {
  userId: string;
  accountId?: string;
  startDate: Date;
  endDate: Date;
};

export type CreateTransactionParams = {
  id: string;
  accountId: string;
  categoryId?: string | null;
  payee: string;
  amount: number; // milliunits — unit conversion is the service's responsibility
  date: Date;
  notes?: string | null;
};

export type UpdateTransactionParams = Partial<
  Omit<CreateTransactionParams, "id">
>;

export type BulkDeleteParams = {
  userId: string;
  ids: string[];
};

export type BulkCreateParams = {
  rows: CreateTransactionParams[];
};

// ─── Return types ──────────────────────────────────────────────────────────────

/** Shape returned by the list query — includes joined account/category names. */
export type TransactionRow = {
  id: string;
  date: Date;
  category: string | null;
  categoryId: string | null;
  payee: string;
  amount: number;
  notes: string | null;
  account: string;
  accountId: string;
};

/** Shape returned by the detail query — no joined names. */
export type TransactionDetailRow = {
  id: string;
  date: Date;
  categoryId: string | null;
  payee: string;
  amount: number;
  notes: string | null;
  accountId: string;
};

// ─── Repository ────────────────────────────────────────────────────────────────

export const transactionRepository = {

  /**
   * List transactions for a user within a date range.
   * Optionally scoped to a single account.
   * Returns rows with joined account + category names.
   *
   * MIRRORS: inline query in GET /api/transactions
   */
  async getTransactions(
    params: GetTransactionsParams
  ): Promise<TransactionRow[]> {
    const { userId, accountId, startDate, endDate } = params;

    return db
      .select({
        id:         transactions.id,
        date:       transactions.date,
        category:   categories.name,
        categoryId: transactions.categoryId,
        payee:      transactions.payee,
        amount:     transactions.amount,
        notes:      transactions.notes,
        account:    accounts.name,
        accountId:  transactions.accountId,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          accountId ? eq(transactions.accountId, accountId) : undefined,
          eq(accounts.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .orderBy(desc(transactions.date));
  },

  /**
   * Fetch a single transaction by ID, scoped to a user (via account join).
   *
   * MIRRORS: inline query in GET /api/transactions/:id
   */
  async getTransactionById(
    id: string,
    userId: string
  ): Promise<TransactionDetailRow | null> {
    const [row] = await db
      .select({
        id:         transactions.id,
        date:       transactions.date,
        categoryId: transactions.categoryId,
        payee:      transactions.payee,
        amount:     transactions.amount,
        notes:      transactions.notes,
        accountId:  transactions.accountId,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          eq(transactions.id, id),
          eq(accounts.userId, userId)
        )
      );

    return row ?? null;
  },

  /**
   * Insert a new transaction row.
   * Caller is responsible for generating the id (createId()) and
   * converting amount to milliunits before calling this.
   *
   * MIRRORS: inline insert in POST /api/transactions
   */
  async createTransaction(
    params: CreateTransactionParams
  ): Promise<TransactionDetailRow> {
    const [row] = await db
      .insert(transactions)
      .values({
        id:         params.id,
        accountId:  params.accountId,
        categoryId: params.categoryId ?? null,
        payee:      params.payee,
        amount:     params.amount,
        date:       params.date,
        notes:      params.notes ?? null,
      })
      .returning();

    return row as TransactionDetailRow;
  },

  /**
   * Bulk-insert transactions (used by CSV import).
   *
   * MIRRORS: inline insert in POST /api/transactions/bulk-create
   */
  async bulkCreateTransactions(
    params: BulkCreateParams
  ): Promise<TransactionDetailRow[]> {
    const rows = await db
      .insert(transactions)
      .values(params.rows.map((r) => ({ ...r, notes: r.notes ?? null })))
      .returning();

    return rows as TransactionDetailRow[];
  },

  /**
   * Update a transaction. Scoped to a user via a CTE join on accounts.
   * Returns null if the transaction doesn't belong to the user.
   *
   * MIRRORS: inline update in PATCH /api/transactions/:id
   */
  async updateTransaction(
    id: string,
    userId: string,
    patch: UpdateTransactionParams
  ): Promise<TransactionDetailRow | null> {
    // CTE to ensure the transaction belongs to this user
    const toUpdate = db.$with("tx_to_update").as(
      db
        .select({ id: transactions.id })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(eq(transactions.id, id), eq(accounts.userId, userId))
        )
    );

    const [row] = await db
      .with(toUpdate)
      .update(transactions)
      .set(patch)
      .where(inArray(transactions.id, sql`(select id from ${toUpdate})`))
      .returning();

    return (row as TransactionDetailRow) ?? null;
  },

  /**
   * Delete a single transaction. Scoped to a user via CTE.
   * Returns null if not found / not owned by user.
   *
   * MIRRORS: inline delete in DELETE /api/transactions/:id
   */
  async deleteTransaction(
    id: string,
    userId: string
  ): Promise<{ id: string } | null> {
    const toDelete = db.$with("tx_to_delete").as(
      db
        .select({ id: transactions.id })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(eq(transactions.id, id), eq(accounts.userId, userId))
        )
    );

    const [row] = await db
      .with(toDelete)
      .delete(transactions)
      .where(inArray(transactions.id, sql`(select id from ${toDelete})`))
      .returning({ id: transactions.id });

    return row ?? null;
  },

  /**
   * Bulk-delete transactions by IDs, scoped to a user.
   *
   * MIRRORS: inline delete in POST /api/transactions/bulk-delete
   */
  async bulkDeleteTransactions(
    params: BulkDeleteParams
  ): Promise<{ id: string }[]> {
    const { userId, ids } = params;

    const toDelete = db.$with("tx_to_delete").as(
      db
        .select({ id: transactions.id })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            inArray(transactions.id, ids),
            eq(accounts.userId, userId)
          )
        )
    );

    return db
      .with(toDelete)
      .delete(transactions)
      .where(inArray(transactions.id, sql`(select id from ${toDelete})`))
      .returning({ id: transactions.id });
  },
};