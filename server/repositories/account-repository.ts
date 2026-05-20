/**
 * server/repositories/account-repository.ts
 *
 * Raw database access for accounts.
 * - No auth logic — callers pass verified userId.
 * - No orchestration — one DB responsibility per function.
 */

import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { accounts, insertAccountSchema } from "@/db/schema";
import type { z } from "zod";

// ── Types ─────────────────────────────────────────────────────────────────────

type NameValues = Pick<z.infer<typeof insertAccountSchema>, "name">;

// ── Read ──────────────────────────────────────────────────────────────────────

export async function listAccounts(userId: string) {
  return db
    .select({ id: accounts.id, name: accounts.name })
    .from(accounts)
    .where(eq(accounts.userId, userId));
}

export async function getAccountById(id: string, userId: string) {
  const [row] = await db
    .select({ id: accounts.id, name: accounts.name })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.id, id)));

  return row ?? null;
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function insertAccount(userId: string, values: NameValues) {
  const [row] = await db
    .insert(accounts)
    .values({ id: createId(), userId, ...values })
    .returning();

  return row;
}

export async function updateAccount(
  id: string,
  userId: string,
  values: NameValues
) {
  const [row] = await db
    .update(accounts)
    .set(values)
    .where(and(eq(accounts.userId, userId), eq(accounts.id, id)))
    .returning();

  return row ?? null;
}

export async function deleteAccount(id: string, userId: string) {
  const [row] = await db
    .delete(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.id, id)))
    .returning({ id: accounts.id });

  return row ?? null;
}

export async function deleteManyAccounts(ids: string[], userId: string) {
  return db
    .delete(accounts)
    .where(and(eq(accounts.userId, userId), inArray(accounts.id, ids)))
    .returning({ id: accounts.id });
}