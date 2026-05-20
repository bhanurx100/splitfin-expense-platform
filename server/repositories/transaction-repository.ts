/**
 * server/repositories/transaction-repository.ts
 *
 * Raw database access for transactions.
 * - No auth logic here — callers pass userId already verified.
 * - No orchestration — one responsibility per function.
 * - Returns raw DB rows; service layer handles shaping if needed.
 */

import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";

import { db } from "@/db/drizzle";
import {
  accounts,
  categories,
  insertTransactionSchema,
  transactions,
} from "@/db/schema";

import type { z } from "zod";

// ── Shared select shape (matches existing API response exactly) ────────────────

const TX_SELECT = {
  id:         transactions.id,
  date:       transactions.date,
  category:   categories.name,
  categoryId: transactions.categoryId,
  payee:      transactions.payee,
  amount:     transactions.amount,
  notes:      transactions.notes,
  account:    accounts.name,
  accountId:  transactions.accountId,
} as const;

const TX_SELECT_DETAIL = {
  id:         transactions.id,
  date:       transactions.date,
  categoryId: transactions.categoryId,
  payee:      transactions.payee,
  amount:     transactions.amount,
  notes:      transactions.notes,
  accountId:  transactions.accountId,
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

type InsertValues = z.infer<typeof insertTransactionSchema> & { id: string };

export type ListFilters = {
  userId: string;
  accountId?: string;
  startDate: Date;
  endDate: Date;
};

// ── Read ──────────────────────────────────────────────────────────────────────

export async function listTransactions(filters: ListFilters) {
  const { userId, accountId, startDate, endDate } = filters;

  return db
    .select(TX_SELECT)
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        accountId ? eq(transactions.accountId, accountId) : undefined,
        eq(accounts.userId, userId),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate),
      )
    )
    .orderBy(desc(transactions.date));
}

export async function getTransactionById(id: string, userId: string) {
  const [row] = await db
    .select(TX_SELECT_DETAIL)
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(
      and(
        eq(transactions.id, id),
        eq(accounts.userId, userId),
      )
    );

  return row ?? null;
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function insertTransaction(
  values: Omit<InsertValues, "id">
): Promise<typeof transactions.$inferSelect> {
  const [row] = await db
    .insert(transactions)
    .values({ id: createId(), ...values })
    .returning();

  return row;
}

export async function insertManyTransactions(
  rows: Omit<InsertValues, "id">[]
): Promise<(typeof transactions.$inferSelect)[]> {
  return db
    .insert(transactions)
    .values(rows.map((r) => ({ id: createId(), ...r })))
    .returning();
}

// ── Update (auth-safe CTE — only rows owned by userId) ────────────────────────

export async function updateTransaction(
  id: string,
  userId: string,
  values: Omit<InsertValues, "id">
): Promise<typeof transactions.$inferSelect | null> {
  const cte = db.$with("tx_to_update").as(
    db
      .select({ id: transactions.id })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(and(eq(transactions.id, id), eq(accounts.userId, userId)))
  );

  const [row] = await db
    .with(cte)
    .update(transactions)
    .set(values)
    .where(inArray(transactions.id, sql`(select id from ${cte})`))
    .returning();

  return row ?? null;
}

// ── Delete (auth-safe CTE) ────────────────────────────────────────────────────

export async function deleteTransaction(
  id: string,
  userId: string
): Promise<{ id: string } | null> {
  const cte = db.$with("tx_to_delete").as(
    db
      .select({ id: transactions.id })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(and(eq(transactions.id, id), eq(accounts.userId, userId)))
  );

  const [row] = await db
    .with(cte)
    .delete(transactions)
    .where(inArray(transactions.id, sql`(select id from ${cte})`))
    .returning({ id: transactions.id });

  return row ?? null;
}

export async function deleteManyTransactions(
  ids: string[],
  userId: string
): Promise<{ id: string }[]> {
  const cte = db.$with("txs_to_delete").as(
    db
      .select({ id: transactions.id })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          inArray(transactions.id, ids),
          eq(accounts.userId, userId),
        )
      )
  );

  return db
    .with(cte)
    .delete(transactions)
    .where(inArray(transactions.id, sql`(select id from ${cte})`))
    .returning({ id: transactions.id });
}